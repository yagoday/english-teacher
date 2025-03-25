import React, { useRef, useEffect } from 'react';
import ChatMessage from '@/components/ChatMessage';
import ThinkingIndicator from '@/components/ThinkingIndicator';
import { Message } from '@/types';

interface ChatMessagesProps {
  messages: Message[];
  isProcessing: boolean;
  userName: string;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, isProcessing, userName }) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
       <ThinkingIndicator />
      </div>
    );
  }

  return (
    <div 
      ref={chatContainerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4"
    >
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message}
          userName={userName}
        />
      ))}
    </div>
  );
};

export default ChatMessages; 