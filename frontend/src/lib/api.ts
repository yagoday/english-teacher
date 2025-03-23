import api from '@/services/api';

interface SpeechResponse {
  success: boolean;
  text?: string;
  error?: string;
  response?: {
    text: string;
    audioUrl?: string;
  };
}

export const speechApi = {
  transcribeAudio: async (formData: FormData): Promise<SpeechResponse> => {
    try {
      const response = await api.post('/speech/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to transcribe audio'
      };
    }
  },

  processText: async (text: string, userId: string, conversationId: string): Promise<SpeechResponse> => {
    try {
      const response = await api.post('/speech/process', {
        text,
        userId,
        conversationId
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to process text'
      };
    }
  },

  resetConversation: async (): Promise<SpeechResponse> => {
    try {
      const response = await api.post('/speech/reset');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to reset conversation'
      };
    }
  }
}; 