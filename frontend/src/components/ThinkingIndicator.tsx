import React from 'react';

const ThinkingIndicator: React.FC = () => {
  return (
    <div className="flex items-center gap-3 px-6 py-2.5 bg-gray-100/80 backdrop-blur-sm rounded-full min-w-[160px] justify-center shadow-sm">
      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" />
      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
    </div>
  );
};

export default ThinkingIndicator; 