
/**
 * Enterprise Hooks Index
 * Central export point for all custom hooks following clean architecture
 */

// Authentication & Authorization hooks
export * from "./useAuth";
export * from "./useLogin";

// Navigation hooks
export * from "./useInstantNavigation";

// Data fetching & API hooks
export * from "./useAsync";
export * from "./use-courses";
export * from "./use-certificates";
export * from "./use-departments";
export * from "./use-positions";
export * from "./use-users";
export * from "./use-tests";
export * from "./use-questions";
export * from "./use-lesson-progress";
export * from "./use-activity-logs";
export * from "./use-audit-log";
export * from "./use-feedback";

// Form & Validation hooks
export * from "./useForm";

// Utility & Common hooks
export * from "./use-cookie";
export * from "./use-debounce";
export * from "./use-mobile";
export * from "./use-error";

    