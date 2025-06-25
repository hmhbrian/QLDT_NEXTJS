
/**
 * Core API Types
 * Shared types across all API services
 */

// Base API Response structure from your backend
export interface ApiResponse<T = unknown> {
  message: string;
  code?: string; // Optional code from backend
  data: T;
  statusCode: number;
  errors?: string[];
  accessToken?: string; // For login response
}

// Pagination Types
export interface PaginationData {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  totalPages: number;
}

export interface PaginatedResponse<T = unknown> {
  items: T[];
  pagination: PaginationData;
}

// Query Parameter Types
export interface FilterParams {
  search?: string;
  status?: string;
  department?: string;
  role?: string;
  name?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export type QueryParams = PaginationParams & FilterParams & { [key: string]: unknown };

// HTTP Request Configuration
export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  params?: Record<string, unknown>;
}

// Generic CRUD Payload Types
export interface BaseCreatePayload {
  [key: string]: unknown;
}

export interface BaseUpdatePayload {
  [key: string]: unknown;
}

// Error Types
export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
  errors?: string[];
}

// Utility Types
export type EntityId = string | number;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
