import express, { Request, Response } from 'express';
import { ConversationService } from '../services/conversationService';
import { MessageService } from '../services/messageService';
import { EnglishTeacherOrchestrator } from '../agents/EnglishTeacherOrchestrator';
import mongoose from 'mongoose';
import { authenticateUser } from '../middleware/auth';
import { UserService } from '../services/userService';

const router = express.Router();

// Initialize agent orchestrator for generating openings and summaries
const agentOrchestrator = new EnglishTeacherOrchestrator();

// Apply authentication middleware to all routes
router.use(authenticateUser);

interface StartConversationBody {
  type: 'QnA' | 'Test' | 'Free' | 'Teach';
  theme?: string;
}

// Input validation helper
const isValidObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Start a new typed conversation
router.post('/start', async (req: Request<{}, {}, StartConversationBody>, res: Response) => {
  try {
    const { type, theme } = req.body;
    const supabaseId = req.user?.id;

    if (!supabaseId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get MongoDB user by Supabase ID
    const user = await UserService.getUserBySupabaseId(supabaseId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get and end the current active conversation if it exists
    const activeConversation = await ConversationService.getActiveConversation(user._id.toString());
    if (activeConversation) {
      await agentOrchestrator.endConversation(activeConversation._id.toString());
    }

    // Create a default title based on type
    const defaultTitle = `${type} English Session`;
    
    // Start new conversation and deactivate any others
    const conversation = await ConversationService.startNewActiveConversation(
      user._id.toString(),
      defaultTitle,
      type,
      theme
    );
    
    // Generate an opening message based on the conversation type
    const opening = await agentOrchestrator.generateConversationOpening(user._id.toString(), type);
    
    // Save the opening message
    await MessageService.createMessage(
      user._id.toString(),
      conversation._id.toString(),
      opening.text,
      'ai'
    );
    
    return res.status(201).json({
      success: true,
      conversation,
      opening
    });
  } catch (error) {
    console.error('Start conversation error:', error);
    return res.status(500).json({ success: false, error: 'Failed to start conversation' });
  }
});

// End a conversation with summary
router.post('/:id/end', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const supabaseId = req.user?.id;

    if (!supabaseId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid conversation ID format' });
    }

    // Get MongoDB user by Supabase ID
    const user = await UserService.getUserBySupabaseId(supabaseId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get the conversation
    const conversation = await ConversationService.getConversationById(id);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Verify the conversation belongs to the user
    if (conversation.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to end this conversation' });
    }
    
    // End the conversation and generate summary
    await agentOrchestrator.endConversation(id);
    
    // Get the updated conversation with summary
    const updatedConversation = await ConversationService.getConversationById(id);
    
    return res.json({
      success: true,
      conversation: updatedConversation
    });
  } catch (error) {
    console.error('End conversation error:', error);
    return res.status(500).json({ error: 'Failed to end conversation' });
  }
});

// Get active conversation for user
router.get('/active', async (req: Request, res: Response) => {
  try {
    const supabaseId = req.user?.id;

    if (!supabaseId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get MongoDB user by Supabase ID
    const user = await UserService.getUserBySupabaseId(supabaseId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const conversation = await ConversationService.getActiveConversation(user._id.toString());
    if (!conversation) {
      return res.status(404).json({ error: 'No active conversation found' });
    }

    return res.json(conversation);
  } catch (error) {
    console.error('Get active conversation error:', error);
    return res.status(500).json({ error: 'Failed to fetch active conversation' });
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

// Delete a conversation
router.delete('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const supabaseId = req.user?.id;

    if (!supabaseId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid conversation ID format' });
    }

    // Get MongoDB user by Supabase ID
    const user = await UserService.getUserBySupabaseId(supabaseId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get the conversation to verify ownership
    const conversation = await ConversationService.getConversationById(id);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Verify the conversation belongs to the user
    if (conversation.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this conversation' });
    }

    await ConversationService.deleteConversation(id);
    return res.status(204).send();
  } catch (error) {
    console.error('Delete conversation error:', error);
    return res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

export default router; 