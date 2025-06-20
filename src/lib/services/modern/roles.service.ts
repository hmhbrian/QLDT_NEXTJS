/**
 * Modern Roles Service
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

// Specific query params for roles
export interface RoleQueryParams extends QueryParams {
  name?: string;
  permissions?: string;
}

// Role entity type
export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
}

// Create/Update payload types
export interface CreateRolePayload extends BaseCreatePayload {
  name: string;
  description?: string;
  permissions?: string[];
}

export interface UpdateRolePayload extends BaseUpdatePayload {
  name?: string;
  description?: string;
  permissions?: string[];
}

// Helper function to convert to backend format
function toRoleQueryParams(params: RoleQueryParams): Record<string, any> {
  return {
    ...params,
    Name: params.name,
    Permissions: params.permissions,
    // Remove frontend properties
    name: undefined,
    permissions: undefined,
  };
}

/**
 * Modern Roles Service
 * Provides clean, typed API for roles operations
 */
export class RolesService extends BaseService<Role> {
  constructor() {
    super('/Roles');
  }

  /**
   * Get all roles with optional filtering
   */
  async getRoles(params?: RoleQueryParams): Promise<PaginatedResponse<Role>> {
    const queryParams = params ? toRoleQueryParams(params) : undefined;
    const response = await this.getAll(queryParams);
    return response.data;
  }

  /**
   * Get role by ID
   */
  async getRoleById(id: string): Promise<Role> {
    const response = await this.getById(id);
    return response.data;
  }

  /**
   * Get role by name
   */
  async getRoleByName(name: string): Promise<Role> {
    const response = await this.get<ApiResponse<Role>>(`/byName/${name}`);
    return response.data;
  }

  /**
   * Create new role
   */
  async createRole(payload: CreateRolePayload): Promise<Role> {
    const response = await this.create(payload);
    return response.data;
  }

  /**
   * Update role
   */
  async updateRole(id: string, payload: UpdateRolePayload): Promise<Role> {
    const response = await this.update(id, payload);
    return response.data;
  }

  /**
   * Delete role
   */
  async deleteRole(id: string): Promise<void> {
    await this.delete(id);
  }
}

// Export singleton instance
export const rolesService = new RolesService();
export default rolesService;
