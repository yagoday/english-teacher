// Conversation Types
export type ConversationType = 'QnA' | 'Test' | 'Free' | 'Teach';

export interface Message {
  id: string;
  userId: string;
  text: string;
  sender: "student" | "tutor";
  audioUrl?: string;
  feedback?: {
    liked: boolean;
    disliked: boolean;
    timestamp?: Date;
  };
  timestamp: Date;
}

export interface Conversation {
  _id: string;
  userId: string;
  title: string;
  type: ConversationType;
  theme?: string;
  status: 'active' | 'completed';
  isActive: boolean;
  summary?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BackendUser {
  _id: string;
  email: string;
  name: string;
  supabaseId: string;
}

export interface ConversationTypeConfig {
  type: ConversationType;
  label: string;
  description: string;
  icon?: string;
}

// Configuration for conversation types
export const CONVERSATION_TYPES: Record<ConversationType, ConversationTypeConfig> = {
  'QnA': {
    type: 'QnA',
    label: 'Questions & Answers',
    description: 'Get answers to your English questions',
    icon: '❓'
  },
  'Test': {
    type: 'Test',
    label: 'Test Your English',
    description: 'Test your knowledge with practice questions',
    icon: '📝'
  },
  'Free': {
    type: 'Free',
    label: 'Free Conversation',
    description: 'Practice casual English conversation',
    icon: '💭'
  },
  'Teach': {
    type: 'Teach',
    label: 'Learning Session',
    description: 'Learn new English concepts and practice',
    icon: '📚'
  }
};

// API Response Types
export interface StartConversationResponse {
  success: boolean;
  conversation: Conversation;
  opening: {
    text: string;
    audioUrl?: string;
  };
}

export interface EndConversationResponse {
  success: boolean;
  conversation: Conversation;
}

export interface ProcessMessageResponse {
  success: boolean;
  response: {
    text: string;
    audioUrl?: string;
  };
  messages: {
    student: Message;
    tutor: Message;
  };
} 