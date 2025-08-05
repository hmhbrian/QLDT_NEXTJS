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

  // Helper function to check if values are different
  const isDifferent = (newVal: any, oldVal: any): boolean => {
    if (Array.isArray(newVal) && Array.isArray(oldVal)) {
      return JSON.stringify(newVal.sort()) !== JSON.stringify(oldVal.sort());
    }
    return newVal !== oldVal;
  };

  // Helper function to format date
  const formatDate = (date: string | null): string | undefined => {
    return date ? new Date(date).toISOString() : undefined;
  };

  // Only include fields that have changed
  if (
    !originalCourse ||
    isDifferent(course.courseCode, originalCourse.courseCode)
  ) {
    payload.Code = course.courseCode;
  }

  if (!originalCourse || isDifferent(course.title, originalCourse.title)) {
    payload.Name = course.title;
  }

  if (
    !originalCourse ||
    isDifferent(course.description, originalCourse.description)
  ) {
    payload.Description = course.description;
  }

  if (
    !originalCourse ||
    isDifferent(course.objectives, originalCourse.objectives)
  ) {
    payload.Objectives = course.objectives;
  }

  if (
    !originalCourse ||
    isDifferent(course.learningType, originalCourse.learningType)
  ) {
    payload.Format = course.learningType;
  }

  if (
    !originalCourse ||
    isDifferent(course.duration?.sessions, originalCourse.duration?.sessions)
  ) {
    payload.Sessions = course.duration?.sessions;
  }

  if (
    !originalCourse ||
    isDifferent(
      course.duration?.hoursPerSession,
      originalCourse.duration?.hoursPerSession
    )
  ) {
    payload.HoursPerSessions = course.duration?.hoursPerSession;
  }

  const newOptional =
    course.enrollmentType === "mandatory" ? "Bắt buộc" : "Tùy chọn";
  const oldOptional =
    originalCourse?.enrollmentType === "mandatory" ? "Bắt buộc" : "Tùy chọn";
  if (!originalCourse || isDifferent(newOptional, oldOptional)) {
    payload.Optional = newOptional;
  }

  if (
    !originalCourse ||
    isDifferent(course.maxParticipants, originalCourse.maxParticipants)
  ) {
    payload.MaxParticipant = course.maxParticipants;
  }

  const newStartDate = formatDate(course.startDate);
  const oldStartDate = formatDate(originalCourse?.startDate || null);
  if (!originalCourse || isDifferent(newStartDate, oldStartDate)) {
    payload.StartDate = newStartDate;
  }

  const newEndDate = formatDate(course.endDate);
  const oldEndDate = formatDate(originalCourse?.endDate || null);
  if (!originalCourse || isDifferent(newEndDate, oldEndDate)) {
    payload.EndDate = newEndDate;
  }

  const newRegStartDate = formatDate(course.registrationStartDate);
  const oldRegStartDate = formatDate(
    originalCourse?.registrationStartDate || null
  );
  if (!originalCourse || isDifferent(newRegStartDate, oldRegStartDate)) {
    payload.RegistrationStartDate = newRegStartDate;
  }

  const newRegCloseDate = formatDate(course.registrationDeadline);
  const oldRegCloseDate = formatDate(
    originalCourse?.registrationDeadline || null
  );
  if (!originalCourse || isDifferent(newRegCloseDate, oldRegCloseDate)) {
    payload.RegistrationClosingDate = newRegCloseDate;
  }

  if (
    !originalCourse ||
    isDifferent(course.location, originalCourse.location)
  ) {
    payload.Location = course.location;
  }

  if (
    !originalCourse ||
    isDifferent(course.statusId, originalCourse.statusId)
  ) {
    payload.StatusId = course.statusId;
  }

  // Handle DepartmentIds - ALWAYS include this field when changed, even if empty
  const newDepartmentIds = (course.department || [])
    .map((id) => {
      if (typeof id === "string") return parseInt(id, 10);
      return NaN;
    })
    .filter((id) => !isNaN(id));

  const oldDepartmentIds = (originalCourse?.department || [])
    .map((id) => {
      if (typeof id === "string") return parseInt(id, 10);
      return NaN;
    })
    .filter((id) => !isNaN(id));

  const departmentIdsChanged =
    !originalCourse || isDifferent(newDepartmentIds, oldDepartmentIds);
  if (departmentIdsChanged) {
    payload.DepartmentIds = newDepartmentIds;
    console.log("🏢 [DepartmentIds] Change detected:", {
      old: oldDepartmentIds,
      new: newDepartmentIds,
      action: newDepartmentIds.length === 0 ? "CLEAR_ALL" : "UPDATE",
    });
  }

  // Handle eLevelIds - ALWAYS include this field when changed, even if empty
  const newLevelIds = (course.level || [])
    .map((id) => {
      if (typeof id === "string") return parseInt(id, 10);
      return NaN;
    })
    .filter((id) => !isNaN(id));

  const oldLevelIds = (originalCourse?.level || [])
    .map((id) => {
      if (typeof id === "string") return parseInt(id, 10);
      return NaN;
    })
    .filter((id) => !isNaN(id));

  const levelIdsChanged =
    !originalCourse || isDifferent(newLevelIds, oldLevelIds);
  if (levelIdsChanged) {
    payload.eLevelIds = newLevelIds;
    console.log("📊 [eLevelIds] Change detected:", {
      old: oldLevelIds,
      new: newLevelIds,
      action: newLevelIds.length === 0 ? "CLEAR_ALL" : "UPDATE",
    });
  }

  // Handle UserIds
  if (!originalCourse || isDifferent(course.userIds, originalCourse.userIds)) {
    payload.UserIds = course.userIds;
  }

  // Handle CategoryId
  const newCategoryId = course.category?.id;
  const oldCategoryId = originalCourse?.category?.id;
  if (!originalCourse || isDifferent(newCategoryId, oldCategoryId)) {
    payload.CategoryId = newCategoryId || null;
    console.log("🏷️ [CategoryId] Change detected:", {
      old: oldCategoryId,
      new: newCategoryId,
      action: newCategoryId ? "UPDATE" : "CLEAR",
    });
  }

  // Always include image file if present
  if (course.imageFile) {
    payload.ThumbUrl = course.imageFile;
  }

  // Remove undefined values
  Object.keys(payload).forEach(
    (key) => (payload as any)[key] === undefined && delete (payload as any)[key]
  );

  console.log("🔍 [mapCourseUiToUpdatePayload] Payload changes:", {
    originalDepartments: oldDepartmentIds,
    newDepartments: newDepartmentIds,
    originalLevels: oldLevelIds,
    newLevels: newLevelIds,
    payload,
  });

  return payload;
}
