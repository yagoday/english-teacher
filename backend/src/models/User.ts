import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  age: number;
  nativeLanguage: string;
  proficiencyLevel: string;
  createdAt: Date;
  lastActive: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
  nativeLanguage: { type: String, required: true, default: 'Hebrew' },
  proficiencyLevel: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now }
});

export const User = mongoose.model<IUser>('User', UserSchema); 