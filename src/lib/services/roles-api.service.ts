/**
 * Roles API Service
 * Handles all role-related API operations
 */
import { BaseApiService, ApiResponse, QueryParams } from "./base-api.service";

export interface Role {
  id: string;
  name: string;
  description?: string;
  isDefault?: boolean;
  permissions?: string[];
}

export type RoleQueryParams = QueryParams;

export type CreateRolePayload = Omit<Role, "id">;

export type UpdateRolePayload = Partial<CreateRolePayload>;

class RolesApiService extends BaseApiService {
  constructor() {
    super("/Roles");
  }

  /**
   * Get all roles
   */
  async getRoles(): Promise<Role[]> {
    const response = await this.get<ApiResponse<Role[]>>("/Roles");
    return response.data || [];
  }

  /**
   * Get role by ID
   */
  async getRoleById(id: string): Promise<Role> {
    const response = await this.getById<Role>(id);
    return response.data!;
  }

  /**
   * Get role by name
   */
  async getRoleByName(name: string): Promise<Role> {
    const response = await this.get<ApiResponse<Role>>(`/Roles/byName/${name}`);
    return response.data!;
  }

  /**
   * Create new role
   */
  async createRole(roleData: CreateRolePayload): Promise<Role> {
    const response = await this.create<Role, CreateRolePayload>(roleData);
    return response.data!;
  }

  /**
   * Update role
   */
  async updateRole(id: string, roleData: UpdateRolePayload): Promise<Role> {
    const response = await this.update<Role, UpdateRolePayload>(id, roleData);
    return response.data!;
  }

  /**
   * Delete role
   */
  async deleteRole(id: string): Promise<void> {
    await this.remove(id);
  }
}

// Export singleton instance
export const rolesApiService = new RolesApiService();
export default rolesApiService;
