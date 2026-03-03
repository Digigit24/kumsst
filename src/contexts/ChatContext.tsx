import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { chatAPI } from '../api/chatService';
import { LongPollingEvent, useLongPolling } from '../hooks/useLongPolling';

const MAX_MESSAGES = 500;

// Define types for chat messages
export interface ChatMessage {
  id?: number;
  type: 'chat_message';
  message: string;
  sender_id: number;
  sender_name?: string;
  recipient_id?: number;
  timestamp?: string;
  attachment?: string | null;
}

interface ChatContextType {
  isConnected: boolean;
  messages: ChatMessage[];
  sendMessage: (recipientId: number, text: string, attachment?: File | null) => Promise<void>;
  sendTyping: (recipientId: number, isTyping: boolean) => void;
  markAsRead: (senderId: number) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const handleLongPollingMessage = useCallback(({ event, data }: LongPollingEvent) => {
    if (event === 'message') {
      const newMsg: ChatMessage = {
        id: data.id,
        type: 'chat_message',
        message: data.message,
        sender_id: data.sender_id,
        sender_name: data.sender_name,
        recipient_id: data.receiver_id,
        timestamp: data.timestamp,
        attachment: data.attachment
      };
      setMessages(prev => {
        const updated = [...prev, newMsg];
        return updated.length > MAX_MESSAGES ? updated.slice(-MAX_MESSAGES) : updated;
      });
    }
  }, []);

  const { isConnected } = useLongPolling(handleLongPollingMessage, false);

  const sendMessage = useCallback(async (recipientId: number, text: string, attachment?: File | null) => {
    await chatAPI.sendMessage(recipientId, text, attachment);
  }, []);

  const sendTyping = useCallback((recipientId: number, isTyping: boolean) => {
    chatAPI.sendTyping(recipientId, isTyping).catch(() => {});
  }, []);

  const markAsRead = useCallback((senderId: number) => {
    chatAPI.markAsRead({ sender_id: senderId }).catch(() => {});
  }, []);

  const value = useMemo(() => ({
    isConnected, messages, sendMessage, sendTyping, markAsRead,
  }), [isConnected, messages, sendMessage, sendTyping, markAsRead]);

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
};
