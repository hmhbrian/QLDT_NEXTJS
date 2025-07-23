
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
    super(API_CONFIG.endpoints.courses.base); 
  }

  async getLessons(courseId: string): Promise<ApiLesson[]> {
    const endpoint = API_CONFIG.endpoints.lessons.base(courseId);
    try {
      const response = await this.get<ApiLesson[]>(endpoint);
      return response || []; 
    } catch (error: any) {
      if (
        error.message &&
        (error.message.includes("404") ||
          error.message.includes("không tồn tại") ||
          error.message.includes("not found"))
      ) {
        return [];
      }
      this.handleError("GET", endpoint, error);
    }
  }

  async createLesson(
    courseId: string,
    payload: CreateLessonPayload
  ): Promise<ApiLesson> {
    const formData = new FormData();
    formData.append("Title", payload.Title);
    if (payload.FilePdf) {
      formData.append("FilePdf", payload.FilePdf);
    }
    if (payload.Link) {
      formData.append("Link", payload.Link);
    }
    if (payload.TotalDurationSeconds) {
        formData.append("TotalDurationSeconds", payload.TotalDurationSeconds.toString());
    }

    const endpoint = API_CONFIG.endpoints.lessons.create(courseId);
    return this.post<ApiLesson>(endpoint, formData);
  }

  async updateLesson(
    courseId: string,
    lessonId: number,
    payload: UpdateLessonPayload
  ): Promise<ApiLesson> {
    const formData = new FormData();
    if(payload.Title) formData.append("Title", payload.Title);
    if (payload.FilePdf) {
      formData.append("FilePdf", payload.FilePdf);
    }
    if (payload.Link) {
        formData.append("Link", payload.Link);
    }
    if (payload.TotalDurationSeconds) {
        formData.append("TotalDurationSeconds", payload.TotalDurationSeconds.toString());
    }

    const endpoint = API_CONFIG.endpoints.lessons.update(courseId, lessonId);
    return this.put<ApiLesson>(endpoint, formData);
  }

  async deleteLessons(courseId: string, lessonIds: number[]): Promise<void> {
    const endpoint = API_CONFIG.endpoints.lessons.delete(courseId);
    await this.delete<void>(endpoint, { ids: lessonIds });
  }

  async reorderLesson(
    courseId: string,
    payload: ReorderLessonPayload
  ): Promise<void> {
    const endpoint = API_CONFIG.endpoints.lessons.reorder(courseId);
    await this.put<void>(endpoint, payload);
  }
}

export const lessonsService = new LessonsService();
