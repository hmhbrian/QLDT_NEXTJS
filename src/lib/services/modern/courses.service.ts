"use client";

import { BaseService, PaginatedResponse, QueryParams } from "@/lib/core";
import {
  CourseApiResponse,
  CreateCourseRequest,
  UpdateCourseRequest,
  UserEnrollCourseDto,
  CompletedCourseDto,
  UserCourseProgressDto,
  UserCourseProgressDetailDto,
} from "@/lib/types/course.types";
import { API_CONFIG } from "@/lib/config";

export class CoursesService extends BaseService<
  CourseApiResponse,
  CreateCourseRequest,
  UpdateCourseRequest
> {
  constructor() {
    super(API_CONFIG.endpoints.courses.base);
  }

  async getCourses(
    params?: QueryParams
  ): Promise<PaginatedResponse<CourseApiResponse>> {
    // Luôn sử dụng endpoint search nếu có bất kỳ tham số nào ngoài phân trang và sắp xếp
    const hasSearchParams =
      params &&
      Object.keys(params).some(
        (key) =>
          !["Page", "Limit", "SortField", "SortType"].includes(key) &&
          params[key]
      );

    const endpoint = hasSearchParams
      ? API_CONFIG.endpoints.courses.search
      : this.endpoint;

    // Chuyển đổi tên tham số để khớp với backend
    const backendParams: Record<string, any> = {};
    if (params) {
      if (params.Page) backendParams.Page = params.Page;
      if (params.Limit) backendParams.Limit = params.Limit;
      if (params.SortField) backendParams.SortField = params.SortField;
      if (params.SortType) backendParams.SortType = params.SortType;
      if (params.keyword) backendParams.Keyword = params.keyword;
      if (params.statusIds) backendParams.StatusIds = params.statusIds;
      if (params.departmentIds)
        backendParams.DepartmentIds = params.departmentIds;
      if (params.positionIds) backendParams.PositionIds = params.positionIds;
      if (params.publicOnly) backendParams.IsPublic = params.publicOnly;
    }

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
        itemsPerPage: (params?.Limit as number) || 10,
        currentPage: (params?.Page as number) || 1,
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

  async getEnrolledCourses(): Promise<PaginatedResponse<UserEnrollCourseDto>> {
    const response = await this.get<PaginatedResponse<UserEnrollCourseDto>>(
      API_CONFIG.endpoints.courses.getEnrolled
    );
    return (
      response ?? {
        items: [],
        pagination: {
          totalItems: 0,
          itemsPerPage: 10,
          currentPage: 1,
          totalPages: 0,
        },
      }
    );
  }

  async getCompletedCoursesCount(): Promise<number> {
    console.log(
      "🔥 Calling getCompletedCoursesCount endpoint:",
      API_CONFIG.endpoints.courses.completedCount
    );

    const response = await this.get<number>(
      API_CONFIG.endpoints.courses.completedCount
    );

    console.log(
      "🔥 Raw Count API response from BaseService (already extracted):",
      response
    );

    return response || 0;
  }

  async getCompletedCourses(): Promise<PaginatedResponse<CompletedCourseDto>> {
    console.log(
      "🔥 Calling getCompletedCourses endpoint:",
      API_CONFIG.endpoints.courses.completedEnrollCourses
    );

    const response = await this.get<PaginatedResponse<CompletedCourseDto>>(
      API_CONFIG.endpoints.courses.completedEnrollCourses
    );

    return (
      response || {
        items: [],
        pagination: {
          totalItems: 0,
          itemsPerPage: 24,
          currentPage: 1,
          totalPages: 0,
        },
      }
    );
  }

  async getUpcomingCourses(): Promise<CourseApiResponse[]> {
    console.log(
      "🔥 Calling getUpcomingCourses endpoint:",
      API_CONFIG.endpoints.courses.upcomingCourses
    );

    const response = await this.get<CourseApiResponse[]>(
      API_CONFIG.endpoints.courses.upcomingCourses
    );

    console.log(
      "🔥 Raw Upcoming Courses API response from BaseService:",
      response
    );

    return response || [];
  }

  async getCourseProgressList(
    courseId: string,
    params?: QueryParams
  ): Promise<PaginatedResponse<UserCourseProgressDto>> {
    console.log(
      "🔥 Calling getCourseProgressList endpoint:",
      API_CONFIG.endpoints.courses.progressList(courseId)
    );

    const response = await this.get<PaginatedResponse<UserCourseProgressDto>>(
      API_CONFIG.endpoints.courses.progressList(courseId),
      {
        params: params,
      }
    );

    console.log(
      "🔥 Raw Course Progress List API response from BaseService:",
      response
    );

    return (
      response || {
        items: [],
        pagination: {
          totalItems: 0,
          itemsPerPage: 24,
          currentPage: 1,
          totalPages: 0,
        },
      }
    );
  }

  async getCourseProgressDetail(
    courseId: string,
    userId: string
  ): Promise<UserCourseProgressDetailDto> {
    console.log(
      "🔥 Calling getCourseProgressDetail endpoint:",
      API_CONFIG.endpoints.courses.progressDetail(courseId, userId)
    );

    const response = await this.get<UserCourseProgressDetailDto>(
      API_CONFIG.endpoints.courses.progressDetail(courseId, userId)
    );

    console.log(
      "🔥 Raw Course Progress Detail API response from BaseService:",
      response
    );

    return response;
  }

  async enrollCourse(courseId: string): Promise<any> {
    return this.post<any>(API_CONFIG.endpoints.courses.enroll(courseId));
  }

  private buildFormDataFromPayload(
    payload: CreateCourseRequest | UpdateCourseRequest
  ): FormData {
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      if (key === "ThumbUrl" && value instanceof File) {
        formData.append("ThumbUrl", value);
      } else if (Array.isArray(value)) {
        value.forEach((item) => formData.append(key, String(item)));
      } else {
        formData.append(key, String(value));
      }
    });

    return formData;
  }

  async createCourse(payload: CreateCourseRequest): Promise<CourseApiResponse> {
    const formData = this.buildFormDataFromPayload(payload);
    return this.post<CourseApiResponse>(
      API_CONFIG.endpoints.courses.create,
      formData
    );
  }

  async updateCourse(
    courseId: string,
    payload: UpdateCourseRequest
  ): Promise<CourseApiResponse> {
    const formData = this.buildFormDataFromPayload(payload);
    return this.put<CourseApiResponse>(
      API_CONFIG.endpoints.courses.update(courseId),
      formData
    );
  }

  async softDeleteCourses(courseIds: string[]): Promise<void> {
    if (courseIds.length === 0) {
      return;
    }
    // Xóa từng khóa học một vì API chỉ nhận 1 id
    for (const courseId of courseIds) {
      await this.delete(
        `${API_CONFIG.endpoints.courses.softDelete}?id=${courseId}`
      );
    }
  }

  async getCompletedLessonsCountByCourseId(courseId: string): Promise<number> {
    console.log(
      "🔥 Calling getCompletedLessonsCountByCourseId endpoint:",
      API_CONFIG.endpoints.courses.countCompletedLessons(courseId)
    );
    const response = await this.get<number>(
      API_CONFIG.endpoints.courses.countCompletedLessons(courseId)
    );
    return response || 0;
  }
}

export const coursesService = new CoursesService();
export default coursesService;
