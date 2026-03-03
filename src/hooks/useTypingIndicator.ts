/**
 * useTypingIndicator Hook
 * Handles typing indicator functionality with debouncing
 */

import { useRef, useCallback } from 'react';
import { chatAPI } from '../api/chatService';

/**
 * Typing indicator hook return type
 */
export interface UseTypingIndicatorReturn {
  sendTyping: (isTyping: boolean) => void;
  stopTyping: () => void;
}

/**
 * useTypingIndicator Hook
 * @param receiverId - The ID of the user receiving the typing indicator
 */
export const useTypingIndicator = (receiverId: number): UseTypingIndicatorReturn => {
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (isTyping && !isTypingRef.current) {
        // Start typing
        chatAPI.sendTyping(receiverId, true).catch((error) => {
          console.error('[useTypingIndicator] Failed to send typing indicator:', error);
        });
        isTypingRef.current = true;
      }

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        if (isTypingRef.current) {
          chatAPI.sendTyping(receiverId, false).catch((error) => {
            console.error('[useTypingIndicator] Failed to send stop typing:', error);
          });
          isTypingRef.current = false;
        }
      }, 3000);
    },
    [receiverId]
  );

  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isTypingRef.current) {
      chatAPI.sendTyping(receiverId, false).catch((error) => {
        console.error('[useTypingIndicator] Failed to send stop typing:', error);
      });
      isTypingRef.current = false;
    }
  }, [receiverId]);

  return { sendTyping, stopTyping };
};

export default useTypingIndicator;
