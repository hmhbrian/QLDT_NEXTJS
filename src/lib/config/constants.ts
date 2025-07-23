
/**
 * Application Constants
 * Centralized constants for the entire application
 */

import type { Course } from "../types/course.types";
import type { DepartmentInfo } from "../types/department.types";

// Application metadata
export const APP_INFO = {
  name: "QLDT Becamex",
  version: "2.0.0",
  description: "Quản lý đào tạo Becamex",
  author: "Becamex Tech Team",
} as const;

// User roles with display names
export const USER_ROLES = {
  ADMIN: {
    value: "ADMIN",
    label: "Quản trị viên",
    permissions: ["all"],
  },
  HR: {
    value: "HR",
    label: "Nhân sự",
    permissions: ["users", "courses", "reports"],
  },
  HOCVIEN: {
    value: "HOCVIEN",
    label: "Học viên",
    permissions: ["courses", "profile"],
  },
} as const;

// Work status options
export const WORK_STATUS = {
  working: "Đang làm việc",
  resigned: "Đã nghỉ việc",
  suspended: "Tạm nghỉ",
  maternity_leave: "Nghỉ thai sản",
  sick_leave: "Nghỉ bệnh dài hạn",
  sabbatical: "Nghỉ phép dài hạn",
  terminated: "Đã sa thải",
} as const;

// Trainee levels
export const TRAINEE_LEVELS = {
  intern: "Thực tập sinh",
  probation: "Thử việc",
  employee: "Nhân viên",
  middle_manager: "Quản lý cấp trung",
  senior_manager: "Quản lý cấp cao",
} as const;

// Course categories
export const COURSE_CATEGORIES = {
  programming: "Lập trình",
  business: "Kinh doanh",
  design: "Thiết kế",
  marketing: "Marketing",
  soft_skills: "Kỹ năng mềm",
} as const;

// Course status
export const COURSE_STATUS = {
  draft: "Bản nháp",
  published: "Đã xuất bản",
  archived: "Đã lưu trữ",
} as const;

// Department types
export const DEPARTMENTS = {
  it: "Công nghệ thông tin",
  hr: "Nhân sự",
  marketing: "Marketing",
  sales: "Kinh doanh",
  finance: "Tài chính",
  operations: "Vận hành",
} as const;

// Material types
export const MATERIAL_TYPES = {
  pdf: "PDF",
  video: "Video",
  image: "Hình ảnh",
  other: "Khác",
} as const;

// Date formats
export const DATE_FORMATS = {
  DISPLAY: "dd/MM/yyyy",
  DISPLAY_WITH_TIME: "dd/MM/yyyy HH:mm",
  API: "yyyy-MM-dd",
  API_WITH_TIME: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

// File upload limits
export const FILE_UPLOAD = {
  MAX_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_TYPES: {
    images: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    documents: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    videos: ["video/mp4", "video/webm", "video/ogg"],
  },
} as const;

// Validation rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  ID_CARD_LENGTH: { min: 9, max: 12 },
  PHONE_PATTERN: /^[0-9+\-\s()]+$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// Theme colors
export const THEME_COLORS = {
  primary: "#0ea5e9",
  secondary: "#64748b",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",
} as const;

// Cookie keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "qldt_auth_token",
  REFRESH_TOKEN: "qldt_refresh_token",
  USER_DATA: "qldt_user_data",
  THEME: "qldt_theme",
  LANGUAGE: "qldt_language",
  EVALUATIONS: "student_course_evaluations",
  USER_PREFERENCES: "user_preferences",
} as const;

// Re-export for backward compatibility
export const EVALUATIONS_COOKIE_KEY = STORAGE_KEYS.EVALUATIONS;

// Các tùy chọn phòng ban
export const departmentOptions: readonly { value: string; label: string }[] = [
  { value: "it", label: "IT" },
  { value: "hr", label: "HR" },
  { value: "finance", label: "Tài chính" },
  { value: "sales", label: "Kinh doanh" },
  { value: "marketing", label: "Marketing" },
  { value: "operations", label: "Vận hành" },
] as const;

// Các tùy chọn cấp độ
export const levelOptions: readonly { value: string; label: string }[] = [
  { value: "intern", label: "Thực tập" },
  { value: "probation", label: "Thử việc" },
  { value: "employee", label: "Nhân viên" },
  { value: "middle_manager", label: "Quản lý cấp trung" },
  { value: "senior_manager", label: "Quản lý cấp cao" },
] as const;

// Mapping cấp độ học viên sang tiếng Việt
export const traineeLevelLabels: Record<string, string> = {
  intern: "Thực tập",
  probation: "Thử việc",
  employee: "Nhân viên",
  middle_manager: "Quản lý cấp trung",
  senior_manager: "Quản lý cấp cao",
};

// Các tùy chọn danh mục khóa học
export const categoryOptions = [
  { value: "programming", label: "Lập trình" },
  { value: "business", label: "Kinh doanh" },
  { value: "design", label: "Thiết kế" },
  { value: "marketing", label: "Tiếp thị" },
  { value: "soft_skills", label: "Kỹ năng mềm" },
] as const;

// Giá trị đặc biệt cho Select khi không chọn phòng ban hoặc cấp độ
export const NO_DEPARTMENT_VALUE = "__NO_DEPARTMENT__";
export const NO_LEVEL_VALUE = "__NO_LEVEL__";

// API endpoints (for reference - actual config is in api.config.ts)
export const API_PATHS = {
  AUTH: "/auth",
  USERS: "/users",
  COURSES: "/courses",
  DEPARTMENTS: "/departments",
} as const;
