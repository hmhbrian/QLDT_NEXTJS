/**
 * Main Library Index
 * Central export point for the entire library.
 */

// Export core API modules
export * from "./core";

// Export modern services (all individual services and the 'services' object)
export * from "./services";

// Export all types
export * from "./types";

// Export configuration
export * from "./config";

// Export general utilities
export * from "./utils";
export * from "./helpers";

// Export legacy API for backward compatibility (if still needed)
// Note: Commented out to avoid API_CONFIG conflict
// export * from "./legacy-api";

// Re-export specific items to avoid ambiguity
export { API_CONFIG as API_CONFIGURATION } from "./config";
