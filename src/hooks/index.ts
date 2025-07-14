
/**
 * Enterprise Hooks Index
 * Central export point for all custom hooks following clean architecture
 */

// Authentication & Authorization hooks
export * from "./useAuth";
export * from "./useLogin";

// Data fetching & API hooks
export * from "./useAsync";
export * from "./use-courses";
export * from "./use-departments";
export * from "./use-positions";
export * from "./use-users";
export * from "./use-tests";
export * from "./use-questions";
export * from "./use-lesson-progress";

// Form & Validation hooks
export * from "./useForm";

// Utility & Common hooks
export * from "./use-cookie";
export * from "./use-debounce";
export * from "./use-mobile";
export * from "./use-error";
