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

    if (params.Page) backendParams.Page = params.Page;
    if (params.Limit) backendParams.Limit = params.Limit;
    if (params.SortField) backendParams.SortField = params.SortField;
    if (params.SortType) backendParams.SortType = params.SortType;
    if (params.keyword) backendParams.keyword = params.keyword;
    if (params.statusIds) backendParams.statusIds = params.statusIds;
    if (params.departmentIds)
      backendParams.departmentIds = params.departmentIds;
    if (params.eLevelIds) backendParams.eLevelIds = params.eLevelIds;
    if (params.publicOnly) backendParams.publicOnly = params.publicOnly;

    return this.get<PaginatedResponse<CourseApiResponse>>(this.endpoint, {
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

  async softDeleteCourses(ids: string[]): Promise<void> {
    await this.delete<void>(API_CONFIG.endpoints.courses.softDelete, ids);
  }

  async getEnrolledCourses(): Promise<PaginatedResponse<UserEnrollCourseDto>> {
    return this.get<PaginatedResponse<UserEnrollCourseDto>>(
      API_CONFIG.endpoints.courses.getEnrolled
    );
  }

  async enrollCourse(courseId: string): Promise<any> {
    return this.post<any>(API_CONFIG.endpoints.courses.enroll(courseId));
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

  async getCompletedCourses(): Promise<PaginatedResponse<CompletedCourseDto>> {
    return this.get<PaginatedResponse<CompletedCourseDto>>(
      API_CONFIG.endpoints.courses.completedEnrollCourses
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
