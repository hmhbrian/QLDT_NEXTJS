/**
 * Cache Manager - Quản lý cache chuyên nghiệp
 * Tương tự như cách GitHub xử lý cache và state management
 */

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  expiresAt: number;
  etag?: string;
  lastModified?: string;
  version: string;
}

export interface CacheOptions {
  maxAge?: number; // milliseconds
  staleWhileRevalidate?: number; // milliseconds
  version?: string;
  tags?: string[];
}

export class CacheManager {
  private static instance: CacheManager;
  private cache = new Map<string, CacheEntry>();
  private storage: Storage | null = null;
  private maxMemoryEntries = 1000;
  private defaultMaxAge = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    if (typeof window !== "undefined") {
      this.storage = window.localStorage;
      this.loadFromStorage();
    }
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  private generateKey(prefix: string, params?: Record<string, any>): string {
    if (!params) return prefix;
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {} as Record<string, any>);
    return `${prefix}:${JSON.stringify(sortedParams)}`;
  }

  private loadFromStorage(): void {
    if (!this.storage) return;

    try {
      const cached = this.storage.getItem("cache_manager_data");
      if (cached) {
        const entries = JSON.parse(cached);
        const now = Date.now();

        // Load only non-expired entries
        Object.entries(entries).forEach(([key, entry]: [string, any]) => {
          if (entry.expiresAt > now) {
            this.cache.set(key, entry);
          }
        });
      }
    } catch (error) {
      console.warn("Failed to load cache from storage:", error);
    }
  }

  private saveToStorage(): void {
    if (!this.storage) return;

    try {
      const now = Date.now();
      const validEntries: Record<string, CacheEntry> = {};

      // Save only non-expired entries
      this.cache.forEach((entry, key) => {
        if (entry.expiresAt > now) {
          validEntries[key] = entry;
        }
      });

      this.storage.setItem("cache_manager_data", JSON.stringify(validEntries));
    } catch (error) {
      console.warn("Failed to save cache to storage:", error);
    }
  }

  set<T>(
    key: string,
    data: T,
    options: CacheOptions = {},
    params?: Record<string, any>
  ): void {
    const cacheKey = this.generateKey(key, params);
    const now = Date.now();
    const maxAge = options.maxAge || this.defaultMaxAge;

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + maxAge,
      version: options.version || "1.0.0",
      etag: this.generateETag(data),
    };

    this.cache.set(cacheKey, entry);

    // Cleanup old entries if memory limit exceeded
    if (this.cache.size > this.maxMemoryEntries) {
      this.cleanup();
    }

    this.saveToStorage();
  }

  get<T>(key: string, params?: Record<string, any>): T | null {
    const cacheKey = this.generateKey(key, params);
    const entry = this.cache.get(cacheKey);

    if (!entry) return null;

    const now = Date.now();

    // Check if expired
    if (entry.expiresAt <= now) {
      this.cache.delete(cacheKey);
      this.saveToStorage();
      return null;
    }

    return entry.data as T;
  }

  has(key: string, params?: Record<string, any>): boolean {
    const cacheKey = this.generateKey(key, params);
    const entry = this.cache.get(cacheKey);

    if (!entry) return false;

    const now = Date.now();
    if (entry.expiresAt <= now) {
      this.cache.delete(cacheKey);
      return false;
    }

    return true;
  }

  invalidate(key: string, params?: Record<string, any>): void {
    const cacheKey = this.generateKey(key, params);
    this.cache.delete(cacheKey);
    this.saveToStorage();
  }

  invalidateByPattern(pattern: string): void {
    const keys = Array.from(this.cache.keys());
    const regex = new RegExp(pattern);

    keys.forEach((key) => {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    });

    this.saveToStorage();
  }

  clear(): void {
    this.cache.clear();
    if (this.storage) {
      this.storage.removeItem("cache_manager_data");
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());

    // Sort by timestamp (oldest first)
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

    // Remove expired entries first
    entries.forEach(([key, entry]) => {
      if (entry.expiresAt <= now) {
        this.cache.delete(key);
      }
    });

    // If still over limit, remove oldest entries
    if (this.cache.size > this.maxMemoryEntries) {
      const toRemove = this.cache.size - this.maxMemoryEntries + 100; // Remove extra for buffer
      entries.slice(0, toRemove).forEach(([key]) => {
        this.cache.delete(key);
      });
    }
  }

  private generateETag<T>(data: T): string {
    try {
      // Use a safer method to generate ETag that handles Unicode characters
      const jsonString = JSON.stringify(data);
      const encoder = new TextEncoder();
      const uint8Array = encoder.encode(jsonString);

      // Create a simple hash from the byte array
      let hash = 0;
      for (let i = 0; i < uint8Array.length; i++) {
        hash = ((hash << 5) - hash + uint8Array[i]) & 0xffffffff;
      }

      // Convert to base36 string and take first 16 chars
      return Math.abs(hash).toString(36).padStart(8, "0").slice(0, 16);
    } catch (error) {
      // Fallback to timestamp-based ETag
      return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.slice(
        0,
        16
      );
    }
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    let expired = 0;
    let valid = 0;

    this.cache.forEach((entry) => {
      if (entry.expiresAt <= now) {
        expired++;
      } else {
        valid++;
      }
    });

    return {
      total: this.cache.size,
      valid,
      expired,
      maxEntries: this.maxMemoryEntries,
    };
  }
}

// Export singleton instance
export const cacheManager = CacheManager.getInstance();
