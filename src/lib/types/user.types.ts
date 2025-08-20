import type { DepartmentInfo } from "./department.types";
import type { Status } from "./status.types";

export type Role = "ADMIN" | "HR" | "HOCVIEN";

export interface EmployeeLevel {
  eLevelId: number;
  eLevelName: string;
}

export interface Position {
  id: string;
  name: string;
}

export interface ServiceRole {
  id: string;
  name: string;
}

export interface CompletedCourseInfo {
  courseId: string;
  courseName: string;
  completionDate: string;
  grade: number;
  feedback?: string;
}

// --- Frontend UI Model ---
export interface User {
  id: string;
  fullName: string;
  urlAvatar?: string | null;
  idCard: string;
  email: string;
  phoneNumber: string;
  role: Role;
  employeeId?: string;
  department?: UserDepartmentInfo | null;
  employeeLevel?: EmployeeLevel;
  position?: string;
  userStatus?: Status;
  manager?: string;
  startWork?: string;
  endWork?: string;
  createdAt?: string;
  modifiedAt?: string;
  password?: string; // Optional for forms
  completedCourses?: CompletedCourseInfo[];
  currentCourseId?: string | null; // For real-time sync
}

// --- API Request Payloads ---
export interface LoginDTO {
  email: string;
  password: string;
}

export interface CreateUserRequest {
  fullName: string;
  idCard?: string;
  code?: string;
  position?: string;
  eLevelId?: number;
  roleId: string;
  managerUId?: string;
  departmentId?: number;
  statusId?: number;
  numberPhone?: string;
  startWork?: string;
  endWork?: string;
  email: string;
  password?: string;
  confirmPassword?: string;
}

export interface UpdateUserRequest {
  fullName?: string;
  idCard?: string;
  code?: string;
  position?: string;
  eLevelId?: number;
  roleId?: string;
  managerUId?: string;
  departmentId?: number;
  statusId?: number;
  numberPhone?: string;
  startWork?: string;
  endWork?: string;
  email?: string;
}

export interface UserProfileUpdateRequest {
  FullName?: string;
  UrlAvatar?: File;
  PhoneNumber?: string;
}

export interface ChangePasswordRequest {
  OldPassword: string;
  NewPassword: string;
  ConfirmNewPassword: string;
}

export interface ResetPasswordRequest {
  NewPassword: string;
  ConfirmNewPassword: string;
}

// --- API Response DTOs ---
export interface UserDepartmentInfo {
  departmentId: number;
  departmentName: string;
}

export interface UserApiResponse {
  id?: string;
  fullName?: string;
  urlAvatar?: string | null;
  idCard?: string;
  code?: string; // mã nhân viên
  email?: string;
  phoneNumber?: string;
  isDeleted?: boolean;
  role?: string;
  position?: string;
  createdBy?: string;
  updatedBy?: string;
  managerBy?: string | { Id: string; Name: string };
  eLevel?: EmployeeLevel; // Backend uses eLevel field
  eLevelName?: string;
  departmentName?: string; // Navigation property
  userStatus?: Status;
  startWork?: string;
  endWork?: string;
  createdAt?: string;
  modifiedAt?: string; // Typo from backend DTO
  accessToken?: string;
  department?: UserDepartmentInfo | null;
}
