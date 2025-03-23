import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('AuthCallback: Component mounted');
    
    // Handle the OAuth callback
    const handleCallback = async () => {
      try {
        // Check if we have an access token in the URL (means we just came from Google)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const urlAccessToken = hashParams.get('access_token');
        
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();
        
        // If we have no access token in URL and no session, go back to login
        if (!urlAccessToken && !session) {
          console.log('AuthCallback: No access token or session found, redirecting to login');
          navigate('/login', { replace: true });
          return;
        }
        
        // If we have a session and came from Google (have access token), proceed to index
        if (session && urlAccessToken) {
          console.log('AuthCallback: Valid session after Google login, redirecting to index');
          navigate('/', { replace: true });
          return;
        }
        
        // If we have no access token but have a session, user might be trying to access callback directly
        if (!urlAccessToken && session) {
          console.log('AuthCallback: Session exists but no access token, redirecting to index');
          navigate('/', { replace: true });
          return;
        }
      } catch (error) {
        console.error('AuthCallback: Error handling callback:', error);
        navigate('/login', { replace: true });
      }
    };

    handleCallback();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthCallback: Auth state changed1:', { event, hasSession: !!session, session });
      if (event === 'SIGNED_IN' && session) {
        console.log('AuthCallback: User signed in, redirecting to index...');
        navigate('/', { replace: true });
      }
    });

    return () => {
      console.log('AuthCallback: Cleaning up listener');
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );
} 