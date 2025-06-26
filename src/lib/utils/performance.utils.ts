/**
 * Performance Monitoring Utilities
 * Enterprise-grade performance tracking and optimization
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  type: "timing" | "counter" | "gauge";
  tags?: Record<string, string>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private timers: Map<string, number> = new Map();

  // Start timing a operation
  startTiming(name: string): void {
    this.timers.set(name, performance.now());
  }

  // End timing and record metric
  endTiming(name: string, tags?: Record<string, string>): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      console.warn(`No timer found for: ${name}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(name);

    this.recordMetric({
      name,
      value: duration,
      timestamp: Date.now(),
      type: "timing",
      tags,
    });

    return duration;
  }

  // Record a counter metric
  incrementCounter(
    name: string,
    value: number = 1,
    tags?: Record<string, string>
  ): void {
    this.recordMetric({
      name,
      value,
      timestamp: Date.now(),
      type: "counter",
      tags,
    });
  }

  // Record a gauge metric
  recordGauge(
    name: string,
    value: number,
    tags?: Record<string, string>
  ): void {
    this.recordMetric({
      name,
      value,
      timestamp: Date.now(),
      type: "gauge",
      tags,
    });
  }

  // Measure React component render time
  measureComponentRender<T extends any[], R>(
    componentName: string,
    renderFn: (...args: T) => R
  ) {
    return (...args: T): R => {
      this.startTiming(`component.render.${componentName}`);
      const result = renderFn(...args);
      this.endTiming(`component.render.${componentName}`, {
        component: componentName,
      });
      return result;
    };
  }

  // Measure API call performance
  async measureApiCall<T>(
    endpoint: string,
    apiCall: () => Promise<T>
  ): Promise<T> {
    const timerName = `api.call.${endpoint}`;
    this.startTiming(timerName);

    try {
      const result = await apiCall();
      this.endTiming(timerName, { endpoint, status: "success" });
      return result;
    } catch (error) {
      this.endTiming(timerName, { endpoint, status: "error" });
      throw error;
    }
  }

  // Get Core Web Vitals
  measureWebVitals(): void {
    if (typeof window === "undefined") return;

    // Measure LCP (Largest Contentful Paint)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.recordMetric({
        name: "web.vitals.lcp",
        value: lastEntry.startTime,
        timestamp: Date.now(),
        type: "timing",
      });
    }).observe({ entryTypes: ["largest-contentful-paint"] });

    // Measure FID (First Input Delay)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        this.recordMetric({
          name: "web.vitals.fid",
          value: entry.processingStart - entry.startTime,
          timestamp: Date.now(),
          type: "timing",
        });
      });
    }).observe({ entryTypes: ["first-input"] });

    // Measure CLS (Cumulative Layout Shift)
    let clsScore = 0;
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsScore += entry.value;
        }
      });
      this.recordMetric({
        name: "web.vitals.cls",
        value: clsScore,
        timestamp: Date.now(),
        type: "gauge",
      });
    }).observe({ entryTypes: ["layout-shift"] });
  }

  // Record custom metric
  private recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // In development, log to console
    if (process.env.NODE_ENV === "development") {
      console.log(
        `📊 Performance: ${metric.name} = ${metric.value.toFixed(2)}ms`,
        metric.tags
      );
    }

    // Keep only last 1000 metrics to prevent memory leaks
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // In production, send to monitoring service
    if (process.env.NODE_ENV === "production") {
      this.sendToMonitoringService(metric);
    }
  }

  // Send metrics to external monitoring service
  private sendToMonitoringService(metric: PerformanceMetric): void {
    // Implementation for sending to Datadog, New Relic, etc.
    // Example:
    // fetch('/api/metrics', {
    //   method: 'POST',
    //   body: JSON.stringify(metric)
    // });
  }

  // Get performance summary
  getSummary(): Record<string, any> {
    const summary: Record<string, any> = {};

    this.metrics.forEach((metric) => {
      if (!summary[metric.name]) {
        summary[metric.name] = {
          count: 0,
          total: 0,
          min: Infinity,
          max: -Infinity,
          avg: 0,
        };
      }

      const stats = summary[metric.name];
      stats.count++;
      stats.total += metric.value;
      stats.min = Math.min(stats.min, metric.value);
      stats.max = Math.max(stats.max, metric.value);
      stats.avg = stats.total / stats.count;
    });

    return summary;
  }

  // Clear all metrics
  clear(): void {
    this.metrics = [];
    this.timers.clear();
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// React Hook for performance monitoring
export function usePerformanceMonitor() {
  return {
    startTiming: performanceMonitor.startTiming.bind(performanceMonitor),
    endTiming: performanceMonitor.endTiming.bind(performanceMonitor),
    incrementCounter:
      performanceMonitor.incrementCounter.bind(performanceMonitor),
    recordGauge: performanceMonitor.recordGauge.bind(performanceMonitor),
    measureApiCall: performanceMonitor.measureApiCall.bind(performanceMonitor),
  };
}

// Higher-order component for measuring component performance
export function withPerformanceMonitoring<P extends object>(
  Component: any,
  componentName?: string
) {
  const displayName =
    componentName || Component.displayName || Component.name || "Component";

  return function WrappedComponent(props: P) {
    performanceMonitor.startTiming(`component.render.${displayName}`);

    try {
      // This will be used in React components, so we return the component reference
      // The actual rendering happens in React context
      return Component;
    } finally {
      performanceMonitor.endTiming(`component.render.${displayName}`, {
        component: displayName,
      });
    }
  };
}

// Initialize web vitals measurement
if (typeof window !== "undefined") {
  performanceMonitor.measureWebVitals();
}
