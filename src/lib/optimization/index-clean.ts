/**
 * Performance Integration - Easy to use
 * Import this file to get all optimizations
 */

// Main optimization hooks
export {
  useOptimizedCourseManagement,
  useOptimizedLearning,
  OptimizationUtils,
  SimpleOptimizedProvider,
  useSmartCache,
  useSmartDebounce,
} from "@/lib/optimization/simple";

// Performance indicator component
export { PerformanceIndicator } from "@/components/common/PerformanceIndicator";

// Core hooks
export { usePerformanceMonitoring } from "@/hooks";
export {
  useRealtimeSync,
  useCourseRealtime,
  useLearningProgressRealtime,
  useAdminRealtime,
} from "@/hooks/use-realtime-sync";

/**
 * Quick setup guide:
 *
 * 1. Add SimpleOptimizedProvider to your app layout:
 *    import { SimpleOptimizedProvider } from '@/lib/optimization';
 *
 * 2. Use hooks in your components:
 *    const { getCached, setCached, forceSync } = useOptimizedCourseManagement();
 *
 * 3. Add performance indicator (dev only):
 *    <PerformanceIndicator />
 */
