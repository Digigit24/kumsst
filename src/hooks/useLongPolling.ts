/**
 * useLongPolling Hook - Real-time Communication (Long Polling)
 * Handles real-time communication via Long Polling (replacing SSE)
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { getAuthToken } from "../api/auth";
import { API_BASE_URL } from "../config/api.config";

/**
 * Event types
 */
export interface LongPollingEvent {
  event:
    | "connected"
    | "message"
    | "typing"
    | "read_receipt"
    | "notification"
    | "heartbeat"
    | "disconnected";
  data: any;
}

/**
 * Message event data
 */
export interface MessageEventData {
  id: number;
  sender_id: number;
  sender_name: string;
  receiver_id: number;
  message: string;
  attachment: string | null;
  attachment_type: string | null;
  timestamp: string;
  is_read: boolean;
  conversation_id: number;
}

/**
 * Typing event data
 */
export interface TypingEventData {
  sender_id: number;
  sender_name: string;
  is_typing: boolean;
}

/**
 * Read receipt event data
 */
export interface ReadReceiptEventData {
  message_id: number;
  reader_id: number;
  reader_name: string;
  read_at: string;
}

/**
 * Notification event data
 */
export interface NotificationEventData {
  title: string;
  message: string;
  notification_type: string;
  [key: string]: any;
}

/**
 * Heartbeat event data
 */
export interface HeartbeatEventData {
  timestamp: number;
}

/**
 * Hook return type
 */
export interface UseLongPollingReturn {
  isConnected: boolean;
  error: string | null;
  reconnect: () => void;
}

/**
 * useLongPolling Hook (Implemented via Long Polling)
 * @param onMessage - Callback function to handle events
 * @param enabled - Whether connection is enabled
 */
export const useLongPolling = (
  onMessage: (event: LongPollingEvent) => void,
  enabled: boolean = true
): UseLongPollingReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isPollingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const startPolling = useCallback(async () => {
    // PREVENT DOUBLE POLLING
    if (isPollingRef.current) {
      return;
    }

    if (!enabled) return;

    const token = getAuthToken();
    if (!token) {
      setError("No auth token");
      return;
    }

    isPollingRef.current = true;
    setIsConnected(true);
    setError(null);

    while (isPollingRef.current) {
      try {
        // Create new AbortController for each request
        abortControllerRef.current = new AbortController();

        // Use the API_BASE_URL which is the host (http://127.0.0.1:8000)
        // and append the full path: /api/v1/communication/poll/events/
        const url = `${API_BASE_URL}/api/v1/communication/poll/events/?token=${token}`;

        const response = await fetch(url, {
          signal: abortControllerRef.current.signal,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Unauthorized");
          }
          if (response.status === 502) {
            // Timeout/Gateway error, just retry
            await new Promise((r) => setTimeout(r, 1000));
            continue;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Process events
        if (
          data.events &&
          Array.isArray(data.events) &&
          data.events.length > 0
        ) {
          data.events.forEach((event: any) => {
            onMessage({
              event: event.event,
              data: event.data,
            });
          });
        }

        // Immediately poll again (loop continues)
      } catch (err: any) {
        if (err.name === "AbortError") {
          break;
        }

        setError("Connection lost. Retrying...");
        setIsConnected(false);

        // Wait before retrying on error
        await new Promise((r) => setTimeout(r, 2000));

        if (isPollingRef.current) {
          setIsConnected(true);
        }
      }
    }

    setIsConnected(false);
    isPollingRef.current = false;
  }, [enabled, onMessage]);

  const stopPolling = useCallback(() => {
    isPollingRef.current = false;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [enabled, startPolling, stopPolling]);

  return {
    isConnected,
    error,
    reconnect: () => {
      stopPolling();
      setTimeout(startPolling, 100);
    },
  };
};

export default useLongPolling;
