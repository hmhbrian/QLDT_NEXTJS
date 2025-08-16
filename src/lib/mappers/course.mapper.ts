import type {
  Course,
  CourseApiResponse,
  CreateCourseRequest,
  UpdateCourseRequest,
  UserEnrollCourseDto,
} from "@/lib/types/course.types";
import { API_CONFIG } from "../config";
import { toApiDateStartOfDay } from "@/lib/utils/date.utils";

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
    // Map trực tiếp isPrivate từ backend
    isPrivate: apiCourse.isPrivate ?? false,
    instructor: "Không có",
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
    category: (() => {
      // Prefer nested category object
      if (apiCourse.category && (apiCourse.category.id !== undefined || apiCourse.category.name)) {
        return {
          id: (apiCourse.category.id as number) ?? 0,
          categoryName:
            (apiCourse.category as any).categoryName ||
            apiCourse.category.name ||
            "Không có",
        };
      }
      // Fallbacks: some endpoints may return only a name string
      const topLevelName = (apiCourse as any).categoryName || (apiCourse as any).category;
      if (typeof topLevelName === "string" && topLevelName.trim()) {
        return { id: 0, categoryName: topLevelName };
      }
      return null;
    })(),
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

// Helper function to map enrollment status number to text
function mapEnrollmentStatusToText(status?: number): string {
  switch (status) {
    case 2:
      return "Đang học";
    case 3:
      return "Đậu";
    case 4:
      return "Rớt";
    default:
      return "Không xác định";
  }
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
    status: mapEnrollmentStatusToText(dto.status),
    enrollmentType: dto.optional === "Bắt buộc" ? "mandatory" : "optional",
    isPrivate: (dto as any).isPrivate ?? false,
    instructor: "Không có",
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
    progressPercentage: dto.progressPercentage
      ? Math.round(dto.progressPercentage)
      : 0,
    // Add new enrollment status fields
    enrollmentStatus: dto.status,
    lessonCompletedCount: dto.lessonCompletedCount || 0,
    totalLessonCount: dto.totalLessonCount || 0,
    testCompletedCount: dto.testCompletedCount || 0,
    totalTestCount: dto.totalTestCount || 0,
  };
}

export function mapCourseUiToCreatePayload(
  course: Partial<Course>
): CreateCourseRequest {
  const formatDateForCreate = (date: string | null | undefined): string | undefined => {
    if (date == null) return ""; // send empty value when not provided
    return toApiDateStartOfDay(date || undefined);
  };

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
    StartDate: formatDateForCreate(course.startDate),
    EndDate: formatDateForCreate(course.endDate),
    RegistrationStartDate: formatDateForCreate(course.registrationStartDate),
    RegistrationClosingDate: formatDateForCreate(course.registrationDeadline),
    Location: course.location,
    StatusId: course.statusId,
    // Backend expects only IsPrivate; UI uses isPublic => invert
    IsPrivate: course.isPrivate === undefined ? undefined : course.isPrivate,
    CategoryId: course.category?.id,
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

  // For update payload: when user clears a date, backend expects an empty value ("")
  // Otherwise, send ISO string at start of day with Z
  const formatDateForUpdate = (date: string | null | undefined): string | undefined => {
    if (date === null) return "";
    return toApiDateStartOfDay(date || undefined);
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
  // Instructor removed
  if (isDifferent(course.location, originalCourse?.location))
    payload.Location = course.location;
  if (isDifferent(course.maxParticipants, originalCourse?.maxParticipants))
    payload.MaxParticipant = course.maxParticipants;
  if (isDifferent(course.statusId, originalCourse?.statusId))
    payload.StatusId = course.statusId;
  if (isDifferent(course.isPrivate, originalCourse?.isPrivate))
    payload.IsPrivate = course.isPrivate === undefined ? undefined : course.isPrivate;

  const newEnrollmentType =
    course.enrollmentType === "mandatory" ? "Bắt buộc" : "Tùy chọn";
  const oldEnrollmentType =
    originalCourse?.enrollmentType === "mandatory" ? "Bắt buộc" : "Tùy chọn";
  if (isDifferent(newEnrollmentType, oldEnrollmentType)) {
    payload.Optional = newEnrollmentType;
  }

  if (isDifferent(course.duration, originalCourse?.duration)) {
    payload.Sessions = course.duration?.sessions;
    payload.HoursPerSessions = course.duration?.hoursPerSession;
  }

  if (isDifferent(course.startDate, originalCourse?.startDate))
    payload.StartDate = formatDateForUpdate(course.startDate);
  if (isDifferent(course.endDate, originalCourse?.endDate))
    payload.EndDate = formatDateForUpdate(course.endDate);
  if (
    isDifferent(
      course.registrationStartDate,
      originalCourse?.registrationStartDate
    )
  )
    payload.RegistrationStartDate = formatDateForUpdate(course.registrationStartDate);
  if (
    isDifferent(
      course.registrationDeadline,
      originalCourse?.registrationDeadline
    )
  )
    payload.RegistrationClosingDate = formatDateForUpdate(course.registrationDeadline);

  const newDepartmentIds = (course.department || []).map((id) =>
    parseInt(id, 10)
  );

  // luôn gửi DepartmentIds
  if (course.enrollmentType) {
    payload.DepartmentIds = newDepartmentIds;
  } else if (
    isDifferent(
      newDepartmentIds,
      originalCourse?.department?.map((id) => parseInt(id, 10))
    )
  ) {
    payload.DepartmentIds = newDepartmentIds;
  }

  const newLevelIds = (course.level || []).map((id) => parseInt(id, 10));

  // luôn gửi eLevelIds
  if (course.enrollmentType) {
    payload.eLevelIds = newLevelIds;
  } else if (
    isDifferent(
      newLevelIds,
      originalCourse?.level?.map((id) => parseInt(id, 10))
    )
  ) {
    payload.eLevelIds = newLevelIds;
  }

  const newUserIds = course.userIds || [];

  // Nếu loại ghi danh là "Bắt buộc" thì luôn gửi UserIds
  if (course.enrollmentType === "mandatory") {
    payload.UserIds = newUserIds;
  } else if (isDifferent(newUserIds, originalCourse?.userIds)) {
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
    (key) => (payload as any)[key] === undefined && delete (payload as any)[key]
  );

  console.log("🔍 [mapCourseUiToUpdatePayload] Final Payload:", payload);
  return payload;
}
