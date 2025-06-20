import apiClient from "@/lib/api-client";
import { DepartmentInfo } from "@/lib/types/index";
import {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  FilterParams,
  createUrl,
} from "@/lib/api/api-utils";
import { BaseService } from "@/lib/api/base-service";

export interface CreateDepartmentPayload {
  name: string;
  description?: string;
  parentId?: string | null;
}

export interface UpdateDepartmentPayload {
  name?: string;
  description?: string;
  parentId?: string | null;
}

export interface DepartmentFilterParams extends FilterParams {
  parentId?: string | null;
  hasChildren?: boolean;
}

export interface DepartmentSortParams {
  sortBy?: "name" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

// Create modified pagination params without sortBy to avoid conflict
type ModifiedPaginationParams = Omit<PaginationParams, "sortBy" | "sortOrder">;

export interface DepartmentQueryParams
  extends ModifiedPaginationParams,
    DepartmentFilterParams,
    DepartmentSortParams {}

/**
 * Department Service
 * Handles all API operations related to departments
 */
class DepartmentService extends BaseService<
  DepartmentInfo,
  CreateDepartmentPayload,
  UpdateDepartmentPayload
> {
  constructor() {
    super("/departments");
  }

  /**
   * Get all departments (unpaginated)
   * @override
   */
  async getAllDepartments(): Promise<DepartmentInfo[]> {
    const response = await this.getAll();
    return response.data.items; // Extract items from paginated response
  }

  /**
   * Get paginated departments with filtering and sorting
   */
  async getDepartments(
    params?: DepartmentQueryParams
  ): Promise<PaginatedResponse<DepartmentInfo>> {
    const url = createUrl(`${this.endpoint}/paginated`, params);
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<DepartmentInfo>>
    >(url);
    return response.data.data;
  }

  /**
   * Get a department by ID
   * @override
   */
  async getDepartmentById(id: string): Promise<DepartmentInfo> {
    const response = await this.getById(id);
    return response.data;
  }

  /**
   * Create a new department
   * @override
   */
  async createDepartment(
    payload: CreateDepartmentPayload
  ): Promise<DepartmentInfo> {
    const response = await this.create(payload);
    return response.data;
  }

  /**
   * Update an existing department
   * @override
   */
  async updateDepartment(
    id: string,
    payload: UpdateDepartmentPayload
  ): Promise<DepartmentInfo> {
    const response = await this.update(id, payload);
    return response.data;
  }

  /**
   * Delete a department
   * @override
   */
  async deleteDepartment(id: string): Promise<void> {
    await this.delete(id);
  }

  /**
   * Move a department (change parent)
   */
  async moveDepartment(
    id: string,
    newParentId: string | null
  ): Promise<DepartmentInfo> {
    const response = await apiClient.patch<ApiResponse<DepartmentInfo>>(
      `${this.endpoint}/${id}/move`,
      {
        parentId: newParentId,
      }
    );
    return response.data.data;
  }

  /**
   * Check if a department name is available
   */
  async checkNameAvailability(
    name: string,
    excludeId?: string
  ): Promise<boolean> {
    const params = excludeId ? { excludeId } : undefined;
    const url = createUrl(`${this.endpoint}/check-name`, { name, ...params });
    const response = await apiClient.get<ApiResponse<{ available: boolean }>>(
      url
    );
    return response.data.data.available;
  }

  /**
   * Get departments structure as a tree
   */
  async getDepartmentsTree(): Promise<DepartmentInfo[]> {
    const response = await apiClient.get<ApiResponse<DepartmentInfo[]>>(
      `${this.endpoint}/tree`
    );
    return response.data.data;
  }

  /**
   * Get department's children
   */
  async getDepartmentChildren(
    id: string,
    recursive: boolean = false
  ): Promise<DepartmentInfo[]> {
    const url = createUrl(`${this.endpoint}/${id}/children`, { recursive });
    const response = await apiClient.get<ApiResponse<DepartmentInfo[]>>(url);
    return response.data.data;
  }
}

// Create a singleton instance
export const departmentsService = new DepartmentService();

export default departmentsService;
