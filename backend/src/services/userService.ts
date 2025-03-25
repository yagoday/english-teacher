import { User, IUser } from '../models/User';

export class UserService {
  // Get user by ID
  static async getUserById(userId: string): Promise<IUser | null> {
    return await User.findById(userId);
  }

  // Create or update user
  static async createOrUpdateUser(userData: {
    email: string;
    name: string;
    supabaseId: string;
  }): Promise<IUser> {
    const { email, name, supabaseId } = userData;
    
    const user = await User.findOneAndUpdate(
      { supabaseId },
      { email, name, supabaseId },
      { upsert: true, new: true }
    );
    
    return user;
  }

  // Get user by Supabase ID
  static async getUserBySupabaseId(supabaseId: string): Promise<IUser | null> {
    return await User.findOne({ supabaseId });
  }
} 