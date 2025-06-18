/**
 * API Configuration
 * Centralized configuration for API-related settings
 */

// API Environment configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || "30000");

export const API_CONFIG = {
  /**
   * Base URL for API requests
   */
  baseURL: API_BASE_URL,

  /**
   * Default headers to include with all requests
   */
  defaultHeaders: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },

  /**
   * Request timeout in milliseconds
   */
  timeout: API_TIMEOUT,

  /**
   * Default pagination settings
   */
  pagination: {
    defaultPage: 1,
    defaultPageSize: 10,
    maxPageSize: 24, // Backend limit
  },

  /**
   * Endpoints configuration
   */
  endpoints: {
    auth: {
      login: "/Users/login",
      logout: "/Users/logout",
      refresh: "/Users/refresh",
      validate: "/Users/validate",
    },
    users: {
      base: "/Users",
      get: "/Users/{userId}",
      create: "/Users/create",
      update: "/Users/{userId}",
      delete: "/Users/{userId}",
    },
    departments: {
      base: "/departments",
      paginated: "/departments/paginated",
      tree: "/departments/tree",
      checkName: "/departments/check-name",
    },
    courses: {
      base: "/courses",
      paginated: "/courses/paginated",
      get: "/courses/{courseId}",
      create: "/courses/create",
      update: "/courses/{courseId}",
      delete: "/courses/{courseId}",
    },
    analytics: {
      base: "/analytics",
      summary: "/analytics/summary",
      users: "/analytics/users",
      courses: "/analytics/courses",
    },
  },

  /**
   * Storage keys for localStorage
   */
  storage: {
    token: "becamex-token",
    user: "user-data",
    preferences: "user-preferences",
  },
} as const;

export default API_CONFIG;
