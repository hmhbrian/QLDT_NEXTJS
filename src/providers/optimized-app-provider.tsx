/**
 * Optimized App Provider
 * Integrates performance monitoring and real-time sync
 */

"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePerformanceMonitoring } from "@/hooks";
import {
  useAdminRealtime,
  useLearningProgressRealtime,
} from "@/hooks/use-realtime-sync";

interface OptimizedAppProviderProps {
  children: React.ReactNode;
}

export function OptimizedAppProvider({ children }: OptimizedAppProviderProps) {
  const { user } = useAuth();

  // Enable performance monitoring in all environments
  const { optimizeQueries, getSummary } = usePerformanceMonitoring(true);

  // Enable real-time sync based on user role
  const isAdmin = user?.role === "ADMIN" || user?.role === "HR";
  const isLearner = user?.role === "HOCVIEN";

  // Admin/HR real-time sync for management operations
  useAdminRealtime(isAdmin);

  // Learning progress real-time sync for learners
  useLearningProgressRealtime(user?.currentCourseId || null);

  // Performance optimization on interval
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Optimize queries every 5 minutes
    const optimizeInterval = setInterval(() => {
      optimizeQueries();
    }, 5 * 60 * 1000);

    // Log performance summary every minute in development
    const logInterval =
      process.env.NODE_ENV === "development"
        ? setInterval(() => {
            const summary = getSummary();
            if (summary && summary.slowQueries > 0) {
              console.log("📊 Performance Summary:", summary);
            }
          }, 60 * 1000)
        : null;

    return () => {
      clearInterval(optimizeInterval);
      if (logInterval) clearInterval(logInterval);
    };
  }, [optimizeQueries, getSummary]);

  // Cleanup on visibility change (user switching tabs)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched away - optimize memory
        setTimeout(() => {
          if (document.hidden) {
            optimizeQueries();
          }
        }, 30000); // After 30 seconds of being hidden
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [optimizeQueries]);

  return <>{children}</>;
}

/**
 * Higher-order component for page-level performance optimization
 */
export function withPageOptimization<P extends object>(
  Component: React.ComponentType<P>,
  pageName: string
) {
  const OptimizedComponent = (props: P) => {
    const startTime = performance.now();

    useEffect(() => {
      // Track page render time
      const renderTime = performance.now() - startTime;

      if (process.env.NODE_ENV === "development" && renderTime > 1000) {
        console.warn(
          `🐌 Slow page render: ${pageName} took ${renderTime.toFixed(2)}ms`
        );
      }

      // Preload critical resources for this page
      if (pageName === "course-detail") {
        // Preload course-related resources
        const link = document.createElement("link");
        link.rel = "prefetch";
        link.href = "/api/courses"; // Example
        document.head.appendChild(link);
      }
    }, []);

    return <Component {...props} />;
  };

  OptimizedComponent.displayName = `withPageOptimization(${
    Component.displayName || Component.name
  })`;
  return OptimizedComponent;
}

/**
 * Lazy loading wrapper with performance optimization
 */
export function createOptimizedLazyComponent<
  T extends React.ComponentType<any>
>(importFn: () => Promise<{ default: T }>, fallback?: React.ReactNode) {
  const LazyComponent = React.lazy(async () => {
    const startTime = performance.now();

    try {
      const module = await importFn();
      const loadTime = performance.now() - startTime;

      if (process.env.NODE_ENV === "development" && loadTime > 2000) {
        console.warn(`🐌 Slow component load: took ${loadTime.toFixed(2)}ms`);
      }

      return module;
    } catch (error) {
      console.error("Failed to load component:", error);
      throw error;
    }
  });

  return function OptimizedLazyWrapper(props: React.ComponentProps<T>) {
    return (
      <React.Suspense fallback={fallback || <div>Đang tải...</div>}>
        <LazyComponent {...props} />
      </React.Suspense>
    );
  };
}
