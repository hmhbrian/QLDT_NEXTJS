import type { Feedback } from "@/lib/types/course.types";

export const mockEvaluations: Feedback[] = [
  {
    id: 1,
    courseId: "1", // JavaScript Nâng cao
    userId: "mock-trainee-alpha",
    userName: "Trainee Alpha",
    q1_relevance: 5,
    q2_clarity: 4,
    q3_structure: 4,
    q4_duration: 5,
    q5_material: 3,
    comment:
      "Khóa học rất hay và thực tế. Tuy nhiên, phần tài liệu về Promises có thể chi tiết hơn một chút.",
    createdAt: new Date().toISOString(),
    averageScore: (5 + 4 + 4 + 5 + 3) / 5,
  },
  {
    id: 2,
    courseId: "2", // Nguyên tắc Quản lý Dự án
    userId: "mock-trainee-beta",
    userName: "Trainee Beta",
    q1_relevance: 4,
    q2_clarity: 5,
    q3_structure: 5,
    q4_duration: 4,
    q5_material: 4,
    comment:
      "Giảng viên nhiệt tình, nội dung dễ hiểu. Nên có thêm bài tập thực hành nhóm.",
    createdAt: new Date().toISOString(),
    averageScore: (4 + 5 + 5 + 4 + 4) / 5,
  },
  {
    id: 3,
    courseId: "1", // JavaScript Nâng cao
    userId: "mock-trainee-gamma",
    userName: "Trainee Gamma",
    q1_relevance: 4,
    q2_clarity: 3,
    q3_structure: 4,
    q4_duration: 4,
    q5_material: 5,
    comment:
      "Tài liệu slide rất tốt, dễ theo dõi. Phần bài tập hơi khó với người mới.",
    createdAt: new Date().toISOString(),
    averageScore: (4 + 3 + 4 + 4 + 5) / 5,
  },
  {
    id: 4,
    courseId: "5", // Python cho Khoa học Dữ liệu
    userId: "3", // Nguyễn Văn An
    userName: "Nguyễn Văn An",
    q1_relevance: 5,
    q2_clarity: 4,
    q3_structure: 5,
    q4_duration: 5,
    q5_material: 4,
    comment:
      "Rất thích phần thực hành với Pandas. Có thể thêm một module về triển khai mô hình đơn giản.",
    createdAt: new Date().toISOString(),
    averageScore: (5 + 4 + 5 + 5 + 4) / 5,
  },
];
