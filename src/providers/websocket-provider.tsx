/**
 * WebSocket Provider
 * Quản lý kết nối WebSocket toàn ứng dụng
 */

"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { webSocketManager } from "@/lib/services/websocket.service";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

interface WebSocketContextType {
  isConnected: boolean;
  connectionStatus: "connecting" | "connected" | "disconnected" | "error";
  reconnectAttempts: number;
}

const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
  connectionStatus: "disconnected",
  reconnectAttempts: 0,
});

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error(
      "useWebSocketContext must be used within WebSocketProvider"
    );
  }
  return context;
}

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] =
    useState<WebSocketContextType["connectionStatus"]>("disconnected");
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const connectionAttemptRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    if (!user?.id) {
      // Nếu không có user, disconnect
      webSocketManager.disconnect();
      setIsConnected(false);
      setConnectionStatus("disconnected");
      setReconnectAttempts(0);
      return;
    }

    // Tránh multiple connection attempts
    if (connectionAttemptRef.current) {
      return;
    }

    const connectWithRetry = async () => {
      setConnectionStatus("connecting");

      try {
        connectionAttemptRef.current = webSocketManager.connect(user.id);
        await connectionAttemptRef.current;

        setIsConnected(true);
        setConnectionStatus("connected");
        setReconnectAttempts(0);

        // Thông báo kết nối thành công (chỉ lần đầu hoặc sau khi reconnect)
        if (reconnectAttempts > 0) {
          toast({
            title: "🔗 Kết nối khôi phục",
            description: "Dữ liệu sẽ được cập nhật realtime",
            duration: 2000,
          });
        }
      } catch (error) {
        console.warn("WebSocket connection failed:", error);
        setIsConnected(false);
        setConnectionStatus("error");
        setReconnectAttempts((prev) => prev + 1);

        // Chỉ hiển thị toast error sau vài lần thử
        if (reconnectAttempts > 2) {
          toast({
            title: "⚠️ Mất kết nối realtime",
            description:
              "Đang chạy ở chế độ polling. Sẽ tự động thử kết nối lại.",
            variant: "destructive",
            duration: 3000,
          });
        }
      } finally {
        connectionAttemptRef.current = null;
      }
    };

    connectWithRetry();

    // Cleanup khi component unmount hoặc user thay đổi
    return () => {
      webSocketManager.disconnect();
      setIsConnected(false);
      setConnectionStatus("disconnected");
      connectionAttemptRef.current = null;
    };
  }, [user?.id, reconnectAttempts, toast]);

  // Monitor connection status
  useEffect(() => {
    const checkConnection = () => {
      const wsConnected = webSocketManager.isConnected;
      if (wsConnected !== isConnected) {
        setIsConnected(wsConnected);
        setConnectionStatus(wsConnected ? "connected" : "disconnected");
      }
    };

    const interval = setInterval(checkConnection, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [isConnected]);

  const contextValue: WebSocketContextType = {
    isConnected,
    connectionStatus,
    reconnectAttempts,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
}
