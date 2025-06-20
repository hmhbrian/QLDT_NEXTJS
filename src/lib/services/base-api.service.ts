/**
 * Base API Service
 * Provides common HTTP methods and error handling for all API services
 */
import apiClient from "@/lib/api-client";
import { HttpResponse, HttpRequestConfig } from "@/lib/http-client";

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
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface QueryParams extends PaginationParams, FilterParams {}

export abstract class BaseApiService {
  protected endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  /**
   * GET request wrapper
   */
  protected async get<T>(url: string, config?: HttpRequestConfig): Promise<T> {
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
    data?: any,
    config?: HttpRequestConfig
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
    data?: any,
    config?: HttpRequestConfig
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
    data?: any,
    config?: HttpRequestConfig
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
  protected async delete<T>(
    url: string,
    config?: HttpRequestConfig
  ): Promise<T> {
    try {
      const response = await apiClient.delete<T>(url, config);
      return response.data;
    } catch (error) {
      this.handleError("DELETE", url, error);
      throw error;
    }
  }

  /**
   * Build query string from params
   */
  protected buildQueryString(params: Record<string, any>): string {
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
  private handleError(method: string, url: string, error: any): void {
    console.error(`${method} ${url} failed:`, {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });
  }

  /**
   * Generic CRUD methods that can be overridden
   */
  async getAll<T>(
    params?: QueryParams
  ): Promise<ApiResponse<PaginatedResponse<T>>> {
    const queryString = params ? this.buildQueryString(params) : "";
    return this.get<ApiResponse<PaginatedResponse<T>>>(
      `${this.endpoint}${queryString}`
    );
  }

  async getById<T>(id: string): Promise<ApiResponse<T>> {
    return this.get<ApiResponse<T>>(`${this.endpoint}/${id}`);
  }

  async create<T, U>(data: U): Promise<ApiResponse<T>> {
    return this.post<ApiResponse<T>>(this.endpoint, data);
  }

  async update<T, U>(id: string, data: U): Promise<ApiResponse<T>> {
    return this.put<ApiResponse<T>>(`${this.endpoint}/${id}`, data);
  }

  async remove(id: string): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`${this.endpoint}/${id}`);
  }
}
