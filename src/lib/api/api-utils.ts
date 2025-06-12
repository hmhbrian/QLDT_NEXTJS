import { AxiosError, AxiosResponse } from 'axios';

/**
 * Common API response interface
 */
export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
}

/**
 * Pagination response interface
 */
export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Standard error response from API
 */
export interface ApiErrorResponse {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

/**
 * Parameters for paginated requests
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Parameters for filtered requests
 */
export interface FilterParams {
  search?: string;
  [key: string]: any;
}

/**
 * Extract data from an API response
 */
export function extractData<T>(response: AxiosResponse<ApiResponse<T>>): T {
  return response.data.data;
}

/**
 * Extract paginated data from an API response
 */
export function extractPaginatedData<T>(response: AxiosResponse<ApiResponse<PaginatedResponse<T>>>): PaginatedResponse<T> {
  return response.data.data;
}

/**
 * Format error from axios error
 */
export function formatApiError(error: AxiosError<ApiErrorResponse>): string {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unknown error occurred';
}

/**
 * Create query string from params object
 */
export function createQueryString(params: Record<string, any>): string {
  const query = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map(v => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`).join('&');
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join('&');
    
  return query ? `?${query}` : '';
}

/**
 * Create a full URL with query parameters
 */
export function createUrl(baseUrl: string, params?: Record<string, any>): string {
  if (!params) return baseUrl;
  const queryString = createQueryString(params);
  return `${baseUrl}${queryString}`;
} 