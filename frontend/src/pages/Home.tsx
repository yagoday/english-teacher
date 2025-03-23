import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export function Home() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto py-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">Welcome to English Teacher</h1>
        <p>Hello, {user?.email}</p>
      </div>
    </div>
  );
} 