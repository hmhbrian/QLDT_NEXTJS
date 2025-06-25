import { BaseService, ApiResponse, QueryParams } from "../../core";
import { API_CONFIG } from "@/lib/legacy-api/config";
import {
  DepartmentInfo,
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
} from "@/lib/types";

// The raw type from the backend API
interface RawDepartment {
  departmentId: number;
  departmentName: string;
  departmentCode: string;
  description?: string;
  parentId?: number | null;
  parentName?: string | null;
  managerId?: string | null;
  managerName?: string | null;
  status: string; // The API sends a string like "1", "2"
  level: number;
  path: string[];
  createdAt: string;
  updatedAt: string;
  children?: RawDepartment[];
}

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

  private mapRawToDepartmentInfo(raw: RawDepartment): DepartmentInfo {
    return {
      departmentId: String(raw.departmentId),
      name: raw.departmentName,
      code: raw.departmentCode,
      description: raw.description,
      parentId: raw.parentId ? String(raw.parentId) : null,
      parentName: raw.parentName,
      managerId: raw.managerId,
      managerName: raw.managerName,
      // Based on sample response, status "2" seems to be the active one.
      // Making a flexible assumption here.
      status:
        raw.status === "2" || raw.status?.toLowerCase() === "active"
          ? "active"
          : "inactive",
      level: raw.level,
      path: raw.path,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      children: raw.children?.map(this.mapRawToDepartmentInfo.bind(this)),
    };
  }

  private mapPayloadToApi(
    payload: CreateDepartmentPayload | UpdateDepartmentPayload
  ) {
    // Maps the frontend-friendly payload to what the API expects.
    return {
      departmentName: payload.name,
      departmentCode: payload.code,
      description: payload.description,
      // The API spec shows `status: "string"`.
      // Based on the sample response, we'll send "2" for active. This might need adjustment.
      status: payload.status === "active" ? "2" : "1",
      managerId: payload.managerId,
      // API expects parentId as a number or null.
      ParentId: payload.parentId ? parseInt(payload.parentId, 10) : null,
    };
  }

  async getDepartments(
    params?: DepartmentQueryParams
  ): Promise<DepartmentInfo[]> {
    const response = await this.get<ApiResponse<RawDepartment[]>>(
      this.endpoint,
      { params }
    );
    const rawData = this.extractData(response) || [];
    return rawData.map(this.mapRawToDepartmentInfo.bind(this));
  }

  async getDepartmentById(id: string): Promise<DepartmentInfo> {
    const response = await this.get<ApiResponse<RawDepartment>>(
      `${this.endpoint}/${id}`
    );
    const rawData = this.extractData(response);
    if (!rawData) {
      throw new Error(`Department with ID ${id} not found.`);
    }
    return this.mapRawToDepartmentInfo(rawData);
  }

  async createDepartment(
    payload: CreateDepartmentPayload
  ): Promise<DepartmentInfo> {
    const apiPayload = this.mapPayloadToApi(payload);
    const response = await this.post<ApiResponse<RawDepartment>>(
      this.endpoint,
      apiPayload
    );
    return this.mapRawToDepartmentInfo(this.extractData(response));
  }

  async updateDepartment(
    id: string,
    payload: UpdateDepartmentPayload
  ): Promise<DepartmentInfo> {
    const apiPayload = this.mapPayloadToApi(payload);
    const response = await this.put<ApiResponse<RawDepartment>>(
      `${this.endpoint}/${id}`,
      apiPayload
    );
    return this.mapRawToDepartmentInfo(this.extractData(response));
  }

  async deleteDepartment(id: string): Promise<void> {
    await this.remove(id);
  }
}

export const departmentsService = new DepartmentsService();
export default departmentsService;
