/**
 * Core Library Index
 * Central export point for all core functionality
 */

// Export types
export * from "./types";

// Export base service
export { BaseService } from "./base-service";

// Export service factory
export * from "./service-factory";

// Export utilities
export * from "./api-utils";

// Re-export commonly used types for convenience
export type {
  ApiResponse,
  PaginatedResponse,
  QueryParams,
  FilterParams,
  PaginationParams,
  EntityId,
} from "./types";
