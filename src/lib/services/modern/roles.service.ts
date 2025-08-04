import { BaseService, QueryParams, PaginatedResponse } from "../../core";
import { API_CONFIG } from "@/lib/config";
import type { ServiceRole } from "@/lib/types/user.types";

export interface CreateRolePayload {
  RoleName: string;
}

export interface UpdateRolePayload {
  RoleName?: string;
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

  async getRoles(params?: RoleQueryParams): Promise<PaginatedResponse<ServiceRole>> {
    return this.get<PaginatedResponse<ServiceRole>>(this.endpoint, { params });
  }

  async getRoleById(id: string): Promise<ServiceRole> {
    return this.get<ServiceRole>(API_CONFIG.endpoints.roles.byId(id));
  }

  async createRole(payload: CreateRolePayload): Promise<ServiceRole> {
    return this.post<ServiceRole>(this.endpoint, payload);
  }

  async updateRole(
    id: string,
    payload: UpdateRolePayload
  ): Promise<ServiceRole> {
    return this.put<ServiceRole>(API_CONFIG.endpoints.roles.byId(id), payload);
  }

  async deleteRole(id: string): Promise<void> {
    await this.delete<void>(API_CONFIG.endpoints.roles.byId(id));
  }
}

export const rolesService = new RolesService();
export default rolesService;
