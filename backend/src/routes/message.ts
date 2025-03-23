import express, { Request, Response } from 'express';
import { MessageService } from '../services/messageService';
import mongoose from 'mongoose';
import { authenticateUser } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateUser);

interface CreateMessageBody {
  userId: string;
  conversationId: string;
  text: string;
  sender: 'student' | 'tutor';
}

interface UpdateFeedbackBody {
  liked: boolean;
  disliked: boolean;
}

// Input validation helper
const isValidObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Create a new message
router.post('/', async (req: Request<{}, {}, CreateMessageBody>, res: Response) => {
  try {
    const { userId, conversationId, text, sender } = req.body;

    // Validate required fields
    if (!userId || !conversationId || !text || !sender) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['userId', 'conversationId', 'text', 'sender']
      });
    }

    // Validate IDs
    if (!isValidObjectId(userId) || !isValidObjectId(conversationId)) {
      return res.status(400).json({ error: 'Invalid userId or conversationId format' });
    }

    // Validate sender type
    if (!['student', 'tutor'].includes(sender)) {
      return res.status(400).json({ error: 'Invalid sender type. Must be "student" or "tutor"' });
    }

    const message = await MessageService.createMessage(userId, conversationId, text, sender);
    return res.status(201).json(message);
  } catch (error) {
    console.error('Create message error:', error);
    if (error instanceof Error && error.message === 'Conversation not found') {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Failed to create message' });
  }
});

// Get all messages for a conversation
router.get('/conversation/:conversationId', async (req: Request<{ conversationId: string }>, res: Response) => {
  try {
    const { conversationId } = req.params;

    if (!isValidObjectId(conversationId)) {
      return res.status(400).json({ error: 'Invalid conversation ID format' });
    }

    const messages = await MessageService.getConversationMessages(conversationId);
    return res.json(messages);
  } catch (error) {
    console.error('Get conversation messages error:', error);
    return res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Update message feedback
router.patch('/:id/feedback', async (req: Request<{ id: string }, {}, UpdateFeedbackBody>, res: Response) => {
  try {
    const { id } = req.params;
    const { liked, disliked } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid message ID format' });
    }

    // Validate feedback data
    if (typeof liked !== 'boolean' || typeof disliked !== 'boolean') {
      return res.status(400).json({ error: 'liked and disliked must be boolean values' });
    }

    // Prevent both liked and disliked being true
    if (liked && disliked) {
      return res.status(400).json({ error: 'Message cannot be both liked and disliked' });
    }

    const message = await MessageService.updateMessageFeedback(id, { liked, disliked });
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    return res.json(message);
  } catch (error) {
    console.error('Update message feedback error:', error);
    return res.status(500).json({ error: 'Failed to update message feedback' });
  }
});

// Get messages by user ID
router.get('/user/:userId', async (req: Request<{ userId: string }>, res: Response) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const messages = await MessageService.getUserMessages(userId);
    return res.json(messages);
  } catch (error) {
    console.error('Get user messages error:', error);
    return res.status(500).json({ error: 'Failed to fetch user messages' });
  }
});

// Delete a message
router.delete('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid message ID format' });
    }

    await MessageService.deleteMessage(id);
    return res.status(204).send();
  } catch (error) {
    console.error('Delete message error:', error);
    return res.status(500).json({ error: 'Failed to delete message' });
  }
});

export default router; 