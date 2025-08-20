/**
 * Performance Monitoring and Optimization Hook
 * Tracks and optimizes app performance for better UX
 */

import { useEffect, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

class PerformanceTracker {
  private static instance: PerformanceTracker;
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];

  static getInstance(): PerformanceTracker {
    if (!PerformanceTracker.instance) {
      PerformanceTracker.instance = new PerformanceTracker();
    }
    return PerformanceTracker.instance;
  }

  startTracking() {
    if (typeof window === "undefined") return;

    // Track Core Web Vitals
    this.trackWebVitals();

    // Track React Query performance
    this.trackQueryPerformance();

    // Track navigation performance
    this.trackNavigationPerformance();
  }

  private trackWebVitals() {
    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.recordMetric({
        name: "web_vitals_lcp",
        value: lastEntry.startTime,
        timestamp: Date.now(),
        tags: { type: "performance" },
      });
    });
    lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
    this.observers.push(lcpObserver);

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        this.recordMetric({
          name: "web_vitals_fid",
          value: entry.processingStart - entry.startTime,
          timestamp: Date.now(),
          tags: { type: "performance" },
        });
      });
    });
    fidObserver.observe({ entryTypes: ["first-input"] });
    this.observers.push(fidObserver);

    // Cumulative Layout Shift (CLS)
    let clsScore = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsScore += entry.value;
        }
      });
      this.recordMetric({
        name: "web_vitals_cls",
        value: clsScore,
        timestamp: Date.now(),
        tags: { type: "performance" },
      });
    });
    clsObserver.observe({ entryTypes: ["layout-shift"] });
    this.observers.push(clsObserver);
  }

  private trackQueryPerformance() {
    // Track slow queries
    const slowQueryThreshold = 2000; // 2 seconds

    // This would be integrated with React Query's onSuccess/onError callbacks
    window.addEventListener("queryExecuted", ((event: CustomEvent) => {
      const { queryKey, duration, success } = event.detail;

      if (duration > slowQueryThreshold) {
        this.recordMetric({
          name: "slow_query",
          value: duration,
          timestamp: Date.now(),
          tags: {
            queryKey: Array.isArray(queryKey) ? queryKey.join(",") : queryKey,
            success: success.toString(),
          },
        });
      }
    }) as EventListener);
  }

  private trackNavigationPerformance() {
    // Track page load performance
    window.addEventListener("load", () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType(
          "navigation"
        )[0] as PerformanceNavigationTiming;

        this.recordMetric({
          name: "page_load_time",
          value: navigation.loadEventEnd - navigation.fetchStart,
          timestamp: Date.now(),
          tags: { type: "navigation" },
        });

        this.recordMetric({
          name: "dom_content_loaded",
          value: navigation.domContentLoadedEventEnd - navigation.fetchStart,
          timestamp: Date.now(),
          tags: { type: "navigation" },
        });
      }, 0);
    });
  }

  private recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);

    // In development, log performance issues
    if (process.env.NODE_ENV === "development") {
      if (metric.name === "slow_query" && metric.value > 3000) {
        console.warn(
          `🐌 Slow Query Detected: ${metric.tags?.queryKey} took ${metric.value}ms`
        );
      }

      if (metric.name === "web_vitals_lcp" && metric.value > 2500) {
        console.warn(`🐌 Poor LCP: ${metric.value}ms (should be < 2500ms)`);
      }
    }

    // Keep only recent metrics to prevent memory leaks
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500);
    }
  }

  getPerformanceSummary() {
    const recent = this.metrics.filter(
      (m) => Date.now() - m.timestamp < 5 * 60 * 1000
    ); // Last 5 minutes

    const summary = {
      totalMetrics: recent.length,
      slowQueries: recent.filter((m) => m.name === "slow_query").length,
      avgLCP: this.getAverageMetric(recent, "web_vitals_lcp"),
      avgFID: this.getAverageMetric(recent, "web_vitals_fid"),
      avgCLS: this.getAverageMetric(recent, "web_vitals_cls"),
      avgPageLoad: this.getAverageMetric(recent, "page_load_time"),
    };

    return summary;
  }

  private getAverageMetric(metrics: PerformanceMetric[], name: string): number {
    const filtered = metrics.filter((m) => m.name === name);
    if (filtered.length === 0) return 0;

    const sum = filtered.reduce((acc, m) => acc + m.value, 0);
    return sum / filtered.length;
  }

  dispose() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
    this.metrics = [];
  }
}

/**
 * Performance monitoring hook
 */
export function usePerformanceMonitoring(enabled: boolean = true) {
  const queryClient = useQueryClient();
  const trackerRef = useRef<PerformanceTracker | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    trackerRef.current = PerformanceTracker.getInstance();
    trackerRef.current.startTracking();

    return () => {
      trackerRef.current?.dispose();
    };
  }, [enabled]);

  const getSummary = useCallback(() => {
    return trackerRef.current?.getPerformanceSummary() || null;
  }, []);

  const optimizeQueries = useCallback(() => {
    // Get all queries and optimize slow ones
    const queries = queryClient.getQueryCache().getAll();

    queries.forEach((query) => {
      const key = query.queryKey;
      const state = query.state;

      // If query is stale and hasn't been used recently, remove it
      const isStale = state.dataUpdatedAt < Date.now() - 10 * 60 * 1000; // 10 minutes
      const notRecentlyUsed = state.dataUpdatedAt < Date.now() - 30 * 60 * 1000; // 30 minutes

      if (isStale && notRecentlyUsed) {
        queryClient.removeQueries({ queryKey: key });
      }
    });

    // Garbage collect unused queries
    queryClient.getQueryCache().clear();

    if (process.env.NODE_ENV === "development") {
      console.log("🧹 Query cache optimized");
    }
  }, [queryClient]);

  const trackSlowQuery = useCallback(
    (queryKey: string[], duration: number, success: boolean) => {
      // Dispatch custom event for tracking
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("queryExecuted", {
            detail: { queryKey, duration, success },
          })
        );
      }
    },
    []
  );

  return {
    getSummary,
    optimizeQueries,
    trackSlowQuery,
    isEnabled: enabled,
  };
}

/**
 * Query performance wrapper
 */
export function withPerformanceTracking<T>(
  queryFn: () => Promise<T>,
  queryKey: string[]
): () => Promise<T> {
  return async () => {
    const startTime = performance.now();
    let success = false;

    try {
      const result = await queryFn();
      success = true;
      return result;
    } catch (error) {
      throw error;
    } finally {
      const duration = performance.now() - startTime;

      // Track the query performance
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("queryExecuted", {
            detail: { queryKey, duration, success },
          })
        );
      }
    }
  };
}
