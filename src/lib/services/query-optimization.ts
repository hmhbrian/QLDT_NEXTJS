/**
 * Query Optimization Service
 * Implements GitHub-style query optimizations for better performance
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class QueryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set<T>(key: string, data: T, ttl = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  invalidate(pattern: string): void {
    const keys = Array.from(this.cache.keys()).filter((key) =>
      key.includes(pattern)
    );
    keys.forEach((key) => this.cache.delete(key));
  }

  clear(): void {
    this.cache.clear();
  }
}

// Global cache instance
export const queryCache = new QueryCache();

// Query deduplication
const pendingQueries = new Map<string, Promise<any>>();

export function dedupedQuery<T>(
  key: string,
  queryFn: () => Promise<T>
): Promise<T> {
  // Check if query is already pending
  if (pendingQueries.has(key)) {
    return pendingQueries.get(key)!;
  }

  // Check cache first
  const cached = queryCache.get<T>(key);
  if (cached) {
    return Promise.resolve(cached);
  }

  // Execute query
  const promise = queryFn()
    .then((result) => {
      queryCache.set(key, result);
      return result;
    })
    .finally(() => {
      pendingQueries.delete(key);
    });

  pendingQueries.set(key, promise);
  return promise;
}

// Batch loading utilities
export class DataLoader<K, V> {
  private readonly batchLoadFn: (keys: K[]) => Promise<V[]>;
  private readonly maxBatchSize: number;
  private readonly batchDelay: number;
  private batch: {
    key: K;
    resolve: (value: V) => void;
    reject: (error: any) => void;
  }[] = [];
  private timeoutId: NodeJS.Timeout | null = null;

  constructor(
    batchLoadFn: (keys: K[]) => Promise<V[]>,
    options: { maxBatchSize?: number; batchDelay?: number } = {}
  ) {
    this.batchLoadFn = batchLoadFn;
    this.maxBatchSize = options.maxBatchSize || 100;
    this.batchDelay = options.batchDelay || 10;
  }

  load(key: K): Promise<V> {
    return new Promise((resolve, reject) => {
      this.batch.push({ key, resolve, reject });

      if (this.batch.length >= this.maxBatchSize) {
        this.executeBatch();
      } else if (!this.timeoutId) {
        this.timeoutId = setTimeout(() => this.executeBatch(), this.batchDelay);
      }
    });
  }

  private async executeBatch(): Promise<void> {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    const currentBatch = this.batch.splice(0);
    if (currentBatch.length === 0) return;

    try {
      const keys = currentBatch.map((item) => item.key);
      const results = await this.batchLoadFn(keys);

      currentBatch.forEach((item, index) => {
        item.resolve(results[index]);
      });
    } catch (error) {
      currentBatch.forEach((item) => {
        item.reject(error);
      });
    }
  }
}

// Optimized query keys
export const QueryKeys = {
  // Users
  users: (params?: any) => ["users", params],
  user: (id: string) => ["user", id],
  userProfile: (id: string) => ["user-profile", id],

  // Courses
  courses: (params?: any) => ["courses", params],
  course: (id: string) => ["course", id],
  courseDetails: (id: string) => ["course-details", id],

  // Departments
  departments: () => ["departments"],
  department: (id: string) => ["department", id],

  // EmployeeLevel
  EmployeeLevel: () => ["EmployeeLevel"],
  employeeLevel: (id: string) => ["employeeLevel", id],

  // Enrollments
  enrollments: (userId?: string) => ["enrollments", userId],
  userEnrollments: (userId: string) => ["user-enrollments", userId],
} as const;

// Cache invalidation helpers
export const CacheInvalidation = {
  invalidateUser: (userId?: string) => {
    if (userId) {
      queryCache.invalidate(`user-${userId}`);
      queryCache.invalidate(`user-profile-${userId}`);
      queryCache.invalidate(`user-enrollments-${userId}`);
    }
    queryCache.invalidate("users");
  },

  invalidateCourse: (courseId?: string) => {
    if (courseId) {
      queryCache.invalidate(`course-${courseId}`);
      queryCache.invalidate(`course-details-${courseId}`);
    }
    queryCache.invalidate("courses");
    queryCache.invalidate("enrollments");
  },

  invalidateDepartment: (deptId?: string) => {
    if (deptId) {
      queryCache.invalidate(`department-${deptId}`);
    }
    queryCache.invalidate("departments");
    queryCache.invalidate("users"); // Users have department info
  },
};

// Background prefetching
export class PrefetchManager {
  private static instance: PrefetchManager;
  private prefetchQueue: Array<() => Promise<any>> = [];
  private isProcessing = false;

  static getInstance(): PrefetchManager {
    if (!PrefetchManager.instance) {
      PrefetchManager.instance = new PrefetchManager();
    }
    return PrefetchManager.instance;
  }

  addToPrefetchQueue(prefetchFn: () => Promise<any>): void {
    this.prefetchQueue.push(prefetchFn);
    this.processPrefetchQueue();
  }

  private async processPrefetchQueue(): Promise<void> {
    if (this.isProcessing || this.prefetchQueue.length === 0) return;

    this.isProcessing = true;

    while (this.prefetchQueue.length > 0) {
      const prefetchFn = this.prefetchQueue.shift()!;
      try {
        await prefetchFn();
      } catch (error) {
        console.warn("Prefetch failed:", error);
      }

      // Small delay to prevent overwhelming the server
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    this.isProcessing = false;
  }
}

export const prefetchManager = PrefetchManager.getInstance();
