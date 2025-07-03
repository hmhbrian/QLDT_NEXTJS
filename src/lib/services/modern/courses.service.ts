
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

export class CoursesService extends BaseService<
  CourseApiResponse,
  CreateCourseRequest,
  UpdateCourseRequest
> {
  constructor() {
    super(API_CONFIG.endpoints.courses.base);
  }

  async getCourses(params?: CourseSearchParams): Promise<CourseApiResponse[]> {
    const filterKeys: (keyof CourseSearchParams)[] = [
      "keyword",
      "StatusIds",
      "DepartmentIds",
      "PositionIds",
    ];
    const hasFilters = filterKeys.some(
      (key) => params && params[key] && params[key] !== "all"
    );

    if (hasFilters) {
      const searchParams: Record<string, any> = { ...params };
      // Rename frontend 'keyword' to backend 'Keyword'
      if (searchParams.keyword) {
        searchParams.Keyword = searchParams.keyword;
        delete searchParams.keyword;
      }
      const response = await this.get<PaginatedResponse<CourseApiResponse>>(
        API_CONFIG.endpoints.courses.search,
        { params: searchParams }
      );
      return response.items || [];
    }

    // If no filters, call the general get all endpoint, but still pass pagination/sorting params
    const response = await this.get<PaginatedResponse<CourseApiResponse>>(
      API_CONFIG.endpoints.courses.getAll,
      { params: params as Record<string, unknown> }
    );
    return response.items || [];
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
    formData.append("Sessions", (payload.Sessions || 0).toString());
    formData.append(
      "HoursPerSessions",
      (payload.HoursPerSessions || 0).toString()
    );
    formData.append("MaxParticipant", (payload.MaxParticipant || 0).toString());
    formData.append("Location", payload.Location || "");
    formData.append("StatusId", (payload.StatusId || "").toString());

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
        data.detail || data.title ||
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

    // The API endpoint /api/Courses/soft-delete expects a single 'id' as a query parameter.
    // We will process deletions one by one. The UI currently only deletes one at a time anyway.
    const deletePromises = courseIds.map((id) => {
      // Pass the config object with `params` as the second argument.
      return this.delete(API_CONFIG.endpoints.courses.softDelete, {
        params: { id },
      });
    });

    await Promise.all(deletePromises);
  }
}

export const coursesService = new CoursesService();
export default coursesService;
