import { BaseService } from "@/lib/core";
import { API_CONFIG } from "@/lib/config";
import type {
  ApiLesson,
  CreateLessonPayload,
  UpdateLessonPayload,
} from "@/lib/types/course.types";

export interface ReorderLessonPayload {
  LessonId: number;
  PreviousLessonId?: number | null;
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
    // Let BaseService handle errors and data extraction
    return this.get<ApiLesson[]>(endpoint);
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
      formData.append(
        "TotalDurationSeconds",
        payload.TotalDurationSeconds.toString()
      );
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
    if (payload.Title) formData.append("Title", payload.Title);
    if (payload.FilePdf) {
      formData.append("FilePdf", payload.FilePdf);
    }
    if (payload.Link) {
      formData.append("Link", payload.Link);
    }
    if (payload.TotalDurationSeconds) {
      formData.append(
        "TotalDurationSeconds",
        payload.TotalDurationSeconds.toString()
      );
    }

    const endpoint = API_CONFIG.endpoints.lessons.update(courseId, lessonId);
    return this.put<ApiLesson>(endpoint, formData);
  }

  async deleteLessons(courseId: string, lessonIds: number[]): Promise<void> {
    const endpoint = API_CONFIG.endpoints.lessons.delete(courseId);
    // Backend expects array directly, not wrapped in object
    await this.delete<void>(endpoint, lessonIds);
  }

  async reorderLesson(
    courseId: string,
    payload: ReorderLessonPayload
  ): Promise<void> {
    const endpoint = API_CONFIG.endpoints.lessons.reorder(courseId);

    // Backend expects multipart/form-data, not JSON
    const formData = new FormData();
    formData.append("LessonId", String(payload.LessonId));

    // Handle PreviousLessonId - append only if it has a valid value
    if (
      payload.PreviousLessonId !== null &&
      payload.PreviousLessonId !== undefined
    ) {
      formData.append("PreviousLessonId", String(payload.PreviousLessonId));
    }
    await this.put<void>(endpoint, formData);
  }
}

export const lessonsService = new LessonsService();
