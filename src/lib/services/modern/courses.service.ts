
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
} from "@/lib/types/course.types";
import { API_CONFIG } from "@/lib/config";
import { getApiToken } from "@/lib/utils/form.utils";
import { PaginationParams } from "@/lib/core";

export class CoursesService extends BaseService<
  CourseApiResponse,
  CreateCourseRequest,
  UpdateCourseRequest
> {
  constructor() {
    super(API_CONFIG.endpoints.courses.base);
  }

  async getCourses(
    params?: CourseSearchParams & PaginationParams
  ): Promise<PaginatedResponse<CourseApiResponse>> {
    const backendParams: Record<string, any> = {};

    // Map frontend params to backend params
    if (params) {
      if (params.keyword) backendParams.Keyword = params.keyword;
      if (params.StatusIds && params.StatusIds !== "all")
        backendParams.StatusIds = params.StatusIds;
      if (params.DepartmentIds && params.DepartmentIds !== "all")
        backendParams.DepartmentIds = params.DepartmentIds;
      if (params.PositionIds && params.PositionIds !== "all")
        backendParams.PositionIds = params.PositionIds;
      if (params.page) backendParams.Page = params.page;
      if (params.limit) backendParams.Limit = params.limit;
      if (params.sortBy) backendParams.SortField = params.sortBy;
      if (params.sortOrder) backendParams.SortType = params.sortOrder;
    }

    const hasFilters =
      backendParams.Keyword ||
      backendParams.StatusIds ||
      backendParams.DepartmentIds ||
      backendParams.PositionIds;

    const endpoint = hasFilters
      ? API_CONFIG.endpoints.courses.search
      : this.endpoint;

    const response = await this.get<PaginatedResponse<CourseApiResponse>>(
      endpoint,
      {
        params: backendParams,
      }
    );

    return {
      items: response.items || [],
      pagination: response.pagination || {
        totalItems: response.items?.length || 0,
        itemsPerPage: backendParams.Limit || 10,
        currentPage: backendParams.Page || 1,
        totalPages: 1,
      },
    };
  }

  async getCourseById(id: string): Promise<CourseApiResponse> {
    const response = await this.get<CourseApiResponse>(
      API_CONFIG.endpoints.courses.getById(id)
    );
    return response;
  }

  private buildFormDataFromPayload(
    payload: CreateCourseRequest | UpdateCourseRequest
  ): FormData {
    const formData = new FormData();
    // Use PascalCase for backend compatibility
    formData.append("Code", payload.Code || "");
    formData.append("Name", payload.Name || "");
    formData.append("Description", payload.Description || "");
    formData.append("Objectives", payload.Objectives || "");
    formData.append("Format", payload.Format || "online");
    formData.append("Sessions", (payload.Sessions || 0).toString());
    formData.append(
      "HoursPerSessions",
      (payload.HoursPerSessions || 0).toString()
    );
    formData.append("Optional", payload.Optional || "Tùy chọn");
    formData.append("MaxParticipant", (payload.MaxParticipant || 0).toString());
    formData.append("Location", payload.Location || "");
    formData.append("StatusId", (payload.StatusId || "").toString());

    if (payload.CategoryId) {
      formData.append("CategoryId", payload.CategoryId.toString());
    }
    if (payload.LecturerId) {
      formData.append("LecturerId", payload.LecturerId.toString());
    }

    if (payload.StartDate) formData.append("StartDate", payload.StartDate);
    if (payload.EndDate) formData.append("EndDate", payload.EndDate);
    if (payload.RegistrationStartDate)
      formData.append("RegistrationStartDate", payload.RegistrationStartDate);
    if (payload.RegistrationClosingDate)
      formData.append(
        "RegistrationClosingDate",
        payload.RegistrationClosingDate
      );

    if (payload.imageFile) {
      formData.append("ThumbUrl", payload.imageFile);
    }
    
    // Append TraineeIds
    payload.TraineeIds?.forEach((id) =>
        formData.append("TraineeIds", id)
    );

    payload.DepartmentIds?.forEach((id) =>
      formData.append("DepartmentIds", id.toString())
    );
    payload.PositionIds?.forEach((id) =>
      formData.append("PositionIds", id.toString())
    );

    return formData;
  }

  async createCourse(payload: CreateCourseRequest): Promise<CourseApiResponse> {
    const formData = this.buildFormDataFromPayload(payload);
    const token = getApiToken();

    const response = await fetch(
      `${API_CONFIG.baseURL}${API_CONFIG.endpoints.courses.create}`,
      {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      }
    );

    const data = await response.json();
    if (!response.ok) {
      const errorMessage =
        data.detail ||
        data.title ||
        (data.errors ? JSON.stringify(data.errors) : "Failed to create course");
      throw new Error(errorMessage);
    }

    // API returns a wrapper with success and data properties
    if (data.success && data.data) {
      return data.data;
    }

    // Fallback if the response is the course object directly
    return data;
  }

  async updateCourse(
    courseId: string,
    payload: UpdateCourseRequest
  ): Promise<CourseApiResponse> {
    const formData = this.buildFormDataFromPayload(payload);
    const token = getApiToken();

    const response = await fetch(
      `${API_CONFIG.baseURL}${API_CONFIG.endpoints.courses.update(courseId)}`,
      {
        method: "PUT",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || data.title || "Failed to update course");
    }

    if (data.success && data.data?.id) {
      return await this.getCourseById(data.data.id);
    } else if (data.data) {
      return data.data;
    }

    return await this.getCourseById(courseId);
  }

  async softDeleteCourses(courseIds: string[]): Promise<void> {
    if (courseIds.length === 0) {
      return;
    }

    await this.delete(API_CONFIG.endpoints.courses.softDelete, courseIds);
  }
}

export const coursesService = new CoursesService();
export default coursesService;
