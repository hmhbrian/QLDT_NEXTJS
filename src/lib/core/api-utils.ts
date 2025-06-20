/**
 * Core API Utilities
 * Shared utilities across all API services
 */
import { QueryParams } from "./types";

/**
 * Create URL with query parameters
 */
export function createUrl(
  baseUrl: string,
  params?: Record<string, unknown>
): string {
  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }

  const url = new URL(baseUrl, window.location.origin);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.append(key, String(value));
    }
  });

  return url.pathname + url.search;
}

/**
 * Build query string from parameters
 */
export function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

/**
 * Merge query parameters
 */
export function mergeQueryParams(
  ...paramObjects: (QueryParams | undefined)[]
): QueryParams {
  return paramObjects.reduce(
    (merged, params) => ({ ...merged, ...params }),
    {} as QueryParams
  );
}

/**
 * Validate required fields
 */
export function validateRequired<T extends Record<string, unknown>>(
  data: T,
  requiredFields: (keyof T)[]
): string[] {
  const errors: string[] = [];

  requiredFields.forEach((field) => {
    if (!data[field]) {
      errors.push(`${String(field)} is required`);
    }
  });

  return errors;
}

/**
 * Clean object by removing undefined/null values
 */
export function cleanObject<T extends Record<string, unknown>>(
  obj: T
): Partial<T> {
  const cleaned: Partial<T> = {};

  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      (cleaned as any)[key] = value;
    }
  });

  return cleaned;
}

/**
 * Format API endpoint
 */
export function formatEndpoint(endpoint: string): string {
  // Ensure endpoint starts with /
  if (!endpoint.startsWith("/")) {
    endpoint = "/" + endpoint;
  }

  // Remove trailing slash
  if (endpoint.endsWith("/") && endpoint.length > 1) {
    endpoint = endpoint.slice(0, -1);
  }

  return endpoint;
}

/**
 * Create pagination params
 */
export function createPaginationParams(
  page: number = 1,
  limit: number = 10,
  sortBy?: string,
  sortOrder: "asc" | "desc" = "asc"
): QueryParams {
  return cleanObject({
    page,
    limit,
    sortBy,
    sortOrder,
  });
}

/**
 * Extract error message from API response
 */
export function extractErrorMessage(error: unknown): string {
  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object") {
    const apiError = error as any;

    // Check for API response error
    if (apiError.response?.data?.message) {
      return apiError.response.data.message;
    }

    // Check for direct message
    if (apiError.message) {
      return apiError.message;
    }

    // Check for errors array
    if (apiError.response?.data?.errors?.length > 0) {
      return apiError.response.data.errors[0];
    }
  }

  return "An unknown error occurred";
}
