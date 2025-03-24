import axios from 'axios';
import { supabase } from '../lib/supabase';
import { ConversationType, Conversation } from '@/types';

// In Vite, we use import.meta.env for environment variables
const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      config: error.config
    });
    throw error;
  }
);

// User API
export const userApi = {
  // Get or create user in our backend
  getOrCreate: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error('No authenticated user');

    try {
      // Try to get existing user first
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        // User doesn't exist in our backend, create them
        const { user } = session;
        const createResponse = await api.post('/users', {
          email: user.email,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          supabaseId: user.id,
        });
        return createResponse.data;
      }
      throw error;
    }
  },
};

// Conversation API
export const conversationApi = {
  create: async (userId: string, title: string, type: ConversationType = 'Free', theme?: string): Promise<Conversation> => {
    const response = await api.post('/conversations', { userId, title, type, theme });
    return response.data;
  },

  start: async (userId: string, type: ConversationType): Promise<{ conversation: Conversation; opening: { text: string; audioUrl?: string } }> => {
    const response = await api.post('/conversations/start', { userId, type });
    return response.data;
  },

  end: async (id: string): Promise<Conversation> => {
    const response = await api.post(`/conversations/${id}/end`);
    return response.data;
  },

  getActive: async (userId: string): Promise<Conversation | null> => {
    const response = await api.get(`/conversations/active?userId=${userId}`);
    return response.data;
  },

  getAll: async (userId: string): Promise<Conversation[]> => {
    const response = await api.get(`/conversations/user/${userId}`);
    return response.data;
  },

  getById: async (id: string): Promise<Conversation> => {
    const response = await api.get(`/conversations/${id}`);
    return response.data;
  },

  complete: async (id: string): Promise<Conversation> => {
    console.warn('conversationApi.complete() is deprecated. Use conversationApi.end() instead.');
    return conversationApi.end(id);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/conversations/${id}`);
  },
};

// Message API
export const messageApi = {
  create: async (userId: string, conversationId: string, text: string, sender: 'student' | 'tutor') => {
    const response = await api.post('/messages', { userId, conversationId, text, sender });
    return response.data;
  },

  getByConversation: async (conversationId: string) => {
    const response = await api.get(`/messages/conversation/${conversationId}`);
    return response.data;
  },

  updateFeedback: async (id: string, feedback: { liked: boolean; disliked: boolean }) => {
    const response = await api.patch(`/messages/${id}/feedback`, feedback);
    return response.data;
  },

  getByUser: async (userId: string) => {
    const response = await api.get(`/messages/user/${userId}`);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/messages/${id}`);
  },
};

export default api; 