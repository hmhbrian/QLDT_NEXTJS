
import type { DepartmentInfo } from "./department.types";
import type { Status } from "./status.types";

export type Role = "ADMIN" | "HR" | "HOCVIEN";

export interface EmployeeLevel {
  eLevelId: number;
  eLevelName: string;
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
  department?: DepartmentInfo;
  employeeLevel?: EmployeeLevel;
  userStatus?: Status;
  manager?: string;
  startWork?: string;
  endWork?: string;
  createdAt?: string;
  modifiedAt?: string;
  password?: string; // Optional for forms
  completedCourses?: CompletedCourseInfo[];
}

// --- API Request Payloads ---
export interface LoginDTO {
  email: string;
  password: string;
}

export interface CreateUserRequest {
  FullName: string;
  IdCard?: string;
  Code?: string;
  eLevelId?: number;
  RoleId: string;
  ManagerUId?: string;
  DepartmentId?: number;
  StatusId?: number;
  NumberPhone?: string;
  StartWork?: string;
  EndWork?: string;
  Email: string;
  Password?: string;
  ConfirmPassword?: string;
}

export interface UpdateUserRequest {
  FullName?: string;
  IdCard?: string;
  Code?: string;
  eLevelId?: number;
  RoleId?: string;
  ManagerUId?: string;
  DepartmentId?: number;
  StatusId?: number;
  NumberPhone?: string;
  StartWork?: string;
  EndWork?: string;
  Email?: string;
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
  createdBy?: string;
  updatedBy?: string;
  managerBy?: string;
  eLevelName?: string;
  departmentName?: string; // Navigation property
  userStatus?: Status;
  startWork?: string;
  endWork?: string;
  createdAt?: string;
  modifedAt?: string; // Typo from backend DTO
  accessToken?: string;
  employeeLevel?: EmployeeLevel;
  department?: DepartmentInfo;
}
