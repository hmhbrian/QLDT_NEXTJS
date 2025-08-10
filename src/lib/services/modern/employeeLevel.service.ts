import { BaseService, QueryParams } from "../../core";
import { API_CONFIG } from "@/lib/config";
import type { EmployeeLevel } from "@/lib/types/user.types";

export interface CreateEmployeeLevelPayload {
  eLevelName: string;
}

export interface UpdateEmployeeLevelPayload {
  eLevelName?: string;
}

export interface EmployeeLevelQueryParams extends QueryParams {
  name?: string;
}

class EmployeeLevelServiceClass extends BaseService<
  EmployeeLevel,
  CreateEmployeeLevelPayload,
  UpdateEmployeeLevelPayload
> {
  constructor() {
    super(API_CONFIG.endpoints.EmployeeLevel.base);
  }

  async getEmployeeLevel(
    params?: EmployeeLevelQueryParams
  ): Promise<EmployeeLevel[]> {
    return this.get<EmployeeLevel[]>(this.endpoint, { params });
  }

  async getEmployeeLevelById(id: string | number): Promise<EmployeeLevel> {
    return this.get<EmployeeLevel>(`${this.endpoint}/${id}`);
  }

  async createEmployeeLevel(
    payload: CreateEmployeeLevelPayload
  ): Promise<EmployeeLevel> {
    return this.post<EmployeeLevel>(this.endpoint, payload);
  }

  async updateEmployeeLevel(
    id: string | number,
    payload: UpdateEmployeeLevelPayload
  ): Promise<EmployeeLevel> {
    return this.put<EmployeeLevel>(`${this.endpoint}/${id}`, payload);
  }

  async deleteEmployeeLevel(id: string | number): Promise<void> {
    await this.delete<void>(`${this.endpoint}/${id}`);
  }
}

export const EmployeeLevelService = new EmployeeLevelServiceClass();
export default EmployeeLevelService;
