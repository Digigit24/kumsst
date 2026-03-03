/**
 * MessageList Component
 * Displays list of messages with infinite scroll support
 */

import React from 'react';
import { Message } from '../../api/chatService';
import { getCurrentUser } from '../../api/auth';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  isOtherUserTyping?: boolean;
  otherUserName?: string;
  messagesEndRef?: React.RefObject<HTMLDivElement>;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  isOtherUserTyping,
  otherUserName,
  messagesEndRef,
}) => {
  const currentUser = getCurrentUser();

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="messages-container flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg) => {
        const isMe = msg.sender === currentUser?.id;

        return (
          <div
            key={msg.id}
            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-2 max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              <img
                src={isMe ? msg.sender_avatar || '/default-avatar.png' : msg.sender_avatar || '/default-avatar.png'}
                alt={msg.sender_name}
                className="w-8 h-8 rounded-full flex-shrink-0"
              />

              {/* Message Content */}
              <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {/* Sender Name */}
                {!isMe && (
                  <span className="text-xs text-muted-foreground mb-1 px-1">
                    {msg.sender_name}
                  </span>
                )}

                {/* Message Bubble */}
                <div
                  className={`px-4 py-2 rounded-lg ${
                    isMe
                      ? 'bg-primary text-primary-foreground rounded-tr-none'
                      : 'bg-muted text-foreground rounded-tl-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>

                  {/* Attachment */}
                  {msg.attachment_url && (
                    <a
                      href={msg.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`mt-2 text-xs underline block ${
                        isMe ? 'text-primary-foreground/80' : 'text-primary'
                      }`}
                    >
                      View Attachment
                    </a>
                  )}
                </div>

                {/* Timestamp and Read Status */}
                <div className={`flex items-center gap-2 mt-1 px-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <span className="text-xs text-muted-foreground">
                    {formatMessageTime(msg.timestamp)}
                  </span>
                  {isMe && msg.is_read && (
                    <span className="text-xs text-primary"></span>
                  )}
                  {isMe && !msg.is_read && msg.delivered_at && (
                    <span className="text-xs text-muted-foreground"></span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Typing Indicator */}
      {isOtherUserTyping && (
        <div className="flex justify-start">
          <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
            <span className="text-xs text-muted-foreground">{otherUserName} is typing...</span>
          </div>
        </div>
      )}

      {/* Scroll Anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
