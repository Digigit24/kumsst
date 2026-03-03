type WebSocketEventListener = (
  event: Event | MessageEvent | CloseEvent
) => void;

export class ReconnectingWebSocket {
  private url: string;
  private protocols?: string | string[];
  private socket: WebSocket | null = null;
  private reconnectInterval: number = 1000;
  private maxReconnectInterval: number = 30000;
  private reconnectDecay: number = 1.5;
  private listeners: Record<string, WebSocketEventListener[]> = {};
  private forcedClose: boolean = false;
  private reconnectTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(url: string, protocols?: string | string[]) {
    this.url = url;
    this.protocols = protocols;
    this.connect();
  }

  private connect() {
    if (this.forcedClose) return;
    try {
      this.socket = new WebSocket(this.url, this.protocols);

      this.socket.onopen = (event) => {
        this.reconnectInterval = 1000; // Reset reconnect interval on success
        this.emit("open", event);
      };

      this.socket.onmessage = (event) => {
        this.emit("message", event);
      };

      this.socket.onclose = (event) => {
        this.emit("close", event);
        if (!this.forcedClose) {
          this.scheduleReconnect();
        }
      };

      this.socket.onerror = (event) => {
        this.emit("error", event);
      };
    } catch (e) {
      if (!this.forcedClose) {
        this.scheduleReconnect();
      }
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimeoutId) return;

    this.reconnectTimeoutId = setTimeout(() => {
      this.reconnectTimeoutId = null;
      this.connect();
    }, this.reconnectInterval);

    this.reconnectInterval = Math.min(
      this.reconnectInterval * this.reconnectDecay,
      this.maxReconnectInterval
    );
  }

  public send(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(data);
    }
  }

  public close(code?: number, reason?: string) {
    this.forcedClose = true;
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }
    if (this.socket) {
      this.socket.close(code, reason);
    }
  }

  public addEventListener(type: string, listener: WebSocketEventListener) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(listener);
  }

  public removeEventListener(type: string, listener: WebSocketEventListener) {
    if (!this.listeners[type]) return;
    this.listeners[type] = this.listeners[type].filter((l) => l !== listener);
  }

  private emit(type: string, event: Event | MessageEvent | CloseEvent) {
    if (this.listeners[type]) {
      this.listeners[type].forEach((l) => l(event));
    }
  }

  public get readyState() {
    return this.socket ? this.socket.readyState : WebSocket.CLOSED;
  }
}

export default ReconnectingWebSocket;
