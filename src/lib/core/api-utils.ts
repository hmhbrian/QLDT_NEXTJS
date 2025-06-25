
import { QueryParams } from "./types";

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

export function mergeQueryParams(
  ...paramObjects: (QueryParams | undefined)[]
): QueryParams {
  return paramObjects.reduce(
    (merged, params) => ({ ...merged, ...params }),
    {} as QueryParams
  );
}

export function validateRequired<T extends Record<string, unknown>>(
  data: T,
  requiredFields: (keyof T)[]
): string[] {
  const errors: string[] = [];
  requiredFields.forEach((field) => {
    if (data[field] === undefined || data[field] === null || data[field] === "") {
      errors.push(`${String(field)} is required`);
    }
  });
  return errors;
}

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

export function formatEndpoint(endpoint: string): string {
  if (!endpoint.startsWith("/")) {
    endpoint = "/" + endpoint;
  }
  if (endpoint.endsWith("/") && endpoint.length > 1) {
    endpoint = endpoint.slice(0, -1);
  }
  return endpoint;
}

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

export function extractErrorMessage(error: unknown): string {
  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object") {
    const apiError = error as any;

    // Handle structured API errors
    if (apiError.response?.data) {
      const { message, errors } = apiError.response.data;
      let fullMessage = message || "An unknown error occurred.";
      if (Array.isArray(errors) && errors.length > 0) {
        // Append details from the 'errors' array
        const errorDetails = errors.join(" ");
        fullMessage += ` ${errorDetails}`;
      }
      return fullMessage;
    }

    // Fallback for general errors
    if (apiError.message) {
      return apiError.message;
    }
  }

  return "An unknown error occurred. Please try again.";
}
