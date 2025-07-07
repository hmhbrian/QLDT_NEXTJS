/**
 * Enterprise API Configuration
 * Centralized, type-safe configuration for all API endpoints and settings
 */

import { courseAttachedFilesService } from "../services";

// Environment configuration with proper typing
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5228/api";
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || "30000");
const USE_API = process.env.NEXT_PUBLIC_USE_API === "true";

// Development logging
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("🚀 API Configuration:", {
    baseURL: API_BASE_URL,
    useApi: USE_API,
    timeout: API_TIMEOUT,
  });
}

// Type-safe endpoint configuration
export const API_ENDPOINTS = {
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
    updateUsers: "/Users/update",
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
  tests: {
    base: "/tests",
  },
  courseAttachedFiles: {
    base: "/courseattachedfiles",
    getByCourseId: (courseId: string) => `/courseattachedfiles/${courseId}`,
    upload: (courseId: string) => `/courseattachedfiles/${courseId}`,
    delete: (courseId: string, fileId: number) =>
      `/courseattachedfiles/${courseId}/${fileId}`,
  },
  courseStatus: {
    base: "/CourseStatus",
  },
  userStatus: {
    base: "/UsersStatus",
  },
  status: {
    base: "/status",
    courses: {
      getAll: "/status/courses",
      create: "/status/courses",
      update: (id: string) => `/status/courses/${id}`,
      delete: (id: string) => `/status/courses/${id}`,
    },
    users: {
      getAll: "/status/users",
      create: "/status/users",
      update: (id: string) => `/status/users/${id}`,
      delete: (id: string) => `/status/users/${id}`,
    },
  },
  analytics: {
    base: "/analytics",
    summary: "/analytics/summary",
  },
} as const;

// Main API configuration object
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
  storage: {
    tokenKey: "qldt_auth_token",
    refreshTokenKey: "qldt_refresh_token",
    userKey: "qldt_user_data",
    // Backward compatibility properties
    token: "qldt_auth_token",
    user: "qldt_user_data",
  },
  endpoints: API_ENDPOINTS,
} as const;

// Export individual config pieces for specific use cases
export const API_BASE = API_BASE_URL;
export const API_USE_REAL = USE_API;
export const API_REQUEST_TIMEOUT = API_TIMEOUT;

// Type exports for better TypeScript support
export type ApiEndpoints = typeof API_ENDPOINTS;
export type ApiConfig = typeof API_CONFIG;
