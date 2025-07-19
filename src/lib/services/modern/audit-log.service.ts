import { BaseService } from "@/lib/core";
import { API_CONFIG } from "@/lib/config";
import { AuditLogEntry, AuditLogParams } from "@/lib/types/audit-log.types";

export class AuditLogService extends BaseService<AuditLogEntry> {
  constructor() {
    super(API_CONFIG.endpoints.auditLog.base);
  }

  async getCourseAuditLog(
    courseId: string,
    params?: AuditLogParams
  ): Promise<AuditLogEntry[]> {
    const queryParams: Record<string, any> = {
      courseId,
    };

    // Chỉ thêm params nếu có giá trị
    if (params) {
      if (params.action) queryParams.action = params.action;
      if (params.entityName) queryParams.entityName = params.entityName;
      if (params.userName) queryParams.userName = params.userName;
      if (params.startDate) queryParams.startDate = params.startDate;
      if (params.endDate) queryParams.endDate = params.endDate;
      if (params.page) queryParams.page = params.page;
      if (params.limit) queryParams.limit = params.limit;
    }

    console.log("🔍 Audit Log API Call:", {
      endpoint: API_CONFIG.endpoints.auditLog.course,
      params: queryParams,
    });

    const response = await this.get<{
      success: boolean;
      data: AuditLogEntry[];
    }>(API_CONFIG.endpoints.auditLog.course, { params: queryParams });

    console.log("📋 Audit Log Response:", response);

    // Kiểm tra cấu trúc response
    if (response && typeof response === "object" && "data" in response) {
      return response.data || [];
    }

    // Nếu response là array trực tiếp
    if (Array.isArray(response)) {
      return response;
    }

    return [];
  }

  async getUserAuditLog(
    userId: string,
    params?: AuditLogParams
  ): Promise<AuditLogEntry[]> {
    const queryParams = {
      userId,
      ...params,
    };

    const response = await this.get<{
      success: boolean;
      data: AuditLogEntry[];
    }>(API_CONFIG.endpoints.auditLog.user, { params: queryParams });

    return response.data || [];
  }

  async getAuditLog(params?: AuditLogParams): Promise<AuditLogEntry[]> {
    const response = await this.get<{
      success: boolean;
      data: AuditLogEntry[];
    }>(API_CONFIG.endpoints.auditLog.base, { params });

    return response.data || [];
  }
}

export const auditLogService = new AuditLogService();
export default auditLogService;
