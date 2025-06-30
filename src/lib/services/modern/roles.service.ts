
import { BaseService, ApiResponse, QueryParams } from "../../core";
import { API_CONFIG } from "@/lib/config";
import type { ServiceRole } from "@/lib/types/user.types";

export interface CreateRolePayload {
  name: string;
  description?: string;
}

export interface UpdateRolePayload {
  name?: string;
  description?: string;
}

export interface RoleQueryParams extends QueryParams {
  name?: string;
}

export class RolesService extends BaseService<
  ServiceRole,
  CreateRolePayload,
  UpdateRolePayload
> {
  constructor() {
    super(API_CONFIG.endpoints.roles.base);
  }

  async getRoles(params?: RoleQueryParams): Promise<ServiceRole[]> {
    return this.get<ServiceRole[]>(this.endpoint, { params });
  }

  async getRoleById(id: string): Promise<ServiceRole> {
    return this.get<ServiceRole>(`${this.endpoint}/${id}`);
  }

  async createRole(payload: CreateRolePayload): Promise<ServiceRole> {
    return this.post<ServiceRole>(this.endpoint, payload);
  }

  async updateRole(
    id: string,
    payload: UpdateRolePayload
  ): Promise<ServiceRole> {
    return this.put<ServiceRole>(`${this.endpoint}/${id}`, payload);
  }

  async deleteRole(id: string): Promise<void> {
    await this.delete<void>(`${this.endpoint}/${id}`);
  }

  async getRoleByName(name: string): Promise<ServiceRole> {
    const url = API_CONFIG.endpoints.roles.byName(name);
    return this.get<ServiceRole>(url);
  }
}

export const rolesService = new RolesService();
export default rolesService;
