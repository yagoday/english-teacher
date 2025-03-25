import mongoose, { Document, Schema } from 'mongoose';

interface MessageMetadata {
  agentName: string;
  processingTime: number;
  conversationType: string;
}

export interface IMessage extends Document {
  conversationId: string;
  text: string;
  sender: 'ai' | 'student';
  metadata?: MessageMetadata;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema({
  conversationId: {
    type: String,
    required: true,
    ref: 'Conversation'
  },
  text: {
    type: String,
    required: true
  },
  sender: {
    type: String,
    required: true,
    enum: ['ai', 'student']
  },
  metadata: {
    type: {
      agentName: String,
      processingTime: Number,
      conversationType: String
    },
    required: false
  }
}, {
  timestamps: true
});

export const Message = mongoose.model<IMessage>('Message', messageSchema); 