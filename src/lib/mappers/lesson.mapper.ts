
import type {
  Lesson,
  CreateLessonPayload,
  ApiLesson,
  LessonContentType,
} from "@/lib/types/course.types";
import { API_CONFIG } from "../config";

export function mapApiLessonToUi(apiLesson: ApiLesson): Lesson {
  let contentType: LessonContentType = "text"; 
  let finalFileUrl = apiLesson.fileUrl || null;
  const finalLink = apiLesson.link || null;

  if (finalLink && (finalLink.includes("youtube.com") || finalLink.includes("youtu.be"))) {
      contentType = "video_url";
  } else if (finalFileUrl || (finalLink && finalLink.toLowerCase().endsWith('.pdf'))) {
      contentType = "pdf_url";
      if(!finalFileUrl && finalLink) finalFileUrl = finalLink; // Case where PDF link is in link field
  } else if (finalLink) {
      contentType = "external_link";
  }
  
  if (finalFileUrl && !finalFileUrl.startsWith("http") && !finalFileUrl.startsWith("data:")) {
    const baseUrl = API_CONFIG.baseURL.replace("/api", "");
    finalFileUrl = `${baseUrl}${finalFileUrl.startsWith("/") ? "" : "/"}${finalFileUrl}`;
  }

  return {
    id: apiLesson.id,
    title: apiLesson.title,
    type: contentType,
    content: finalFileUrl || finalLink, 
    fileUrl: finalFileUrl,
    link: finalLink,
    duration: apiLesson.totalDurationSeconds
      ? `${Math.round(apiLesson.totalDurationSeconds / 60)} phút`
      : undefined,
    totalDurationSeconds: apiLesson.totalDurationSeconds
  };
}
