import { Message, IMessage } from '../models/Message';
import { ConversationService } from './conversationService';

interface MessageMetadata {
  agentName: string;
  processingTime: number;
  conversationType: string;
}

interface SaveMessageParams {
  conversationId: string;
  sender: 'ai' | 'student';
  text: string;
  metadata?: MessageMetadata;
}

export class MessageService {
  // Create a new message
  static async createMessage(
    userId: string,
    conversationId: string,
    text: string,
    sender: 'ai' | 'student'
  ): Promise<IMessage> {
    // Verify conversation exists
    const conversation = await ConversationService.getConversationById(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const message = new Message({
      userId,
      conversationId,
      text,
      sender
    });
    return await message.save();
  }

  // Save a message with metadata
  static async saveMessage(params: SaveMessageParams): Promise<IMessage> {
    const { conversationId, sender, text, metadata } = params;
    
    // Verify conversation exists
    const conversation = await ConversationService.getConversationById(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const message = new Message({
      conversationId,
      text,
      sender,
      metadata
    });
    return await message.save();
  }

  // Get all messages for a conversation
  static async getConversationMessages(conversationId: string): Promise<IMessage[]> {
    return await Message.find({ conversationId }).sort({ createdAt: 1 });
  }

  // Update message feedback
  static async updateMessageFeedback(
    messageId: string,
    feedback: { liked: boolean; disliked: boolean }
  ): Promise<IMessage | null> {
    return await Message.findByIdAndUpdate(
      messageId,
      {
        feedback: {
          ...feedback,
          timestamp: new Date()
        }
      },
      { new: true }
    );
  }

  // Get messages by user ID
  static async getUserMessages(userId: string): Promise<IMessage[]> {
    return await Message.find({ userId }).sort({ createdAt: -1 });
  }

  // Delete a message
  static async deleteMessage(messageId: string): Promise<void> {
    await Message.findByIdAndDelete(messageId);
  }
} 