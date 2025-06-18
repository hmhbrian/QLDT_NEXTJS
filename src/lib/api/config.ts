/**
 * API Configuration
 * Centralized configuration for API-related settings
 */

// API Environment configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5228/api";
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || "30000");
const USE_API = process.env.NEXT_PUBLIC_USE_API === "true";

// Log API configuration for debugging
console.log("API Configuration:", {
  baseURL: API_BASE_URL,
  useApi: USE_API,
  timeout: API_TIMEOUT
});

export const API_CONFIG = {
  /**
   * Base URL for API requests
   */
  baseURL: API_BASE_URL,

  /**
   * Whether to use real API or mock data
   */
  useApi: USE_API,

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
      login: process.env.NEXT_PUBLIC_API_LOGIN || "/Users/login",
      logout: process.env.NEXT_PUBLIC_API_LOGOUT || "/Account/logout",
      refresh: "/Account/refresh",
      validate: "/Account/validate",
      me: process.env.NEXT_PUBLIC_API_GET_ME || "/Account/me",
    },
    users: {
      base: process.env.NEXT_PUBLIC_API_USER || "/Users",
      get: "/Users/{userId}",
      create: "/Users/create",
      update: "/Users/{userId}",
      delete: "/Users/{userId}",
    },
    roles: {
      base: "/Roles",
      getById: "/Roles/{roleId}",
      getByName: "/Roles/byName/{name}",
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
