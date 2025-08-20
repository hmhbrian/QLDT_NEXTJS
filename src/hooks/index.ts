/**
 * Enterprise Hooks Index
 * Central export point for all custom hooks following clean architecture
 */

// Authentication & Authorization hooks
export * from "./useAuth";

// Navigation hooks
export * from "./useInstantNavigation";

// Data fetching & API hooks (using TanStack Query)
export * from "./use-courses";
export * from "./use-certificates";
export * from "./use-departments";
export * from "./use-employeeLevel";
export * from "./use-users";
export * from "./use-tests";
export * from "./use-questions";
export * from "./use-lesson-progress";
export * from "./use-activity-logs";
export * from "./use-audit-log";
export * from "./use-feedback";
export * from "./use-reports";
export * from "./use-statuses";
export * from "./use-student-dashboard";

// Utility & Common hooks
export { useDebounce } from "./use-debounce";
export * from "./use-mobile";
export * from "./use-error";

// Performance optimization hooks
export * from "./use-websocket-realtime";
export * from "./use-optimized-query";
export * from "./use-performance-monitor";

// Additional hooks
export * from "./use-course-attached-files";
export * from "./use-debounced-lesson-progress";
export * from "./use-lessons";
export * from "./use-pagination";
export * from "./use-performance";
export * from "./use-positions";
export * from "./use-course-categories";
