import api from '../services/api';

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
  messages?: {
    student: any;
    tutor: any;
  };
  error?: string;
}

export const speechApi = {
  async transcribeAudio(audioBlob: Blob): Promise<TranscriptionResponse> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    try {
      const response = await api.post<TranscriptionResponse>('/speech/transcribe', formData, {
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

  async processText(text: string, userId: string, conversationId: string): Promise<ProcessResponse> {
    try {
      const response = await api.post<ProcessResponse>('/speech/process', { 
        text,
        userId,
        conversationId
      });
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
      const response = await api.post('/speech/reset');
      return response.data;
    } catch (error) {
      return { success: false };
    }
  },
}; 