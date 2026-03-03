/**
 * ChatWindow Component
 * Main chat interface with SSE integration
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { chatAPI, Message, Conversation } from '../../api/chatService';
import { useLongPolling, LongPollingEvent } from '../../hooks/useLongPolling';
import { getCurrentUser } from '../../api/auth';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

interface ChatWindowProps {
  otherUser: Conversation['other_user'];
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ otherUser }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = getCurrentUser();

  // Load initial messages
  useEffect(() => {
    loadMessages();
  }, [otherUser.id]);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const data = await chatAPI.getMessages(otherUser.id, { limit: 50 });
      setMessages(data.messages.reverse()); // Reverse for chronological order
      setHasMore(data.has_more);

      // Mark conversation as read
      if (data.conversation_id) {
        await chatAPI.markConversationAsRead(data.conversation_id);
      }
    } catch (error) {
      console.error('[ChatWindow] Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Long Polling events
  const handleLongPollingEvent = useCallback(
    (event: LongPollingEvent) => {
      const { event: eventType, data } = event;
      
      switch (eventType) {
        case 'message':
          // Only add if relevant to this conversation
          if (
            (data.sender_id === otherUser.id && data.receiver_id === currentUser?.id) ||
            (data.sender_id === currentUser?.id && data.receiver_id === otherUser.id)
          ) {
            setMessages((prev) => {
              // Avoid duplicates
              const exists = prev.some((msg) => msg.id === data.id);
              if (exists) {
                return prev;
              }

              return [...prev, data];
            });

            // Auto mark as read if we're the receiver
            if (data.receiver_id === currentUser?.id) {
              chatAPI.markMessagesAsRead([data.id]).catch((err) =>
                console.error('[ChatWindow] Failed to mark as read:', err)
              );
            }

            // Scroll to bottom
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }
          break;

        case 'typing':
          if (data.sender_id === otherUser.id) {
            setIsOtherUserTyping(data.is_typing);
            if (data.is_typing) {
              // Auto-clear after 5 seconds
              setTimeout(() => setIsOtherUserTyping(false), 5000);
            }
          }
          break;

        case 'read_receipt':
          // Update message read status
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === data.message_id
                ? { ...msg, is_read: true, read_at: data.read_at }
                : msg
            )
          );
          break;

        default:
          break;
      }
    },
    [otherUser.id, currentUser?.id]
  );

  // Connect to Long Polling
  const { isConnected, error, reconnect } = useLongPolling(handleLongPollingEvent);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleMessageSent = (sentMessage: Message) => {
    // Message will be added via SSE, but add optimistically
    setMessages((prev) => {
      const exists = prev.some((msg) => msg.id === sentMessage.id);
      if (exists) return prev;
      return [...prev, sentMessage];
    });
  };

  return (
    <div className="chat-window flex flex-col h-full bg-background">
      {/* Chat Header */}
      <div className="chat-header flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={otherUser.avatar || '/default-avatar.png'}
              alt={otherUser.full_name}
              className="w-10 h-10 rounded-full object-cover"
            />
            {otherUser.is_online && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{otherUser.full_name}</h3>
            <span
              className={`text-xs ${
                otherUser.is_online ? 'text-green-600' : 'text-muted-foreground'
              }`}
            >
              {otherUser.is_online ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Connection Indicator */}
        <div className="flex items-center gap-2">
          {isConnected ? (
            <div className="flex items-center gap-1 text-green-600 text-xs">
              <span className="w-2 h-2 bg-green-600 rounded-full"></span>
              <span>Connected</span>
            </div>
          ) : error ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-red-600 text-xs">
                <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                <span>Disconnected</span>
              </div>
              <button
                onClick={reconnect}
                className="text-xs text-primary hover:underline"
              >
                Reconnect
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-yellow-600 text-xs">
              <span className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse"></span>
              <span>Connecting...</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages List */}
      <MessageList
        messages={messages}
        isLoading={isLoading}
        isOtherUserTyping={isOtherUserTyping}
        otherUserName={otherUser.full_name}
        messagesEndRef={messagesEndRef}
      />

      {/* Message Input */}
      <MessageInput receiverId={otherUser.id} onMessageSent={handleMessageSent} />
    </div>
  );
};

export default ChatWindow;
