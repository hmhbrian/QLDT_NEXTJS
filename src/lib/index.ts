/**
 * Main Library Index
 * Central export point for the entire library.
 */

// Export core API modules
export * from "./core";

// Export modern services (all individual services and the 'services' object)
// Export all services except ApiResponse to avoid ambiguity
export * from "./services";

// Export all types
export * from "./types";

// Export configuration
export * from "./config";

// Export general utilities
export * from "./utils";

// Export helper helpers
export * from "./helpers";

// Re-export specific items to avoid ambiguity
export { API_CONFIG as API_CONFIGURATION } from "./config";
// Explicitly re-export ApiResponse from core only
export type { ApiResponse } from "./core";
