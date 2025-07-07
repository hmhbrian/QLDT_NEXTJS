
import { BaseService } from "@/lib/core";
import { API_CONFIG } from "@/lib/config";
import type {
  ApiLesson,
  CreateLessonPayload,
  UpdateLessonPayload,
} from "@/lib/types/course.types";

export interface ReorderLessonPayload {
  lessonId: number;
  previousLessonId?: number | null;
}

class LessonsService extends BaseService<
  ApiLesson,
  CreateLessonPayload,
  UpdateLessonPayload
> {
  constructor() {
    super(API_CONFIG.endpoints.courses.base); // Base endpoint for context, specific paths used in methods
  }

  async getLessons(courseId: string): Promise<ApiLesson[]> {
    const endpoint = `${this.endpoint}/${courseId}/lessons`;
    try {
      const response = await this.get<ApiLesson[]>(endpoint);
      return response || []; // Ensure it returns an array even if API gives null
    } catch (error: any) {
      // Gracefully handle 404 as an empty array, not a critical error.
      if (
        error.message &&
        (error.message.includes("404") ||
          error.message.includes("không tồn tại") ||
          error.message.includes("not found"))
      ) {
        return [];
      }
      // For all other errors (e.g., 500, 401), re-throw them to be handled by the query's error state.
      this.handleError("GET", endpoint, error);
    }
  }

  async createLesson(
    courseId: string,
    payload: CreateLessonPayload
  ): Promise<ApiLesson> {
    const formData = new FormData();
    formData.append("Title", payload.title);
    if (payload.file) {
      formData.append("FilePdf", payload.file);
    }

    const endpoint = `${this.endpoint}/${courseId}/lessons`;
    return this.post<ApiLesson>(endpoint, formData);
  }

  async updateLesson(
    courseId: string,
    lessonId: number,
    payload: UpdateLessonPayload
  ): Promise<ApiLesson> {
    const formData = new FormData();
    formData.append("Title", payload.title);
    if (payload.file) {
      formData.append("FilePdf", payload.file);
    }
    const endpoint = `${this.endpoint}/${courseId}/lessons/${lessonId}`;
    return this.put<ApiLesson>(endpoint, formData);
  }

  async deleteLesson(courseId: string, lessonIds: number[]): Promise<void> {
    const endpoint = `${this.endpoint}/${courseId}/lessons`;
    // Backend expects an array of IDs in the body for the DELETE request.
    await this.delete<void>(endpoint, lessonIds);
  }

  async reorderLesson(
    courseId: string,
    payload: ReorderLessonPayload
  ): Promise<void> {
    const formData = new FormData();
    formData.append("LessonId", payload.lessonId.toString());

    // Only append PreviousLessonId if it's not null.
    // Backend should handle the absence of this field as moving to the first position.
    if (payload.previousLessonId) {
      formData.append(
        "PreviousLessonId",
        payload.previousLessonId.toString()
      );
    }

    const endpoint = `${this.endpoint}/${courseId}/lessons/reorder`;
    await this.put<void>(endpoint, formData);
  }
}

export const lessonsService = new LessonsService();
