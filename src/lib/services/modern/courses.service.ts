
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
import { getApiToken } from "@/lib/utils/form.utils";

export class CoursesService extends BaseService<
  CourseApiResponse,
  CreateCourseRequest,
  UpdateCourseRequest
> {
  constructor() {
    super(API_CONFIG.endpoints.courses.base);
  }

  async getCourses(params?: QueryParams): Promise<CourseApiResponse[]> {
    if (params?.search) {
      const searchResult = await this.searchCourses({
        keyword: params.search as string,
        ...params,
      });
      return Array.isArray(searchResult) ? searchResult : [];
    }

    const response = await this.get<PaginatedResponse<CourseApiResponse>>(
      API_CONFIG.endpoints.courses.getAll, { params }
    );
    return response.items || [];
  }

  async getCourseById(id: string): Promise<CourseApiResponse> {
    const response = await this.get<CourseApiResponse>(
      API_CONFIG.endpoints.courses.getById(id)
    );
    return response;
  }

  private buildFormDataFromPayload(payload: CreateCourseRequest | UpdateCourseRequest): FormData {
    const formData = new FormData();
    // Use PascalCase for backend compatibility
    formData.append("Code", payload.Code || "");
    formData.append("Name", payload.Name || "");
    formData.append("Description", payload.Description || "");
    formData.append("Objectives", payload.Objectives || "");
    formData.append("Sessions", (payload.Sessions || 0).toString());
    formData.append("HoursPerSessions", (payload.HoursPerSessions || 0).toString());
    formData.append("MaxParticipant", (payload.MaxParticipant || 0).toString());
    formData.append("Location", payload.Location || "");
    formData.append("StatusId", (payload.StatusId || 1).toString());

    if (payload.StartDate) formData.append("StartDate", payload.StartDate);
    if (payload.EndDate) formData.append("EndDate", payload.EndDate);
    if (payload.RegistrationStartDate) formData.append("RegistrationStartDate", payload.RegistrationStartDate);
    if (payload.RegistrationClosingDate) formData.append("RegistrationClosingDate", payload.RegistrationClosingDate);
    
    if (payload.imageFile) {
        formData.append("ThumbUrlFile", payload.imageFile);
    }
    
    payload.DepartmentIds?.forEach(id => formData.append("DepartmentIds", id.toString()));
    payload.PositionIds?.forEach(id => formData.append("PositionIds", id.toString()));

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
        throw new Error(data.title || 'Failed to create course');
    }

    if (data.success && data.data?.id) {
        return await this.getCourseById(data.data.id);
    } else if(data.data) {
        return data.data;
    }
    throw new Error(data.message || 'Unknown error occurred during course creation');
  }

  async updateCourse(courseId: string, payload: UpdateCourseRequest): Promise<CourseApiResponse> {
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
        throw new Error(data.title || 'Failed to update course');
    }

    if (data.success && data.data?.id) {
        return await this.getCourseById(data.data.id);
    } else if(data.data) {
        return data.data;
    }
    
    return await this.getCourseById(courseId);
}

  async searchCourses(
    params: CourseSearchParams
  ): Promise<CourseApiResponse[]> {
    const response = await this.get<PaginatedResponse<CourseApiResponse>>(
        API_CONFIG.endpoints.courses.search,
        { params: params as Record<string, unknown> }
    );
    return response.items || [];
  }

  async softDeleteCourses(courseIds: string[]): Promise<void> {
    const payload: SoftDeleteCoursesRequest = { ids: courseIds };
    // The base service's `delete` method does not support a body.
    // Use `post` or adjust `delete` in `BaseService` if needed.
    await this.post(API_CONFIG.endpoints.courses.softDelete, payload);
  }
}

export const coursesService = new CoursesService();
export default coursesService;
