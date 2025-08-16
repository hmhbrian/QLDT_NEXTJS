/**
 * Course Domain Types
 * All course-related interfaces and types, aligned with backend DTOs.
 */

import type { DepartmentInfo } from "./department.types";
import type { EmployeeLevel, User } from "./user.types";
import type { Status } from "./status.types";
import type { Test } from "./test.types";

// --- Enums and Unions ---
export type LearningFormat = "online" | "offline";
export type EnrollmentType = "optional" | "mandatory" | "";
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
  isPrivate: boolean;
  instructor: string; // kept for compatibility but no longer used in UI
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
  // Updated to match API response
  departments: Array<{ departmentId: number; departmentName: string }>;
  eLevels: Array<{ eLevelId: number; eLevelName: string }>;
  category: { id: number; categoryName: string } | null;
  // Legacy fields for backward compatibility
  department?: string[];
  level?: string[];
  materials: CourseMaterial[];
  lessons: Lesson[];
  tests: Test[];
  userIds: string[];
  createdAt: string;
  modifiedAt: string;
  createdBy: string | { id: string; name: string }; // Handle both string and object
  modifiedBy: string | { id: string; name: string } | null; // Handle both string and object
  imageFile?: File | null;
  progressPercentage?: number;
  // Add enrollment status for trainee view
  enrollmentStatus?: number; // 2=đang học, 3=đậu, 4=rớt
  lessonCompletedCount?: number;
  totalLessonCount?: number;
  testCompletedCount?: number;
  totalTestCount?: number;
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
  averageScore?: number; // Add this field for backend compatibility
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
  IsPrivate?: boolean;
  DepartmentIds?: number[];
  eLevelIds?: number[];
  UserIds?: string[];
}

export interface UpdateCourseRequest extends Partial<CreateCourseRequest> { }

export interface CreateLessonPayload {
  Title: string;
  FilePdf?: File | null;
  Link?: string | null;
  TotalDurationSeconds?: number;
}

export interface UpdateLessonPayload extends Partial<CreateLessonPayload> { }

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
  isPrivate?: boolean;
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
  // lecturer removed from mapping
  departments?: Array<{ departmentId: number; departmentName: string }>;
  eLevels?: Array<{ eLevelId: number; eLevelName: string }>;
  // Legacy fields for backward compatibility
  DepartmentInfo?: DepartmentInfo[];
  EmployeeLevel?: EmployeeLevel[];
  users?: User[]; // For enrolled users (legacy)
  students?: { id: string; name: string }[]; // For enrolled students (new API format)
}

export interface UserEnrollCourseDto {
  id: string;
  name: string;
  description: string;
  thumbUrl?: string;
  courseCode?: string;
  code?: string; // Add this for mapping
  objectives?: string; // Add this for mapping
  status?: number; // Changed to number to match backend API (2=đang học, 3=đậu, 4=rớt)
  startDate?: string;
  endDate?: string;
  registrationStartDate?: string; // Add this for mapping
  registrationClosingDate?: string; // Add this for mapping
  category?: string;
  location?: string;
  instructor?: string;
  format?: string; // Add this for mapping
  sessions?: number; // Add this for mapping
  hoursPerSessions?: number; // Add this for mapping
  optional?: string; // Add this for mapping
  maxParticipant?: number; // Add this for mapping
  progressPercentage?: number; // Fix typo
  lessonCompletedCount?: number; // Add missing fields from API
  totalLessonCount?: number;
  testCompletedCount?: number;
  totalTestCount?: number;
}

export interface CompletedCourseDto {
  id: string;
  name: string;
  description: string;
  thumbUrl?: string;
}

export interface UserCourseProgressDto {
  userId: string;
  userName: string;
  progressPercentage: number;
}

export interface LessonProgressDetail {
  lessonId: string;
  lessonName: string;
  progressPercentage: number;
  isCompleted: boolean;
}

export interface TestScoreDetail {
  testId: string;
  testName: string;
  isPassed: boolean;
  score: number;
  attemptDate: string;
}

export interface UserCourseProgressDetailDto {
  courseId: string;
  courseName: string;
  status: string;
  lessonProgress: LessonProgressDetail[];
  testScore: TestScoreDetail[];
  userId: string;
  userName: string;
  progressPercentage: number;
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
