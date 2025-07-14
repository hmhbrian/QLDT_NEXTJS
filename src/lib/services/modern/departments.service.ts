import { BaseService, QueryParams } from "../../core";
import { API_CONFIG } from "@/lib/config";
import {
  DepartmentInfo,
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
  DepartmentApiResponse,
} from "@/lib/types/department.types";
import { mapDepartmentApiToUi } from "@/lib/mappers/department.mapper";
import { ApiResponse } from "@/lib/core/types";

export interface DepartmentQueryParams extends QueryParams {
  status?: string;
}

export class DepartmentsService extends BaseService<
  DepartmentInfo,
  CreateDepartmentPayload,
  UpdateDepartmentPayload
> {
  constructor() {
    super(API_CONFIG.endpoints.departments.base);
  }

  async getDepartments(
    params?: DepartmentQueryParams
  ): Promise<DepartmentInfo[]> {
    // The 'get' method in BaseService already handles extracting the 'data' property
    // from the ApiResponse wrapper. So, the response here should be the array itself.
    const apiDepartments = await this.get<DepartmentApiResponse[]>(
      this.endpoint,
      { params }
    );
    // Ensure we handle cases where apiDepartments might be null or undefined.
    return (apiDepartments || []).map(mapDepartmentApiToUi);
  }

  async getDepartmentById(id: string): Promise<DepartmentInfo> {
    const rawData = await this.get<DepartmentApiResponse>(
      API_CONFIG.endpoints.departments.getById(id)
    );
    if (!rawData) {
      throw new Error(`Department with ID ${id} not found.`);
    }
    return mapDepartmentApiToUi(rawData);
  }

  async createDepartment(
    payload: CreateDepartmentPayload
  ): Promise<DepartmentInfo> {
    const rawData = await this.post<DepartmentApiResponse>(
      this.endpoint,
      payload
    );
    return mapDepartmentApiToUi(rawData);
  }

  async updateDepartment(
    id: string,
    payload: UpdateDepartmentPayload
  ): Promise<void> {
    await this.put<void>(API_CONFIG.endpoints.departments.update(id), payload);
  }

  async deleteDepartment(id: string): Promise<void> {
    await this.delete(API_CONFIG.endpoints.departments.delete(id));
  }
}

export const departmentsService = new DepartmentsService();
export default departmentsService;
