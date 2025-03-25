import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  supabaseId: string;
}

const userSchema = new Schema({
  email: { type: String, required: true },
  name: { type: String, required: true },
  supabaseId: { type: String, required: true, unique: true }
}, {
  timestamps: true
});

export const User = mongoose.model<IUser>('User', userSchema); 