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

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  protected async get<T>(url: string, config?: RequestConfig): Promise<T> {
    try {
      const response = await apiClient.get<T>(url, config);
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
      const response = await apiClient.post<T>(url, data, config);
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
      const response = await apiClient.put<T>(url, data, config);
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
      const response = await apiClient.patch<T>(url, data, config);
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
      const response = await apiClient.delete<T>(url, config);
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
