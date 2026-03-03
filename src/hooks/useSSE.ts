/**
 * useSSE Hook - Real-time Server-Sent Events connection
 * Connects to the backend SSE endpoint for real-time notifications,
 * chat messages, typing indicators, and read receipts.
 *
 * The backend sends auth errors as SSE events (event: error, data: {"error": "Unauthorized"})
 * with HTTP 200, so we use fetch-based streaming to properly detect and stop on auth failures.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { getAuthToken } from '../api/auth';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api.config';

export type SSEEventType =
  | 'connected'
  | 'message'
  | 'typing'
  | 'read_receipt'
  | 'notification'
  | 'heartbeat';

export interface SSEEvent {
  event: SSEEventType;
  data: any;
}

export interface UseSSEReturn {
  isConnected: boolean;
  error: string | null;
  reconnect: () => void;
}

const RECONNECT_DELAYS = [2000, 4000, 8000, 16000, 30000];

/**
 * Parse SSE text stream into event/data pairs.
 * SSE format: "event: <name>\ndata: <json>\n\n"
 */
function parseSSEChunk(chunk: string): Array<{ event: string; data: string }> {
  const events: Array<{ event: string; data: string }> = [];
  const blocks = chunk.split('\n\n');

  for (const block of blocks) {
    if (!block.trim()) continue;

    let event = 'message';
    let data = '';

    for (const line of block.split('\n')) {
      if (line.startsWith('event:')) {
        event = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        data = line.slice(5).trim();
      }
    }

    if (data) {
      events.push({ event, data });
    }
  }

  return events;
}

/**
 * useSSE Hook
 * @param onEvent - Callback for each SSE event received
 * @param enabled - Whether the connection should be active
 */
export const useSSE = (
  onEvent: (event: SSEEvent) => void,
  enabled: boolean = true
): UseSSEReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onEventRef = useRef(onEvent);
  const stoppedRef = useRef(false);

  // Keep callback ref fresh without re-triggering effect
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  const cleanup = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const scheduleReconnect = useCallback((connectFn: () => void) => {
    if (stoppedRef.current) return;

    const attempt = reconnectAttemptRef.current;
    const delay = RECONNECT_DELAYS[Math.min(attempt, RECONNECT_DELAYS.length - 1)];
    reconnectAttemptRef.current = attempt + 1;

    setError(`Connection lost. Reconnecting in ${delay / 1000}s...`);

    reconnectTimerRef.current = setTimeout(connectFn, delay);
  }, []);

  const connect = useCallback(() => {
    cleanup();

    if (!enabled) return;
    stoppedRef.current = false;

    const token = getAuthToken();
    if (!token) {
      setError('No auth token');
      return;
    }

    const url = `${API_BASE_URL}${API_ENDPOINTS.approvals.sseEvents}?token=${token}`;
    const controller = new AbortController();
    abortRef.current = controller;

    (async () => {
      try {
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Accept': 'text/event-stream',
          },
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            setError('Unauthorized');
            stoppedRef.current = true;
            return;
          }
          throw new Error(`HTTP ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response body');
        }

        const decoder = new TextDecoder();
        setIsConnected(true);
        setError(null);
        reconnectAttemptRef.current = 0;

        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Process complete SSE blocks (terminated by \n\n)
          const lastDoubleNewline = buffer.lastIndexOf('\n\n');
          if (lastDoubleNewline === -1) continue;

          const completeChunk = buffer.substring(0, lastDoubleNewline + 2);
          buffer = buffer.substring(lastDoubleNewline + 2);

          const events = parseSSEChunk(completeChunk);

          for (const evt of events) {
            // Handle auth error sent as SSE event
            if (evt.event === 'error') {
              try {
                const errData = JSON.parse(evt.data);
                if (errData.error === 'Unauthorized' || errData.error === 'Forbidden') {
                  setError('Unauthorized');
                  setIsConnected(false);
                  stoppedRef.current = true;
                  reader.cancel();
                  return;
                }
              } catch {
                // not JSON, ignore
              }
              continue;
            }

            // Dispatch known event types
            const knownTypes: string[] = [
              'connected', 'message', 'typing', 'read_receipt', 'notification', 'heartbeat',
            ];

            if (knownTypes.includes(evt.event)) {
              try {
                const data = JSON.parse(evt.data);
                onEventRef.current({ event: evt.event as SSEEventType, data });
              } catch {
                onEventRef.current({ event: evt.event as SSEEventType, data: evt.data });
              }
            }
          }
        }

        // Stream ended normally — reconnect
        setIsConnected(false);
        if (!stoppedRef.current) {
          scheduleReconnect(connect);
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;

        setIsConnected(false);
        if (!stoppedRef.current) {
          scheduleReconnect(connect);
        }
      }
    })();
  }, [enabled, cleanup, scheduleReconnect]);

  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      stoppedRef.current = true;
      cleanup();
    }

    return () => {
      stoppedRef.current = true;
      cleanup();
    };
  }, [enabled, connect, cleanup]);

  const reconnect = useCallback(() => {
    reconnectAttemptRef.current = 0;
    stoppedRef.current = false;
    connect();
  }, [connect]);

  return { isConnected, error, reconnect };
};

export default useSSE;
