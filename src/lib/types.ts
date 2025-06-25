import type { LucideIcon } from "lucide-react";

// --- Position Types ---
export interface Position {
  positionId: number;
  positionName: string;
}

// --- API Query Parameters ---
export interface BaseQueryParam {
  Page: number; // Must be >= 1
  Limit: number; // Must be between 1 and 24
  SortField: string; // Default: "created.at"
  SortType: "asc" | "desc"; // Default: "desc"
}

// --- User Types ---
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

export interface UserUpdateDto {
  email?: string;
  fullName?: string;
  role?: Role;
  department?: string | DepartmentInfo;
  idCard?: string;
  phoneNumber?: string;
  urlAvatar?: string;
}

export interface UserLoginDto {
  email: string;
  password: string;
}

// Interface cho request tạo user phù hợp với backend
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

// Vai trò người dùng
export type Role = "ADMIN" | "HR" | "HOCVIEN";

export interface ServiceRole {
  id: string;
  name: string;
  description?: string;
}

// Trạng thái làm việc
export type WorkStatus =
  | "working" // Đang làm việc
  | "resigned" // Đã nghỉ việc
  | "suspended" // Tạm nghỉ
  | "maternity_leave" // Nghỉ thai sản
  | "sick_leave" // Nghỉ bệnh dài hạn
  | "sabbatical" // Nghỉ phép dài hạn
  | "terminated"; // Đã sa thải

// Trình độ học viên
export type TraineeLevel =
  | "intern"
  | "probation"
  | "employee"
  | "middle_manager"
  | "senior_manager";

// Loại tài liệu
export type MaterialType = "pdf" | "video" | "image" | "other"; // Dùng cho tài liệu khóa học chung

// Danh mục khóa học
export type CourseCategory =
  | "programming"
  | "business"
  | "design"
  | "marketing"
  | "soft_skills";

// Trạng thái khóa học
export type CourseStatus = "draft" | "published" | "archived";

// Loại phòng ban - cần đồng bộ với code của DepartmentInfo
// Để đơn giản, giữ nguyên các literal string cụ thể.
export type Department =
  | "it"
  | "hr"
  | "marketing"
  | "sales"
  | "finance"
  | "operations";

// Loại ghi danh
export type EnrollmentType = "optional" | "mandatory";

// --- Cấu trúc mới cho Bài học và Bài kiểm tra ---
export interface Question {
  id: string;
  questionCode?: string; // Mã câu hỏi
  text: string;
  options: string[];
  correctAnswerIndex: number; // Vị trí đáp án đúng trong mảng options
  explanation?: string; // Lời giải
}

export interface Test {
  id: string;
  title: string;
  questions: Question[];
  passingScorePercentage: number; // Ví dụ: 70 cho 70%
}

export type LessonContentType =
  | "text"
  | "video_url"
  | "pdf_url"
  | "slide_url"
  | "external_link";

export interface Lesson {
  id: string;
  title: string;
  contentType: LessonContentType;
  content: string; // Có thể là markdown hoặc URL
  duration?: string; // Ví dụ: "30 phút", "1 giờ"
}
// --- Kết thúc cấu trúc mới ---

// Thông tin khóa học đã hoàn thành
export interface CompletedCourse {
  courseId: string;
  courseName: string;
  completionDate: string;
  grade: number;
  feedback?: string;
  instructor?: string;
  duration?: string;
}

// Thông tin chứng chỉ
export interface Certificate {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  description?: string;
}

// Đánh giá học viên (định kỳ)
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

// Frontend model for a department
export interface DepartmentInfo {
  departmentId: string;
  name?: string; // Keep for backward compatibility
  departmentName?: string; // Actual field from API
  code?: string;
  departmentCode?: string; // Actual field from API
  description?: string;
  parentId?: string | null;
  parentName?: string | null;
  managerId?: string | null;
  managerName?: string | null;
  status: string; // Changed to string to match API response
  level: number;
  path?: string[] | null;
  createdAt: string;
  updatedAt: string;
  children?: DepartmentInfo[];
}

export interface CreateDepartmentPayload {
  name: string;
  code: string;
  description?: string;
  status: "active" | "inactive";
  managerId?: string;
  parentId?: string | null;
}

export type UpdateDepartmentPayload = Partial<CreateDepartmentPayload>;

// Alias for service-specific types for consistency
export type ServiceDepartment = DepartmentInfo;
export type ServicePosition = Position;

// Thông tin học viên đầy đủ
export interface Trainee {
  id: string;
  fullName: string;
  employeeId: string;
  email: string;
  phoneNumber: string;
  urlAvatar?: string;
  department: Department; // Nên đồng bộ với DepartmentInfo.code
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

// Interface cho form đăng ký học viên mới
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

// Interface cho đăng nhập
export interface LoginDTO {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Interface cho navigation
export interface NavItem {
  label: string;
  href?: string; // Optional for group headers
  icon: LucideIcon;
  roles: Role[];
  disabled?: boolean;
  children?: NavItem[]; // For nested sub-menus
}

export interface CourseMaterial {
  id: string;
  type: "pdf" | "slide" | "video" | "link";
  title: string;
  url: string;
  __file?: File; // Đối tượng file phía client trước khi upload
}

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
  learningType: "online";
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

// Kiểu PublicCourse dùng cho trang khóa học công khai, ánh xạ từ Course
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

// Đánh giá của học viên về khóa học
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
