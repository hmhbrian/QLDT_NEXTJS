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
      // Dựa trên phản hồi mẫu, status "2" có vẻ là trạng thái hoạt động.
      // Đưa ra giả định linh hoạt ở đây.
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
    // Ánh xạ payload thân thiện với frontend thành những gì API mong đợi.
    return {
      departmentName: payload.name,
      departmentCode: payload.code,
      description: payload.description,
      // Đặc tả API hiển thị `status: "string"`.
      // Dựa trên phản hồi mẫu, chúng ta sẽ gửi "2" cho hoạt động. Có thể cần điều chỉnh.
      status: payload.status === "active" ? "2" : "1",
      managerId: payload.managerId,
      // API mong đợi parentId là số hoặc null.
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
