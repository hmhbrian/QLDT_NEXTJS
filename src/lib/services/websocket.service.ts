/**
 * WebSocket Service for Real-time Updates
 * Tối ưu realtime cho khóa học - tự động cập nhật khi admin thay đổi
 */

import { API_CONFIG } from "@/lib/config";

export interface WebSocketMessage {
  type:
    | "course_update"
    | "course_create"
    | "course_delete"
    | "progress_update"
    | "enrollment_update"
    | "lesson_update"
    | "test_update"
    | "attached_file_update";
  data: any;
  userId?: string;
  courseId?: string;
  timestamp: number;
  action?: "create" | "update" | "delete" | "status_change";
}

export interface WebSocketConfig {
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
}

class WebSocketManager {
  private static instance: WebSocketManager;
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private listeners = new Map<string, Set<(data: any) => void>>();
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;

  private readonly config: WebSocketConfig = {
    reconnectInterval: 5000, // 5 giây
    maxReconnectAttempts: 10,
    heartbeatInterval: 30000, // 30 giây
  };

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  connect(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        // Wait for existing connection attempt
        const checkConnection = () => {
          if (this.ws?.readyState === WebSocket.OPEN) {
            resolve();
          } else if (!this.isConnecting) {
            reject(new Error("Connection failed"));
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
        return;
      }

      this.isConnecting = true;

      // Construct WebSocket URL
      const wsUrl = `${
        API_CONFIG.WS_BASE_URL || "ws://localhost:5228/ws"
      }?userId=${userId}`;

      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log("🔗 WebSocket connected");
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.warn("Failed to parse WebSocket message:", error);
          }
        };

        this.ws.onclose = (event) => {
          console.log("🔌 WebSocket disconnected:", event.code, event.reason);
          this.isConnecting = false;
          this.stopHeartbeat();

          // Auto-reconnect nếu không phải disconnect có chỉ ý
          if (
            event.code !== 1000 &&
            this.reconnectAttempts < this.config.maxReconnectAttempts
          ) {
            this.scheduleReconnect(userId);
          }
        };

        this.ws.onerror = (error) => {
          console.error("❌ WebSocket error:", error);
          this.isConnecting = false;
          reject(error);
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private scheduleReconnect(userId: string): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      console.log(
        `🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`
      );
      this.connect(userId).catch(() => {
        // Sẽ tự động retry hoặc dừng khi đạt max attempts
      });
    }, this.config.reconnectInterval * Math.pow(2, Math.min(this.reconnectAttempts, 5))); // Exponential backoff
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "ping", timestamp: Date.now() }));
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    const { type, data, courseId, action } = message;

    console.log(`📨 WebSocket realtime update:`, { type, courseId, action });

    // Gửi tới listeners theo type cụ thể
    const typeListeners = this.listeners.get(type);
    if (typeListeners) {
      typeListeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error("Error in WebSocket listener:", error);
        }
      });
    }

    // Gửi tới listeners theo courseId (cho realtime course updates)
    if (courseId) {
      const courseListeners = this.listeners.get(`course_${courseId}`);
      if (courseListeners) {
        courseListeners.forEach((callback) => {
          try {
            callback({ type, data, action });
          } catch (error) {
            console.error("Error in course WebSocket listener:", error);
          }
        });
      }
    }

    // Gửi tới listeners chung (all events)
    const allListeners = this.listeners.get("all");
    if (allListeners) {
      allListeners.forEach((callback) => {
        try {
          callback(message);
        } catch (error) {
          console.error("Error in WebSocket all listener:", error);
        }
      });
    }
  }

  // Subscribe to specific event types
  subscribe(eventType: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    const listeners = this.listeners.get(eventType)!;
    listeners.add(callback);

    // Return unsubscribe function
    return () => {
      listeners.delete(callback);
      if (listeners.size === 0) {
        this.listeners.delete(eventType);
      }
    };
  }

  // Send message to server
  send(message: Partial<WebSocketMessage>): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          ...message,
          timestamp: Date.now(),
        })
      );
    } else {
      console.warn("WebSocket not connected, cannot send message:", message);
    }
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.stopHeartbeat();

    if (this.ws) {
      this.ws.close(1000, "Client disconnect");
      this.ws = null;
    }

    this.listeners.clear();
    this.reconnectAttempts = 0;
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const webSocketManager = WebSocketManager.getInstance();

// Hook để sử dụng WebSocket
export function useWebSocket() {
  return {
    manager: webSocketManager,
    isConnected: webSocketManager.isConnected,
  };
}
