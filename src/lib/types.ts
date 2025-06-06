import type { LucideIcon } from 'lucide-react';

export type Role = 'Admin' | 'HR' | 'Trainee';

export type WorkStatus =
  | 'working'           // Đang làm việc
  | 'resigned'          // Đã nghỉ việc
  | 'suspended'         // Tạm nghỉ
  | 'maternity_leave'   // Nghỉ thai sản
  | 'sick_leave'        // Nghỉ bệnh dài hạn
  | 'sabbatical'        // Nghỉ phép dài hạn
  | 'terminated';       // Đã sa thải

export type TraineeLevel =
  | 'intern'           // Thực tập
  | 'probation'        // Thử việc
  | 'employee'         // Nhân viên
  | 'middle_manager'   // Quản lý cấp trung
  | 'senior_manager';  // Quản lý cấp cao

// Thông tin khóa học đã hoàn thành
export interface CompletedCourse {
  courseId: string;
  courseName: string;
  completionDate: string;
  grade: number;          // Điểm số
  feedback?: string;      // Phản hồi
  instructor?: string;    // Người hướng dẫn
  duration?: string;      // Thời lượng khóa học
}

// Thông tin chứng chỉ
export interface Certificate {
  id: string;
  name: string;
  issuingOrganization: string;  // Tổ chức cấp
  issueDate: string;            // Ngày cấp
  expiryDate?: string;         // Ngày hết hạn (nếu có)
  credentialId?: string;       // Mã chứng chỉ
  description?: string;        // Mô tả
}

// Đánh giá học viên
export interface Evaluation {
  id: string;
  evaluator: string;           // Người đánh giá
  evaluationDate: string;      // Ngày đánh giá
  type: 'monthly' | 'quarterly' | 'yearly';  // Loại đánh giá
  criteria: {                  // Tiêu chí đánh giá
    name: string;
    score: number;
    maxScore: number;
    comment?: string;
  }[];
  overallScore: number;        // Điểm tổng
  strengths?: string[];        // Điểm mạnh
  weaknesses?: string[];       // Điểm yếu
  recommendations?: string[];  // Đề xuất cải thiện
  status: 'draft' | 'submitted' | 'reviewed' | 'approved';
}

// Cấu trúc phòng ban
export interface Department {
  id: string;
  name: string;               // Tên phòng ban
  code: string;               // Mã phòng ban
  description?: string;       // Mô tả
  parentId?: string;          // ID phòng ban cha
  managerId?: string;         // ID người quản lý
  managerName?: string;       // Tên người quản lý
  level: number;              // Cấp bậc trong cơ cấu
  path: string[];             // Đường dẫn từ root (để biết vị trí trong cây)
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// Thông tin học viên đầy đủ
export interface Trainee {
  // Thông tin cơ bản
  id: string;
  fullName: string;           // Họ và tên
  employeeId: string;         // Mã nhân viên
  email: string;              // Email công ty
  phoneNumber: string;        // Số điện thoại
  urlAvatar?: string;         // Ảnh đại diện

  // Thông tin công việc
  department: Department;     // Phòng ban (có cấu trúc cha-con)
  position: string;          // Chức vụ
  level: TraineeLevel;       // Cấp bậc
  workStatus: WorkStatus;    // Trạng thái làm việc

  // Thông tin quản lý
  managerId: string;         // ID quản lý trực tiếp
  managerName: string;       // Tên quản lý trực tiếp

  // Thông tin thời gian
  joinDate: string;          // Ngày vào công ty
  startWork?: Date;          // Ngày bắt đầu làm việc
  endWork?: Date;            // Ngày kết thúc (nếu đã nghỉ)
  createdAt: Date;
  modifiedAt: Date;

  // Hồ sơ học tập
  completedCourses: CompletedCourse[];  // Các khóa học đã hoàn thành
  evaluations: Evaluation[];            // Lịch sử đánh giá
  certificates: Certificate[];          // Chứng chỉ đạt được
}

// Interface cho form đăng ký học viên mới
export interface RegisterDTO {
  fullName: string;      // max 50 chars, required
  idCard: string;        // 10-50 chars, required
  role: Role;           // required
  numberPhone: string;   // 10-50 chars, required
  email: string;        // required, must be @becamex.com or @becamex.com.vn
  startWork?: Date;     // optional
  endWork?: Date;       // optional
  password: string;     // 6-100 chars, required
  confirmPassword: string; // must match password, required
}

// Interface cho đăng nhập
export interface LoginDTO {
  email: string;        // required, must be @becamex.com
  password: string;     // required, 6-100 chars
  rememberMe?: boolean; // optional
}

// Interface cho navigation
export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: Role[];
  disabled?: boolean;
}

// Interface cho khóa học
export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  instructor: string;
  duration: string;
  image: string;
  status: 'active' | 'inactive' | 'draft';
  startDate?: string;
  endDate?: string;
  maxParticipants?: number;
  prerequisites?: string[];
  syllabus?: {
    title: string;
    content: string;
    duration: string;
  }[];
}

// Base User interface
export interface User {
  id: string;
  fullName: string;
  urlAvatar?: string;
  idCard: string;
  email: string;
  phoneNumber: string;
  role: Role;
  startWork?: Date;
  endWork?: Date;
  createdAt?: Date;
  modifiedAt?: Date;
  // Optional Trainee fields
  employeeId?: string;
  department?: string;
  position?: string;
  level?: TraineeLevel;
  status?: WorkStatus;
  manager?: string;
  completedCourses?: CompletedCourse[];
  certificates?: Certificate[];
  evaluations?: Evaluation[];
}
