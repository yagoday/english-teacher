import React from 'react';
import { Plus, User, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { CONVERSATION_TYPES, ConversationType, ConversationTypeConfig } from '@/types';

interface ChatHeaderProps {
  onNewChat: (type: ConversationType) => void;
  onSettingsClick: () => void;
  onLogout: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  onNewChat,
  onSettingsClick,
  onLogout,
}) => {
  return (
    <div className="flex justify-between items-center p-4 border-b">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {Object.values(CONVERSATION_TYPES).map((config: ConversationTypeConfig) => (
            <DropdownMenuItem
              key={config.type}
              onClick={() => onNewChat(config.type)}
            >
              <div className="flex flex-col">
                <span className="font-medium">{config.label}</span>
                <span className="text-sm text-gray-500">{config.description}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onSettingsClick}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ChatHeader; 