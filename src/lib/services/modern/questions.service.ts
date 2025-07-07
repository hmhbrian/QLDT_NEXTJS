
import { BaseService, PaginatedResponse, QueryParams } from "@/lib/core";
import { API_CONFIG } from "@/lib/config";
import type {
  ApiQuestion,
  CreateQuestionPayload,
  UpdateQuestionPayload,
} from "@/lib/types/course.types";

class QuestionsService extends BaseService<ApiQuestion> {
  constructor() {
    super(API_CONFIG.endpoints.tests.base);
  }

  async getQuestions(
    testId: number,
    params?: QueryParams
  ): Promise<PaginatedResponse<ApiQuestion>> {
    const endpoint = `${this.endpoint}/${testId}/questions`;
    return this.get<PaginatedResponse<ApiQuestion>>(endpoint, { params });
  }

  async createQuestion(
    testId: number,
    payload: CreateQuestionPayload
  ): Promise<ApiQuestion> {
    const endpoint = `${this.endpoint}/${testId}/questions`;
    return this.post<ApiQuestion>(endpoint, payload);
  }

  async updateQuestion(
    testId: number,
    questionId: number,
    payload: UpdateQuestionPayload
  ): Promise<ApiQuestion> {
    const endpoint = `${this.endpoint}/${testId}/questions/${questionId}`;
    return this.put<ApiQuestion>(endpoint, payload);
  }

  async deleteQuestion(testId: number, questionId: number): Promise<void> {
    const endpoint = `${this.endpoint}/${testId}/questions/${questionId}`;
    await this.delete<void>(endpoint);
  }

  async deleteQuestions(
    testId: number,
    questionIds: number[]
  ): Promise<void> {
    const endpoint = `${this.endpoint}/${testId}/questions`;
    // API expects the array of IDs in the request body for bulk delete
    await this.delete<void>(endpoint, questionIds);
  }
}

export const questionsService = new QuestionsService();
