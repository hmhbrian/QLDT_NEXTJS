
import type {
  Course,
  CourseApiResponse,
  CreateCourseRequest,
  UpdateCourseRequest,
} from "@/lib/types/course.types";
import { getStatusNameFromId } from "../helpers";
import { API_CONFIG } from "../config";

/**
 * Transforms a raw API course object into a standardized UI-friendly Course object.
 * @param apiCourse - The course object from the API response.
 * @returns A standardized `Course` object for the UI.
 */
export function mapCourseApiToUi(apiCourse: CourseApiResponse): Course {
  const defaultImageUrl = `https://placehold.co/600x400/f97316/white?text=${encodeURIComponent(
    apiCourse.name || "Course"
  )}`;
  let imageUrl = apiCourse.thumbUrl || defaultImageUrl;

  // Handle invalid image URL string from API
  if (imageUrl && imageUrl.toLowerCase().includes("formfile")) {
    imageUrl = defaultImageUrl;
  } else if (
    imageUrl &&
    !imageUrl.startsWith("http") &&
    !imageUrl.startsWith("data:")
  ) {
    const baseUrl = API_CONFIG.baseURL.replace("/api", "");
    imageUrl = `${baseUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
  }

  return {
    id: apiCourse.id,
    title: apiCourse.name || "N/A",
    courseCode: apiCourse.code,
    description: apiCourse.description || "",
    objectives: apiCourse.objectives || "",
    image: imageUrl,
    location: apiCourse.location || "",
    status: apiCourse.status?.name || getStatusNameFromId(apiCourse.statusId) || "N/A",
    statusId: apiCourse.statusId,
    enrollmentType: apiCourse.optional === "Bắt buộc" ? "mandatory" : "optional",
    isPublic: apiCourse.optional !== "Bắt buộc",
    instructor: "N/A", // This field is missing from the API response
    duration: {
      sessions: apiCourse.sessions || 0,
      hoursPerSession: apiCourse.hoursPerSessions || 0,
    },
    learningType: apiCourse.format === "offline" ? "offline" : "online",
    maxParticipants: apiCourse.maxParticipant,
    startDate: apiCourse.startDate || null,
    endDate: apiCourse.endDate || null,
    registrationStartDate: apiCourse.registrationStartDate,
    registrationDeadline: apiCourse.registrationClosingDate,
    department: (apiCourse.departments || []).map((d) =>
      String(d.departmentId)
    ),
    level: (apiCourse.positions || []).map((p) => String(p.positionId)),
    category: "programming", // Default category
    materials: [], // Default empty array
    createdAt: apiCourse.createdAt || new Date().toISOString(),
    modifiedAt: apiCourse.modifiedAt || new Date().toISOString(),
    createdBy: "API",
    modifiedBy: "API",
  };
}

/**
 * Transforms a frontend Course object into a payload for the 'create' API endpoint.
 * @param course - The frontend course object.
 * @returns A `CreateCourseRequest` object.
 */
export function mapCourseUiToCreatePayload(
  course: Partial<Course>
): CreateCourseRequest {
  return {
    Code: course.courseCode || "",
    Name: course.title || "",
    Description: course.description || "",
    Objectives: course.objectives || "",
    Format: course.learningType || "online",
    Sessions: course.duration?.sessions,
    HoursPerSessions: course.duration?.hoursPerSession,
    Optional: course.enrollmentType === "mandatory" ? "Bắt buộc" : "Tùy chọn",
    MaxParticipant: course.maxParticipants,
    StartDate: course.startDate
      ? new Date(course.startDate).toISOString()
      : undefined,
    EndDate: course.endDate ? new Date(course.endDate).toISOString() : undefined,
    RegistrationStartDate: course.registrationStartDate
      ? new Date(course.registrationStartDate).toISOString()
      : undefined,
    RegistrationClosingDate: course.registrationDeadline
      ? new Date(course.registrationDeadline).toISOString()
      : undefined,
    Location: course.location,
    StatusId: course.statusId,
    DepartmentIds: course.department
      ?.map((id) => parseInt(id, 10))
      .filter((id) => !isNaN(id)),
    PositionIds: course.level
      ?.map((id) => parseInt(id, 10))
      .filter((id) => !isNaN(id)),
    imageFile: course.imageFile,
  };
}

/**
 * Transforms a complete frontend Course object into a payload for the 'update' API endpoint.
 * @param course - The complete frontend course object.
 * @returns An `UpdateCourseRequest` object.
 */
export function mapCourseUiToUpdatePayload(
  course: Course
): UpdateCourseRequest {
  const payload: UpdateCourseRequest = {
    Code: course.courseCode,
    Name: course.title,
    Description: course.description,
    Objectives: course.objectives,
    Format: course.learningType,
    Sessions: course.duration.sessions,
    HoursPerSessions: course.duration.hoursPerSession,
    Optional: course.enrollmentType === "mandatory" ? "Bắt buộc" : "Tùy chọn",
    MaxParticipant: course.maxParticipants,
    StartDate: course.startDate
      ? new Date(course.startDate).toISOString()
      : undefined,
    EndDate: course.endDate ? new Date(course.endDate).toISOString() : undefined,
    RegistrationStartDate: course.registrationStartDate
      ? new Date(course.registrationStartDate).toISOString()
      : undefined,
    RegistrationClosingDate: course.registrationDeadline
      ? new Date(course.registrationDeadline).toISOString()
      : undefined,
    Location: course.location,
    StatusId: course.statusId,
    DepartmentIds: course.department
      .map((id) => parseInt(id, 10))
      .filter((id) => !isNaN(id)),
    PositionIds: course.level
      .map((id) => parseInt(id, 10))
      .filter((id) => !isNaN(id)),
    imageFile: course.imageFile,
  };

  return payload;
}
