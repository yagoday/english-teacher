import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface TranscriptionResponse {
  success: boolean;
  text: string;
  error?: string;
}

export interface ProcessResponse {
  success: boolean;
  response: {
    text: string;
    audioUrl?: string;
  };
  error?: string;
}

export const speechApi = {
  async transcribeAudio(audioBlob: Blob): Promise<TranscriptionResponse> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    try {
      const response = await api.post<TranscriptionResponse>('/api/speech/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        text: '',
        error: error.response?.data?.error || 'Failed to transcribe audio',
      };
    }
  },

  async processText(text: string): Promise<ProcessResponse> {
    try {
      const response = await api.post<ProcessResponse>('/api/speech/process', { text });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        response: {
          text: '',
        },
        error: error.response?.data?.error || 'Failed to process text',
      };
    }
  },

  async resetConversation(): Promise<{ success: boolean }> {
    try {
      const response = await api.post('/api/speech/reset');
      return response.data;
    } catch (error) {
      return { success: false };
    }
  },
}; 