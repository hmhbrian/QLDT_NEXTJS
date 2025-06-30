
import { BaseService, ApiResponse, QueryParams } from "../../core";
import { API_CONFIG } from "@/lib/config";
import {
  DepartmentInfo,
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
} from "@/lib/types/department.types";

// Kiểu dữ liệu thô từ backend API
interface RawDepartment {
  departmentId: number;
  departmentName: string;
  departmentCode: string;
  description?: string;
  parentId?: number | null;
  parentName?: string | null;
  managerId?: string | null;
  managerName?: string | null;
  status: string; // API gửi chuỗi như "1", "2"
  statusId: number; // API also sends statusId
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
      status: raw.status, // The text name like "Đang hoạt động"
      statusId: raw.statusId, // The numeric ID
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
    // Backend expects PascalCase keys
    return {
      DepartmentName: payload.name,
      DepartmentCode: payload.code,
      Description: payload.description,
      StatusId: payload.statusId ? parseInt(payload.statusId, 10) : undefined,
      ManagerId: payload.managerId,
      ParentId: payload.parentId ? parseInt(payload.parentId, 10) : null,
    };
  }

  async getDepartments(
    params?: DepartmentQueryParams
  ): Promise<DepartmentInfo[]> {
    const response = await this.get<RawDepartment[]>(
      this.endpoint,
      { params }
    );
    return (response || []).map(this.mapRawToDepartmentInfo.bind(this));
  }

  async getDepartmentById(id: string): Promise<DepartmentInfo> {
    const rawData = await this.get<RawDepartment>(
      `${this.endpoint}/${id}`
    );
    if (!rawData) {
      throw new Error(`Department with ID ${id} not found.`);
    }
    return this.mapRawToDepartmentInfo(rawData);
  }

  async createDepartment(
    payload: CreateDepartmentPayload
  ): Promise<DepartmentInfo> {
    const apiPayload = this.mapPayloadToApi(payload);
    const rawData = await this.post<RawDepartment>(
      this.endpoint,
      apiPayload
    );
    return this.mapRawToDepartmentInfo(rawData);
  }

  async updateDepartment(
    id: string,
    payload: UpdateDepartmentPayload
  ): Promise<void> {
    const apiPayload = this.mapPayloadToApi(payload);
    await this.put<void>(
      `${this.endpoint}/${id}`,
      apiPayload
    );
  }

  async deleteDepartment(id: string): Promise<void> {
    await this.remove(id);
  }
}

export const departmentsService = new DepartmentsService();
export default departmentsService;
