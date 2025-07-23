/**
 * API Response Types
 * Standard API response interfaces for type safety
 */

// Generic API Response wrapper
export interface ApiResponse<T = any> {
  statusCode: number;
  message: string;
  data: T;
  success: boolean;
}

// Paginated response for list endpoints
export interface PaginatedResponse<T = any> {
  statusCode: number;
  message: string;
  data: {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  success: boolean;
}

// Query parameters for API calls
export interface BaseQueryParam {
  Page: number; // Must be >= 1
  Limit: number; // Must be between 1 and 24
  SortField: string; // Default: "created.at"
  SortType: "asc" | "desc"; // Default: "desc"
}

// Error response structure
export interface ApiError {
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
  timestamp: string;
}
