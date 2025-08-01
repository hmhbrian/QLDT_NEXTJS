
import { BaseService, QueryParams } from "../../core";
import { API_CONFIG } from "@/lib/config";
import {
  DepartmentInfo,
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
  DepartmentApiResponse,
} from "@/lib/types/department.types";
import { mapDepartmentApiToUi } from "@/lib/mappers/department.mapper";

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
    const apiDepartments = await this.get<DepartmentApiResponse[]>(
      this.endpoint,
      { params }
    );
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
    // Backend API for PUT expects all required fields.
    // Ensure the payload is complete before sending.
    const completePayload: Required<UpdateDepartmentPayload> = {
        DepartmentName: payload.DepartmentName || '',
        DepartmentCode: payload.DepartmentCode || '',
        Description: payload.Description || '',
        ManagerId: payload.ManagerId || '',
        StatusId: payload.StatusId || 0,
        ParentId: payload.ParentId === undefined ? null : payload.ParentId,
    };
    await this.put<void>(API_CONFIG.endpoints.departments.update(id), completePayload);
  }

  async deleteDepartment(id: string): Promise<void> {
    await this.delete(API_CONFIG.endpoints.departments.delete(id));
  }
}

export const departmentsService = new DepartmentsService();
export default departmentsService;
