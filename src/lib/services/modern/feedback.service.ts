
import { BaseService } from "@/lib/core";
import { API_CONFIG } from "@/lib/config";
import type { Feedback, CreateFeedbackPayload } from "@/lib/types/course.types";

class FeedbackService extends BaseService {
  constructor() {
    super(API_CONFIG.endpoints.feedback.base("")); // Base endpoint is dynamic
  }

  async getFeedbacks(courseId: string): Promise<Feedback[]> {
    const endpoint = API_CONFIG.endpoints.feedback.base(courseId);
    try {
      // The actual data is in the 'data' property of the response
      const response = await this.get<Feedback[]>(endpoint);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error(`Failed to fetch feedbacks for course ${courseId}:`, error);
      return []; // Return empty array on error
    }
  }

  async createFeedback(
    courseId: string,
    payload: CreateFeedbackPayload
  ): Promise<void> {
    const endpoint = API_CONFIG.endpoints.feedback.create(courseId);
    await this.post<void>(endpoint, payload);
  }
}

export const feedbackService = new FeedbackService();

    