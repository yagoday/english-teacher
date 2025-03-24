import React, { useRef, useEffect } from 'react';
import ChatMessage from '@/components/ChatMessage';
import ThinkingIndicator from '@/components/ThinkingIndicator';
import { Message } from '@/types';

interface ChatMessagesProps {
  messages: Message[];
  isProcessing: boolean;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, isProcessing }) => {
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
        />
      ))}
    </div>
  );
};

export default ChatMessages; 