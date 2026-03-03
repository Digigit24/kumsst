/**
 * MessageInput Component
 * Input field for sending messages with attachment support
 */

import React, { useState, useRef } from 'react';
import { Paperclip, X } from 'lucide-react';
import { toast } from 'sonner';
import { chatAPI, Message } from '../../api/chatService';
import { useTypingIndicator } from '../../hooks/useTypingIndicator';

interface MessageInputProps {
  receiverId: number;
  onMessageSent?: (message: Message) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({ receiverId, onMessageSent }) => {
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { sendTyping, stopTyping } = useTypingIndicator(receiverId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() && !attachment) return;

    setSending(true);
    try {
      const sentMessage = await chatAPI.sendMessage(receiverId, message, attachment);

      setMessage('');
      setAttachment(null);
      stopTyping();

      if (onMessageSent) {
        onMessageSent(sentMessage);
      }
    } catch (error) {
      console.error('[MessageInput] Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File too large. Max 10MB.');
        return;
      }
      setAttachment(file);
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);

    // Send typing indicator
    if (e.target.value.trim()) {
      sendTyping(true);
    }
  };

  const handleBlur = () => {
    stopTyping();
  };

  return (
    <form onSubmit={handleSubmit} className="message-input-form border-t border-border p-4">
      {/* Attachment Preview */}
      {attachment && (
        <div className="mb-2 flex items-center gap-2 p-2 bg-muted/50 rounded-md">
          <span className="text-sm text-foreground/80 flex-1 truncate">{attachment.name}</span>
          <button
            type="button"
            onClick={() => setAttachment(null)}
            className="text-muted-foreground hover:text-accent-foreground"
            aria-label="Remove attachment"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-center gap-2">
        {/* File Input (Hidden) */}
        <input
          ref={fileInputRef}
          type="file"
          id="file-input"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Attachment Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0 p-2 text-muted-foreground hover:text-accent-foreground rounded-full hover:bg-accent"
          title="Attach file"
          aria-label="Attach file"
        >
          <Paperclip className="h-5 w-5" />
        </button>

        {/* Message Input */}
        <input
          type="text"
          value={message}
          onChange={handleMessageChange}
          onBlur={handleBlur}
          placeholder="Type a message..."
          disabled={sending}
          className="flex-1 px-4 py-2 border border-input rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={sending || (!message.trim() && !attachment)}
          className="flex-shrink-0 px-6 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors"
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
