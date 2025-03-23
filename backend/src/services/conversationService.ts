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

  // Get conversation by ID
  static async getConversationById(conversationId: string): Promise<IConversation | null> {
    return await Conversation.findById(conversationId);
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

  // Delete conversation and its messages
  static async deleteConversation(conversationId: string): Promise<void> {
    // Delete all messages in the conversation
    await Message.deleteMany({ conversationId });
    // Delete the conversation
    await Conversation.findByIdAndDelete(conversationId);
  }
} 