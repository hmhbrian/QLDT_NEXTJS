/**
 * Simple Performance Optimization Utilities
 * Clean implementation without complex JSX
 */

import React from "react";
import { usePerformanceMonitoring } from "@/hooks";
import { useRealtimeSync } from "@/hooks/use-realtime-sync";
import { useSmartCache, useSmartDebounce } from "@/lib/utils/api-optimization";

/**
 * Simple App Provider
 */
export function SimpleOptimizedProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Setup performance monitoring
  usePerformanceMonitoring(true);

  return children;
}

/**
 * Course Management Hook
 */
export function useOptimizedCourseManagement() {
  const { getSummary, optimizeQueries } = usePerformanceMonitoring(true);
  const { get: getCached, set: setCached } = useSmartCache<any>();
  const { debounce } = useSmartDebounce();

  const { forceSync } = useRealtimeSync(["courses", "users", "attachedFiles"], {
    enabled: true,
    interval: 30000,
    priority: "high",
  });

  return {
    getSummary,
    optimizeQueries,
    getCached,
    setCached,
    debounce,
    forceSync,
  };
}

/**
 * Learning Hook
 */
export function useOptimizedLearning(courseId: string | null) {
  const { trackSlowQuery } = usePerformanceMonitoring(true);
  const { get: getCached, set: setCached } = useSmartCache<any>();

  const { forceSync, isActive } = useRealtimeSync(
    ["lessonProgress", "enrolledCourses"],
    {
      enabled: !!courseId,
      interval: 15000,
      priority: "high",
    }
  );

  return {
    trackSlowQuery,
    forceSync,
    isActive,
    getCached,
    setCached,
  };
}

/**
 * Utility functions
 */
export const OptimizationUtils = {
  preloadCriticalResources: () => {
    if (typeof window === "undefined") return;

    const criticalEndpoints = [
      "/api/courses",
      "/api/users/profile",
      "/api/departments",
    ];

    criticalEndpoints.forEach((endpoint) => {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = endpoint;
      document.head.appendChild(link);
    });
  },

  optimizeImage: (src: string, width: number = 400): string => {
    if (src.includes("placeholder") || src.includes("data:")) return src;

    try {
      const url = new URL(src, window.location.origin);
      url.searchParams.set("w", width.toString());
      url.searchParams.set("q", "80");
      return url.toString();
    } catch {
      return src;
    }
  },

  cleanupMemory: () => {
    if ("gc" in window && typeof (window as any).gc === "function") {
      (window as any).gc();
    }

    const objectUrls = (window as any).__objectUrls || [];
    objectUrls.forEach((url: string) => {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {
        // Ignore errors
      }
    });

    console.log("🧹 Memory cleanup completed");
  },
};

// Re-export utilities
export {
  useSmartCache,
  useSmartDebounce,
  useBatcher,
} from "@/lib/utils/api-optimization";
