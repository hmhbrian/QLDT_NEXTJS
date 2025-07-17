"use client";

import { BaseService } from "@/lib/core";
import { API_CONFIG } from "@/lib/config";
import type {
  ApiTest,
  CreateTestPayload,
  UpdateTestPayload,
  SelectedAnswer,
  TestSubmissionResponse,
  TestSession,
  DetailedTestResult,
} from "@/lib/types/course.types";

class TestsService extends BaseService<ApiTest, CreateTestPayload, any> {
  constructor() {
    super(""); // Không cần base endpoint vì sẽ build đầy đủ trong từng method
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
        console.warn(
          `[TestsService] Access denied or not found for course ${courseId}. Returning empty array. Status: ${error?.response?.status}`
        );
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

  /**
   * Submit test với các câu trả lời đã chọn
   * @param courseId ID của khóa học
   * @param testId ID của test
   * @param answers Mảng các câu trả lời đã chọn
   * @param startedAt Thời điểm bắt đầu làm bài
   * @returns Promise với kết quả submit test
   */
  async submitTest(
    courseId: string,
    testId: number,
    answers: SelectedAnswer[],
    startedAt: string
  ): Promise<TestSubmissionResponse> {
    // Sử dụng endpoint từ API_CONFIG
    const baseEndpoint = API_CONFIG.endpoints.tests.submit(courseId, testId);
    const endpoint = `${baseEndpoint}?StartedAt=${encodeURIComponent(
      startedAt
    )}`;

    try {
      console.log("🚀 Submitting test:", {
        courseId,
        testId,
        answers,
        startedAt,
        endpoint,
      });

      const response = await this.post<TestSubmissionResponse>(
        endpoint,
        answers // Body chỉ chứa mảng answers theo API spec
      );

      console.log("✅ Test submitted successfully:", response);
      return response;
    } catch (error) {
      console.error("❌ Error submitting test:", error);
      this.handleError("POST", endpoint, error);
      throw error; // Re-throw để hook có thể catch
    }
  }

  /**
   * Bắt đầu làm bài test
   * @param courseId ID của khóa học
   * @param testId ID của test
   * @returns Promise với thông tin session test
   */
  async startTest(courseId: string, testId: number): Promise<TestSession> {
    const endpoint = API_CONFIG.endpoints.tests.start(courseId, testId);
    try {
      const response = await this.post<TestSession>(endpoint);
      return response;
    } catch (error) {
      console.error("Error starting test:", error);
      this.handleError("POST", endpoint, error);
    }
  }

  /**
   * Lấy kết quả test đã submit
   * @param courseId ID của khóa học
   * @param testId ID của test
   * @param submissionId ID của submission
   * @returns Promise với kết quả chi tiết test
   */
  async getTestResult(
    courseId: string,
    testId: number,
    submissionId: number
  ): Promise<DetailedTestResult> {
    const endpoint = API_CONFIG.endpoints.tests.result(
      courseId,
      testId,
      submissionId
    );
    try {
      const response = await this.get<DetailedTestResult>(endpoint);
      return response;
    } catch (error) {
      console.error("Error fetching test result:", error);
      this.handleError("GET", endpoint, error);
    }
  }

  /**
   * Lấy lịch sử test submissions của user
   * @param courseId ID của khóa học
   * @param testId ID của test
   * @returns Promise với lịch sử submissions
   */
  async getTestSubmissions(
    courseId: string,
    testId: number
  ): Promise<TestSubmissionResponse[]> {
    const endpoint = API_CONFIG.endpoints.tests.submissions(courseId, testId);
    try {
      const response = await this.get<TestSubmissionResponse[]>(endpoint);
      return response || [];
    } catch (error) {
      console.error("Error fetching test submissions:", error);
      this.handleError("GET", endpoint, error);
    }
  }
}

export const testsService = new TestsService();
