import { BaseService, PaginatedResponse, QueryParams } from "@/lib/core";
import { API_CONFIG } from "@/lib/config";
import type {
  ApiQuestion,
  CreateQuestionPayload,
  UpdateQuestionPayload,
} from "@/lib/types/test.types";

class QuestionsService extends BaseService<ApiQuestion> {
  constructor() {
    // This service operates on a sub-resource of tests.
    // The base endpoint is not directly used.
    super(API_CONFIG.endpoints.courses.base);
  }

  async getQuestions(
    testId: number,
    params?: QueryParams
  ): Promise<PaginatedResponse<ApiQuestion>> {
    const endpoint = API_CONFIG.endpoints.tests.questions(testId);
    return this.get<PaginatedResponse<ApiQuestion>>(endpoint, { params });
  }

  async createQuestion(
    testId: number,
    payload: CreateQuestionPayload
  ): Promise<ApiQuestion> {
    const endpoint = API_CONFIG.endpoints.tests.questions(testId);
    // Send as array like the successful curl request
    return this.post<ApiQuestion>(endpoint, [payload]);
  }

  async createQuestions(
    testId: number,
    questions: CreateQuestionPayload[]
  ): Promise<void> {
    const endpoint = API_CONFIG.endpoints.tests.questions(testId);
    // Send array directly like the successful curl request
    await this.post<void>(endpoint, questions);
  }

  async updateQuestion(
    testId: number,
    questionId: number,
    payload: UpdateQuestionPayload
  ): Promise<ApiQuestion> {
    const endpoint = API_CONFIG.endpoints.tests.questionById(
      testId,
      questionId
    );
    return this.put<ApiQuestion>(endpoint, payload);
  }

  async deleteQuestions(testId: number, questionIds: number[]): Promise<void> {
    const endpoint = API_CONFIG.endpoints.tests.questions(testId);
    await this.delete<void>(endpoint, questionIds);
  }
}

export const questionsService = new QuestionsService();
