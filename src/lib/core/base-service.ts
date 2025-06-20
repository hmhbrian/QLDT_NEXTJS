/**
 * Universal Base Service
 * Single, consistent base service for all API operations
 * Replaces both BaseService and BaseApiService
 */
import apiClient from "@/lib/api-client";
import {
  ApiResponse,
  PaginatedResponse,
  QueryParams,
  RequestConfig,
  EntityId,
  BaseCreatePayload,
  BaseUpdatePayload,
} from "../core/types";

export abstract class BaseService<
  TEntity = unknown,
  TCreatePayload extends BaseCreatePayload = BaseCreatePayload,
  TUpdatePayload extends BaseUpdatePayload = BaseUpdatePayload
> {
  protected readonly endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  // ==================== HTTP Methods ====================

  /**
   * GET request wrapper
   */
  protected async get<T>(url: string, config?: RequestConfig): Promise<T> {
    try {
      const response = await apiClient.get<T>(url, config);
      return response.data;
    } catch (error) {
      this.handleError("GET", url, error);
      throw error;
    }
  }

  /**
   * POST request wrapper
   */
  protected async post<T>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    try {
      const response = await apiClient.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError("POST", url, error);
      throw error;
    }
  }

  /**
   * PUT request wrapper
   */
  protected async put<T>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    try {
      const response = await apiClient.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError("PUT", url, error);
      throw error;
    }
  }

  /**
   * PATCH request wrapper
   */
  protected async patch<T>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    try {
      const response = await apiClient.patch<T>(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError("PATCH", url, error);
      throw error;
    }
  }

  /**
   * DELETE request wrapper
   */
  protected async delete<T = void>(
    url: string,
    config?: RequestConfig
  ): Promise<T> {
    try {
      const response = await apiClient.delete<T>(url, config);
      return response.data;
    } catch (error) {
      this.handleError("DELETE", url, error);
      throw error;
    }
  }

  // ==================== CRUD Operations ====================

  /**
   * Get all items with optional pagination and filtering
   */
  async getAll(
    params?: QueryParams
  ): Promise<ApiResponse<PaginatedResponse<TEntity>>> {
    const queryString = params ? this.buildQueryString(params) : "";
    const url = `${this.endpoint}${queryString}`;
    return this.get<ApiResponse<PaginatedResponse<TEntity>>>(url);
  }

  /**
   * Get single item by ID
   */
  async getById(id: EntityId): Promise<ApiResponse<TEntity>> {
    return this.get<ApiResponse<TEntity>>(`${this.endpoint}/${id}`);
  }

  /**
   * Create new item
   */
  async create(payload: TCreatePayload): Promise<ApiResponse<TEntity>> {
    return this.post<ApiResponse<TEntity>>(this.endpoint, payload);
  }

  /**
   * Update existing item
   */
  async update(
    id: EntityId,
    payload: TUpdatePayload
  ): Promise<ApiResponse<TEntity>> {
    return this.put<ApiResponse<TEntity>>(`${this.endpoint}/${id}`, payload);
  }

  /**
   * Delete item
   */
  async remove(id: EntityId): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`${this.endpoint}/${id}`);
  }

  // ==================== Utility Methods ====================

  /**
   * Build query string from parameters
   */
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

  /**
   * Handle API errors consistently
   */
  protected handleError(method: string, url: string, error: unknown): void {
    console.error(`[${this.constructor.name}] ${method} ${url} failed:`, {
      status: (error as any)?.response?.status,
      message: (error as any)?.message,
      data: (error as any)?.response?.data,
    });
  }

  /**
   * Extract data from API response
   */
  protected extractData<T>(response: ApiResponse<T>): T {
    if (!response.data) {
      throw new Error("No data in API response");
    }
    return response.data;
  }

  /**
   * Extract items from paginated response
   */
  protected extractItems<T>(response: ApiResponse<PaginatedResponse<T>>): T[] {
    return this.extractData(response).items;
  }
}
