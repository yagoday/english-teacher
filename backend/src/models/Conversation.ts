import mongoose, { Document, Schema } from 'mongoose';

export interface IConversation extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  theme?: string;
  status: 'active' | 'completed';
  type: string; // QnA, Test, Free, Teach
  isActive: boolean;
  summary?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  theme: { type: String },
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
  type: { 
    type: String, 
    enum: ['QnA', 'Test', 'Free', 'Teach'], 
    required: true 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  summary: { 
    type: String, 
    default: '' 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt timestamp before saving
ConversationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema); 