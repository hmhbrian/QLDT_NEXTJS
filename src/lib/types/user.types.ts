/**
 * User Domain Types
 * All user-related interfaces and types
 */

import type { TraineeLevel, Department } from "./course.types";
import type { DepartmentInfo } from "./department.types";

// User role enumeration
export type Role = "ADMIN" | "HR" | "HOCVIEN";

// Work status enumeration
export type WorkStatus =
  | "working" // Đang làm việc
  | "resigned" // Đã nghỉ việc
  | "suspended" // Tạm nghỉ
  | "maternity_leave" // Nghỉ thai sản
  | "sick_leave" // Nghỉ bệnh dài hạn
  | "sabbatical" // Nghỉ phép dài hạn
  | "terminated"; // Đã sa thải

// Position interface
export interface Position {
  positionId: number;
  positionName: string;
}

// Service role interface
export interface ServiceRole {
  id: string;
  name: string;
  description?: string;
}

// Main User interface
export interface User {
  id: string;
  fullName: string;
  urlAvatar?: string;
  idCard: string;
  email: string;
  phoneNumber: string;
  role: Role;
  password?: string; // Mật khẩu người dùng (không băm trong demo)
  startWork?: Date; // Đối tượng Date
  endWork?: Date; // Đối tượng Date
  createdAt?: Date | string; // Đối tượng Date hoặc string
  modifiedAt?: Date | string; // Đối tượng Date hoặc string
  updatedAt?: Date | string; // Alias cho modifiedAt để tương thích với backend

  // Trường dành riêng cho Trainee/Nhân viên (tùy chọn)
  employeeId?: string;
  department?: string | DepartmentInfo; // Mã hoặc tên phòng ban
  position?: string | Position; // Có thể là string hoặc Position object
  level?: string; // Cấp bậc - có thể là string từ Positions API
  status?: WorkStatus;
  manager?: string; // Tên hoặc ID quản lý
  joinDate?: string; // Chuỗi ngày ISO cho ngày vào làm, khác với startWork

  // Trường liên quan đến học tập (tùy chọn, chủ yếu cho Trainee)
  completedCourses?: CompletedCourse[];
  certificates?: Certificate[];
  evaluations?: Evaluation[];
}

// User creation DTO
export interface UserCreateDto {
  email: string;
  fullName: string;
  role: Role;
  department?: string | DepartmentInfo;
  password: string;
  idCard?: string;
  phoneNumber?: string;
  urlAvatar?: string;
}

// User update DTO
export interface UserUpdateDto {
  email?: string;
  fullName?: string;
  role?: Role;
  department?: string | DepartmentInfo;
  idCard?: string;
  phoneNumber?: string;
  urlAvatar?: string;
}

// User login DTO
export interface UserLoginDto {
  email: string;
  password: string;
}

// Login DTO interface
export interface LoginDTO {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Create user request for backend
export interface CreateUserRequest {
  FullName: string;
  IdCard?: string;
  Code?: string;
  PositionId?: number;
  RoleId: string;
  ManagerUId?: string;
  DepartmentId?: number;
  StatusId?: number;
  NumberPhone?: string;
  StartWork?: string; // ISO string format
  EndWork?: string; // ISO string format
  Email: string;
  Password: string;
  ConfirmPassword: string;
}

// Registration DTO
export interface RegisterDTO {
  fullName: string;
  idCard: string;
  role: Role;
  numberPhone: string;
  email: string;
  startWork?: Date;
  endWork?: Date;
  password: string;
  confirmPassword: string;
  // Các trường bổ sung cho Trainee
  department?: string;
  position?: string; // Chức vụ - free text
  level?: string; // Cấp bậc - positionId từ Positions API
  status?: WorkStatus;
  employeeId?: string;
}

// Trainee full information
export interface Trainee {
  id: string;
  fullName: string;
  employeeId: string;
  email: string;
  phoneNumber: string;
  urlAvatar?: string;
  department: string; // Department code
  position: string;
  level: TraineeLevel;
  workStatus: WorkStatus;
  managerId: string;
  managerName: string;
  joinDate: string;
  startWork?: Date;
  endWork?: Date;
  createdAt: Date;
  modifiedAt: Date;
  completedCourses: CompletedCourse[];
  evaluations: Evaluation[];
  certificates: Certificate[];
}

// Course-related types (simplified to avoid circular deps)
export interface CompletedCourse {
  courseId: string;
  courseName: string;
  completionDate: string;
  grade: number;
  feedback?: string;
  instructor?: string;
  duration?: string;
}

export interface Certificate {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  description?: string;
}

export interface Evaluation {
  id: string;
  evaluator: string;
  evaluationDate: string;
  type: "monthly" | "quarterly" | "yearly";
  criteria: {
    name: string;
    score: number;
    maxScore: number;
    comment?: string;
  }[];
  overallScore: number;
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
  status: "draft" | "submitted" | "reviewed" | "approved";
}
