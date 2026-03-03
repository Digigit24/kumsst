/**
 * ChatContainer Component
 * Main container that manages conversations list and active chat
 */

import React, { useState } from 'react';
import { Conversation } from '../../api/chatService';
import ConversationsList from './ConversationsList';
import ChatWindow from './ChatWindow';

export const ChatContainer: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<Conversation['other_user'] | null>(null);

  const handleSelectConversation = (otherUser: Conversation['other_user']) => {
    setSelectedUser(otherUser);
  };

  return (
    <div className="chat-container flex h-screen bg-muted/50">
      {/* Conversations Sidebar */}
      <div className="w-80 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border bg-muted/30">
          <h2 className="text-xl font-bold text-foreground">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ConversationsList onSelectConversation={handleSelectConversation} />
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <ChatWindow otherUser={selectedUser} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <svg
                className="w-24 h-24 mx-auto mb-4 text-muted-foreground/70"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="text-lg">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatContainer;
