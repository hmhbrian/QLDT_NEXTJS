/**
 * Performance utilities for monitoring and optimizing app performance
 */

export class PerformanceMonitor {
    private static timers: Map<string, number> = new Map();
    private static metrics: Map<string, number[]> = new Map();

    /**
     * Start timing an operation
     */
    static start(operation: string): void {
        this.timers.set(operation, performance.now());
    }

    /**
     * End timing and record the duration
     */
    static end(operation: string): number | null {
        const startTime = this.timers.get(operation);
        if (!startTime) {
            console.warn(`No start time found for operation: ${operation}`);
            return null;
        }

        const duration = performance.now() - startTime;
        this.timers.delete(operation);

        // Store metric
        const existing = this.metrics.get(operation) || [];
        existing.push(duration);
        this.metrics.set(operation, existing);

        // Log if duration is concerning
        if (duration > 1000) {
            console.warn(`Slow operation detected: ${operation} took ${duration.toFixed(2)}ms`);
        }

        return duration;
    }

    /**
     * Get average duration for an operation
     */
    static getAverage(operation: string): number {
        const durations = this.metrics.get(operation) || [];
        if (durations.length === 0) return 0;

        return durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
    }

    /**
     * Get all metrics for debugging
     */
    static getAllMetrics(): Record<string, { avg: number; count: number; last: number }> {
        const result: Record<string, { avg: number; count: number; last: number }> = {};

        this.metrics.forEach((durations, operation) => {
            result[operation] = {
                avg: this.getAverage(operation),
                count: durations.length,
                last: durations[durations.length - 1] || 0
            };
        });

        return result;
    }

    /**
     * Clear all metrics
     */
    static clear(): void {
        this.timers.clear();
        this.metrics.clear();
    }
}

/**
 * Decorator for measuring function performance
 */
export function measurePerformance(operationName: string) {
    return function <T extends (...args: any[]) => any>(
        target: any,
        propertyName: string,
        descriptor: TypedPropertyDescriptor<T>
    ) {
        const method = descriptor.value!;

        descriptor.value = (async function (this: any, ...args: any[]) {
            PerformanceMonitor.start(operationName);
            try {
                const result = await method.apply(this, args);
                return result;
            } finally {
                PerformanceMonitor.end(operationName);
            }
        }) as T;
    };
}

/**
 * Simple debounce utility to prevent excessive API calls
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): T {
    let timeout: NodeJS.Timeout | null = null;

    return ((...args: any[]) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    }) as T;
}

/**
 * Simple throttle utility for event handlers
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): T {
    let inThrottle: boolean;

    return ((...args: any[]) => {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }) as T;
}

/**
 * Utility to measure component render time
 */
export function measureRender(componentName: string) {
    return {
        start: () => PerformanceMonitor.start(`render-${componentName}`),
        end: () => PerformanceMonitor.end(`render-${componentName}`)
    };
} 