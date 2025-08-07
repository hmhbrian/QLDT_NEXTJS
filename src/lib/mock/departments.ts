import type { DepartmentInfo } from "@/lib/types/department.types";
import type { Status } from "@/lib/types/status.types";

const activeStatus: Status = { id: 1, name: "Hoạt động" };
const inactiveStatus: Status = { id: 2, name: "Không hoạt động" };

// Mock Departments List
export const mockDepartments: DepartmentInfo[] = [
  {
    departmentId: 1,
    name: "Công nghệ thông tin",
    code: "it",
    description: "Phòng phát triển và quản lý hệ thống công nghệ thông tin",
    managerId: "1",
    status: activeStatus,
    level: 1,
    path: ["Công nghệ thông tin"],
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    departmentId: 2,
    name: "Nhân sự",
    code: "hr",
    description: "Phòng quản lý nhân sự và tuyển dụng",
    managerId: "2",
    status: activeStatus,
    level: 1,
    path: ["Nhân sự"],
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    departmentId: 3,
    name: "Kinh doanh",
    code: "sales",
    description: "Phòng phát triển kinh doanh và bán hàng",
    managerId: "3",
    status: activeStatus,
    level: 1,
    path: ["Kinh doanh"],
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    departmentId: 4,
    name: "Marketing",
    code: "marketing",
    description: "Phòng tiếp thị và truyền thông",
    managerId: "4",
    status: activeStatus,
    level: 1,
    path: ["Marketing"],
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  // Phòng ban con của IT
  // Phòng ban con của IT
  {
    departmentId: 5,
    name: "Phát triển phần mềm",
    code: "it-dev",
    description: "Phòng phát triển ứng dụng và phần mềm",
    managerId: "5",
    parentId: 1, // Con của IT
    status: activeStatus,
    level: 2,
    path: ["Công nghệ thông tin", "Phát triển phần mềm"],
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    departmentId: 6,
    name: "Hạ tầng & Vận hành",
    code: "it-ops",
    description: "Phòng quản lý hạ tầng CNTT và vận hành hệ thống",
    managerId: "6",
    parentId: 1, // Con của IT
    status: activeStatus,
    level: 2,
    path: ["Công nghệ thông tin", "Hạ tầng & Vận hành"],
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  // Phòng ban con cấp 3 của Phát triển phần mềm
  {
    departmentId: 7,
    name: "Phát triển Web",
    code: "it-dev-web",
    description: "Nhóm phát triển ứng dụng web",
    managerId: "7",
    parentId: 5, // Con của Phát triển phần mềm
    status: activeStatus,
    level: 3,
    path: ["Công nghệ thông tin", "Phát triển phần mềm", "Phát triển Web"],
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    departmentId: 8,
    name: "Phát triển Mobile",
    code: "it-dev-mobile",
    description: "Nhóm phát triển ứng dụng di động",
    managerId: "8",
    parentId: 5, // Con của Phát triển phần mềm
    status: activeStatus,
    level: 3,
    path: ["Công nghệ thông tin", "Phát triển phần mềm", "Phát triển Mobile"],
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  // Phòng ban con của HR
  {
    departmentId: 9,
    name: "Tuyển dụng",
    code: "hr-rec",
    description: "Phòng tuyển dụng nhân sự",
    managerId: "9",
    parentId: 2, // Con của HR
    status: activeStatus,
    level: 2,
    path: ["Nhân sự", "Tuyển dụng"],
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    departmentId: 10,
    name: "Phát triển nhân sự",
    code: "hr-dev",
    description: "Phòng phát triển và đào tạo nhân sự",
    managerId: "10",
    parentId: 2, // Con của HR
    status: inactiveStatus,
    level: 2,
    path: ["Nhân sự", "Phát triển nhân sự"],
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  // Phòng ban con của HR
  {
    departmentId: 9,
    name: "Tuyển dụng",
    code: "hr-rec",
    description: "Phòng tuyển dụng nhân sự",
    managerId: "9",
    parentId: 2, // Con của HR
    status: activeStatus,
    level: 2,
    path: ["Nhân sự", "Tuyển dụng"],
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    departmentId: 10,
    name: "Phát triển nhân sự",
    code: "hr-dev",
    description: "Phòng phát triển và đào tạo nhân sự",
    managerId: "10",
    parentId: 2, // Con của HR
    status: inactiveStatus,
    level: 2,
    path: ["Nhân sự", "Phát triển nhân sự"],
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
];
