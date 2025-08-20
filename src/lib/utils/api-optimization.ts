/**
 * Smart API Batching and Optimization Utilities
 * Reduces server load and improves performance
 */

interface BatchRequest {
  id: string;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  payload: any;
  timestamp: number;
}

interface BatchConfig {
  maxBatchSize?: number;
  batchDelay?: number;
  maxWaitTime?: number;
}

/**
 * API Request Batcher
 * Batches multiple API requests into a single call
 */
export class APIBatcher {
  private batches: Map<string, BatchRequest[]> = new Map();
  private timeouts: Map<string, NodeJS.Timeout> = new Map();
  private config: Required<BatchConfig>;

  constructor(config: BatchConfig = {}) {
    this.config = {
      maxBatchSize: config.maxBatchSize || 10,
      batchDelay: config.batchDelay || 50,
      maxWaitTime: config.maxWaitTime || 1000,
    };
  }

  /**
   * Add request to batch
   */
  batch<T>(
    batchKey: string,
    payload: any,
    batchFn: (payloads: any[]) => Promise<T[]>
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const request: BatchRequest = {
        id: `${Date.now()}-${Math.random()}`,
        resolve,
        reject,
        payload,
        timestamp: Date.now(),
      };

      // Initialize batch if doesn't exist
      if (!this.batches.has(batchKey)) {
        this.batches.set(batchKey, []);
      }

      const batch = this.batches.get(batchKey)!;
      batch.push(request);

      // Execute immediately if batch is full
      if (batch.length >= this.config.maxBatchSize) {
        this.executeBatch(batchKey, batchFn);
        return;
      }

      // Set timeout for batch execution
      if (!this.timeouts.has(batchKey)) {
        const timeout = setTimeout(() => {
          this.executeBatch(batchKey, batchFn);
        }, this.config.batchDelay);

        this.timeouts.set(batchKey, timeout);
      }

      // Force execution if request is too old
      const oldestRequest = batch[0];
      if (Date.now() - oldestRequest.timestamp > this.config.maxWaitTime) {
        this.executeBatch(batchKey, batchFn);
      }
    });
  }

  private async executeBatch<T>(
    batchKey: string,
    batchFn: (payloads: any[]) => Promise<T[]>
  ) {
    const batch = this.batches.get(batchKey);
    if (!batch || batch.length === 0) return;

    // Clear timeout and batch
    const timeout = this.timeouts.get(batchKey);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(batchKey);
    }
    this.batches.delete(batchKey);

    try {
      const payloads = batch.map((req) => req.payload);
      const results = await batchFn(payloads);

      // Resolve each request with its result
      batch.forEach((request, index) => {
        if (results[index] !== undefined) {
          request.resolve(results[index]);
        } else {
          request.reject(new Error("No result for request"));
        }
      });
    } catch (error) {
      // Reject all requests in batch
      batch.forEach((request) => request.reject(error));
    }
  }
}

/**
 * Smart Cache with TTL and LRU eviction
 */
export class SmartCache<T = any> {
  private cache = new Map<
    string,
    { data: T; timestamp: number; hits: number }
  >();
  private readonly maxSize: number;
  private readonly ttl: number;

  constructor(maxSize: number = 100, ttlMinutes: number = 10) {
    this.maxSize = maxSize;
    this.ttl = ttlMinutes * 60 * 1000;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update hit count for LRU
    entry.hits++;
    return entry.data;
  }

  set(key: string, data: T): void {
    // Evict if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      hits: 0,
    });
  }

  private evictLRU(): void {
    let lruKey: string | null = null;
    let minHits = Infinity;
    let oldestTime = Infinity;

    this.cache.forEach((entry, key) => {
      // First, remove expired entries
      if (Date.now() - entry.timestamp > this.ttl) {
        this.cache.delete(key);
        return;
      }

      // Find LRU entry
      if (
        entry.hits < minHits ||
        (entry.hits === minHits && entry.timestamp < oldestTime)
      ) {
        minHits = entry.hits;
        oldestTime = entry.timestamp;
        lruKey = key;
      }
    });

    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

/**
 * Intelligent Debouncer with priority support
 */
export class SmartDebouncer {
  private timeouts = new Map<string, NodeJS.Timeout>();
  private priorities = new Map<string, number>();

  debounce<T extends (...args: any[]) => any>(
    key: string,
    fn: T,
    delay: number,
    priority: number = 0
  ): (...args: Parameters<T>) => void {
    return (...args: Parameters<T>) => {
      const existingTimeout = this.timeouts.get(key);
      const existingPriority = this.priorities.get(key) || 0;

      // If new call has higher priority, execute immediately
      if (priority > existingPriority && existingTimeout) {
        clearTimeout(existingTimeout);
        this.timeouts.delete(key);
        fn(...args);
        return;
      }

      // Clear existing timeout
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Set new timeout
      const timeout = setTimeout(() => {
        this.timeouts.delete(key);
        this.priorities.delete(key);
        fn(...args);
      }, delay);

      this.timeouts.set(key, timeout);
      this.priorities.set(key, priority);
    };
  }

  cancel(key: string): void {
    const timeout = this.timeouts.get(key);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(key);
      this.priorities.delete(key);
    }
  }

  cancelAll(): void {
    this.timeouts.forEach((timeout) => clearTimeout(timeout));
    this.timeouts.clear();
    this.priorities.clear();
  }
}

// Global instances
export const globalBatcher = new APIBatcher();
export const globalCache = new SmartCache();
export const globalDebouncer = new SmartDebouncer();

/**
 * React Hook for using the batcher
 */
export function useBatcher() {
  return {
    batch: <T>(
      key: string,
      payload: any,
      batchFn: (payloads: any[]) => Promise<T[]>
    ) => globalBatcher.batch(key, payload, batchFn),
  };
}

/**
 * React Hook for using smart cache
 */
export function useSmartCache<T>() {
  return {
    get: (key: string) => globalCache.get(key) as T | null,
    set: (key: string, data: T) => globalCache.set(key, data),
    clear: () => globalCache.clear(),
    size: () => globalCache.size(),
  };
}

/**
 * React Hook for smart debouncing
 */
export function useSmartDebounce() {
  return {
    debounce: <T extends (...args: any[]) => any>(
      key: string,
      fn: T,
      delay: number,
      priority?: number
    ) => globalDebouncer.debounce(key, fn, delay, priority),
    cancel: (key: string) => globalDebouncer.cancel(key),
    cancelAll: () => globalDebouncer.cancelAll(),
  };
}
