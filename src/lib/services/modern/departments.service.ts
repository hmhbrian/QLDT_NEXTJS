/**
 * Modern Departments Service
 * Uses core architecture for clean and consistent API operations
 */

import { 
  BaseService, 
  ApiResponse, 
  PaginatedResponse, 
  QueryParams,
  BaseCreatePayload,
  BaseUpdatePayload
} from '../../core';
import type { DepartmentInfo } from '../../types';

// Specific query params for departments
export interface DepartmentQueryParams extends QueryParams {
  parentId?: string | null;
  hasChildren?: boolean;
  name?: string;
}

// Create/Update payload types
export interface CreateDepartmentPayload extends BaseCreatePayload {
  Name: string;
  Description?: string;
  ParentId?: string | null;
}

export interface UpdateDepartmentPayload extends BaseUpdatePayload {
  Name?: string;
  Description?: string;
  ParentId?: string | null;
}

// Helper function to convert to backend format
function toDepartmentQueryParams(params: DepartmentQueryParams): Record<string, any> {
  return {
    ...params,
    ParentId: params.parentId,
    HasChildren: params.hasChildren,
    Name: params.name,
    // Remove frontend properties
    parentId: undefined,
    hasChildren: undefined,
    name: undefined,
  };
}

/**
 * Modern Departments Service
 * Provides clean, typed API for departments operations
 */
export class DepartmentsService extends BaseService<DepartmentInfo> {
  constructor() {
    super('/departments');
  }  /**
   * Get all departments with optional filtering
   */
  async getDepartments(params?: DepartmentQueryParams): Promise<PaginatedResponse<DepartmentInfo>> {
    const queryParams = params ? toDepartmentQueryParams(params) : undefined;
    const response = await this.getAll(queryParams);
    return response.data;
  }

  /**
   * Get department by ID
   */
  async getDepartmentById(id: string): Promise<DepartmentInfo> {
    const response = await this.getById(id);
    return response.data;
  }

  /**
   * Create new department
   */
  async createDepartment(payload: CreateDepartmentPayload): Promise<DepartmentInfo> {
    const response = await this.create(payload);
    return response.data;
  }

  /**
   * Update department
   */
  async updateDepartment(id: string, payload: UpdateDepartmentPayload): Promise<DepartmentInfo> {
    const response = await this.update(id, payload);
    return response.data;
  }

  /**
   * Delete department
   */
  async deleteDepartment(id: string): Promise<void> {
    await this.delete(id);
  }

  /**
   * Move a department (change parent)
   */
  async moveDepartment(id: string, newParentId: string | null): Promise<DepartmentInfo> {
    const response = await this.patch<ApiResponse<DepartmentInfo>>(`${id}/move`, {
      ParentId: newParentId,
    });
    return response.data;
  }

  /**
   * Check if a department name is available
   */
  async checkNameAvailability(name: string, excludeId?: string): Promise<boolean> {
    const params = new URLSearchParams({ name });
    if (excludeId) {
      params.append('excludeId', excludeId);
    }
    const response = await this.get<ApiResponse<{ available: boolean }>>(`/check-name?${params.toString()}`);
    return response.data.available;
  }

  /**
   * Get departments structure as a tree
   */
  async getDepartmentsTree(): Promise<DepartmentInfo[]> {
    const response = await this.get<ApiResponse<DepartmentInfo[]>>('/tree');
    return response.data;
  }

  /**
   * Get department's children
   */
  async getDepartmentChildren(id: string, recursive: boolean = false): Promise<DepartmentInfo[]> {
    const params = new URLSearchParams({ recursive: recursive.toString() });
    const response = await this.get<ApiResponse<DepartmentInfo[]>>(`${id}/children?${params.toString()}`);
    return response.data;
  }
}

// Export singleton instance
export const departmentsService = new DepartmentsService();
export default departmentsService;
