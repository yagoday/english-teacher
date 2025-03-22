import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface AIResponse {
  feedback: string;
  type: 'conversation' | 'vocabulary' | 'question';
}

export const submitSpeech = async (text: string): Promise<AIResponse> => {
  try {
    const response = await api.post<AIResponse>('/api/ai/classify', { text });
    return response.data;
  } catch (error) {
    console.error('Error submitting speech:', error);
    throw error;
  }
};

export const getConversationFeedback = async (text: string): Promise<AIResponse> => {
  try {
    const response = await api.post<AIResponse>('/api/ai/conversation', { text });
    return response.data;
  } catch (error) {
    console.error('Error getting conversation feedback:', error);
    throw error;
  }
};

export const getVocabularyFeedback = async (text: string): Promise<AIResponse> => {
  try {
    const response = await api.post<AIResponse>('/api/ai/vocabulary', { text });
    return response.data;
  } catch (error) {
    console.error('Error getting vocabulary feedback:', error);
    throw error;
  }
}; 