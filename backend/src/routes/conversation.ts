import express, { Request, Response } from 'express';
import { ConversationService } from '../services/conversationService';
import mongoose from 'mongoose';

const router = express.Router();

interface CreateConversationBody {
  userId: string;
  title: string;
  theme?: string;
}

// Input validation helper
const isValidObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Create a new conversation
router.post('/', async (req: Request<{}, {}, CreateConversationBody>, res: Response) => {
  try {
    const { userId, title, theme } = req.body;

    if (!userId || !title) {
      return res.status(400).json({ error: 'userId and title are required' });
    }

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ error: 'Invalid userId format' });
    }

    const conversation = await ConversationService.createConversation(userId, title, theme);
    return res.status(201).json(conversation);
  } catch (error) {
    console.error('Create conversation error:', error);
    return res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Get all conversations for a user
router.get('/user/:userId', async (req: Request<{ userId: string }>, res: Response) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ error: 'Invalid userId format' });
    }

    const conversations = await ConversationService.getUserConversations(userId);
    return res.json(conversations);
  } catch (error) {
    console.error('Get user conversations error:', error);
    return res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get conversation by ID
router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid conversation ID format' });
    }

    const conversation = await ConversationService.getConversationById(id);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    return res.json(conversation);
  } catch (error) {
    console.error('Get conversation error:', error);
    return res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// Complete a conversation
router.patch('/:id/complete', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid conversation ID format' });
    }

    const conversation = await ConversationService.completeConversation(id);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    return res.json(conversation);
  } catch (error) {
    console.error('Complete conversation error:', error);
    return res.status(500).json({ error: 'Failed to complete conversation' });
  }
});

// Delete a conversation
router.delete('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid conversation ID format' });
    }

    await ConversationService.deleteConversation(id);
    return res.status(204).send();
  } catch (error) {
    console.error('Delete conversation error:', error);
    return res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

export default router; 