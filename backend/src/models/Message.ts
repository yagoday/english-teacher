import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  userId: mongoose.Types.ObjectId;
  conversationId: mongoose.Types.ObjectId;
  sender: 'student' | 'tutor';
  text: string;
  feedback?: {
    liked: boolean;
    disliked: boolean;
    timestamp: Date;
  };
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender: { type: String, enum: ['student', 'tutor'], required: true },
  text: { type: String, required: true },
  feedback: {
    liked: { type: Boolean, default: false },
    disliked: { type: Boolean, default: false },
    timestamp: { type: Date }
  },
  createdAt: { type: Date, default: Date.now }
});

// Create compound index for efficient querying of messages by conversation
MessageSchema.index({ conversationId: 1, createdAt: 1 });

export const Message = mongoose.model<IMessage>('Message', MessageSchema); 