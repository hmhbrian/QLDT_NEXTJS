
import type { User, Trainee, WorkStatus } from "../types/user.types";
import type { TraineeLevel } from "../types/course.types";

// Mock Users Data
export const mockUsers: User[] = [
  {
    id: "1",
    fullName: "Quản trị viên Hệ Thống", // More specific name
    email: "admin@becamex.com",
    idCard: "CMND001",
    phoneNumber: "0901234567",
    password: "123123",
    role: "ADMIN",
    urlAvatar: "https://placehold.co/100x100.png?text=Admin", // Placeholder avatar
    startWork: new Date("2020-01-15"),
    createdAt: new Date("2020-01-15"),
    modifiedAt: new Date(),
    userStatus: { id: 2, name: "Đang hoạt động" },
    department: "IT Administration",
    position: "System Administrator",
  },
  {
    id: "2",
    fullName: "Trần Thị Bích (HR)", // More specific name
    email: "hr@becamex.com",
    idCard: "CMND002",
    phoneNumber: "0902345678",
    password: "123123",
    role: "HR",
    urlAvatar: "https://placehold.co/100x100.png?text=HR", // Placeholder avatar
    startWork: new Date("2021-05-10"),
    createdAt: new Date("2021-05-10"),
    modifiedAt: new Date(),
    userStatus: { id: 2, name: "Đang hoạt động" },
    department: "Human Resources",
    position: "HR Manager",
  },
  {
    id: "3",
    fullName: "Nguyễn Văn An (Học viên)", // Name clarification
    email: "trainee@becamex.com",
    idCard: "CMND003",
    phoneNumber: "0903456789",
    password: "123123",
    role: "HOCVIEN",
    urlAvatar: "https://placehold.co/100x100.png?text=NV", // Placeholder avatar
    startWork: new Date("2024-01-01"),
    createdAt: new Date("2024-01-01"),
    modifiedAt: new Date(),
    userStatus: { id: 3, name: "Đang làm việc" },
    department: "IT",
    level: "intern" as TraineeLevel,
    employeeId: "EMP001",
    // Trainee specific fields from mockTrainee (if applicable and part of User type)
    completedCourses: [
      {
        courseId: "C1",
        courseName: "JavaScript Fundamentals",
        completionDate: "2024-02-15",
        grade: 85,
        feedback: "Good understanding",
      },
      {
        courseId: "C2",
        courseName: "React Basics",
        completionDate: "2024-03-01",
        grade: 90,
        feedback: "Excellent work",
      },
    ],
    certificates: [
      {
        id: "CERT1",
        name: "JS Developer",
        issueDate: "2024-02-20",
        issuingOrganization: "Tech Academy",
        credentialId: "JS-2024-001",
      },
    ],
    evaluations: [
      {
        id: "E1",
        evaluator: "HR Manager",
        evaluationDate: "2024-03-15",
        type: "monthly",
        criteria: [],
        overallScore: 4,
        status: "approved",
      },
    ],
  },
  // Add more mock users as needed
];

// Mock Trainee Profile Data (Specific for trainee details if different from generic User)
// This mockTrainee might become less relevant if User type holds all necessary fields
export const mockHOCVIEN: Trainee = {
  // Trainee type might need review if User is comprehensive
  id: "3", // Should match one of the mockUsers
  employeeId: "EMP001",
  fullName: "Nguyễn Văn An (Học viên)",
  email: "trainee@becamex.com",
  phoneNumber: "0903456789",
  department: "it", // Giả định Department là string
  position: "Thực tập",
  level: "intern" as TraineeLevel,
  joinDate: "2024-01-01",
  managerId: "2",
  workStatus: "working", // Ensure this is WorkStatus type
  managerName: "Trần Thị Bích (HR)",
  createdAt: new Date("2024-01-01"),
  modifiedAt: new Date(),
  completedCourses: [
    {
      courseId: "C1",
      courseName: "JavaScript Fundamentals",
      completionDate: "2024-02-15",
      grade: 85,
      feedback: "Good understanding of core concepts",
    },
    {
      courseId: "C2",
      courseName: "React Basics",
      completionDate: "2024-03-01",
      grade: 90,
      feedback: "Excellent project work",
    },
  ],
  certificates: [
    {
      id: "CERT1",
      name: "JavaScript Developer",
      issueDate: "2024-02-20",
      issuingOrganization: "Tech Academy",
      credentialId: "JS-2024-001",
    },
  ],
  evaluations: [
    {
      id: "E1",
      evaluator: "Trần Thị Bích (HR)",
      evaluationDate: "2024-03-15",
      type: "monthly",
      criteria: [
        {
          name: "Technical Skills",
          score: 4,
          maxScore: 5,
          comment: "Good technical foundation",
        },
        {
          name: "Communication",
          score: 4,
          maxScore: 5,
          comment: "Clear and effective communication",
        },
        {
          name: "Problem Solving",
          score: 3,
          maxScore: 5,
          comment: "Shows potential, needs more practice",
        },
      ],
      overallScore: 4,
      strengths: ["Quick learner", "Team player"],
      weaknesses: ["Complex problem solving"],
      recommendations: ["Focus on advanced problem-solving scenarios"],
      status: "approved",
    },
  ],
};

export const getUserByEmailAndPassword = (
  email: string,
  password: string
): User | null => {
  // Tìm user có email và password khớp, không phân biệt chữ hoa/thường cho email
  const user = mockUsers.find(
    (u) =>
      u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  return user || null;
};
