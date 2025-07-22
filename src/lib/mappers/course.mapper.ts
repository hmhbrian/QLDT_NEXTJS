import type {
  Course,
  CourseApiResponse,
  CreateCourseRequest,
  UpdateCourseRequest,
  UserEnrollCourseDto,
} from "@/lib/types/course.types";
import { API_CONFIG } from "../config";

function getAbsoluteImageUrl(
  thumbUrl: string | undefined | null,
  name?: string
): string {
  const defaultImageUrl = `https://placehold.co/600x400/f97316/white?text=${encodeURIComponent(
    name || "Course"
  )}`;

  if (!thumbUrl) return defaultImageUrl;

  if (thumbUrl.toLowerCase().includes("formfile")) {
    return defaultImageUrl;
  }

  if (thumbUrl.startsWith("http") || thumbUrl.startsWith("data:")) {
    return thumbUrl;
  }

  const baseUrl = API_CONFIG.baseURL.replace("/api", "");
  return `${baseUrl}${thumbUrl.startsWith("/") ? "" : "/"}${thumbUrl}`;
}

export function mapCourseApiToUi(apiCourse: CourseApiResponse): Course {
  const imageUrl = getAbsoluteImageUrl(apiCourse.thumbUrl, apiCourse.name);

  return {
    id: apiCourse.id,
    title: apiCourse.name || "N/A",
    courseCode: apiCourse.code || "N/A",
    description: apiCourse.description || "",
    objectives: apiCourse.objectives || "",
    image: imageUrl,
    location: apiCourse.location || "",
    status: apiCourse.status?.name || "N/A",
    statusId: apiCourse.status?.id,
    enrollmentType:
      apiCourse.optional === "Bắt buộc" ? "mandatory" : "optional",
    isPublic: apiCourse.optional !== "Bắt buộc",
    instructor: apiCourse.lecturer?.name || "N/A",
    duration: {
      sessions: apiCourse.sessions || 0,
      hoursPerSession: apiCourse.hoursPerSessions || 0,
    },
    learningType: apiCourse.format === "offline" ? "offline" : "online",
    maxParticipants: apiCourse.maxParticipant,
    startDate: apiCourse.startDate || null,
    endDate: apiCourse.endDate || null,
    registrationStartDate: apiCourse.registrationStartDate || null,
    registrationDeadline: apiCourse.registrationClosingDate || null,
    department: (apiCourse.departments || []).map((d) =>
      String(d.departmentId)
    ),
    level: (apiCourse.positions || []).map((p) => String(p.positionId)),
    userIds: (apiCourse.users || []).map((u) => u.id),
    category: apiCourse.category?.name || "Chung",
    materials: [],
    lessons: [],
    tests: [],
    createdAt: apiCourse.createdAt || new Date().toISOString(),
    modifiedAt: apiCourse.modifiedAt || new Date().toISOString(),
    createdBy: apiCourse.createdBy || "Không có",
    modifiedBy: apiCourse.updatedBy || "Không có",
  };
}

export function mapUserEnrollCourseDtoToCourse(
  dto: UserEnrollCourseDto
): Course {
  const imageUrl = getAbsoluteImageUrl(dto.thumbUrl, dto.name);
  return {
    id: dto.id,
    title: dto.name,
    courseCode: dto.code,
    description: dto.description || "",
    objectives: dto.objectives || "",
    image: imageUrl,
    location: dto.location || "",
    status: "Đang mở",
    enrollmentType: dto.optional === "Bắt buộc" ? "mandatory" : "optional",
    isPublic: dto.optional !== "Bắt buộc",
    instructor: "N/A",
    duration: {
      sessions: dto.sessions || 0,
      hoursPerSession: dto.hoursPerSessions || 0,
    },
    learningType: dto.format === "offline" ? "offline" : "online",
    maxParticipants: dto.maxParticipant,
    startDate: dto.startDate || null,
    endDate: dto.endDate || null,
    registrationStartDate: dto.registrationStartDate || null,
    registrationDeadline: dto.registrationClosingDate || null,
    department: [],
    level: [],
    category: "N/A",
    materials: [],
    lessons: [],
    tests: [],
    userIds: [],
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    createdBy: "",
    modifiedBy: "",
    progressPercentage: dto.progressPercentage
      ? Math.round(dto.progressPercentage)
      : 0,
  };
}

export function mapCourseUiToCreatePayload(
  course: Partial<Course>
): CreateCourseRequest {
  const payload: CreateCourseRequest = {
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
    EndDate: course.endDate
      ? new Date(course.endDate).toISOString()
      : undefined,
    RegistrationStartDate: course.registrationStartDate
      ? new Date(course.registrationStartDate).toISOString()
      : undefined,
    RegistrationClosingDate: course.registrationDeadline
      ? new Date(course.registrationDeadline).toISOString()
      : undefined,
    Location: course.location,
    StatusId: course.statusId,
    DepartmentIds: course.department
      ?.map((item) => {
        if (typeof item === "string") return parseInt(item, 10);
        if (typeof item === "object" && item && "id" in item)
          return parseInt(String(item.id), 10);
        return NaN;
      })
      .filter((id) => !isNaN(id)),
    PositionIds: course.level
      ?.map((item) => {
        if (typeof item === "string") return parseInt(item, 10);
        if (typeof item === "object" && item && "id" in item)
          return parseInt(String(item.id), 10);
        return NaN;
      })
      .filter((id) => !isNaN(id)),
    UserIds: course.userIds || [],
  };

  if (course.imageFile) {
    payload.ThumbUrl = course.imageFile;
  }

  return payload;
}

export function mapCourseUiToUpdatePayload(
  course: Partial<Course>
): UpdateCourseRequest {
  const payload: UpdateCourseRequest = {
    Code: course.courseCode,
    Name: course.title,
    Description: course.description,
    Objectives: course.objectives,
    Format: course.learningType,
    Sessions: course.duration?.sessions,
    HoursPerSessions: course.duration?.hoursPerSession,
    Optional: course.enrollmentType === "mandatory" ? "Bắt buộc" : "Tùy chọn",
    MaxParticipant: course.maxParticipants,
    StartDate: course.startDate
      ? new Date(course.startDate).toISOString()
      : undefined,
    EndDate: course.endDate
      ? new Date(course.endDate).toISOString()
      : undefined,
    RegistrationStartDate: course.registrationStartDate
      ? new Date(course.registrationStartDate).toISOString()
      : undefined,
    RegistrationClosingDate: course.registrationDeadline
      ? new Date(course.registrationDeadline).toISOString()
      : undefined,
    Location: course.location,
    StatusId: course.statusId,
    DepartmentIds: course.department
      ?.map((item) => {
        if (typeof item === "string") return parseInt(item, 10);
        if (typeof item === "object" && item && "id" in item)
          return parseInt(String(item.id), 10);
        return NaN;
      })
      .filter((id) => !isNaN(id)),
    PositionIds: course.level
      ?.map((item) => {
        if (typeof item === "string") return parseInt(item, 10);
        if (typeof item === "object" && item && "id" in item)
          return parseInt(String(item.id), 10);
        return NaN;
      })
      .filter((id) => !isNaN(id)),
    UserIds: course.userIds,
  };

  if (course.imageFile) {
    payload.ThumbUrl = course.imageFile;
  }

  Object.keys(payload).forEach(
    (key) => (payload as any)[key] === undefined && delete (payload as any)[key]
  );

  return payload;
}
