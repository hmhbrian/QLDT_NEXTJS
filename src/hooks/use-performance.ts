/**
 * Performance Optimization Hooks
 * Lazy loading, caching and optimization utilities
 */

import { useMemo, useCallback, useState, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

/**
 * Memoized filter for better performance
 */
export function useOptimizedFilter<T>(
  items: T[],
  searchTerm: string,
  filterFn: (item: T, search: string) => boolean
) {
  return useMemo(() => {
    if (!searchTerm.trim()) return items;
    const lowercaseSearch = searchTerm.toLowerCase();
    return items.filter(item => filterFn(item, lowercaseSearch));
  }, [items, searchTerm, filterFn]);
}

/**
 * Debounced search with performance optimization
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Virtualized list helper for large datasets
 */
export function useVirtualizedList<T>(items: T[], itemHeight: number = 60) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end);
  }, [items, visibleRange]);

  const handleScroll = useCallback((scrollTop: number, containerHeight: number) => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(start + Math.ceil(containerHeight / itemHeight) + 5, items.length);
    setVisibleRange({ start, end });
  }, [itemHeight, items.length]);

  return { visibleItems, handleScroll, totalHeight: items.length * itemHeight };
}

interface PageData<T> {
  items: T[];
  hasMore: boolean;
}

/**
 * Infinite scroll hook for pagination
 */
export function useInfiniteData<T>(
  queryKey: string[],
  fetchFn: (pageParam: number) => Promise<PageData<T>>,
  enabled: boolean = true
) {
  return useInfiniteQuery<PageData<T>, Error>({
    queryKey,
    queryFn: ({ pageParam }) => fetchFn(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => 
      lastPage.hasMore ? pages.length + 1 : undefined,
    enabled,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

/**
 * Performance optimized table data
 */
export function useOptimizedTableData<T>(
  data: T[],
  pageSize: number = 10,
  currentPage: number = 1
) {
  return useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return {
      pageData: data.slice(startIndex, endIndex),
      totalPages: Math.ceil(data.length / pageSize),
      totalItems: data.length,
    };
  }, [data, pageSize, currentPage]);
}
