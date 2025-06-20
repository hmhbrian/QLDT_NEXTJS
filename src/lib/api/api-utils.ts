/**
 * API Utilities
 * Common types and utilities for API services
 */

export interface ApiResponse<T = any> {
  message: string;
  code: string;
  data?: T;
  statusCode: number;
  errors?: string[];
}

export interface PaginationData {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  totalPages: number;
}

export interface PaginatedResponse<T = any> {
  items: T[];
  pagination: PaginationData;
}

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

export interface QueryParams extends PaginationParams, FilterParams {}

/**
 * Create URL with query parameters
 */
export function createUrl(
  baseUrl: string,
  params: Record<string, any> = {}
): string {
  const url = new URL(baseUrl, window.location.origin);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.append(key, String(value));
    }
  });

  return url.pathname + url.search;
}
