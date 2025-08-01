/**
 * Data Sync Hook - Quản lý đồng bộ data chuyên nghiệp
 * Tương tự cách GitHub xử lý real-time data updates
 */

import { useCallback, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { cacheManager, stateSyncManager } from "@/lib/cache";

export interface DataSyncOptions {
  onlineSync?: boolean;
  focusSync?: boolean;
  intervalSync?: number; // milliseconds
  dependencies?: string[];
}

export function useDataSync(options: DataSyncOptions = {}) {
  const queryClient = useQueryClient();
  const syncTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const {
    onlineSync = true,
    focusSync = true,
    intervalSync,
    dependencies = [],
  } = options;

  // Force invalidate and refetch specific data
  const invalidateData = useCallback(
    (keys: string | string[], immediate = true) => {
      const keyArray = Array.isArray(keys) ? keys : [keys];

      keyArray.forEach((key) => {
        // Invalidate React Query cache
        queryClient.invalidateQueries({ queryKey: [key] });

        // Invalidate custom cache
        cacheManager.invalidateByPattern(key);

        // Invalidate state sync
        stateSyncManager.invalidateState(key);
      });

      if (immediate) {
        // Refetch immediately
        keyArray.forEach((key) => {
          queryClient.refetchQueries({ queryKey: [key] });
        });
      }
    },
    [queryClient]
  );

  // Debounced invalidation
  const debouncedInvalidate = useCallback(
    (keys: string | string[], delay = 500) => {
      const keyArray = Array.isArray(keys) ? keys : [keys];
      const cacheKey = keyArray.join(",");

      // Clear existing timeout
      const existingTimeout = syncTimeoutsRef.current.get(cacheKey);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Set new timeout
      const timeout = setTimeout(() => {
        invalidateData(keyArray);
        syncTimeoutsRef.current.delete(cacheKey);
      }, delay);

      syncTimeoutsRef.current.set(cacheKey, timeout);
    },
    [invalidateData]
  );

  // Refresh all stale data
  const refreshStaleData = useCallback(async () => {
    console.log("Refreshing stale data...");

    // Get stale queries
    const staleQueries = queryClient
      .getQueryCache()
      .getAll()
      .filter((query) => query.isStale());

    if (staleQueries.length > 0) {
      console.log(`Found ${staleQueries.length} stale queries`);

      // Refetch stale queries
      await queryClient.refetchQueries({ stale: true });
    }

    // Clean up expired cache
    const stats = cacheManager.getStats();
    if (stats.expired > 0) {
      console.log(`Cleaning up ${stats.expired} expired cache entries`);
    }
  }, [queryClient]);

  // Sync specific data patterns
  const syncDataPattern = useCallback(
    async (pattern: string) => {
      // Invalidate cache by pattern
      cacheManager.invalidateByPattern(pattern);

      // Get matching queries and refetch
      const matchingQueries = queryClient
        .getQueryCache()
        .getAll()
        .filter((query) => {
          const queryKey = query.queryKey.join(":");
          return new RegExp(pattern).test(queryKey);
        });

      if (matchingQueries.length > 0) {
        console.log(
          `Syncing ${matchingQueries.length} queries matching pattern: ${pattern}`
        );

        await Promise.all(
          matchingQueries.map((query) =>
            queryClient.refetchQueries({ queryKey: query.queryKey })
          )
        );
      }
    },
    [queryClient]
  );

  // Handle browser online event
  useEffect(() => {
    if (!onlineSync) return;

    const handleOnline = () => {
      console.log("Browser back online - syncing all data");
      refreshStaleData();
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [onlineSync, refreshStaleData]);

  // Handle window focus event
  useEffect(() => {
    if (!focusSync) return;

    const handleFocus = () => {
      console.log("Window focused - checking for stale data");
      refreshStaleData();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [focusSync, refreshStaleData]);

  // Handle periodic sync
  useEffect(() => {
    if (!intervalSync) return;

    const interval = setInterval(() => {
      refreshStaleData();
    }, intervalSync);

    return () => clearInterval(interval);
  }, [intervalSync, refreshStaleData]);

  // Handle dependencies sync
  useEffect(() => {
    if (dependencies.length === 0) return;

    const unsubscribers = dependencies.map((dep) =>
      stateSyncManager.subscribe(dep, (newData) => {
        if (newData === null) {
          // Data was invalidated
          invalidateData(dep, false);
        }
      })
    );

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [dependencies, invalidateData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      syncTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      syncTimeoutsRef.current.clear();
    };
  }, []);

  return {
    invalidateData,
    debouncedInvalidate,
    refreshStaleData,
    syncDataPattern,
    getCacheStats: () => cacheManager.getStats(),
    getQueryStats: () => ({
      queries: queryClient.getQueryCache().getAll().length,
      stale: queryClient
        .getQueryCache()
        .getAll()
        .filter((q) => q.isStale()).length,
      fetching: queryClient
        .getQueryCache()
        .getAll()
        .filter((q) => q.state.fetchStatus === "fetching").length,
    }),
  };
}

// Hook for specific data types
export function useUserDataSync() {
  return useDataSync({
    onlineSync: true,
    focusSync: true,
    intervalSync: 10 * 60 * 1000, // 10 minutes
    dependencies: ["current_user", "user_profile"],
  });
}

export function useCourseDataSync() {
  return useDataSync({
    onlineSync: true,
    focusSync: true,
    intervalSync: 5 * 60 * 1000, // 5 minutes
    dependencies: ["courses", "enrolled_courses", "course_progress"],
  });
}

export function useSystemDataSync() {
  return useDataSync({
    onlineSync: true,
    focusSync: false, // Don't sync system data on focus
    intervalSync: 30 * 60 * 1000, // 30 minutes
    dependencies: ["system_settings", "notifications"],
  });
}
