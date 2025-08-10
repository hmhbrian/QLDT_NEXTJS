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
      departmentId: 1,
      departmentName: "IT Administration",
    },
    employeeLevel: { eLevelId: 1, eLevelName: "System Administrator" },
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
      departmentId: 2,
      departmentName: "Human Resources",
    },
    employeeLevel: { eLevelId: 2, eLevelName: "HR Manager" },
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
      departmentId: 1,
      departmentName: "IT Administration",
    },
    employeeLevel: { eLevelId: 1, eLevelName: "System Administrator" },
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
