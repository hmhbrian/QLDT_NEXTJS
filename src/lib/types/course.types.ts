/**
 * Course Domain Types
 * All course-related interfaces and types, aligned with backend DTOs.
 */

import type { DepartmentInfo } from "./department.types";
import type { Position, User } from "./user.types";
import type { Status } from "./status.types";
import type { Test } from "./test.types";

// --- Enums and Unions ---
export type LearningFormat = "online" | "offline";
export type EnrollmentType = "optional" | "mandatory";
export type CourseMaterialType = "PDF" | "Link";
export type LessonContentType =
  | "video_url"
  | "pdf_url"
  | "slide_url"
  | "text"
  | "external_link";

// Activity Log Types
export type ActivityAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "ENROLL"
  | "UNENROLL"
  | "START_LESSON"
  | "COMPLETE_LESSON"
  | "SUBMIT_TEST"
  | "VIEW_CONTENT";

export type ActivityEntityType =
  | "COURSE"
  | "LESSON"
  | "TEST"
  | "USER_ENROLLMENT"
  | "QUESTION"
  | "MATERIAL";

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  courseId: string;
  action: ActivityAction;
  entityType: ActivityEntityType;
  entityId?: string;
  entityName?: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
}

// --- Frontend UI Models ---

export interface Lesson {
  id: number;
  title: string;
  type: LessonContentType;
  content?: string | null;
  fileUrl?: string | null;
  link?: string | null;
  duration?: string;
  totalDurationSeconds?: number;
}

export interface CourseMaterial {
  id: number;
  courseId: string;
  title: string;
  type: CourseMaterialType;
  link: string;
  createdAt: string;
  modifiedAt: string | null;
}

export interface Course {
  id: string;
  title: string;
  courseCode: string;
  description: string;
  objectives: string;
  image: string;
  location: string;
  status: string | { id: number; name: string }; // Handle both string and object
  statusId?: number;
  enrollmentType: EnrollmentType;
  isPublic: boolean;
  instructor: string;
  duration: {
    sessions: number;
    hoursPerSession: number;
  };
  learningType: LearningFormat;
  maxParticipants?: number;
  startDate: string | null;
  endDate: string | null;
  registrationStartDate: string | null;
  registrationDeadline: string | null;
  department: (
    | string
    | { id: number; name: string; departmentName?: string }
  )[]; // Handle both string and object arrays
  level: (string | { id: number; name: string; positionName?: string })[]; // Handle both string and object arrays
  category: string;
  materials: CourseMaterial[];
  lessons: Lesson[];
  tests: Test[];
  userIds: string[];
  createdAt: string;
  modifiedAt: string;
  createdBy: string | { id: string; name: string }; // Handle both string and object
  modifiedBy: string | { id: string; name: string } | null; // Handle both string and object
  imageFile?: File | null;
  progressPercentage?: number; // Add this to UI model
}

export interface Feedback {
  id?: number;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  courseId?: string;
  q1_relevance: number;
  q2_clarity: number;
  q3_structure: number;
  q4_duration: number;
  q5_material: number;
  comment: string;
  createdAt?: string;
  averageRating: number;
}

export interface ApiLessonProgress {
  id: number;
  title: string;
  urlPdf?: string | null;
  progressPercentage: number;
  type: "PDF" | "LINK";
  currentPage?: number;
  currentTimeSecond?: number;
}

// --- API Request Payloads ---

export interface CreateCourseRequest {
  Code: string;
  Name: string;
  Description?: string;
  Objectives: string;
  ThumbUrl?: File;
  Format?: LearningFormat;
  Sessions?: number;
  HoursPerSessions?: number;
  Optional?: string;
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
  UserIds?: string[];
}

export interface UpdateCourseRequest extends Partial<CreateCourseRequest> {}

export interface CreateLessonPayload {
  Title: string;
  FilePdf?: File | null;
  Link?: string | null;
  TotalDurationSeconds?: number;
}

export interface UpdateLessonPayload extends Partial<CreateLessonPayload> {}

export interface UpsertLessonProgressPayload {
  lessonId: number;
  currentPage?: number;
  currentTimeSecond?: number;
}

export interface CreateFeedbackPayload {
  q1_relevance: number;
  q2_clarity: number;
  q3_structure: number;
  q4_duration: number;
  q5_material: number;
  comment: string;
}

// --- API Response DTOs ---

export interface CourseCategoryDto {
  id: number;
  name?: string;
  description?: string;
}

export interface CourseApiResponse {
  id: string;
  code?: string;
  name?: string;
  description?: string;
  objectives?: string;
  thumbUrl?: string;
  format?: string;
  sessions?: number;
  hoursPerSessions?: number;
  optional?: string;
  maxParticipant?: number;
  createdBy?: string;
  updatedBy?: string;
  startDate?: string;
  endDate?: string;
  registrationStartDate?: string;
  registrationClosingDate?: string;
  location?: string;
  createdAt?: string;
  modifiedAt?: string;
  status?: Status;
  category?: CourseCategoryDto;
  lecturer?: any; // Define LecturerDto if needed
  departments?: DepartmentInfo[];
  positions?: Position[];
  users?: User[]; // For enrolled users (legacy)
  students?: { id: string; name: string }[]; // For enrolled students (new API format)
}

export interface UserEnrollCourseDto {
  id: string;
  code: string;
  name: string;
  description?: string;
  objectives?: string;
  thumbUrl?: string;
  format?: string;
  sessions?: number;
  hoursPerSessions?: number;
  optional?: string;
  maxParticipant?: number;
  startDate?: string | null;
  endDate?: string | null;
  registrationStartDate?: string | null;
  registrationClosingDate?: string | null;
  location?: string;
  progressPercentange?: number; // Correct property name from backend
}

export interface ApiLesson {
  id: number;
  title: string;
  fileUrl?: string | null;
  link?: string | null;
  type?: string;
  totalDurationSeconds?: number;
}

export interface ApiCourseAttachedFile {
  id: number;
  courseId?: string;
  title?: string;
  type?: string;
  link?: string;
  publicIdUrlPdf?: string;
  createdAt?: string;
  modifiedAt?: string;
}
