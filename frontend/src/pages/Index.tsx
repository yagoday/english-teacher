import React, { useState, useRef, useEffect } from "react";
import ChatMessage from "@/components/ChatMessage";
import RecordButton from "@/components/RecordButton";
import EmptyState from "@/components/EmptyState";
import { Plus, MessageSquare, FileCheck, Wand2, User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import SettingsPanel from "@/components/SettingsPanel";
import { speechApi } from "@/lib/api";
import { conversationApi } from "@/services/api";
import { messageApi } from "@/services/api";

// Define message type
interface Message {
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

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Use test user ID for now
  const userId = "67e00f284ba1bfef7e300589";

  // Initialize or load conversation
  useEffect(() => {
    const initializeConversation = async () => {
      // Try to get conversation ID from session storage
      const storedConversationId = sessionStorage.getItem('currentConversationId');
      
      if (storedConversationId) {
        try {
          // Verify the conversation exists and load its messages
          const conversation = await conversationApi.getById(storedConversationId);
          const conversationMessages = await messageApi.getByConversation(storedConversationId);
          setCurrentConversationId(storedConversationId);
          setMessages(conversationMessages);
        } catch (error) {
          console.error('Failed to load stored conversation:', error);
          // If loading fails, we'll create a new conversation below
          sessionStorage.removeItem('currentConversationId');
        }
      }
      
      // If no stored conversation or loading failed, create a new one
      if (!sessionStorage.getItem('currentConversationId')) {
        try {
          const conversation = await conversationApi.create(userId, "English Learning Session", "general");
          setCurrentConversationId(conversation._id);
          sessionStorage.setItem('currentConversationId', conversation._id);
        } catch (error) {
          console.error('Failed to create new conversation:', error);
          toast({
            title: "Error",
            description: "Failed to start conversation",
            variant: "destructive",
          });
        }
      }
    };

    initializeConversation();
  }, []);

  const handleRecordingComplete = async (text: string) => {
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "No speech detected. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (!currentConversationId) {
      toast({
        title: "Error",
        description: "No active conversation",
        variant: "destructive",
      });
      return;
    }

    // Add student message to UI immediately
    const studentMessage: Message = {
      id: `msg-${Date.now()}-student`,
      userId,
      text,
      sender: "student",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, studentMessage]);
    setIsProcessing(true);
    
    try {
      // Process the text through the AI
      const response = await speechApi.processText(text, userId, currentConversationId);
      
      if (response.success && response.response) {
        const tutorMessage: Message = {
          id: `msg-${Date.now()}-tutor`,
          userId,
          text: response.response.text,
          sender: "tutor",
          audioUrl: response.response.audioUrl,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, tutorMessage]);
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to get tutor's response",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process your message",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const startNewChat = async (chatType: string) => {
    // Clear current messages and conversation
    setMessages([]);
    
    try {
      // Reset conversation context in the backend
      await speechApi.resetConversation();
      
      // Create a new conversation
      const conversation = await conversationApi.create(userId, chatType, chatType);
      setCurrentConversationId(conversation._id);
      sessionStorage.setItem('currentConversationId', conversation._id);
      
      // Based on chat type, we could show a different welcome message
      let welcomeText = "";
      
      switch (chatType) {
        case "teach":
          welcomeText = "I'm here to teach you! What would you like to learn today?";
          break;
        case "answer":
          welcomeText = "I'm ready to answer your questions! What would you like to know?";
          break;
        case "test":
          welcomeText = "Let's test your knowledge! I'll ask you some questions.";
          break;
        case "freestyle":
          welcomeText = "Let's chat freely! Talk to me about anything you'd like.";
          break;
        default:
          welcomeText = "Hi there! How can I help you with your English today?";
      }
      
      const tutorMessage: Message = {
        id: `msg-${Date.now()}-tutor`,
        userId,
        text: welcomeText,
        sender: "tutor",
        timestamp: new Date()
      };
      
      setMessages([tutorMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start new chat",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    // Clear conversation data
    setMessages([]);
    setCurrentConversationId(null);
    sessionStorage.removeItem('currentConversationId');
  };

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden relative">
      {/* Panda Background */}
      <div 
        className="absolute inset-0 z-0 opacity-25 bg-no-repeat bg-center bg-cover pointer-events-none"
        style={{ 
          backgroundImage: "url('/lovable-uploads/b71358da-9822-49a8-924f-27ee814b96ed.png')", 
        }}
      ></div>
      
      {/* Header */}
      <header className="glass-morphism border-b px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User size={20} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <SheetTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer gap-2">
                    <Settings size={16} />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Settings</SheetTitle>
                    <SheetDescription>
                      Customize your English tutor experience
                    </SheetDescription>
                  </SheetHeader>
                  <SettingsPanel />
                </SheetContent>
              </Sheet>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer gap-2 text-red-500">
                <LogOut size={16} />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center">
            <h1 className="text-xl font-semibold">English Fun</h1>
          </div>
        </div>
        
        {/* New Chat Button with Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <Plus size={16} />
              <span>New Chat</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => startNewChat("teach")} className="cursor-pointer gap-2">
              <MessageSquare size={16} />
              <span>Teach me</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => startNewChat("answer")} className="cursor-pointer gap-2">
              <MessageSquare size={16} />
              <span>Answer me</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => startNewChat("test")} className="cursor-pointer gap-2">
              <FileCheck size={16} />
              <span>Test me</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => startNewChat("freestyle")} className="cursor-pointer gap-2">
              <Wand2 size={16} />
              <span>Free Style</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      
      {/* Chat Area */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 md:px-6 py-6 chat-container z-10"
      >
        <div className="max-w-2xl mx-auto flex flex-col items-stretch">
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}
        </div>
      </div>
      
      {/* Input Area */}
      <div className="glass-morphism border-t px-4 md:px-6 py-3 z-10">
        <div className="max-w-2xl mx-auto flex items-center">
          <RecordButton onRecordingComplete={handleRecordingComplete} />
        </div>
      </div>
    </div>
  );
};

export default Index;
