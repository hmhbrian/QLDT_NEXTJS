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
    const response = await this.get<ApiResponse<ServiceRole[]>>(this.endpoint, {
      params,
    });
    return this.extractData(response) || [];
  }

  async getRoleById(id: string): Promise<ServiceRole> {
    const response = await super.getById(id);
    const data = this.extractData(response);
    if (!data) {
      throw new Error(`Role with ID ${id} not found.`);
    }
    return data;
  }

  async createRole(payload: CreateRolePayload): Promise<ServiceRole> {
    const response = await this.create(payload);
    return this.extractData(response);
  }

  async updateRole(
    id: string,
    payload: UpdateRolePayload
  ): Promise<ServiceRole> {
    const response = await this.update(id, payload);
    return this.extractData(response);
  }

  async deleteRole(id: string): Promise<void> {
    await this.remove(id);
  }

  async getRoleByName(name: string): Promise<ServiceRole> {
    const url = API_CONFIG.endpoints.roles.byName(name);
    const response = await this.get<ApiResponse<ServiceRole>>(url);
    return this.extractData(response);
  }
}

export const rolesService = new RolesService();
export default rolesService;
