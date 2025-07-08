import apiClient from "@/lib/api-client";
import {
  ApiResponse,
  PaginatedResponse,
  QueryParams,
  RequestConfig,
  EntityId,
} from "../core/types";
import { extractErrorMessage } from "./api-utils";

export abstract class BaseService<
  TEntity = unknown,
  TCreatePayload = any,
  TUpdatePayload = any
> {
  protected readonly endpoint: string;

  // Helper: get Authorization header from localStorage
  protected getAuthHeaders(): Record<string, string> {
    let token = "";
    if (typeof window !== "undefined") {
      // Sử dụng cùng key token như api-client.ts
      token =
        localStorage.getItem("qldt_auth_token") ||
        localStorage.getItem("accessToken") ||
        "";
    }
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  protected async get<T>(url: string, config?: RequestConfig): Promise<T> {
    try {
      const mergedConfig = {
        ...config,
        headers: {
          ...this.getAuthHeaders(),
          ...config?.headers,
        },
      };
      const response = await apiClient.get<ApiResponse<T>>(url, mergedConfig);
      return this.extractData(response.data);
    } catch (error) {
      this.handleError("GET", url, error);
    }
  }

  protected async post<T>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    try {
      // Handle FormData - don't set Content-Type, let browser set it with boundary
      if (data instanceof FormData) {
        const formDataConfig = {
          ...config,
          headers: {
            ...this.getAuthHeaders(),
            ...config?.headers,
            // Remove Content-Type to let browser set multipart boundary
          },
        };
        delete formDataConfig.headers?.["Content-Type"];

        console.log("📡 Sending FormData request:");
        console.log("  URL:", url);
        console.log("  Method: POST");
        console.log("  Headers:", formDataConfig.headers);
        console.log(
          "  FormData entries:",
          Array.from((data as FormData).entries())
        );

        const response = await apiClient.post<ApiResponse<T>>(
          url,
          data,
          formDataConfig
        );
        return this.extractData(response.data);
      }

      const mergedConfig = {
        ...config,
        headers: {
          ...this.getAuthHeaders(),
          ...config?.headers,
        },
      };
      const response = await apiClient.post<ApiResponse<T>>(
        url,
        data,
        mergedConfig
      );
      return this.extractData(response.data);
    } catch (error) {
      this.handleError("POST", url, error);
    }
  }

  protected async put<T>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    try {
      // Handle FormData for PUT requests as well
      if (data instanceof FormData) {
        const formDataConfig = {
          ...config,
          headers: {
            ...this.getAuthHeaders(),
            ...config?.headers,
          },
        };
        delete formDataConfig.headers?.["Content-Type"];
        const response = await apiClient.put<ApiResponse<T>>(
          url,
          data,
          formDataConfig
        );
        return this.extractData(response.data);
      }

      const mergedConfig = {
        ...config,
        headers: {
          ...this.getAuthHeaders(),
          ...config?.headers,
        },
      };
      const response = await apiClient.put<ApiResponse<T>>(
        url,
        data,
        mergedConfig
      );
      return this.extractData(response.data);
    } catch (error) {
      this.handleError("PUT", url, error);
    }
  }

  protected async patch<T>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    try {
      const mergedConfig = {
        ...config,
        headers: {
          ...this.getAuthHeaders(),
          ...config?.headers,
        },
      };
      const response = await apiClient.patch<ApiResponse<T>>(
        url,
        data,
        mergedConfig
      );
      return this.extractData(response.data);
    } catch (error) {
      this.handleError("PATCH", url, error);
    }
  }

  protected async delete<T = void>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    try {
      const mergedConfig = {
        ...config,
        headers: {
          ...this.getAuthHeaders(),
          ...config?.headers,
        },
      };
      const response = await apiClient.delete<ApiResponse<T>>(
        url,
        data,
        mergedConfig
      );
      return this.extractData(response.data);
    } catch (error) {
      this.handleError("DELETE", url, error);
    }
  }

  async getAll(params?: QueryParams): Promise<TEntity[]> {
    const response = await this.get<PaginatedResponse<TEntity>>(this.endpoint, {
      params,
    });
    return response.items || [];
  }

  async getById(id: EntityId): Promise<TEntity> {
    return this.get<TEntity>(`${this.endpoint}/${id}`);
  }

  async create(payload: TCreatePayload): Promise<TEntity> {
    return this.post<TEntity>(this.endpoint, payload);
  }

  async update(id: EntityId, payload: TUpdatePayload): Promise<TEntity> {
    return this.put<TEntity>(`${this.endpoint}/${id}`, payload);
  }

  async remove(id: EntityId): Promise<void> {
    await this.delete<void>(`${this.endpoint}/${id}`);
  }

  protected buildQueryString(params: Record<string, unknown>): string {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : "";
  }

  protected handleError(method: string, url: string, error: unknown): never {
    const message = extractErrorMessage(error);
    console.error(`[${this.constructor.name}] ${method} ${url} failed:`, {
      message,
      originalError: error,
    });
    throw new Error(message);
  }

  protected extractData<T>(response: ApiResponse<T>): T {
    // Check for success property first, if it exists and is false, throw error.
    if (
      response &&
      typeof response.success === "boolean" &&
      !response.success
    ) {
      throw new Error(
        response.message || "An API error occurred without a message."
      );
    }

    // If 'data' property exists, return it. This is the primary success case for GET requests.
    if (response && "data" in response && response.data !== undefined) {
      return response.data as T;
    }

    // Handle successful mutations (POST, PUT, PATCH, DELETE) that might not return a 'data' field.
    // Return the full response so mutations can access success, message, etc.
    if (response && response.success === true) {
      return response as T;
    }

    // Handle cases where the response is the data itself (no wrapper), for backward compatibility.
    if (
      response &&
      typeof response.success === "undefined" &&
      typeof response.message === "undefined"
    ) {
      return response as T;
    }

    // Fallback for unexpected response structures that are not explicitly errors.
    // This could be considered a contract violation with the API.
    throw new Error(
      "Invalid API response format: could not determine success or find data."
    );
  }

  protected extractItems(response: PaginatedResponse<TEntity>): TEntity[] {
    return response?.items || [];
  }
}
