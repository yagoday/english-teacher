
import React from "react";
import { MessageCircle, Mic } from "lucide-react";

const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-fade-in">
      <div className="w-20 h-20 mb-6 rounded-full bg-primary/10 flex items-center justify-center">
        <MessageCircle size={32} className="text-primary" />
      </div>
      
      <h2 className="text-xl font-semibold mb-2">Welcome to English Tutor</h2>
      
      <p className="text-gray-500 max-w-md mb-8">
        Start practicing your English by recording a message.
        The tutor will respond to help you learn!
      </p>
      
      <div className="flex items-center gap-3 bg-secondary p-3 rounded-lg text-sm">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <Mic size={16} className="text-student" />
        </div>
        <span>Press the microphone button to start speaking</span>
      </div>
    </div>
  );
};

export default EmptyState;
