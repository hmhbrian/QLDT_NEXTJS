
/**
 * Data Fetching Hooks
 * Enterprise-grade hooks for API data fetching with caching, error handling, and optimistic updates
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useError } from "./use-error";

interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
  mutate: (updater: (prev: T | null) => T | null) => void;
}

interface UseAsyncOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  retryCount?: number;
  retryDelay?: number;
}

/**
 * Universal async hook for API calls with error handling
 */
export function useAsync<T = any>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions = {}
): UseAsyncState<T> {
  const {
    immediate = true,
    onSuccess,
    onError,
    retryCount = 3,
    retryDelay = 1000,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<Error | null>(null);

  const { handleError } = useError();
  const retryCountRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await asyncFunction(...args);

        if (mountedRef.current) {
          setData(result);
          setError(null);
          retryCountRef.current = 0;
          onSuccess?.(result);
        }

        return result;
      } catch (err) {
        if (!mountedRef.current) return null;

        const error = err instanceof Error ? err : new Error(String(err));

        // Retry logic
        if (retryCountRef.current < retryCount) {
          retryCountRef.current++;

          setTimeout(() => {
            if (mountedRef.current) {
              execute(...args);
            }
          }, retryDelay * retryCountRef.current);

          return null;
        }

        setError(error);
        handleError(error);
        onError?.(error);
        return null;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [asyncFunction, handleError, onSuccess, onError, retryCount, retryDelay]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    retryCountRef.current = 0;
  }, []);

  const mutate = useCallback((updater: (prev: T | null) => T | null) => {
    setData(updater);
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    mutate,
  };
}

/**
 * Hook for fetching paginated data
 */
interface UsePaginatedDataOptions extends UseAsyncOptions {
  pageSize?: number;
  initialPage?: number;
}

interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function usePaginatedData<T>(
  fetchFunction: (
    page: number,
    pageSize: number
  ) => Promise<PaginatedResult<T>>,
  options: UsePaginatedDataOptions = {}
) {
  const { pageSize = 10, initialPage = 1, ...asyncOptions } = options;

  const [page, setPage] = useState(initialPage);
  const [allData, setAllData] = useState<T[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const {
    data,
    loading,
    error,
    execute: fetchPage,
  } = useAsync(() => fetchFunction(page, pageSize), {
    ...asyncOptions,
    immediate: false,
    onSuccess: (result: PaginatedResult<T>) => {
      setAllData((prev) =>
        page === 1 ? result.items : [...prev, ...result.items]
      );
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
    },
  });

  const loadMore = useCallback(() => {
    if (page < totalPages && !loading) {
      setPage((prev) => prev + 1);
    }
  }, [page, totalPages, loading]);

  const refresh = useCallback(() => {
    setPage(1);
    setAllData([]);
    fetchPage();
  }, [fetchPage]);

  const goToPage = useCallback(
    (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setPage(newPage);
      }
    },
    [totalPages]
  );

  useEffect(() => {
    fetchPage();
  }, [page, fetchPage]);

  return {
    data: allData,
    currentPageData: data?.items || [],
    loading,
    error,
    page,
    totalPages,
    totalCount,
    hasMore: page < totalPages,
    loadMore,
    refresh,
    goToPage,
  };
}

/**
 * Hook for optimistic updates
 */
export function useOptimisticUpdate<T>(
  data: T[],
  updateFunction: (item: Partial<T> & { id: string }) => Promise<T>
) {
  const [optimisticData, setOptimisticData] = useState<T[]>(data);
  const { handleError } = useError();

  useEffect(() => {
    setOptimisticData(data);
  }, [data]);

  const update = useCallback(
    async (item: Partial<T> & { id: string }) => {
      // Optimistic update
      setOptimisticData((prev) =>
        prev.map((existing) =>
          (existing as any).id === item.id ? { ...existing, ...item } : existing
        )
      );

      try {
        const updatedItem = await updateFunction(item);
        // Update with real data from server
        setOptimisticData((prev) =>
          prev.map((existing) =>
            (existing as any).id === item.id ? updatedItem : existing
          )
        );
        return updatedItem;
      } catch (error) {
        // Revert optimistic update on error
        setOptimisticData(data);
        handleError(error);
        throw error;
      }
    },
    [data, updateFunction, handleError]
  );

  return {
    data: optimisticData,
    update,
  };
}
