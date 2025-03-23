import axios from 'axios';

// In Vite, we use import.meta.env for environment variables
const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Conversation API
export const conversationApi = {
  create: async (userId: string, title: string, theme?: string) => {
    const response = await api.post('/conversations', { userId, title, theme });
    return response.data;
  },

  getAll: async (userId: string) => {
    const response = await api.get(`/conversations/user/${userId}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/conversations/${id}`);
    return response.data;
  },

  complete: async (id: string) => {
    const response = await api.patch(`/conversations/${id}/complete`);
    return response.data;
  },

  delete: async (id: string) => {
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