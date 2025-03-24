import { Conversation, IConversation } from '../models/Conversation';
import { Message } from '../models/Message';

export class ConversationService {
  // Create a new conversation
  static async createConversation(userId: string, title: string, theme?: string): Promise<IConversation> {
    const conversation = new Conversation({
      userId,
      title,
      theme,
      status: 'active'
    });
    return await conversation.save();
  }

  // Create a new active conversation and deactivate any other active ones for the user
  static async startNewActiveConversation(userId: string, title: string, type: string, theme?: string): Promise<IConversation> {
    // Deactivate any currently active conversations for this user
    await Conversation.updateMany(
      { userId, isActive: true },
      { isActive: false }
    );
    
    // Create new active conversation
    const conversation = new Conversation({
      userId,
      title,
      type,
      theme: theme || type.toLowerCase(), // Use type as theme by default if no theme provided
      status: 'active',
      isActive: true
    });
    
    return await conversation.save();
  }

  // Get conversation by ID
  static async getConversationById(conversationId: string): Promise<IConversation | null> {
    return await Conversation.findById(conversationId);
  }

  // Get the active conversation for a user
  static async getActiveConversation(userId: string): Promise<IConversation | null> {
    return await Conversation.findOne({ userId, isActive: true });
  }

  // Get all conversations for a user
  static async getUserConversations(userId: string): Promise<IConversation[]> {
    return await Conversation.find({ userId }).sort({ updatedAt: -1 });
  }

  // Mark conversation as completed
  static async completeConversation(conversationId: string): Promise<IConversation | null> {
    return await Conversation.findByIdAndUpdate(
      conversationId,
      { status: 'completed' },
      { new: true }
    );
  }

  // Complete a conversation with summary and optional new title
  static async completeConversationWithSummary(
    conversationId: string, 
    summary: string, 
    newTitle?: string
  ): Promise<IConversation | null> {
    const updateData: Record<string, any> = { 
      status: 'completed', 
      isActive: false,
      summary
    };
    
    if (newTitle) {
      updateData.title = newTitle;
    }
    
    return await Conversation.findByIdAndUpdate(
      conversationId,
      updateData,
      { new: true }
    );
  }

  // Delete conversation and its messages
  static async deleteConversation(conversationId: string): Promise<void> {
    // Delete all messages in the conversation
    await Message.deleteMany({ conversationId });
    // Delete the conversation
    await Conversation.findByIdAndDelete(conversationId);
  }
} 