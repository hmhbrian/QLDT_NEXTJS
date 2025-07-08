import { BaseService } from "@/lib/core";
import { API_CONFIG } from "@/lib/config";
import type {
  ApiTest,
  CreateTestPayload,
  UpdateTestPayload,
} from "@/lib/types/course.types";

class TestsService extends BaseService<ApiTest, CreateTestPayload, any> {
  constructor() {
    super(API_CONFIG.endpoints.courses.base); // Base endpoint for context
  }

  async getTests(courseId: string): Promise<ApiTest[]> {
    const endpoint = `${this.endpoint}/${courseId}/tests`;
    try {
      const response = await this.get<ApiTest[]>(endpoint);
      return response || [];
    } catch (error: any) {
      // Gracefully handle 404 as an empty array, not a critical error.
      if (error?.message?.includes("Không tìm thấy bài kiểm tra")) {
        return [];
      }
      // For all other errors, re-throw them to be handled by the query's error state.
      this.handleError("GET", endpoint, error);
    }
  }

  async getTestById(courseId: string, testId: number): Promise<ApiTest> {
    const endpoint = `${this.endpoint}/${courseId}/tests/${testId}`;
    return this.get<ApiTest>(endpoint);
  }

  async createTest(
    courseId: string,
    payload: CreateTestPayload
  ): Promise<ApiTest> {
    const endpoint = `${this.endpoint}/${courseId}/tests/create`;
    return this.post<ApiTest>(endpoint, payload);
  }

  async updateTest(
    courseId: string,
    testId: number,
    payload: UpdateTestPayload
  ): Promise<any> {
    const endpoint = `${this.endpoint}/${courseId}/tests/update/${testId}`;
    return this.put<any>(endpoint, payload);
  }

  async deleteTest(courseId: string, testId: number): Promise<void> {
    const endpoint = `${this.endpoint}/${courseId}/tests/delete/${testId}`;
    await this.delete<void>(endpoint);
  }
}

export const testsService = new TestsService();
