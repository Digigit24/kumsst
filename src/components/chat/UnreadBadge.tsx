/**
 * UnreadBadge Component
 * Displays unread message count badge
 */

import React, { useState, useEffect } from 'react';
import { chatAPI } from '../../api/chatService';

interface UnreadBadgeProps {
  refreshInterval?: number; // How often to refresh (in milliseconds, default 30000)
}

export const UnreadBadge: React.FC<UnreadBadgeProps> = ({ refreshInterval = 30000 }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnreadCount();

    // Refresh periodically
    const interval = setInterval(loadUnreadCount, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const loadUnreadCount = async () => {
    try {
      const data = await chatAPI.getUnreadCount();
      setUnreadCount(data.total_unread);
    } catch (error) {
      console.error('[UnreadBadge] Failed to load unread count:', error);
    }
  };

  if (unreadCount === 0) return null;

  return (
    <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs font-bold text-destructive-foreground bg-destructive rounded-full">
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  );
};

export default UnreadBadge;
