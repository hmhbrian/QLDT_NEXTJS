/**
 * Optimized Query Hook
 * Tối ưu performance cho dự án lớn với smart caching
 */

import { useQuery, useQueryClient, QueryKey } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";

interface OptimizedQueryOptions<T> {
  queryKey: QueryKey;
  queryFn: () => Promise<T>;
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
  priority?: "high" | "normal" | "low";
  prefetch?: boolean;
  backgroundSync?: boolean;
}

/**
 * Hook tối ưu cho queries với smart caching và background updates
 */
export function useOptimizedQuery<T>({
  queryKey,
  queryFn,
  enabled = true,
  staleTime,
  gcTime,
  priority = "normal",
  prefetch = false,
  backgroundSync = true,
}: OptimizedQueryOptions<T>) {
  const queryClient = useQueryClient();
  const lastAccessRef = useRef<number>(Date.now());

  // Smart staleTime dựa trên priority
  const getStaleTime = useCallback(() => {
    if (staleTime !== undefined) return staleTime;

    switch (priority) {
      case "high":
        return 1 * 60 * 1000; // 1 phút
      case "low":
        return 15 * 60 * 1000; // 15 phút
      default:
        return 5 * 60 * 1000; // 5 phút
    }
  }, [priority, staleTime]);

  // Smart gcTime dựa trên priority
  const getGcTime = useCallback(() => {
    if (gcTime !== undefined) return gcTime;

    switch (priority) {
      case "high":
        return 10 * 60 * 1000; // 10 phút
      case "low":
        return 60 * 60 * 1000; // 1 giờ
      default:
        return 30 * 60 * 1000; // 30 phút
    }
  }, [priority, gcTime]);

  const query = useQuery<T>({
    queryKey,
    queryFn: async () => {
      lastAccessRef.current = Date.now();
      return queryFn();
    },
    enabled,
    staleTime: getStaleTime(),
    gcTime: getGcTime(),
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: (failureCount, error: any) => {
      // Smart retry logic
      if (failureCount >= 3) return false;

      const status = error?.response?.status;
      // Không retry cho 4xx errors (trừ timeout và rate limit)
      if (status >= 400 && status < 500 && status !== 408 && status !== 429) {
        return false;
      }

      return true;
    },
    retryDelay: (attemptIndex) => {
      // Exponential backoff với jitter
      const baseDelay = Math.min(1000 * Math.pow(2, attemptIndex), 10000);
      const jitter = Math.random() * 0.1 * baseDelay;
      return baseDelay + jitter;
    },
  });

  // Prefetch logic cho performance
  useEffect(() => {
    if (prefetch && enabled) {
      const prefetchTimer = setTimeout(() => {
        queryClient.prefetchQuery({
          queryKey,
          queryFn,
          staleTime: getStaleTime(),
        });
      }, 100); // Delay nhỏ để không block main thread

      return () => clearTimeout(prefetchTimer);
    }
  }, [prefetch, enabled, queryClient, queryKey, queryFn, getStaleTime]);

  // Background sync cho data mới
  useEffect(() => {
    if (!backgroundSync || !enabled) return;

    const syncTimer = setInterval(() => {
      // Chỉ sync nếu data đã stale và user đang active
      const timeSinceAccess = Date.now() - lastAccessRef.current;
      const isRecentlyAccessed = timeSinceAccess < 5 * 60 * 1000; // 5 phút

      if (isRecentlyAccessed && query.isStale && !query.isFetching) {
        query.refetch();
      }
    }, getStaleTime());

    return () => clearInterval(syncTimer);
  }, [backgroundSync, enabled, query, getStaleTime]);

  // Cleanup unused queries để tiết kiệm memory
  useEffect(() => {
    return () => {
      const timeSinceAccess = Date.now() - lastAccessRef.current;
      const isOldData = timeSinceAccess > getGcTime();

      if (isOldData && priority === "low") {
        // Chỉ remove low priority queries khi không sử dụng lâu
        setTimeout(() => {
          queryClient.removeQueries({ queryKey, exact: true });
        }, 1000);
      }
    };
  }, [queryClient, queryKey, getGcTime, priority]);

  return {
    ...query,
    lastAccess: lastAccessRef.current,
    priority,
  };
}

/**
 * Hook cho infinite queries với virtual scrolling
 */
export function useOptimizedInfiniteQuery<T>({
  queryKey,
  queryFn,
  enabled = true,
  staleTime = 5 * 60 * 1000,
  pageSize = 20,
}: {
  queryKey: QueryKey;
  queryFn: (pageParam: number) => Promise<{ data: T[]; hasNextPage: boolean }>;
  enabled?: boolean;
  staleTime?: number;
  pageSize?: number;
}) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey,
    queryFn: async () => {
      // Load first page
      const firstPage = await queryFn(1);
      return {
        pages: [firstPage],
        pageParams: [1],
      };
    },
    enabled,
    staleTime,
    gcTime: staleTime * 2,
    refetchOnWindowFocus: true,
  });
}

/**
 * Batch query hook cho multiple queries cùng lúc
 */
export function useBatchQueries<T extends Record<string, any>>(
  queries: Array<{
    key: keyof T;
    queryKey: QueryKey;
    queryFn: () => Promise<T[keyof T]>;
    enabled?: boolean;
  }>
) {
  const results = {} as {
    [K in keyof T]: ReturnType<typeof useOptimizedQuery>;
  };

  queries.forEach(({ key, queryKey, queryFn, enabled = true }) => {
    results[key] = useOptimizedQuery({
      queryKey,
      queryFn,
      enabled,
      priority: "normal",
    });
  });

  const isLoading = Object.values(results).some((query) => query.isLoading);
  const isError = Object.values(results).some((query) => query.isError);
  const data = {} as T;

  Object.entries(results).forEach(([key, query]) => {
    data[key as keyof T] = query.data as T[keyof T];
  });

  return {
    data,
    isLoading,
    isError,
    queries: results,
  };
}
