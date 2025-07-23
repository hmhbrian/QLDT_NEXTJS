import { BaseService } from "@/lib/core";
import { API_CONFIG } from "@/lib/config";
import type {
  ApiLessonProgress,
  UpsertLessonProgressPayload,
} from "@/lib/types/course.types";

class LessonProgressService extends BaseService<ApiLessonProgress> {
  constructor() {
    super(API_CONFIG.endpoints.lessonProgress.base);
  }

  async getLessonProgress(courseId: string): Promise<ApiLessonProgress[]> {
    const endpoint = API_CONFIG.endpoints.lessonProgress.getProgress(courseId);
    try {
      const response = await this.get<ApiLessonProgress[]>(endpoint);
      return response || [];
    } catch (error) {
      console.error(
        `Failed to fetch lesson progress for course ${courseId}:`,
        error
      );
      return [];
    }
  }

  async upsertLessonProgress(
    payload: UpsertLessonProgressPayload
  ): Promise<void> {
    const endpoint = API_CONFIG.endpoints.lessonProgress.upsert();
    // Ensure we don't send null values if the backend doesn't expect them
    const cleanPayload = { ...payload };
    if (cleanPayload.currentPage === undefined) delete cleanPayload.currentPage;
    if (cleanPayload.currentTimeSecond === undefined)
      delete cleanPayload.currentTimeSecond;

    try {
      await this.post<void>(endpoint, cleanPayload);
    } catch (error: any) {
      // Add better error logging for debugging
      console.error("Failed to upsert lesson progress:", {
        payload: cleanPayload,
        error: error.message || error,
        status: error.status || "unknown",
      });
      throw error;
    }
  }
}

export const lessonProgressService = new LessonProgressService();
