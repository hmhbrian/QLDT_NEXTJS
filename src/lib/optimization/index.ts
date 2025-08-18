/**
 * Performance Optimization Integration Guide
 * Hướng dẫn tích hợp các tối ưu hóa vào ứng dụng
 */

import React from "react";
import { OptimizedAppProvider } from "@/providers/optimized-app-provider";
import { usePerformanceMonitoring } from "@/hooks";
import { useRealtimeSync } from "@/hooks/use-realtime-sync";
import { useSmartCache, useSmartDebounce } from "@/lib/utils/api-optimization";

/**
 * 1. Tích hợp vào App Layout chính
 * Thêm OptimizedAppProvider vào app layout
 */
export function AppLayoutWithOptimizations({
  children,
}: {
  children: React.ReactNode;
}) {
  return React.createElement(OptimizedAppProvider, null, children);
}

/**
 * 2. Hook tối ưu cho trang Course Management (Admin/HR)
 */
export function useOptimizedCourseManagement() {
  // Performance monitoring
  const { getSummary, optimizeQueries } = usePerformanceMonitoring(true);

  // Smart caching cho data thường dùng
  const { get: getCached, set: setCached } = useSmartCache<any>();

  // Smart debouncing cho search và filter
  const { debounce } = useSmartDebounce();

  // Real-time sync cho admin operations
  const { forceSync } = useRealtimeSync(["courses", "users", "attachedFiles"], {
    enabled: true,
    interval: 30000, // 30 giây
    priority: "high",
  });

  return {
    // Performance utilities
    getSummary,
    optimizeQueries,

    // Caching utilities
    getCached,
    setCached,

    // Debouncing utilities
    debounce,

    // Real-time sync
    forceSync,
  };
}

/**
 * 3. Hook tối ưu cho trang Learning (Học viên)
 */
export function useOptimizedLearning(courseId: string | null) {
  // Performance monitoring với ít overhead hơn
  const { trackSlowQuery } = usePerformanceMonitoring(true);

  // Real-time sync cho learning progress
  const { forceSync, isActive } = useRealtimeSync(
    ["lessonProgress", "enrolledCourses"],
    {
      enabled: !!courseId,
      interval: 15000, // 15 giây cho progress updates
      priority: "high",
    }
  );

  // Smart caching cho lesson content
  const { get: getCached, set: setCached } = useSmartCache<any>();

  return {
    trackSlowQuery,
    forceSync,
    isActive,
    getCached,
    setCached,
  };
}

/**
 * 4. Utility functions cho tối ưu hóa
 */
export const OptimizationUtils = {
  // Preload critical resources
  preloadCriticalResources: () => {
    if (typeof window === "undefined") return;

    // Preload common API endpoints
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

  // Optimize images
  optimizeImage: (src: string, width: number = 400): string => {
    if (src.includes("placeholder") || src.includes("data:")) return src;

    // Add image optimization parameters
    const url = new URL(src, window.location.origin);
    url.searchParams.set("w", width.toString());
    url.searchParams.set("q", "80"); // Quality 80%
    return url.toString();
  },

  // Batch API calls
  batchApiCalls: async <T>(
    calls: (() => Promise<T>)[],
    batchSize: number = 3
  ): Promise<T[]> => {
    const results: T[] = [];

    for (let i = 0; i < calls.length; i += batchSize) {
      const batch = calls.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map((call) =>
          call().catch((error) => {
            console.warn("Batch call failed:", error);
            return null;
          })
        )
      );
      results.push(...(batchResults.filter(Boolean) as T[]));
    }

    return results;
  },

  // Memory cleanup
  cleanupMemory: () => {
    // Force garbage collection if available
    if ("gc" in window && typeof window.gc === "function") {
      window.gc();
    }

    // Clear unused object URLs
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

/**
 * 5. Performance monitoring component
 */
export function PerformanceIndicator() {
  const { getSummary } = usePerformanceMonitoring(true);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    // Only show in development
    setIsVisible(process.env.NODE_ENV === "development");
  }, []);

  if (!isVisible) return null;

  const summary = getSummary();

  return React.createElement(
    "div",
    {
      className:
        "fixed bottom-4 right-4 p-2 bg-black bg-opacity-80 text-white text-xs rounded z-50",
    },
    [
      React.createElement("div", { key: "title" }, "📊 Performance"),
      summary &&
        React.createElement("div", { key: "content" }, [
          React.createElement(
            "div",
            { key: "queries" },
            `Slow queries: ${summary.slowQueries}`
          ),
          React.createElement(
            "div",
            { key: "lcp" },
            `LCP: ${summary.avgLCP?.toFixed(0)}ms`
          ),
          React.createElement(
            "div",
            { key: "fid" },
            `FID: ${summary.avgFID?.toFixed(0)}ms`
          ),
        ]),
    ]
  );
}

/**
 * 6. HOC cho performance optimization
 */
export function withOptimization<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    enableRealtime?: boolean;
    cacheKey?: string;
    preloadData?: () => Promise<any>;
  } = {}
) {
  const OptimizedComponent = (props: P) => {
    const { enableRealtime = false, cacheKey, preloadData } = options;

    // Setup performance monitoring
    usePerformanceMonitoring(true);

    // Setup real-time sync if enabled
    if (enableRealtime) {
      useRealtimeSync(["courses", "users"], {
        enabled: true,
        interval: 30000,
      });
    }

    // Preload data if specified
    React.useEffect(() => {
      if (preloadData) {
        preloadData().catch(console.warn);
      }
    }, []);

    return React.createElement(Component, props);
  };

  OptimizedComponent.displayName = `withOptimization(${
    Component.displayName || Component.name
  })`;
  return OptimizedComponent;
}

// Export utilities for easier importing
export {
  useSmartCache,
  useSmartDebounce,
  useBatcher,
} from "@/lib/utils/api-optimization";

export default {
  AppLayoutWithOptimizations,
  useOptimizedCourseManagement,
  useOptimizedLearning,
  OptimizationUtils,
  PerformanceIndicator,
  withOptimization,
};
