/**
 * Core API Types
 * Shared types across all API services
 */

// Generic API Response wrapper from your backend.
// It's assumed the actual data is in the `data` property.
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string | null;
  data: T; // The actual payload is here
  statusCode?: number;
  errors?: string[];
  accessToken?: string;
}

// HTTP Response from the client (includes status, headers)
export interface HttpResponse<T = any> {
  data: T; // This will hold the entire ApiResponse<T>
  status: number;
  statusText: string;
  headers: Record<string, string>;
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
  keyword?: string;
  statusIds?: string;
  departmentIds?: string;
  eLevelIds?: string;
  publicOnly?: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  Page?: number;
  Limit?: number;
  SortField?: string;
  SortType?: "asc" | "desc";
}

export type QueryParams = PaginationParams &
  FilterParams & { [key: string]: unknown };

// HTTP Request Configuration
export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  params?: Record<string, any>;
  withCredentials?: boolean;
  signal?: AbortSignal;
}

// Generic CRUD Payload Types
export interface BaseCreatePayload {
  [key: string]: unknown;
}

export interface BaseUpdatePayload {
  [key: string]: unknown;
}

// Utility Types
export type EntityId = string | number;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
