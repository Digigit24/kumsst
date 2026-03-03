/**
 * ChatPage Component
 * Main page for the SSE-based chat application
 */

import React from 'react';
import { ChatContainer } from '../components/chat';

export const ChatPage: React.FC = () => {
  return (
    <div className="h-screen overflow-hidden">
      <ChatContainer />
    </div>
  );
};

export default ChatPage;
