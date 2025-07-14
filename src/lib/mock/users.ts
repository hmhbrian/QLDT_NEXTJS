
import type { User } from "../types/user.types";

export const mockUsers: User[] = [
  {
    id: "1",
    fullName: "Quản trị viên Hệ Thống",
    email: "admin@becamex.com",
    idCard: "CMND001",
    phoneNumber: "0901234567",
    password: "123123",
    role: "ADMIN",
    urlAvatar: "https://placehold.co/100x100.png?text=Admin",
    startWork: new Date("2020-01-15").toISOString(),
    createdAt: new Date("2020-01-15").toISOString(),
    modifiedAt: new Date().toISOString(),
    userStatus: { id: 2, name: "Đang hoạt động" },
    department: {
      departmentId: "d1",
      name: "IT Administration",
      code: "IT_ADMIN",
      level: 1,
      path: ["IT Administration"],
      status: { id: 1, name: "Active" },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    position: { positionId: 1, positionName: "System Administrator" },
  },
  {
    id: "2",
    fullName: "Trần Thị Bích (HR)",
    email: "hr@becamex.com",
    idCard: "CMND002",
    phoneNumber: "0902345678",
    password: "123123",
    role: "HR",
    urlAvatar: "https://placehold.co/100x100.png?text=HR",
    startWork: new Date("2021-05-10").toISOString(),
    createdAt: new Date("2021-05-10").toISOString(),
    modifiedAt: new Date().toISOString(),
    userStatus: { id: 2, name: "Đang hoạt động" },
    department: {
      departmentId: "d2",
      name: "Human Resources",
      code: "HR",
      level: 1,
      path: ["Human Resources"],
      status: { id: 1, name: "Active" },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    position: { positionId: 2, positionName: "HR Manager" },
  },
  {
    id: "3",
    fullName: "Nguyễn Văn An (Học viên)",
    email: "trainee@becamex.com",
    idCard: "CMND003",
    phoneNumber: "0903456789",
    password: "123123",
    role: "HOCVIEN",
    urlAvatar: "https://placehold.co/100x100.png?text=NV",
    startWork: new Date("2024-01-01").toISOString(),
    createdAt: new Date("2024-01-01").toISOString(),
    modifiedAt: new Date().toISOString(),
    userStatus: { id: 3, name: "Đang làm việc" },
    department: {
      departmentId: "d1",
      name: "IT",
      code: "IT",
      level: 1,
      path: ["IT"],
      status: { id: 1, name: "Active" },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    position: { positionId: 3, positionName: "Intern" },
    employeeId: "EMP001",
  },
];


export const getUserByEmailAndPassword = (
  email: string,
  password: string
): User | null => {
  const user = mockUsers.find(
    (u) =>
      u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  return user || null;
};
