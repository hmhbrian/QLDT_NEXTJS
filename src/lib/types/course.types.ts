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

// Question interface for tests
export interface Question {
  id: string | number;
  questionCode?: string; // Mã câu hỏi
  text: string;
  options: string[];
  correctAnswerIndex: number; // Vị trí đáp án đúng trong mảng options (backward compatibility)
  correctAnswerIndexes?: number[]; // Nhiều đáp án đúng (new feature)
  explanation?: string; // Lời giải
  position?: number;
}

// Test interface
export interface Test {
  id: string | number;
  title: string;
  questions: Question[];
  passingScorePercentage: number;
  time?: number;
  countQuestion?: number; // Add this field
}

// Lesson content type enumeration
export type LessonContentType =
  | "video_url"
  | "pdf_url"
  | "slide_url"
  | "text"
  | "external_link";

// API-facing Lesson type
export interface ApiLesson {
  id: number;
  title: string;
  urlPdf: string;
}

// UI-facing Lesson type
export interface Lesson {
  id: number | string;
  title: string;
  content?: string;
  contentType?: LessonContentType;
  duration?: string;
  urlPdf?: string;
  link?: string;
}

export type CourseMaterialType = "PDF" | "Link";

// Course material interface from API
export interface CourseMaterial {
  id: number | string;
  courseId: string;
  title: string;
  type: CourseMaterialType;
  link: string;
  createdAt: string;
  modifiedAt: string | null;
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
  materials: CourseMaterial[]; // This will now hold the fetched attached files
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
  Format?: string; // "online" hoặc "offline"
  Sessions?: number;
  HoursPerSessions?: number;
  Optional?: string; // "tùy chọn" hoặc "bắt buộc"
  MaxParticipant?: number;
  StartDate?: string;
  EndDate?: string;
  RegistrationStartDate?: string;
  RegistrationClosingDate?: string;
  Location?: string;
  StatusId?: number;
  CategoryId?: number;
  LecturerId?: number;
  DepartmentIds?: number[];
  PositionIds?: number[];
  TraineeIds?: string[];
  imageFile?: File | null;
}

export interface UpdateCourseRequest extends Partial<CreateCourseRequest> {}

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
  isPublic?: boolean;
}

// Lesson API Payloads
export interface CreateLessonPayload {
  title: string;
  file: File;
}

export interface UpdateLessonPayload extends Partial<CreateLessonPayload> {}

// Test and Question API Types
export interface ApiQuestion {
  id: number;
  questionCode?: string;
  questionText: string;
  correctOption: string;
  questionType: number;
  explanation: string;
  a: string;
  b: string;
  c?: string;
  d?: string;
  position?: number;
}

export interface ApiTest {
  id: number;
  title: string;
  passThreshold: number;
  timeTest: number;
  position?: number;
  questions?: ApiQuestion[]; // Note: This might be null or not present in list views
  countQuestion?: number; // Add this field for list views
}

export interface CreateTestPayload {
  title: string;
  passThreshold: number;
  timeTest: number;
  questions: Array<Omit<ApiQuestion, "id" | "questionCode">>;
}

export interface UpdateTestPayload {
  title: string;
  passThreshold: number;
  time_test: number;
  position?: number;
  questions?: Array<Omit<ApiQuestion, "id" | "questionCode">>;
}

export interface CreateQuestionPayload {
  questionText: string;
  correctOption: string;
  questionType: number;
  explanation: string;
  a: string;
  b: string;
  c: string;
  d: string;
  position?: number;
}

export interface UpdateQuestionPayload extends CreateQuestionPayload {}
