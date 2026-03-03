import { useEffect, useRef, useState } from "react";
import ReconnectingWebSocket from "../utils/ReconnectingWebSocket";
import { WS_NOTIFICATIONS_URL } from "../config/api.config";

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  timestamp: string;
}

export const useNotificationWebSocket = (token: string | null) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<ReconnectingWebSocket | null>(null);

  useEffect(() => {
    if (!token) return;

    const baseUrl = WS_NOTIFICATIONS_URL.replace(/\/$/, "");
    const wsUrl = `${baseUrl}/?token=${token}`;

    const socket = new ReconnectingWebSocket(wsUrl);

    socket.addEventListener("open", () => {
      setIsConnected(true);
    });

    socket.addEventListener("message", (event: any) => {
      try {
        const data = JSON.parse(event.data);

        // Only handle notify type messages or store generic ones?
        // User doc: Response Payloads ... { type: "notify", ... }
        if (data.type === "notify") {
          setNotifications((prev) => [
            ...prev,
            {
              id: data.data?.id || Date.now(), // Fallback ID
              title: data.title,
              message: data.message,
              type: data.notification_type || "info",
              timestamp: data.timestamp || new Date().toISOString(),
            },
          ]);
        }
      } catch (err) {
        console.error("Notify WS Parse Error", err);
      }
    });

    socket.addEventListener("close", () => {
      setIsConnected(false);
    });

    socket.addEventListener("error", (event: any) => {
      // console.error('Notify WS Error', event);
    });

    socketRef.current = socket;

    return () => {
      socket.close();
    };
  }, [token]);

  return { notifications, isConnected };
};
