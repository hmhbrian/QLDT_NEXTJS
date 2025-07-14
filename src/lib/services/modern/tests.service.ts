
"use client";

import { BaseService } from "@/lib/core";
import { API_CONFIG } from "@/lib/config";
import type {
  ApiTest,
  CreateTestPayload,
  UpdateTestPayload,
} from "@/lib/types/course.types";
import { mapApiTestToUiTest } from "@/lib/mappers/test.mapper";
import { useError } from "@/hooks/use-error";

class TestsService extends BaseService<ApiTest, CreateTestPayload, any> {
  constructor() {
    super(API_CONFIG.endpoints.courses.base); 
  }

  async getTests(courseId: string): Promise<ApiTest[]> {
    const endpoint = API_CONFIG.endpoints.tests.base(courseId);
    try {
      const response = await this.get<ApiTest[]>(endpoint);
      return response || [];
    } catch (error: any) {
      if (
        error.message &&
        (error.message.includes("403") ||
          error.message.includes("404") ||
          error.message.includes("không tồn tại") ||
          error.message.includes("not found"))
      ) {
        console.warn(`[TestsService] Access denied or not found for course ${courseId}. Returning empty array. Status: ${error?.response?.status}`);
        return [];
      }
      this.handleError("GET", endpoint, error);
    }
  }

  async getTestById(courseId: string, testId: number): Promise<ApiTest> {
    const endpoint = API_CONFIG.endpoints.tests.getById(courseId, testId);
    return this.get<ApiTest>(endpoint);
  }

  async createTest(
    courseId: string,
    payload: CreateTestPayload
  ): Promise<ApiTest> {
    const endpoint = API_CONFIG.endpoints.tests.create(courseId);
    return this.post<ApiTest>(endpoint, payload);
  }

  async updateTest(
    courseId: string,
    testId: number,
    payload: UpdateTestPayload
  ): Promise<any> {
    const endpoint = API_CONFIG.endpoints.tests.update(courseId, testId);
    return this.put<any>(endpoint, payload);
  }

  async deleteTest(courseId: string, testId: number): Promise<void> {
    const endpoint = API_CONFIG.endpoints.tests.delete(courseId, testId);
    await this.delete<void>(endpoint);
  }
}

export const testsService = new TestsService();
