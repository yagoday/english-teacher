import React, { createContext, useContext, useState, useCallback } from 'react';
import { conversationApi, messageApi } from '@/services/api';
import { Message, Conversation, ConversationType } from '@/types';

interface ConversationContextType {
  activeConversation: Conversation | null;
  messages: Message[];
  startNewConversation: (userId: string, type: ConversationType) => Promise<void>;
  loadConversation: (conversationId: string) => Promise<void>;
  addMessage: (userId: string, text: string, sender: 'student' | 'tutor', audioUrl?: string) => Promise<void>;
  completeConversation: () => Promise<void>;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export const useConversation = () => {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error('useConversation must be used within a ConversationProvider');
  }
  return context;
};

export const ConversationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const startNewConversation = useCallback(async (userId: string, type: ConversationType) => {
    try {
      const { conversation, opening } = await conversationApi.start(userId, type);
      setActiveConversation(conversation);
      setMessages([{
        id: `msg-${Date.now()}-tutor`,
        userId,
        text: opening.text,
        sender: 'tutor',
        audioUrl: opening.audioUrl,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Failed to start new conversation:', error);
      throw error;
    }
  }, []);

  const loadConversation = useCallback(async (conversationId: string) => {
    try {
      const [conversation, conversationMessages] = await Promise.all([
        conversationApi.getById(conversationId),
        messageApi.getByConversation(conversationId)
      ]);
      setActiveConversation(conversation);
      setMessages(conversationMessages);
    } catch (error) {
      console.error('Failed to load conversation:', error);
      throw error;
    }
  }, []);

  const addMessage = useCallback(async (
    userId: string,
    text: string,
    sender: 'student' | 'tutor',
    audioUrl?: string
  ) => {
    if (!activeConversation) {
      throw new Error('No active conversation');
    }

    try {
      const message = await messageApi.create(
        userId,
        activeConversation._id,
        text,
        sender
      );

      setMessages(prev => [...prev, { ...message, audioUrl }]);
    } catch (error) {
      console.error('Failed to add message:', error);
      throw error;
    }
  }, [activeConversation]);

  const completeConversation = useCallback(async () => {
    if (!activeConversation) {
      throw new Error('No active conversation');
    }

    try {
      const updatedConversation = await conversationApi.end(activeConversation._id);
      setActiveConversation(updatedConversation);
    } catch (error) {
      console.error('Failed to complete conversation:', error);
      throw error;
    }
  }, [activeConversation]);

  return (
    <ConversationContext.Provider
      value={{
        activeConversation,
        messages,
        startNewConversation,
        loadConversation,
        addMessage,
        completeConversation,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}; 