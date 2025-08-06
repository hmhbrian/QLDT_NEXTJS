
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
    title: apiCourse.name || "Không có",
    courseCode: apiCourse.code || "Không có",
    description: apiCourse.description || "",
    objectives: apiCourse.objectives || "",
    image: imageUrl,
    location: apiCourse.location || "",
    status: apiCourse.status?.name || "Không có",
    statusId: apiCourse.status?.id,
    enrollmentType:
      apiCourse.optional === "Bắt buộc" ? "mandatory" : "optional",
    isPublic: apiCourse.optional !== "Bắt buộc",
    instructor: apiCourse.lecturer?.name || "Không có",
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
    // Updated to match new Course interface
    departments:
      apiCourse.departments ||
      (apiCourse.DepartmentInfo || []).map((d) => ({
        departmentId: Number(d.departmentId),
        departmentName: d.name,
      })),
    eLevels:
      apiCourse.eLevels ||
      (apiCourse.EmployeeLevel || []).map((e) => ({
        eLevelId: Number(e.eLevelId),
        eLevelName: e.eLevelName,
      })),
    category: apiCourse.category
      ? {
          id: apiCourse.category.id,
          categoryName: apiCourse.category.name || "Không có",
        }
      : null,
    // Legacy fields for backward compatibility
    department: (apiCourse.departments || apiCourse.DepartmentInfo || []).map(
      (d) => String(d.departmentId)
    ),
    level: (apiCourse.eLevels || apiCourse.EmployeeLevel || []).map((p) =>
      String(p.eLevelId)
    ),
    userIds: (apiCourse.students || apiCourse.users || []).map((user) =>
      "id" in user ? user.id : (user as any).id
    ),
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
    courseCode: dto.code || dto.courseCode || "",
    description: dto.description || "",
    objectives: dto.objectives || "",
    image: imageUrl,
    location: dto.location || "",
    status: "Đang mở",
    enrollmentType: dto.optional === "Bắt buộc" ? "mandatory" : "optional",
    isPublic: dto.optional !== "Bắt buộc",
    instructor: dto.instructor || "Không có",
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
    // For UserEnrollCourseDto, provide defaults
    departments: [],
    eLevels: [],
    category: null,
    // Legacy fields for backward compatibility
    department: [],
    level: [],
    materials: [],
    lessons: [],
    tests: [],
    userIds: [],
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    createdBy: "",
    modifiedBy: "",
    progressPercentage: dto.progressPercentage // Fixed property name
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
    DepartmentIds: (course.department || [])
      .map((id) => {
        if (typeof id === "string") return parseInt(id, 10);
        return NaN;
      })
      .filter((id) => !isNaN(id)),
    eLevelIds: (course.level || [])
      .map((id) => {
        if (typeof id === "string") return parseInt(id, 10);
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
  course: Partial<Course>,
  originalCourse?: Course
): UpdateCourseRequest {
  const payload: UpdateCourseRequest = {};

  const isDifferent = (newVal: any, oldVal: any): boolean => {
    if (newVal === undefined) return false; // Don't include if new value is not set
    if (newVal === oldVal) return false;
    if (newVal == null && oldVal == null) return false;
    if (Array.isArray(newVal) && Array.isArray(oldVal)) {
      if (newVal.length !== oldVal.length) return true;
      const sortedNew = [...newVal].map(String).sort();
      const sortedOld = [...oldVal].map(String).sort();
      return JSON.stringify(sortedNew) !== JSON.stringify(sortedOld);
    }
    return true;
  };

  const formatDate = (date: string | null): string | undefined => {
    if (!date) return undefined;
    try {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime()) ? parsed.toISOString() : undefined;
    } catch {
      return undefined;
    }
  };

  if (isDifferent(course.title, originalCourse?.title))
    payload.Name = course.title;
  if (isDifferent(course.courseCode, originalCourse?.courseCode))
    payload.Code = course.courseCode;
  if (isDifferent(course.description, originalCourse?.description))
    payload.Description = course.description;
  if (isDifferent(course.objectives, originalCourse?.objectives))
    payload.Objectives = course.objectives;
  if (isDifferent(course.learningType, originalCourse?.learningType))
    payload.Format = course.learningType;
  if (isDifferent(course.instructor, originalCourse?.instructor))
    payload.LecturerId = undefined; // Assuming conversion is needed
  if (isDifferent(course.location, originalCourse?.location))
    payload.Location = course.location;
  if (isDifferent(course.maxParticipants, originalCourse?.maxParticipants))
    payload.MaxParticipant = course.maxParticipants;
  if (isDifferent(course.statusId, originalCourse?.statusId))
    payload.StatusId = course.statusId;
  
  const newEnrollmentType = course.enrollmentType === "mandatory" ? "Bắt buộc" : "Tùy chọn";
  const oldEnrollmentType = originalCourse?.enrollmentType === "mandatory" ? "Bắt buộc" : "Tùy chọn";
  if (isDifferent(newEnrollmentType, oldEnrollmentType)) {
    payload.Optional = newEnrollmentType;
  }

  if (isDifferent(course.duration, originalCourse?.duration)) {
    payload.Sessions = course.duration?.sessions;
    payload.HoursPerSessions = course.duration?.hoursPerSession;
  }

  if (isDifferent(course.startDate, originalCourse?.startDate))
    payload.StartDate = formatDate(course.startDate);
  if (isDifferent(course.endDate, originalCourse?.endDate))
    payload.EndDate = formatDate(course.endDate);
  if (
    isDifferent(
      course.registrationStartDate,
      originalCourse?.registrationStartDate
    )
  )
    payload.RegistrationStartDate = formatDate(course.registrationStartDate);
  if (
    isDifferent(
      course.registrationDeadline,
      originalCourse?.registrationDeadline
    )
  )
    payload.RegistrationClosingDate = formatDate(course.registrationDeadline);

  const newDepartmentIds = (course.department || []).map((id) =>
    parseInt(id, 10)
  );
  if (isDifferent(newDepartmentIds, originalCourse?.department?.map(id => parseInt(id, 10)))) {
    payload.DepartmentIds = newDepartmentIds;
  }

  const newLevelIds = (course.level || []).map((id) => parseInt(id, 10));
   if (isDifferent(newLevelIds, originalCourse?.level?.map(id => parseInt(id, 10)))) {
    payload.eLevelIds = newLevelIds;
  }

  const newUserIds = course.userIds || [];
  if (isDifferent(newUserIds, originalCourse?.userIds)) {
    payload.UserIds = newUserIds;
  }

  const newCategoryId = course.category?.id;
  if (isDifferent(newCategoryId, originalCourse?.category?.id)) {
    payload.CategoryId = newCategoryId === undefined ? null : newCategoryId;
  }

  if (course.imageFile) {
    payload.ThumbUrl = course.imageFile;
  }

  // Remove undefined fields from payload to keep it clean
  Object.keys(payload).forEach(
    (key) =>
      (payload as any)[key] === undefined && delete (payload as any)[key]
  );
  
  console.log("🔍 [mapCourseUiToUpdatePayload] Final Payload:", payload);
  return payload;
}
