import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    //console.log('AuthContext: Checking initial session...');
    supabase.auth.getSession().then(({ data: { session } }) => {
      //console.log('AuthContext: Initial session check result:', session ? 'User found' : 'No user');
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    //console.log('AuthContext: Setting up auth state change listener');
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      //console.log('AuthContext: Auth state changed2:', _event, session ? 'User present' : 'No user', session?.user );
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    //console.log('AuthContext: Starting Google sign in...');
    try {
      //console.log('AuthContext: Calling Supabase signInWithOAuth...');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: false,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account'
          }
        },
      });
      
      //console.log('AuthContext: signInWithOAuth response:', { data, error });
      
      if (error) throw error;
      if (!data.url) throw new Error('No redirect URL returned');
      
      //console.log('AuthContext: Redirecting to Google URL:', data.url);
      // Force redirect to Google's sign-in page
      window.location.href = data.url;
    } catch (error) {
      //console.error('AuthContext: Error in signInWithGoogle:', error);
      throw error;
    }
  };

  const signOut = async () => {
    //console.log('AuthContext: Starting sign out...');
    try {
      // Clear any existing sessions
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) throw error;
      
      // Clear the user state
      setUser(null);
      
      //console.log('AuthContext: Successfully signed out');
    } catch (error) {
      //console.error('AuthContext: Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 