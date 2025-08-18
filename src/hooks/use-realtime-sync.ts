/**
 * Real-time Data Synchronization Hook
 * Provides smart, efficient real-time updates for better UX/UI
 */

import { useEffect, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

interface RealtimeConfig {
  enabled?: boolean;
  interval?: number;
  onUpdate?: (data: any) => void;
  priority?: "high" | "normal" | "low";
}

/**
 * Smart real-time hook that manages data synchronization
 * Only fetches when necessary and user is active
 */
export function useRealtimeSync(
  queryKeys: string[],
  config: RealtimeConfig = {}
) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(true);
  const lastUpdateRef = useRef<number>(Date.now());

  const {
    enabled = true,
    interval = 30000, // 30 seconds default
    onUpdate,
    priority = "normal",
  } = config;

  // Smart intervals based on priority
  const getInterval = useCallback(() => {
    const baseInterval = interval;
    switch (priority) {
      case "high":
        return baseInterval / 2; // More frequent for critical data
      case "low":
        return baseInterval * 2; // Less frequent for non-critical data
      default:
        return baseInterval;
    }
  }, [interval, priority]);

  // Check if user is active and data needs update
  const shouldUpdate = useCallback(() => {
    if (!enabled || !user || !isActiveRef.current) return false;

    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;

    // Only update if enough time has passed
    return timeSinceLastUpdate >= getInterval();
  }, [enabled, user, getInterval]);

  // Smart invalidation - only invalidate stale data
  const syncData = useCallback(async () => {
    if (!shouldUpdate()) return;

    try {
      const queries = queryClient.getQueryCache().getAll();
      const staleBatch: string[] = [];

      // Collect stale queries that need updating
      queries.forEach((query) => {
        const queryKey = query.queryKey;
        if (queryKeys.some((key) => queryKey.includes(key))) {
          const isStale =
            query.state.dataUpdatedAt < Date.now() - getInterval();
          if (isStale) {
            staleBatch.push(queryKey.join("-"));
          }
        }
      });

      // Batch invalidate only stale queries
      if (staleBatch.length > 0) {
        await Promise.all(
          queryKeys.map((key) =>
            queryClient.invalidateQueries({
              queryKey: [key],
              refetchType: "active", // Only refetch active queries
            })
          )
        );

        lastUpdateRef.current = Date.now();
        onUpdate?.(staleBatch);
      }
    } catch (error) {
      console.warn("Realtime sync failed:", error);
    }
  }, [queryClient, queryKeys, shouldUpdate, getInterval, onUpdate]);

  // Page visibility handling
  useEffect(() => {
    const handleVisibilityChange = () => {
      isActiveRef.current = !document.hidden;

      if (isActiveRef.current && enabled) {
        // User came back - sync immediately if data is stale
        syncData();
      }
    };

    const handleFocus = () => {
      isActiveRef.current = true;
      if (enabled) {
        syncData();
      }
    };

    const handleBlur = () => {
      isActiveRef.current = false;
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, [enabled, syncData]);

  // Setup smart polling
  useEffect(() => {
    if (!enabled || !user) return;

    const startPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        if (isActiveRef.current) {
          syncData();
        }
      }, getInterval());
    };

    startPolling();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, user, syncData, getInterval]);

  // Manual sync method
  const forceSync = useCallback(() => {
    lastUpdateRef.current = 0; // Force next sync
    syncData();
  }, [syncData]);

  return {
    forceSync,
    isActive: isActiveRef.current,
    lastUpdate: lastUpdateRef.current,
  };
}

/**
 * Course-specific realtime updates
 */
export function useCourseRealtime(courseId: string | null) {
  return useRealtimeSync(["courses", "attachedFiles", "lessons"], {
    enabled: !!courseId,
    interval: 45000, // 45 seconds for course data
    priority: "normal",
  });
}

/**
 * Learning progress realtime updates - high priority
 */
export function useLearningProgressRealtime(courseId: string | null) {
  return useRealtimeSync(["lessonProgress", "enrolledCourses"], {
    enabled: !!courseId,
    interval: 15000, // 15 seconds for progress
    priority: "high",
  });
}

/**
 * Admin/HR realtime updates for management
 */
export function useAdminRealtime(enabled: boolean = false) {
  return useRealtimeSync(["users", "reports", "departments"], {
    enabled,
    interval: 60000, // 1 minute for admin data
    priority: "low",
  });
}
