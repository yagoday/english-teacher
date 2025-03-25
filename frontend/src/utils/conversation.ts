import { speechApi } from '@/lib/api';
import { conversationApi, messageApi } from '@/services/api';
import { Message, BackendUser, CONVERSATION_TYPES, ConversationType } from '@/types';
import { SetStateAction } from 'react';

export const initializeConversation = async (
  backendUser: BackendUser | null,
  setCurrentConversationId: (id: string) => void,
  setMessages: (value: SetStateAction<Message[]>) => void
): Promise<void> => {
  if (!backendUser) return;

  const storedConversationId = sessionStorage.getItem('currentConversationId');
  
  if (storedConversationId) {
    try {
      const conversation = await conversationApi.getById(storedConversationId);
      const conversationMessages = await messageApi.getByConversation(storedConversationId);
      setCurrentConversationId(storedConversationId);
      setMessages(conversationMessages);
      return;
    } catch (error) {
      console.error('Failed to load stored conversation:', error);
      sessionStorage.removeItem('currentConversationId');
    }
  }
  
  try {
    // Start with a Free conversation type by default
    const { conversation, opening } = await conversationApi.start(backendUser._id, 'Free');
    setCurrentConversationId(conversation._id);
    sessionStorage.setItem('currentConversationId', conversation._id);
    setMessages([{
      id: `msg-${Date.now()}-tutor`,
      userId: backendUser._id,
      text: opening.text,
      sender: 'ai',
      audioUrl: opening.audioUrl,
      timestamp: new Date()
    }]);
  } catch (error) {
    console.error('Failed to create new conversation:', error);
    throw new Error('Failed to start conversation. Please try logging out and back in.');
  }
};

export const processUserMessage = async (
  text: string,
  backendUser: BackendUser | null,
  currentConversationId: string | null,
  setMessages: (value: SetStateAction<Message[]>) => void
): Promise<void> => {
  if (!text.trim()) {
    throw new Error('No speech detected. Please try again.');
  }

  if (!currentConversationId) {
    throw new Error('No active conversation');
  }

  const studentMessage: Message = {
    id: `msg-${Date.now()}-student`,
    userId: backendUser?._id || '',
    text,
    sender: "ai",
    timestamp: new Date()
  };
  
  setMessages(prev => [...prev, studentMessage]);
  
  try {
    const response = await speechApi.processText(text, backendUser?._id || '', currentConversationId);
    
    if (response.success && response.response) {
      const tutorMessage: Message = {
        id: `msg-${Date.now()}-tutor`,
        userId: backendUser?._id || '',
        text: response.response.text,
        sender: "ai",
        audioUrl: response.response.audioUrl,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, tutorMessage]);
    } else {
      throw new Error(response.error || "Failed to get tutor's response");
    }
  } catch (error) {
    throw new Error('Failed to process your message');
  }
};

export const startNewChat = async (
  type: ConversationType,
  backendUser: BackendUser | null,
  setMessages: (value: SetStateAction<Message[]>) => void,
  setCurrentConversationId: (id: string) => void
): Promise<void> => {
  if (!backendUser) {
    throw new Error('No user logged in');
  }

  setMessages([]);
  
  try {
    const { conversation, opening } = await conversationApi.start(backendUser._id, type);
    setCurrentConversationId(conversation._id);
    sessionStorage.setItem('currentConversationId', conversation._id);
    
    const tutorMessage: Message = {
      id: `msg-${Date.now()}-tutor`,
      userId: backendUser._id,
      text: opening.text,
      sender: "ai",
      audioUrl: opening.audioUrl,
      timestamp: new Date()
    };
    
    setMessages([tutorMessage]);
  } catch (error) {
    console.error('Failed to start new chat:', error);
    throw new Error('Failed to start new chat');
  }
}; 