/**
 * useOnlineStatus Hook
 * Checks and tracks online status of users
 */

import { useState, useEffect } from 'react';
import { chatAPI } from '../api/chatService';

/**
 * useOnlineStatus Hook
 * @param userId - The ID of the user to check online status for
 * @param refreshInterval - How often to check online status (in milliseconds, default 10000)
 */
export const useOnlineStatus = (userId: number, refreshInterval: number = 10000): boolean => {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const checkOnlineStatus = async () => {
      try {
        const data = await chatAPI.getOnlineUsers();
        setIsOnline(data.online_users.includes(userId));
      } catch (error) {
        console.error('[useOnlineStatus] Failed to check online status:', error);
      }
    };

    // Check immediately
    checkOnlineStatus();

    // Set up interval to check periodically
    const interval = setInterval(checkOnlineStatus, refreshInterval);

    return () => clearInterval(interval);
  }, [userId, refreshInterval]);

  return isOnline;
};

export default useOnlineStatus;
