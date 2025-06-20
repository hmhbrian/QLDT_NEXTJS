/**
 * Departments API Service
 * Handles all API operations related to departments
 */
import { BaseApiService, ApiResponse } from "./base-api.service";
import { DepartmentInfo } from "@/lib/types";
import {
  PaginatedResponse,
  PaginationParams,
  FilterParams,
} from "../api/api-utils";

export interface CreateDepartmentRequest {
  Name: string;
  Description?: string;
  ParentId?: string | null;
}

export interface UpdateDepartmentRequest {
  Name?: string;
  Description?: string;
  ParentId?: string | null;
}

export interface DepartmentFilterParams extends FilterParams {
  parentId?: string | null;
  hasChildren?: boolean;
}

export interface DepartmentSortParams {
  sortBy?: "name" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

type ModifiedPaginationParams = Omit<PaginationParams, "sortBy" | "sortOrder">;

export interface DepartmentQueryParams
  extends ModifiedPaginationParams,
    DepartmentFilterParams,
    DepartmentSortParams {}

/**
 * Departments API Service
 * Handles all API operations related to departments using the new HTTP client
 */
class DepartmentsApiService extends BaseApiService {
  constructor() {
    super("/departments");
  }
  /**
   * Get all departments (unpaginated)
   */
  async getAllDepartments(): Promise<DepartmentInfo[]> {
    const response = await this.get<ApiResponse<DepartmentInfo[]>>(
      this.endpoint
    );
    return response.data;
  }

  /**
   * Get paginated departments with filtering and sorting
   */
  async getDepartments(
    params?: DepartmentQueryParams
  ): Promise<PaginatedResponse<DepartmentInfo>> {
    const queryString = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : "";
    const response = await this.get<
      ApiResponse<PaginatedResponse<DepartmentInfo>>
    >(`${this.endpoint}/paginated${queryString}`);
    return response.data;
  }

  /**
   * Get a department by ID
   */
  async getDepartmentById(id: string): Promise<DepartmentInfo> {
    const response = await this.get<ApiResponse<DepartmentInfo>>(
      `${this.endpoint}/${id}`
    );
    return response.data;
  }

  /**
   * Create a new department
   */
  async createDepartment(
    payload: CreateDepartmentRequest
  ): Promise<DepartmentInfo> {
    const response = await this.post<ApiResponse<DepartmentInfo>>(
      this.endpoint,
      payload
    );
    return response.data;
  }

  /**
   * Update an existing department
   */
  async updateDepartment(
    id: string,
    payload: UpdateDepartmentRequest
  ): Promise<DepartmentInfo> {
    const response = await this.put<ApiResponse<DepartmentInfo>>(
      `${this.endpoint}/${id}`,
      payload
    );
    return response.data;
  }

  /**
   * Delete a department
   */
  async deleteDepartment(id: string): Promise<void> {
    await this.delete(`${this.endpoint}/${id}`);
  }

  /**
   * Move a department (change parent)
   */
  async moveDepartment(
    id: string,
    newParentId: string | null
  ): Promise<DepartmentInfo> {
    const response = await this.patch<ApiResponse<DepartmentInfo>>(
      `${this.endpoint}/${id}/move`,
      {
        parentId: newParentId,
      }
    );
    return response.data;
  }

  /**
   * Check if a department name is available
   */
  async checkNameAvailability(
    name: string,
    excludeId?: string
  ): Promise<boolean> {
    const params = new URLSearchParams({ name });
    if (excludeId) {
      params.append("excludeId", excludeId);
    }
    const response = await this.get<ApiResponse<{ available: boolean }>>(
      `${this.endpoint}/check-name?${params.toString()}`
    );
    return response.data.available;
  }

  /**
   * Get departments structure as a tree
   */
  async getDepartmentsTree(): Promise<DepartmentInfo[]> {
    const response = await this.get<ApiResponse<DepartmentInfo[]>>(
      `${this.endpoint}/tree`
    );
    return response.data;
  }

  /**
   * Get department's children
   */
  async getDepartmentChildren(
    id: string,
    recursive: boolean = false
  ): Promise<DepartmentInfo[]> {
    const params = new URLSearchParams({ recursive: recursive.toString() });
    const response = await this.get<ApiResponse<DepartmentInfo[]>>(
      `${this.endpoint}/${id}/children?${params.toString()}`
    );
    return response.data;
  }
}

// Create a singleton instance
export const departmentsApiService = new DepartmentsApiService();

export default departmentsApiService;
