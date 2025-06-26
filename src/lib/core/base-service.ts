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
        localStorage.getItem("becamex-token") ||
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
      const response = await apiClient.get<T>(url, mergedConfig);
      return response.data;
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

        const response = await apiClient.post<T>(url, data, formDataConfig);
        return response.data;
      }

      const mergedConfig = {
        ...config,
        headers: {
          ...this.getAuthHeaders(),
          ...config?.headers,
        },
      };
      const response = await apiClient.post<T>(url, data, mergedConfig);
      return response.data;
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
      const mergedConfig = {
        ...config,
        headers: {
          ...this.getAuthHeaders(),
          ...config?.headers,
        },
      };
      const response = await apiClient.put<T>(url, data, mergedConfig);
      return response.data;
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
      const response = await apiClient.patch<T>(url, data, mergedConfig);
      return response.data;
    } catch (error) {
      this.handleError("PATCH", url, error);
    }
  }

  protected async delete<T = void>(
    url: string,
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
      // Log chi tiết request DELETE
      console.log("[BaseService][DELETE] URL:", url);
      console.log("[BaseService][DELETE] Headers:", mergedConfig.headers);
      if (config && (config as any).data) {
        console.log("[BaseService][DELETE] Body:", (config as any).data);
      }
      const response = await apiClient.delete<T>(url, mergedConfig);
      return response.data;
    } catch (error) {
      this.handleError("DELETE", url, error);
    }
  }

  async getAll(
    params?: QueryParams
  ): Promise<ApiResponse<PaginatedResponse<TEntity>>> {
    const queryString = params ? this.buildQueryString(params) : "";
    const url = `${this.endpoint}${queryString}`;
    return this.get<ApiResponse<PaginatedResponse<TEntity>>>(url);
  }

  async getById(id: EntityId): Promise<ApiResponse<TEntity>> {
    return this.get<ApiResponse<TEntity>>(`${this.endpoint}/${id}`);
  }

  async create(payload: TCreatePayload): Promise<ApiResponse<TEntity>> {
    return this.post<ApiResponse<TEntity>>(this.endpoint, payload);
  }

  async update(
    id: EntityId,
    payload: TUpdatePayload
  ): Promise<ApiResponse<TEntity>> {
    return this.put<ApiResponse<TEntity>>(`${this.endpoint}/${id}`, payload);
  }

  async remove(id: EntityId): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`${this.endpoint}/${id}`);
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

    // Log raw error response for debugging
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as any;
      console.error("🔥 Raw error response:", {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        headers: axiosError.response?.headers,
        config: axiosError.config,
      });
      // Log Authorization header nếu có
      if (axiosError.config && axiosError.config.headers) {
        console.error("🔥 Request headers:", axiosError.config.headers);
      }
      // Log request body nếu có
      if (axiosError.config && axiosError.config.data) {
        console.error("🔥 Request body:", axiosError.config.data);
      }
      // Try to parse and log detailed error message
      try {
        const errorData = axiosError.response?.data;
        if (typeof errorData === "string") {
          const parsedError = JSON.parse(errorData);
          console.error("🔥 Parsed error details:", parsedError);

          // Extract validation errors if present
          if (parsedError.errors) {
            console.error("🔥 Validation errors:", parsedError.errors);
            // Log each validation error in detail
            Object.entries(parsedError.errors).forEach(([field, errors]) => {
              console.error(`🔥   Field '${field}':`, errors);
            });
          }
          if (parsedError.title) {
            console.error("🔥 Error title:", parsedError.title);
          }
          if (parsedError.detail) {
            console.error("🔥 Error detail:", parsedError.detail);
          }
        } else if (errorData && typeof errorData === "object") {
          console.error("🔥 Error object:", errorData);
        }
      } catch (parseError) {
        console.error("🔥 Could not parse error response:", parseError);
      }
    }

    throw new Error(message);
  }

  protected extractData<T>(response: ApiResponse<T>): T {
    if (!response) {
      throw new Error("Invalid API response: response is null or undefined.");
    }

    // For responses that don't have a data field (like success messages)
    // but have a successful status code, return the response itself
    if (response.data === undefined) {
      if (response.statusCode >= 200 && response.statusCode < 300) {
        // Nếu có message hoặc success, trả về response gốc
        if ("message" in response || "success" in response) {
          return response as unknown as T;
        }
        // For void responses, return undefined
        return undefined as T;
      }
      throw new Error("Invalid API response: no data found.");
    }

    return response.data;
  }

  protected extractItems(
    response: ApiResponse<PaginatedResponse<TEntity>>
  ): TEntity[] {
    return this.extractData(response)?.items || [];
  }
}
