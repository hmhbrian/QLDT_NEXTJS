import { BaseService, QueryParams, PaginatedResponse } from "../../core";
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

  // Sửa lại kiểu dữ liệu trả về để khớp với API
  async getDepartments(
    params: DepartmentQueryParams = {}
  ): Promise<DepartmentApiResponse[]> {
    const backendParams: Record<string, any> = {};
    if (params.status) backendParams.status = params.status;
    if (params.Page) backendParams.Page = params.Page;
    if (params.Limit) backendParams.Limit = params.Limit;
    if (params.SortField) backendParams.SortField = params.SortField;
    if (params.SortType) backendParams.SortType = params.SortType;

    const apiResponse = await this.get<DepartmentApiResponse[]>(this.endpoint, {
      params: backendParams,
    });
    // API trả về một mảng phẳng, không phải object có `items`
    return apiResponse;
  }

  async getDepartmentById(id: number): Promise<DepartmentInfo> {
    const rawData = await this.get<DepartmentApiResponse>(
      API_CONFIG.endpoints.departments.getById(String(id))
    );
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
    id: number,
    payload: UpdateDepartmentPayload
  ): Promise<void> {
    await this.put<void>(
      API_CONFIG.endpoints.departments.update(String(id)),
      payload
    );
  }

  async deleteDepartment(id: number): Promise<void> {
    await this.delete(API_CONFIG.endpoints.departments.delete(String(id)));
  }
}

export const departmentsService = new DepartmentsService();
export default departmentsService;
