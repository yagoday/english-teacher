import express from 'express';
import User from '../models/User';
import { authenticateUser } from '../middleware/auth';

const router = express.Router();

// Get current user
router.get('/me', authenticateUser, async (req, res) => {
  try {
    const user = await User.findOne({ supabaseId: req?.user?.id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new user
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { email, name } = req.body;
    const supabaseId = req.user?.id;

    // Check if user already exists
    const existingUser = await User.findOne({ supabaseId });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({
      email,
      name,
      supabaseId,
    });

    await user.save();
    return res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user
router.patch('/me', authenticateUser, async (req, res) => {
  try {
    const user = await User.findOne({ supabaseId: req.user?.id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update allowed fields
    const allowedUpdates = ['name'];
    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce<Record<string, any>>((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    Object.assign(user, updates);
    await user.save();
    return res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;