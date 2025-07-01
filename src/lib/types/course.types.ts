
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

// Student Course Evaluation interface
export interface StudentCourseEvaluation {
  id: string;
  courseId: string;
  traineeId: string;
  submissionDate: string; // ISO string
  ratings: {
    contentRelevance: number; // 1-5
    clarity: number; // 1-5
    structureLogic: number; // 1-5
    durationAppropriateness: number; // 1-5
    materialsEffectiveness: number; // 1-5
  };
  suggestions?: string;
}

// Main Course interface for Frontend
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
  startDate: string | null;
  endDate: string | null;
  location: string;
  image: string;
  status: string;
  statusId?: number;
  department: string[];
  level: string[];
  materials: CourseMaterial[];
  lessons?: Lesson[];
  tests?: Test[];
  createdAt: string;
  modifiedAt: string;
  createdBy: string;
  modifiedBy: string;
  enrollmentType: EnrollmentType;
  registrationDeadline?: string | null;
  enrolledTrainees?: string[];
  isPublic?: boolean;
  maxParticipants?: number;
  prerequisites?: string[];
  syllabus?: { title: string; content: string; duration: string }[];
  slides?: { title: string; url: string; type: "pdf" | "image" }[];
  registrationStartDate?: string | null;
  registrationClosingDate?: string | null;
  imageFile?: File | null;
}

// Courses API Types - Match backend exactly
export interface CreateCourseRequest {
  Code: string;
  Name: string;
  Description: string;
  Objectives: string;
  Sessions?: number;
  HoursPerSessions?: number;
  MaxParticipant?: number;
  StartDate?: string;
  EndDate?: string;
  RegistrationStartDate?: string;
  RegistrationClosingDate?: string;
  Location?: string;
  StatusId?: number;
  DepartmentIds?: number[];
  PositionIds?: number[];
  imageFile?: File | null;
}

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
  }>;
  positions?: Array<{
    positionId: number;
    positionName: string;
  }>;
}

// Course search parameters for API
export interface CourseSearchParams {
  keyword?: string;
  StatusIds?: string;
  DepartmentIds?: string;
  PositionIds?: string;
  page?: number;
  limit?: number;
}
