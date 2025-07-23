/**
 * Common Components Index
 * Central export point for reusable common components
 */

// Error handling components
export * from "./ErrorBoundary";

// Loading components
export * from "./Loading";

// Re-exports for convenience
export {
  ErrorBoundary,
  PageErrorBoundary,
  ComponentErrorBoundary,
  DefaultErrorFallback,
} from "./ErrorBoundary";

export {
  LoadingSpinner,
  PageLoading,
  ButtonLoading,
  TableLoading,
  CardLoading,
} from "./Loading";
