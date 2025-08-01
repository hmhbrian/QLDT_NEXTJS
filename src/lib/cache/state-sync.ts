/**
 * State Sync Manager - Đồng bộ state với backend
 * Tương tự cách GitHub xử lý real-time updates và state invalidation
 */

import { cacheManager } from "./cache-manager";

export interface SyncOptions {
  immediate?: boolean;
  debounce?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface StateVersion {
  version: string;
  timestamp: number;
  checksum: string;
}

export type StateChangeListener<T = any> = (
  newState: T,
  oldState: T | null
) => void;

export class StateSyncManager {
  private static instance: StateSyncManager;
  private listeners = new Map<string, Set<StateChangeListener>>();
  private pendingSyncs = new Map<string, NodeJS.Timeout>();
  private websocket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  private constructor() {
    if (typeof window !== "undefined") {
      this.initializeWebSocket();
      this.setupVisibilityListener();
      this.setupOnlineListener();
    }
  }

  static getInstance(): StateSyncManager {
    if (!StateSyncManager.instance) {
      StateSyncManager.instance = new StateSyncManager();
    }
    return StateSyncManager.instance;
  }

  private initializeWebSocket(): void {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!wsUrl) return;

    try {
      this.websocket = new WebSocket(wsUrl);

      this.websocket.onopen = () => {
        console.log("WebSocket connected for state sync");
        this.reconnectAttempts = 0;
      };

      this.websocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleServerStateUpdate(message);
        } catch (error) {
          console.warn("Failed to parse WebSocket message:", error);
        }
      };

      this.websocket.onclose = () => {
        console.log("WebSocket disconnected");
        this.scheduleReconnect();
      };

      this.websocket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    } catch (error) {
      console.warn("Failed to initialize WebSocket:", error);
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn("Max WebSocket reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      console.log(
        `Attempting WebSocket reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );
      this.initializeWebSocket();
    }, delay);
  }

  private setupVisibilityListener(): void {
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        // Tab became visible - sync all cached data
        this.syncAllOnFocus();
      }
    });
  }

  private setupOnlineListener(): void {
    window.addEventListener("online", () => {
      console.log("Browser back online - syncing state");
      this.syncAllOnFocus();
    });
  }

  private async syncAllOnFocus(): Promise<void> {
    // Implement logic to refresh critical data when user returns
    const criticalKeys = ["user_profile", "courses", "notifications"];

    for (const key of criticalKeys) {
      try {
        await this.forceSync(key);
      } catch (error) {
        console.warn(`Failed to sync ${key} on focus:`, error);
      }
    }
  }

  private handleServerStateUpdate(message: any): void {
    const { type, key, data, version } = message;

    switch (type) {
      case "STATE_INVALIDATE":
        this.invalidateState(key);
        break;
      case "STATE_UPDATE":
        this.updateState(key, data, { version });
        break;
      case "BATCH_INVALIDATE":
        message.keys.forEach((k: string) => this.invalidateState(k));
        break;
    }
  }

  // Subscribe to state changes
  subscribe<T>(key: string, listener: StateChangeListener<T>): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }

    this.listeners.get(key)!.add(listener);

    // Return unsubscribe function
    return () => {
      const keyListeners = this.listeners.get(key);
      if (keyListeners) {
        keyListeners.delete(listener);
        if (keyListeners.size === 0) {
          this.listeners.delete(key);
        }
      }
    };
  }

  // Update state and notify listeners
  updateState<T>(
    key: string,
    newState: T,
    options: { version?: string } = {}
  ): void {
    const oldState = cacheManager.get<T>(key);

    // Cache the new state
    cacheManager.set(key, newState, {
      version: options.version || this.generateVersion(),
      maxAge: 10 * 60 * 1000, // 10 minutes default
    });

    // Notify listeners
    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(newState, oldState);
        } catch (error) {
          console.error(`Error in state listener for ${key}:`, error);
        }
      });
    }
  }

  // Invalidate state and notify for refresh
  invalidateState(key: string): void {
    cacheManager.invalidate(key);

    // Notify listeners that state is invalid
    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(null as any, null);
        } catch (error) {
          console.error(`Error in invalidation listener for ${key}:`, error);
        }
      });
    }
  }

  // Force sync with server
  async forceSync(key: string, options: SyncOptions = {}): Promise<void> {
    // Clear pending sync if exists
    const pendingSync = this.pendingSyncs.get(key);
    if (pendingSync) {
      clearTimeout(pendingSync);
      this.pendingSyncs.delete(key);
    }

    if (options.immediate !== false) {
      await this.performSync(key, options);
    } else {
      const debounceTime = options.debounce || 500;
      const timeoutId = setTimeout(() => {
        this.performSync(key, options);
        this.pendingSyncs.delete(key);
      }, debounceTime);

      this.pendingSyncs.set(key, timeoutId);
    }
  }

  private async performSync(key: string, options: SyncOptions): Promise<void> {
    const retryAttempts = options.retryAttempts || 3;
    const retryDelay = options.retryDelay || 1000;

    for (let attempt = 0; attempt < retryAttempts; attempt++) {
      try {
        // Here you would implement actual API call to sync with server
        // For now, we'll simulate with a generic approach
        await this.syncWithServer(key);
        return;
      } catch (error) {
        console.warn(`Sync attempt ${attempt + 1} failed for ${key}:`, error);

        if (attempt < retryAttempts - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, retryDelay * (attempt + 1))
          );
        } else {
          throw error;
        }
      }
    }
  }

  private async syncWithServer(key: string): Promise<void> {
    // This would be implemented based on your API structure
    // Example implementation:

    const token = localStorage.getItem("auth_token");
    if (!token) return;

    const response = await fetch(`/api/sync/${key}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "If-None-Match": cacheManager.get(`${key}_etag`) || "",
      },
    });

    if (response.status === 304) {
      // Not modified - update timestamp only
      const cached = cacheManager.get(key);
      if (cached) {
        cacheManager.set(key, cached, { maxAge: 10 * 60 * 1000 });
      }
      return;
    }

    if (response.ok) {
      const data = await response.json();
      const etag = response.headers.get("etag");

      this.updateState(key, data, { version: etag || undefined });

      if (etag) {
        cacheManager.set(`${key}_etag`, etag);
      }
    }
  }

  private generateVersion(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Cleanup on unmount
  destroy(): void {
    this.pendingSyncs.forEach((timeout) => clearTimeout(timeout));
    this.pendingSyncs.clear();
    this.listeners.clear();

    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }
}

// Export singleton instance
export const stateSyncManager = StateSyncManager.getInstance();
