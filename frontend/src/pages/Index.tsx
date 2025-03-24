import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import ChatHeader from "@/components/ChatHeader";
import ChatMessages from "@/components/ChatMessages";
import RecordButton from "@/components/RecordButton";
import SettingsPanel from "@/components/SettingsPanel";
import { userApi } from "@/services/api";
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Message, BackendUser, ConversationType } from '@/types';
import { initializeConversation, processUserMessage, startNewChat } from '@/utils/conversation';

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [backendUser, setBackendUser] = useState<BackendUser | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch or create backend user
  useEffect(() => {
    const initializeUser = async () => {
      if (!user) {
        console.log('No Supabase user available');
        return;
      }

      try {
        const userData = await userApi.getOrCreate();
        setBackendUser(userData);
      } catch (error) {
        console.error('Failed to get/create backend user:', error);
        toast({
          title: "Error",
          description: "Failed to initialize user data. Please try logging out and back in.",
          variant: "destructive",
        });
      }
    };

    initializeUser();
  }, [user]);

  // Initialize or load conversation
  useEffect(() => {
    if (!backendUser?._id) return;

    const loadConversation = async () => {
      try {
        await initializeConversation(backendUser, setCurrentConversationId, setMessages);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    loadConversation();
  }, [backendUser?._id]);

  const handleRecordingComplete = async (text: string) => {
    setIsProcessing(true);
    try {
      await processUserMessage(text, backendUser, currentConversationId, setMessages);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNewChat = async (type: ConversationType) => {
    try {
      await startNewChat(type, backendUser, setMessages, setCurrentConversationId);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' });
      localStorage.clear();
      sessionStorage.clear();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <ChatHeader
        onNewChat={handleNewChat}
        onSettingsClick={() => setIsSettingsOpen(true)}
        onLogout={handleLogout}
      />

      <ChatMessages
        messages={messages}
        isProcessing={isProcessing}
      />

      <div className="p-4 border-t">
        <RecordButton
          onRecordingComplete={handleRecordingComplete}
          disabled={isProcessing || !currentConversationId}
          isThinking={isProcessing}
        />
      </div>

      <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Settings</SheetTitle>
            <SheetDescription>
              Configure your learning experience
            </SheetDescription>
          </SheetHeader>
          <SettingsPanel />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Index;
