"use client";

import { BaseService } from "@/lib/core";
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
import type { PaginatedResponse, QueryParams } from "@/lib/core";

export class CoursesService extends BaseService<
  CourseApiResponse,
  CreateCourseRequest,
  UpdateCourseRequest
> {
  constructor() {
    super(API_CONFIG.endpoints.courses.base);
  }

  async getCourses(
    params: QueryParams = {}
  ): Promise<PaginatedResponse<CourseApiResponse>> {
    const backendParams: Record<string, any> = {};
    if (params.SortField) backendParams.SortField = params.SortField;
    if (params.SortType) backendParams.SortType = params.SortType;
    if (params.keyword) backendParams.Keyword = params.keyword;
    if (params.statusIds) backendParams.StatusIds = params.statusIds;
    if (params.departmentIds) {
      backendParams.DepartmentIds = params.departmentIds; // Use correct parameter name with capital D
    }
    if (params.eLevelIds) backendParams.ELevelIds = params.eLevelIds;
    if (params.categoryIds) backendParams.CategoryIds = params.categoryIds;
    if (params.publicOnly) backendParams.publicOnly = params.publicOnly;

    // Add enrollment type filter mapping
    if (params.enrollmentType === "optional") {
      backendParams.Optional = "Tùy chọn";
    } else if (params.enrollmentType === "mandatory") {
      backendParams.Optional = "Bắt buộc";
    }

    // Add expired/open course filters
    if (params.onlyOpen) backendParams.onlyOpen = params.onlyOpen;
    if (params.onlyExpired) backendParams.onlyExpired = params.onlyExpired;

    // Determine which endpoint to use based on publicOnly flag and filters
    let endpoint;
    if (params.publicOnly) {
      // For public users (students), always use public search endpoint
      endpoint = API_CONFIG.endpoints.courses.searchPublic;
      console.log(
        "🚀 [CoursesService] Using public search endpoint:",
        endpoint
      );
    } else {
      // For admin/HR users, use search endpoint if there are filters, otherwise base endpoint
      const hasFilters = !!(
        params.keyword ||
        params.statusIds ||
        params.departmentIds ||
        params.eLevelIds ||
        params.categoryIds ||
        params.enrollmentType ||
        params.onlyOpen ||
        params.onlyExpired
      );

      endpoint = hasFilters
        ? API_CONFIG.endpoints.courses.search
        : API_CONFIG.endpoints.courses.base;
      console.log(
        "🚀 [CoursesService] Using admin endpoint:",
        endpoint,
        "hasFilters:",
        hasFilters
      );
    }

    console.log("📊 [CoursesService] Request params:", backendParams);

    // Only pass Page/Limit to base endpoint. For /search, backend paginates internally and
    // passing Page/Limit can cause empty pages when client navigates.
    // if (!hasFilters) {
    if (params.Page) backendParams.Page = params.Page;
    if (params.Limit) backendParams.Limit = params.Limit;
    // }

    return this.get<PaginatedResponse<CourseApiResponse>>(endpoint, {
      params: backendParams,
    });
  }

  async getCourseById(id: string): Promise<CourseApiResponse> {
    return this.get<CourseApiResponse>(
      API_CONFIG.endpoints.courses.getById(id)
    );
  }

  async createCourse(payload: CreateCourseRequest): Promise<CourseApiResponse> {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((item) => formData.append(key, item.toString()));
        } else {
          formData.append(key, value as string | Blob);
        }
      }
    });

    return this.post<CourseApiResponse>(
      API_CONFIG.endpoints.courses.create,
      formData
    );
  }

  async updateCourse(
    id: string,
    payload: UpdateCourseRequest
  ): Promise<CourseApiResponse> {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((item) => formData.append(key, item.toString()));
        } else {
          formData.append(key, value as string | Blob);
        }
      }
    });
    return this.put<CourseApiResponse>(
      API_CONFIG.endpoints.courses.update(id),
      formData
    );
  }

  async softDeleteCourse(id: string): Promise<void> {
    // Backend expects DELETE /Courses/soft-delete?id={id}
    await this.delete<void>(
      `${API_CONFIG.endpoints.courses.softDelete}?id=${encodeURIComponent(id)}`
    );
  }

  async getEnrolledCourses(
    params: QueryParams = {}
  ): Promise<PaginatedResponse<UserEnrollCourseDto>> {
    const backendParams: Record<string, any> = {};
    if (params.Page) backendParams.Page = params.Page;
    if (params.Limit) backendParams.Limit = params.Limit;
    return this.get<PaginatedResponse<UserEnrollCourseDto>>(
      API_CONFIG.endpoints.courses.getEnrolled,
      { params: backendParams }
    );
  }

  async enrollCourse(courseId: string): Promise<any> {
    return this.post<any>(API_CONFIG.endpoints.courses.enroll(courseId));
  }

  async cancelEnrollCourse(courseId: string): Promise<any> {
    return this.post<any>(API_CONFIG.endpoints.courses.cancelEnroll(courseId));
  }

  async getUpcomingCourses(): Promise<CourseApiResponse[]> {
    return this.get<CourseApiResponse[]>(
      API_CONFIG.endpoints.courses.upcomingCourses
    );
  }

  async getCourseProgressList(
    courseId: string,
    params?: QueryParams
  ): Promise<PaginatedResponse<UserCourseProgressDto>> {
    return this.get<PaginatedResponse<UserCourseProgressDto>>(
      API_CONFIG.endpoints.courses.progressList(courseId),
      { params }
    );
  }

  async getCourseProgressDetail(
    courseId: string,
    userId: string
  ): Promise<UserCourseProgressDetailDto> {
    return this.get<UserCourseProgressDetailDto>(
      API_CONFIG.endpoints.courses.progressDetail(courseId, userId)
    );
  }

  async getCompletedCourses(
    params: QueryParams = {}
  ): Promise<PaginatedResponse<CompletedCourseDto>> {
    const backendParams: Record<string, any> = {};
    if (params.Page) backendParams.Page = params.Page;
    if (params.Limit) backendParams.Limit = params.Limit;
    return this.get<PaginatedResponse<CompletedCourseDto>>(
      API_CONFIG.endpoints.courses.completedEnrollCourses,
      { params: backendParams }
    );
  }

  async getCompletedCoursesCount(): Promise<number> {
    return this.get<number>(API_CONFIG.endpoints.courses.completedCount);
  }

  async getCompletedLessonsCountByCourseId(courseId: string): Promise<number> {
    const endpoint =
      API_CONFIG.endpoints.courses.countCompletedLessons(courseId);
    return this.get<number>(endpoint);
  }
}

export const coursesService = new CoursesService();
export default coursesService;
