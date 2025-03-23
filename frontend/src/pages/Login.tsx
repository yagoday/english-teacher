import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";

export function LoginPage() {
  const { signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // If user is already authenticated, redirect to index
  useEffect(() => {
    if (user) {
      console.log('Login: User already authenticated, redirecting to index');
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    console.log('Login: handleGoogleSignIn clicked');
    try {
      console.log('Login: Calling signInWithGoogle...');
      await signInWithGoogle();
      console.log('Login: signInWithGoogle completed - if you see this, redirect did not happen');
    } catch (error) {
      console.error('Login: Error during sign in:', error);
      toast({
        title: 'Error signing in',
        description: 'An error occurred while signing in with Google.',
        variant: 'destructive'
      });
    }
  };

  // If we're still checking auth status, show loading
  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome to English Teacher</CardTitle>
          <p className="text-center text-muted-foreground mt-2">
            Sign in to start your English learning journey
          </p>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
          >
            <FcGoogle className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 