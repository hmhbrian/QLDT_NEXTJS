/**
 * Enterprise API Configuration
 * Centralized, type-safe configuration for all API endpoints and settings
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
export const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:5228/ws";
export const API_TIMEOUT = parseInt(
  process.env.NEXT_PUBLIC_API_TIMEOUT || "30000"
);
export const USE_API = process.env.NEXT_PUBLIC_USE_API === "true";

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("🚀 API Configuration:", {
    baseURL: API_BASE_URL,
    useApi: USE_API,
    timeout: API_TIMEOUT,
  });
}

export const API_ENDPOINTS = {
  auth: {
    login: "/Users/login",
    changePassword: "/Users/change-password",
  },
  users: {
    base: "/Users",
    create: "/Users/create",
    update: "/Users/update",
    search: "/Users/search",
    managerDept: "/Users/manager-dept",
    byId: (userId: string) => `/Users/${userId}`,
    updateAdmin: (userId: string) => `/Users/admin/${userId}/update`,
    resetPassword: (userId: string) => `/Users/${userId}/reset-password`,
    softDelete: (userId: string) => `/Users/${userId}/soft-delete`,
    forceDelete: (userId: string) => `/Users/${userId}/force-delete`,
  },
  roles: {
    base: "/roles",
    byId: (id: string) => `/roles/${id}`,
  },
  departments: {
    base: "/Departments",
    getById: (id: string) => `/Departments/${id}`,
    update: (id: string) => `/Departments/${id}`,
    delete: (id: string) => `/Departments/${id}`,
  },
  EmployeeLevel: {
    base: "/EmployeeLevel",
    byId: (id: number) => `/EmployeeLevel/${id}`,
    update: (id: number) => `/EmployeeLevel/${id}`,
    delete: (id: number) => `/EmployeeLevel/${id}`,
  },
  courses: {
    base: "/Courses",
    create: "/Courses",
    detail: (id: string) => `/Courses/${id}`,
    getById: (id: string) => `/Courses/${id}`,
    update: (id: string) => `/Courses/${id}`,
    enroll: (courseId: string) => `/Courses/${courseId}/enroll`,
    cancelEnroll: (courseId: string) => `/Courses/${courseId}/cancel-enroll`,
    getEnrolled: "/Courses/enroll-courses",
    completedCount: "/Courses/completed-count",
    completedEnrollCourses: "/Courses/completed-enroll-courses",
    search: "/Courses/search",
    searchPublic: "/Courses/search-public-course",
    softDelete: "/Courses/soft-delete",
    upcomingCourses: "/Courses/upcoming-courses",
    progressList: (courseId: string) => `/Courses/progress-list/${courseId}`,
    progressDetail: (courseId: string, userId: string) =>
      `/Courses/progress-detail/${courseId}/${userId}`,
    countCompletedLessons: (courseId: string) =>
      `/Courses/${courseId}/lessons/count-completed`, // New endpoint
  },
  tests: {
    base: (courseId: string) => `/courses/${courseId}/tests`,
    create: (courseId: string) => `/courses/${courseId}/tests/create`,
    getById: (courseId: string, testId: number) =>
      `/courses/${courseId}/tests/${testId}`,
    getNoAnswer: (courseId: string, testId: number) =>
      `/courses/${courseId}/tests/no-answer/${testId}`,
    update: (courseId: string, testId: number) =>
      `/courses/${courseId}/tests/update/${testId}`,
    delete: (courseId: string, testId: number) =>
      `/courses/${courseId}/tests/delete/${testId}`,
    reorder: (courseId: string) => `/courses/${courseId}/tests/reorder`,
    submit: (courseId: string, testId: number) =>
      `/courses/${courseId}/tests/submit/${testId}`,
    detailResult: (courseId: string, testId: number) =>
      `/courses/${courseId}/tests/detail-test-result/${testId}`,
    questions: (testId: number) => `/tests/${testId}/questions`,
    questionById: (testId: number, questionId: number) =>
      `/tests/${testId}/questions/${questionId}`,
  },
  lessons: {
    base: (courseId: string) => `/courses/${courseId}/lessons`,
    create: (courseId: string) => `/courses/${courseId}/lessons`,
    getById: (courseId: string, lessonId: number) =>
      `/courses/${courseId}/lessons/${lessonId}`,
    update: (courseId: string, lessonId: number) =>
      `/courses/${courseId}/lessons/${lessonId}`,
    delete: (courseId: string) => `/courses/${courseId}/lessons`,
    reorder: (courseId: string) => `/courses/${courseId}/lessons/reorder`,
  },
  lessonProgress: {
    base: "/LessonProgress",
    getProgress: (courseId: string) =>
      `/LessonProgress/get-lesson-progress/${courseId}`,
    upsert: () => `/LessonProgress/upsert-lesson-progress`,
  },
  courseAttachedFiles: {
    base: "/courseattachedfiles",
    upload: (courseId: string) => `/courseattachedfiles/${courseId}`,
    getByCourseId: (courseId: string) => `/courseattachedfiles/${courseId}`,
    delete: (courseId: string, fileId: number) =>
      `/courseattachedfiles/${courseId}/${fileId}`,
  },
  status: {
    base: "/status",
    courses: {
      getAll: "/status/courses",
      create: "/status/courses",
      update: (id: string) => `/status/courses/${id}`,
      delete: (id: string) => `/status/courses/${id}`,
    },
    users: {
      getAll: "/status/users",
      create: "/status/users",
      update: (id: string) => `/status/users/${id}`,
      delete: (id: string) => `/status/users/${id}`,
    },
    departments: {
      getAll: "/status/department",
      create: "/status/department",
      update: (id: string) => `/status/department/${id}`,
      delete: (id: string) => `/status/department/${id}`,
    },
  },
  feedback: {
    base: (courseId: string) => `/feedback/${courseId}`,
    create: (courseId: string) => `/feedback/${courseId}/create`,
  },
  auditLog: {
    base: "/AuditLog",
    course: "/AuditLog/course",
    user: "/AuditLog/user",
  },
  report: {
    avgFeedback: "/Report/avg-feedback",
    monthlyReport: (month: number, year: number) =>
      `/Report/data-report?month=${month}&year=${year}`,
    quarterlyReport: (quarter: number, year: number) =>
      `/Report/data-report?quarter=${quarter}&year=${year}`,
    yearReport: (year: number) => `/Report/data-report?year=${year}`,
    courseAndAvgFeedback: "/Report/course-and-avg-feedback",
    studentsOfCourse: "/Report/students-of-course",
    topDepartment: "/Report/top-department",
    reportStatus: "/Report/report-status",
  },
  certs: {
    base: "/Certs",
    byCourseId: (courseId: string) => `/Certs/${courseId}`,
  },
} as const;

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  useApi: USE_API,
  defaultHeaders: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: API_TIMEOUT,
  storage: {
    token: "qldt_auth_token",
    user: "qldt_user_data",
  },
  endpoints: API_ENDPOINTS,
  WS_BASE_URL: WS_BASE_URL,
} as const;
