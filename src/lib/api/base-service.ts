/**
 * Base Service for API operations
 * Provides common CRUD methods for all API services
 */
import apiClient from "@/lib/api-client";
import { ApiResponse, PaginatedResponse } from "./api-utils";

export abstract class BaseService<T, CreatePayload, UpdatePayload> {
  protected endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  /**
   * Get all items
   */
  async getAll(): Promise<ApiResponse<PaginatedResponse<T>>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<T>>>(
      this.endpoint
    );
    return response.data;
  }

  /**
   * Get item by ID
   */
  async getById(id: string): Promise<ApiResponse<T>> {
    const response = await apiClient.get<ApiResponse<T>>(
      `${this.endpoint}/${id}`
    );
    return response.data;
  }

  /**
   * Create new item
   */
  async create(payload: CreatePayload): Promise<ApiResponse<T>> {
    const response = await apiClient.post<ApiResponse<T>>(
      this.endpoint,
      payload
    );
    return response.data;
  }

  /**
   * Update item
   */
  async update(id: string, payload: UpdatePayload): Promise<ApiResponse<T>> {
    const response = await apiClient.put<ApiResponse<T>>(
      `${this.endpoint}/${id}`,
      payload
    );
    return response.data;
  }

  /**
   * Delete item
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(
      `${this.endpoint}/${id}`
    );
    return response.data;
  }
}
