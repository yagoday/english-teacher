import mongoose, { Document, Schema } from 'mongoose';

export interface IConversation extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  theme?: string;
  status: 'active' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  theme: { type: String },
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt timestamp before saving
ConversationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema); 