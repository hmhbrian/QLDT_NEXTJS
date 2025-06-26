/**
 * API Configuration
 * Centralized configuration for API-related settings
 */

// API Environment configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5228/api"; // Direct backend URL
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || "30000");
const USE_API = process.env.NEXT_PUBLIC_USE_API === "true";

// Log API configuration for debugging
if (typeof window !== "undefined") {
  console.log("API Configuration:", {
    baseURL: API_BASE_URL,
    useApi: USE_API,
    timeout: API_TIMEOUT,
  });
}

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  useApi: USE_API,
  defaultHeaders: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: API_TIMEOUT,
  pagination: {
    defaultPage: 1,
    defaultPageSize: 10,
    maxPageSize: 100,
  },
  endpoints: {
    auth: {
      login: "/Users/login",
      logout: "/Account/logout",
      refresh: "/Account/refresh",
      validate: "/Account/validate",
      me: "/Account/me",
      changePassword: "/Users/change-password",
    },
    users: {
      base: "/Users",
      create: "/Users/create",
      search: "/Users/search",
      resetPassword: (userId: string) => `/Users/${userId}/reset-password`,
      softDelete: (userId: string) => `/Users/${userId}/soft-delete`,
      updateAdmin: (userId: string) => `/Users/admin/${userId}/update`,
    },
    roles: {
      base: "/Roles",
      byName: (name: string) => `/Roles/byName/${name}`,
    },
    departments: {
      base: "/Departments",
      tree: "/Departments",
    },
    positions: {
      base: "/Positions",
    },
    courses: {
      base: "/Courses",
      create: "/Courses",
      getAll: "/Courses",
      getById: (id: string) => `/Courses/${id}`,
      update: (id: string) => `/Courses/${id}`,
      search: "/Courses/search",
      softDelete: "/Courses/soft-delete",
    },
    courseStatus: {
      base: "/CourseStatus",
    },
    userStatus: {
      base: "/UsersStatus",
    },
    analytics: {
      base: "/analytics",
      summary: "/analytics/summary",
    },
  },
  storage: {
    token: "becamex-token",
    user: "user-data",
    preferences: "user-preferences",
  },
} as const;

export default API_CONFIG;
