import { BaseService } from "@/lib/core";
import { API_CONFIG } from "@/lib/config";
import type { CourseMaterial } from "@/lib/types/course.types";

export interface CourseAttachedFilePayload {
  title: string;
  file?: File;
  link?: string;
}

class CourseAttachedFilesService extends BaseService<CourseMaterial> {
  constructor() {
    super(API_CONFIG.endpoints.courses.base); // Endpoint base is not used directly here
  }

  async getAttachedFiles(courseId: string): Promise<CourseMaterial[]> {
    try {
      // The get method already handles extracting the `data` property from the response wrapper.
      const response = await this.get<CourseMaterial[]>(
        API_CONFIG.endpoints.courseAttachedFiles.getByCourseId(courseId)
      );
      return response || [];
    } catch (error) {
      console.error(
        `Failed to fetch attached files for course ${courseId}:`,
        error
      );
      return []; // Return empty array on error to prevent UI crash
    }
  }

  async uploadAttachedFiles(
    courseId: string,
    payload: CourseAttachedFilePayload[]
  ): Promise<any> {
    const formData = new FormData();

    payload.forEach((item, index) => {
      formData.append(`request[${index}].Title`, item.title);
      if (item.file) {
        formData.append(`request[${index}].File`, item.file);
      }
      if (item.link) {
        // Backend might expect 'Link' or 'link'
        formData.append(`request[${index}].Link`, item.link);
      }
    });

    return this.post<any>(
      API_CONFIG.endpoints.courseAttachedFiles.upload(courseId),
      formData
    );
  }

  async deleteAttachedFile({
    courseId,
    fileId,
  }: {
    courseId: string;
    fileId: number;
  }): Promise<void> {
    await this.delete<void>(
      API_CONFIG.endpoints.courseAttachedFiles.delete(courseId, fileId)
    );
  }
}

export const courseAttachedFilesService = new CourseAttachedFilesService();
