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

export interface BackendUser {
  _id: string;
  email: string;
  name: string;
  supabaseId: string;
}

export interface ChatType {
  id: string;
  name: string;
  description: string;
  welcomeText: string;
}

export const CHAT_TYPES: Record<string, ChatType> = {
  teach: {
    id: 'teach',
    name: 'Teaching Session',
    description: 'Learn new concepts and practice',
    welcomeText: "I'm here to teach you! What would you like to learn today?"
  },
  answer: {
    id: 'answer',
    name: 'Q&A Session',
    description: 'Get answers to your questions',
    welcomeText: "I'm ready to answer your questions! What would you like to know?"
  },
  test: {
    id: 'test',
    name: 'Test Session',
    description: 'Test your knowledge',
    welcomeText: "Let's test your knowledge! I'll ask you some questions."
  },
  freestyle: {
    id: 'freestyle',
    name: 'Free Conversation',
    description: 'Practice casual conversation',
    welcomeText: "Let's chat freely! Talk to me about anything you'd like."
  }
}; 