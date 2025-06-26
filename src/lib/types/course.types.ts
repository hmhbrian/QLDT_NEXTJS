/**
 * Course Domain Types
 * All course-related interfaces and types
 */

// Forward declarations to avoid circular dependencies
export type Department =
  | "it"
  | "hr"
  | "marketing"
  | "sales"
  | "finance"
  | "operations";

export type TraineeLevel =
  | "intern"
  | "probation"
  | "employee"
  | "middle_manager"
  | "senior_manager";

// Course category enumeration
export type CourseCategory =
  | "programming"
  | "business"
  | "design"
  | "marketing"
  | "soft_skills";

// Course status enumeration
export type CourseStatus = "draft" | "published" | "archived";

// Enrollment type enumeration
export type EnrollmentType = "optional" | "mandatory";

// Material type enumeration
export type MaterialType = "pdf" | "video" | "image" | "other";

// Lesson content type enumeration
export type LessonContentType =
  | "text"
  | "video_url"
  | "pdf_url"
  | "slide_url"
  | "external_link";

// Question interface for tests
export interface Question {
  id: string;
  questionCode?: string; // Mã câu hỏi
  text: string;
  options: string[];
  correctAnswerIndex: number; // Vị trí đáp án đúng trong mảng options
  explanation?: string; // Lời giải
}

// Test interface
export interface Test {
  id: string;
  title: string;
  questions: Question[];
  passingScorePercentage: number; // Ví dụ: 70 cho 70%
}

// Lesson interface
export interface Lesson {
  id: string;
  title: string;
  contentType: LessonContentType;
  content: string; // Có thể là markdown hoặc URL
  duration?: string; // Ví dụ: "30 phút", "1 giờ"
}

// Course material interface
export interface CourseMaterial {
  id: string;
  type: "pdf" | "slide" | "video" | "link";
  title: string;
  url: string;
  __file?: File; // Đối tượng file phía client trước khi upload
}

// Main Course interface
export interface Course {
  id: string;
  title: string;
  courseCode: string;
  description: string;
  objectives: string;
  category: CourseCategory;
  instructor: string;
  duration: {
    sessions: number;
    hoursPerSession: number;
  };
  learningType: "online" | "offline";
  startDate: string | null; // Chuỗi ngày ISO hoặc null
  endDate: string | null; // Chuỗi ngày ISO hoặc null
  location: string;
  image: string;
  status: CourseStatus;
  department: Department[]; // Mảng mã phòng ban
  level: TraineeLevel[];
  materials: CourseMaterial[];
  lessons?: Lesson[];
  tests?: Test[];
  createdAt: string; // Chuỗi ngày ISO
  modifiedAt: string; // Chuỗi ngày ISO
  createdBy: string; // ID hoặc tên người tạo
  modifiedBy: string; // ID hoặc tên người sửa
  enrollmentType: EnrollmentType;
  registrationDeadline?: string | null; // Chuỗi ngày ISO hoặc null
  enrolledTrainees?: string[]; // Mảng ID học viên đã ghi danh
  isPublic?: boolean;
  maxParticipants?: number;
  prerequisites?: string[];
  syllabus?: { title: string; content: string; duration: string }[];
  slides?: { title: string; url: string; type: "pdf" | "image" }[];
}

// Public course interface for public course page
export interface PublicCourse {
  id: string;
  title: string;
  description: string;
  category: string; // Lấy từ label của categoryOptions
  instructor: string;
  duration: string; // Chuỗi đã định dạng
  image: string;
  dataAiHint?: string;
  enrollmentType?: EnrollmentType;
  registrationDeadline?: string | null;
  isPublic?: boolean;
  enrolledTrainees?: string[]; // Add enrolledTrainees property
}

// Student course evaluation
export interface StudentCourseEvaluation {
  id: string;
  courseId: string;
  traineeId: string;
  submissionDate: string;
  ratings: {
    contentRelevance: number; // Mức độ phù hợp nội dung
    clarity: number; // Độ rõ ràng
    structureLogic: number; // Logic cấu trúc
    durationAppropriateness: number; // Thời lượng hợp lý
    materialsEffectiveness: number; // Hiệu quả tài liệu
  };
  suggestions?: string; // Góp ý thêm
}

// Courses API Types - Match backend exactly
export interface CreateCourseRequest {
  code: string; // Required
  name: string; // Required
  description: string; // Required
  objectives: string; // Required
  sessions?: number;
  hoursPerSessions?: number; // Note: backend uses plural form
  maxParticipant?: number;
  startDate?: string; // ISO date-time
  endDate?: string; // ISO date-time
  registrationStartDate?: string; // ISO date-time
  registrationClosingDate?: string; // ISO date-time
  location?: string;
  statusId?: number;
  departmentIds?: number[];
  positionIds?: number[];
}

// Course update request
export interface UpdateCourseRequest extends Partial<CreateCourseRequest> {
  // All fields optional for updates
}

// Course API response
export interface CourseApiResponse {
  id: string;
  code: string;
  name: string;
  description: string;
  objectives: string;
  thumbUrl?: string;
  format?: string;
  sessions?: number;
  hoursPerSessions?: number;
  optional?: string;
  maxParticipant?: number;
  startDate?: string;
  endDate?: string;
  registrationStartDate?: string;
  registrationClosingDate?: string;
  location?: string;
  createdAt?: string;
  modifiedAt?: string;
  statusId?: number;
  status?: {
    id: number;
    name: string;
  };
  departments?: Array<{
    departmentId: number;
    departmentName: string;
    departmentCode?: string;
    description?: string;
    parentId?: number;
    parentName?: string;
    managerId?: number;
    managerName?: string;
    status?: string;
    level: number;
    path?: string;
    createdAt: string;
    updatedAt: string;
    children?: any;
  }>;
  positions?: Array<{
    positionId: number;
    positionName: string;
  }>;
}

// Course search parameters
export interface CourseSearchParams {
  keyword?: string;
  statusId?: number;
  departmentIds?: number[];
  positionIds?: number[];
  startDate?: string;
  endDate?: string;
}

// Soft delete courses request
export interface SoftDeleteCoursesRequest {
  ids: string[];
}
