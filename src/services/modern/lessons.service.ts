
import { BaseService } from "@/lib/core";
import { API_CONFIG } from "@/lib/config";
import type { ApiLesson, CreateLessonPayload, UpdateLessonPayload } from "@/lib/types/course.types";

class LessonsService extends BaseService<ApiLesson, CreateLessonPayload, UpdateLessonPayload> {
  constructor() {
    super(API_CONFIG.endpoints.courses.base); // Base endpoint for context, specific paths used in methods
  }

  async getLessons(courseId: string): Promise<ApiLesson[]> {
    const endpoint = `${this.endpoint}/${courseId}/lessons`;
    try {
      const response = await this.get<ApiLesson[]>(endpoint);
      return response || []; // Ensure it returns an array even if API gives null
    } catch (error: any) {
      // If the API returns 404 for "not found", treat it as an empty list, not a critical error.
      if (error?.response?.status === 404) {
        return [];
      }
      // For all other errors (e.g., 500, 401), re-throw them to be handled by the query's error state.
      this.handleError("GET", endpoint, error);
    }
  }

  async createLesson(courseId: string, payload: CreateLessonPayload): Promise<ApiLesson> {
    const formData = new FormData();
    formData.append("Title", payload.title);
    if (payload.file) {
      formData.append("FilePdf", payload.file);
    }
    
    const endpoint = `${this.endpoint}/${courseId}/lessons`;
    return this.post<ApiLesson>(endpoint, formData);
  }

  async updateLesson(courseId: string, lessonId: number, payload: UpdateLessonPayload): Promise<ApiLesson> {
    const formData = new FormData();
    formData.append("Title", payload.title);
    if (payload.file) {
      formData.append("FilePdf", payload.file);
    }
    const endpoint = `${this.endpoint}/${courseId}/lessons/${lessonId}`;
    return this.put<ApiLesson>(endpoint, formData);
  }

  async deleteLesson(courseId: string, lessonId: number): Promise<void> {
    const endpoint = `${this.endpoint}/${courseId}/lessons/${lessonId}`;
    await this.delete<void>(endpoint);
  }
}

export const lessonsService = new LessonsService();
