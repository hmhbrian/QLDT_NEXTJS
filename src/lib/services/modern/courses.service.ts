import {
  BaseService,
  PaginatedResponse,
  QueryParams,
  ApiResponse,
} from "@/lib/core";
import {
  Course,
  CreateCourseRequest,
  UpdateCourseRequest,
  CourseApiResponse,
  CourseSearchParams,
  SoftDeleteCoursesRequest,
} from "@/lib/types/course.types";
import { API_CONFIG } from "@/lib/config";
import { buildFormData, getApiToken } from "@/lib/utils/form.utils";

export class CoursesService extends BaseService<
  CourseApiResponse,
  CreateCourseRequest,
  UpdateCourseRequest
> {
  constructor() {
    super(API_CONFIG.endpoints.courses.base);
  }

  async getCourses(params?: QueryParams): Promise<CourseApiResponse[]> {
    // If there's a search term, use the search endpoint
    if (params?.search) {
      const searchResult = await this.searchCourses({
        keyword: params.search as string,
        ...params,
      });
      return Array.isArray(searchResult) ? searchResult : [];
    }

    const response = await this.get<
      ApiResponse<PaginatedResponse<CourseApiResponse>>
    >(API_CONFIG.endpoints.courses.getAll, { params });
    const items = this.extractItems(response);
    return Array.isArray(items) ? items : [];
  }

  async getCourseById(id: string): Promise<CourseApiResponse> {
    const response = await this.get<ApiResponse<CourseApiResponse>>(
      API_CONFIG.endpoints.courses.getById(id)
    );
    return this.extractData(response);
  }

  // Override createCourse to use native fetch for multipart/form-data
  async createCourse(payload: CreateCourseRequest): Promise<CourseApiResponse> {
    console.log("🔥 Creating course with payload (native fetch):", payload);

    // Build object đúng contract backend
    const obj: Record<string, any> = {
      Code: payload.code?.trim(),
      Name: payload.name?.trim(),
      Description: payload.description?.trim(),
      Objectives: payload.objectives?.trim(),
      Sessions: payload.sessions,
      HoursPerSessions: payload.hoursPerSessions,
      MaxParticipant: payload.maxParticipant,
      StartDate: payload.startDate,
      EndDate: payload.endDate,
      RegistrationStartDate: payload.registrationStartDate,
      RegistrationClosingDate: payload.registrationClosingDate,
      Location: payload.location,
      StatusId: payload.statusId,
      DepartmentIds: payload.departmentIds,
      PositionIds: payload.positionIds,
    };
    const formData = buildFormData(obj);
    const token = getApiToken();
    const response = await fetch(
      `${API_CONFIG.baseURL}${API_CONFIG.endpoints.courses.create}`,
      {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }
    const data = await response.json();
    console.log("[createCourse] Success response:", data);

    // Backend có thể trả về {success: true, message: "courseId"} thay vì course object
    if (data.success) {
      // Lấy lại course từ API để trả về course object đầy đủ
      const courseId = data.message;
      return await this.getCourseById(courseId);
    } else if (data.data) {
      // Nếu backend trả về course object trong data
      return this.extractData(data);
    } else {
      // Fallback: coi như data chính là course object
      return data;
    }
  }

  // Add new create method that uses CreateCourseRequest (matching BaseService interface)
  async create(
    payload: CreateCourseRequest
  ): Promise<ApiResponse<CourseApiResponse>> {
    console.log("🎯 CourseService.create called with payload:", payload);

    const formData = new FormData();

    // Always send required fields, even if empty
    formData.append("Code", payload.code || "");
    formData.append("Name", payload.name || "");
    formData.append("Description", payload.description || "");
    formData.append("Objectives", payload.objectives || "");

    // Optional fields with validation
    if (payload.startDate) {
      formData.append("StartDate", payload.startDate);
    }
    if (payload.endDate) {
      formData.append("EndDate", payload.endDate);
    }
    if (payload.maxParticipant && payload.maxParticipant > 0) {
      formData.append("MaxParticipant", payload.maxParticipant.toString());
    }

    // Only send valid department IDs
    if (payload.departmentIds?.length) {
      payload.departmentIds.forEach((id) => {
        if (id && id > 0) {
          formData.append("DepartmentIds", id.toString());
        }
      });
    }

    // Only send valid position IDs
    if (payload.positionIds?.length) {
      payload.positionIds.forEach((id) => {
        if (id && id > 0) {
          formData.append("PositionIds", id.toString());
        }
      });
    }

    // Skip Optional field entirely (matches working test script)
    // Skip Format field (not in test script)

    // Debug: Log all FormData entries
    console.log("📦 FormData contents:");
    const formDataEntries: Array<[string, any]> = [];
    for (const [key, value] of formData.entries()) {
      formDataEntries.push([key, value]);
      console.log(`  ${key}:`, value);
    }

    console.log("📊 FormData entries count:", formDataEntries.length);

    // Try to serialize FormData for inspection
    const formDataObj: Record<string, any> = {};
    for (const [key, value] of formData.entries()) {
      if (formDataObj[key]) {
        // Handle multiple values for same key (like arrays)
        if (Array.isArray(formDataObj[key])) {
          formDataObj[key].push(value);
        } else {
          formDataObj[key] = [formDataObj[key], value];
        }
      } else {
        formDataObj[key] = value;
      }
    }
    console.log("📊 FormData as object:", formDataObj);

    // Compare with test script keys
    const testScriptKeys = [
      "Code",
      "Name",
      "Description",
      "Objectives",
      "StartDate",
      "EndDate",
      "MaxParticipant",
      "DepartmentIds",
      "PositionIds",
    ];
    const formDataKeys = Array.from(formData.keys());
    console.log("🔍 Test script keys:", testScriptKeys);
    console.log("🔍 FormData keys:", formDataKeys);
    console.log(
      "🔍 Missing from FormData:",
      testScriptKeys.filter((k) => !formDataKeys.includes(k))
    );
    console.log(
      "🔍 Extra in FormData:",
      formDataKeys.filter((k) => !testScriptKeys.includes(k))
    );

    console.log(
      "🚀 Sending POST request to:",
      API_CONFIG.endpoints.courses.create
    );

    try {
      const result = await this.post<ApiResponse<CourseApiResponse>>(
        API_CONFIG.endpoints.courses.create,
        formData,
        {
          headers: {
            // QUAN TRỌNG: Không set Content-Type, để browser tự set boundary cho multipart
          },
        }
      );
      console.log("✅ POST request successful, result:", result);
      return result;
    } catch (error) {
      console.error("❌ POST request failed, error:", error);
      throw error;
    }
  }

  // Build update payload: chỉ lấy field backend chấp nhận, map đúng tên
  private buildUpdatePayload(
    payload: UpdateCourseRequest
  ): Record<string, any> {
    const result: Record<string, any> = {};

    // Required fields: LUÔN phải có giá trị và không được rỗng
    result["Code"] = payload.code?.trim() || "DEFAULT_CODE";
    result["Name"] = payload.name?.trim() || "DEFAULT_NAME";
    result["Description"] =
      payload.description?.trim() || "DEFAULT_DESCRIPTION";
    result["Objectives"] = payload.objectives?.trim() || "DEFAULT_OBJECTIVES";

    // Optional fields: chỉ thêm nếu có giá trị
    if (payload.sessions !== undefined) result["Sessions"] = payload.sessions;
    if (payload.hoursPerSessions !== undefined)
      result["HoursPerSessions"] = payload.hoursPerSessions;
    if (payload.maxParticipant !== undefined)
      result["MaxParticipant"] = payload.maxParticipant;
    if (payload.startDate) result["StartDate"] = payload.startDate;
    if (payload.endDate) result["EndDate"] = payload.endDate;
    if (payload.registrationStartDate)
      result["RegistrationStartDate"] = payload.registrationStartDate;
    if (payload.registrationClosingDate)
      result["RegistrationClosingDate"] = payload.registrationClosingDate;
    if (payload.location) result["Location"] = payload.location;
    if (payload.statusId !== undefined) result["StatusId"] = payload.statusId;
    if (
      payload.departmentIds &&
      Array.isArray(payload.departmentIds) &&
      payload.departmentIds.length > 0
    ) {
      result["DepartmentIds"] = payload.departmentIds;
    }
    if (
      payload.positionIds &&
      Array.isArray(payload.positionIds) &&
      payload.positionIds.length > 0
    ) {
      result["PositionIds"] = payload.positionIds;
    }
    return result;
  }

  async updateCourse(
    courseId: string,
    payload: UpdateCourseRequest
  ): Promise<CourseApiResponse> {
    console.log("[updateCourse] Input payload:", payload);

    const obj: Record<string, any> = {
      Code: payload.code?.trim(),
      Name: payload.name?.trim(),
      Description: payload.description?.trim(),
      Objectives: payload.objectives?.trim(),
      Sessions: payload.sessions,
      HoursPerSessions: payload.hoursPerSessions,
      MaxParticipant: payload.maxParticipant,
      StartDate: payload.startDate,
      EndDate: payload.endDate,
      RegistrationStartDate: payload.registrationStartDate,
      RegistrationClosingDate: payload.registrationClosingDate,
      Location: payload.location,
      StatusId: payload.statusId,
      DepartmentIds: payload.departmentIds,
      PositionIds: payload.positionIds,
    };
    const formData = buildFormData(obj);
    const token = getApiToken();
    const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.courses.update(
      courseId
    )}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    const data = await response.json();
    if (data.success) {
      const courseId = data.message;
      return await this.getCourseById(courseId);
    } else {
      throw new Error(data.message || "Update failed");
    }
  }

  async searchCourses(
    params: CourseSearchParams
  ): Promise<CourseApiResponse[]> {
    const response = await this.get<
      ApiResponse<PaginatedResponse<CourseApiResponse>>
    >(API_CONFIG.endpoints.courses.search, {
      params: params as Record<string, unknown>,
    });
    const items = this.extractItems(response);
    return Array.isArray(items) ? items : [];
  }

  // Override softDeleteCourses to use native fetch with DELETE and body
  async softDeleteCourses(courseIds: string[]): Promise<void> {
    let token = "";
    if (typeof window !== "undefined") {
      token =
        localStorage.getItem("becamex-token") ||
        localStorage.getItem("accessToken") ||
        "";
    }

    // Only support single id for now (backend expects one id per request)
    if (!courseIds || courseIds.length === 0)
      throw new Error("No course id provided");
    // If you want to support multiple, loop and call this method per id
    const id = courseIds[0];
    const url = `${API_CONFIG.baseURL}${
      API_CONFIG.endpoints.courses.softDelete
    }?id=${encodeURIComponent(id)}`;

    // Log for debug
    console.log("🔍 [softDeleteCourses] URL:", url);
    console.log(
      "🔍 [softDeleteCourses] Token:",
      token ? `${token.substring(0, 20)}...` : "NO TOKEN"
    );

    const headers = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      Accept: "*/*",
    };
    console.log("🔍 [softDeleteCourses] Headers:", headers);

    const response = await fetch(url, {
      method: "DELETE",
      headers,
    });

    console.log("🔍 [softDeleteCourses] Response status:", response.status);
    console.log(
      "🔍 [softDeleteCourses] Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("🔥 [softDeleteCourses] Error response:", errorText);
      throw new Error(errorText);
    }

    const responseText = await response.text();
    console.log("✅ [softDeleteCourses] Success response:", responseText);
  }

  // Transform API response to frontend Course type
  transformToCourse(apiCourse: CourseApiResponse): Course {
    // Map departments từ API response
    const departments =
      apiCourse.departments?.map((dept) => dept.departmentName) || [];

    // Map positions/levels từ API response
    const levels = apiCourse.positions?.map((pos) => pos.positionName) || [];

    // Map status từ API response
    const status =
      apiCourse.status?.name || this.mapStatusIdToStatus(apiCourse.statusId);

    return {
      id: apiCourse.id,
      title: apiCourse.name,
      courseCode: apiCourse.code,
      description: apiCourse.description,
      objectives: apiCourse.objectives,
      category: "programming", // Default, could be enhanced with mapping
      instructor: "Instructor", // Would need separate API call or field
      duration: {
        sessions: apiCourse.sessions || 1,
        hoursPerSession: apiCourse.hoursPerSessions || 1,
      },
      learningType: (apiCourse.format === "offline" ? "offline" : "online") as
        | "online"
        | "offline",
      startDate: apiCourse.startDate || null,
      endDate: apiCourse.endDate || null,
      location: apiCourse.location || "",
      image: apiCourse.thumbUrl || "https://placehold.co/600x400.png",
      status: this.mapStatusNameToStatus(status) as any,
      department: departments as any[], // Map department names
      level: levels as any[], // Map position names
      materials: [],
      createdAt: apiCourse.createdAt || new Date().toISOString(),
      modifiedAt: apiCourse.modifiedAt || new Date().toISOString(),
      createdBy: "Unknown", // API doesn't return this field
      modifiedBy: "Unknown", // API doesn't return this field
      enrollmentType: this.mapOptionalToEnrollmentType(apiCourse.optional),
      registrationDeadline: apiCourse.registrationClosingDate || null,
      enrolledTrainees: [],
      isPublic: true,
      maxParticipants: apiCourse.maxParticipant || 25,
    };
  }

  // Transform frontend Course to Create API payload
  transformToCreatePayload(course: Partial<Course>): CreateCourseRequest {
    // Validation - đảm bảo các field bắt buộc không trống
    const requiredFields = {
      code: course.courseCode?.trim(),
      name: course.title?.trim(),
      description: course.description?.trim(),
      objectives: course.objectives?.trim(),
    };

    // Kiểm tra các field bắt buộc
    Object.entries(requiredFields).forEach(([key, value]) => {
      if (!value) {
        throw new Error(`Field '${key}' is required and cannot be empty`);
      }
    });

    // Đảm bảo dates hợp lệ và logic đúng
    const startDate = course.startDate
      ? new Date(course.startDate).toISOString()
      : undefined;
    const endDate = course.endDate
      ? new Date(course.endDate).toISOString()
      : undefined;

    // LOGIC ĐÚNG cho registration dates:
    // 1. Registration start date phải trước registration closing date
    // 2. Registration closing date phải trước course start date

    // Registration start date: 7 ngày trước start date
    const registrationStartDate = course.startDate
      ? new Date(
          new Date(course.startDate).getTime() - 7 * 24 * 60 * 60 * 1000
        ).toISOString()
      : undefined;

    // Registration closing date: 1 ngày trước start date (SAU registration start date)
    const registrationClosingDate = course.registrationDeadline
      ? new Date(course.registrationDeadline).toISOString()
      : course.startDate
      ? new Date(
          new Date(course.startDate).getTime() - 1 * 24 * 60 * 60 * 1000
        ).toISOString()
      : undefined;

    // Filter valid department và position IDs để tránh lỗi business validation
    const validDepartmentIds = Array.isArray(course.department)
      ? course.department
          .map((d) => {
            if (typeof d === "string") {
              const id = parseInt(d);
              return isNaN(id) ? 0 : id;
            }
            return (d as any)?.departmentId || (d as any)?.id || 0;
          })
          .filter((id) => id > 0)
      : [];

    const validPositionIds = Array.isArray(course.level)
      ? course.level
          .map((l) => {
            if (typeof l === "string") {
              const id = parseInt(l);
              return isNaN(id) ? 0 : id;
            }
            return (l as any)?.positionId || (l as any)?.id || 0;
          })
          .filter((id) => id > 0)
      : [];

    const payload: CreateCourseRequest = {
      code: requiredFields.code,
      name: requiredFields.name,
      description: requiredFields.description,
      objectives: requiredFields.objectives,
      // ONLY send fields that work in test script - NO FORMAT, OPTIONAL, THUMBURL!
      sessions: course.duration?.sessions || 1,
      hoursPerSessions: course.duration?.hoursPerSession || 1,
      maxParticipant: course.maxParticipants || 25,
      startDate,
      endDate,
      registrationStartDate,
      registrationClosingDate,
      location: course.location?.trim() || "Room 101",
      statusId: this.mapStatusToStatusId(course.status) || 1,
      // CHỈ GỬI department/position IDs nếu chúng có giá trị hợp lệ và > 0
      departmentIds: validDepartmentIds.length > 0 ? validDepartmentIds : [],
      positionIds: validPositionIds.length > 0 ? validPositionIds : [],
    };

    console.log("🔄 Transform payload debug:", {
      input: course,
      output: payload,
      validDepartmentIds,
      validPositionIds,
      dateLogic: {
        startDate,
        endDate,
        registrationStartDate,
        registrationClosingDate,
        dateValidation:
          registrationStartDate && registrationClosingDate && startDate
            ? `${registrationStartDate} < ${registrationClosingDate} < ${startDate}`
            : "N/A",
      },
    });

    return payload;
  }

  // Transform frontend Course to Update API payload
  transformToUpdatePayload(course: Partial<Course>): UpdateCourseRequest {
    return {
      code: course.courseCode,
      name: course.title,
      description: course.description,
      objectives: course.objectives,
      // Removed thumbUrl - not supported by backend
      sessions: course.duration?.sessions,
      hoursPerSessions: course.duration?.hoursPerSession,
      maxParticipant: course.maxParticipants,
      startDate: course.startDate,
      endDate: course.endDate,
      registrationClosingDate: course.registrationDeadline,
      location: course.location,
      statusId: course.status
        ? this.mapStatusToStatusId(course.status)
        : undefined,
    };
  }

  // Legacy transform - kept for backward compatibility
  transformToApiPayload(
    course: Partial<Course>
  ): CreateCourseRequest | UpdateCourseRequest {
    return this.transformToCreatePayload(course);
  }

  private mapStatusIdToStatus(statusId?: number): string {
    const statusMap: Record<number, string> = {
      1: "draft",
      2: "published",
      3: "archived",
    };
    return statusMap[statusId || 1] || "draft";
  }

  private mapStatusNameToStatus(statusName?: string): string {
    const statusMap: Record<string, string> = {
      "Lưu nháp": "draft",
      "Đã xuất bản": "published",
      "Đã lưu trữ": "archived",
      Draft: "draft",
      Published: "published",
      Archived: "archived",
    };
    return statusMap[statusName || ""] || "draft";
  }

  private mapOptionalToEnrollmentType(
    optional?: string
  ): "optional" | "mandatory" {
    if (optional === "Bắt buộc" || optional === "mandatory") {
      return "mandatory";
    }
    return "optional";
  }

  private mapEnrollmentTypeToOptional(enrollmentType?: string): string {
    return enrollmentType === "mandatory" ? "Bắt buộc" : "Tự nguyện";
  }

  private mapStatusToStatusId(status?: string): number {
    const statusMap: Record<string, number> = {
      draft: 1,
      published: 2,
      archived: 3,
    };
    return statusMap[status || "draft"] || 1;
  }
}

export const coursesService = new CoursesService();
export default coursesService;
