
import type { StudentCourseEvaluation } from '../types';

export const mockEvaluations: StudentCourseEvaluation[] = [
  {
    id: 'eval1',
    courseId: '1', // JavaScript Nâng cao
    traineeId: 'mock-trainee-alpha', // Thay đổi từ '3'
    submissionDate: '2024-09-20T10:00:00Z',
    ratings: {
      contentRelevance: 5,
      clarity: 4,
      structureLogic: 4,
      durationAppropriateness: 5,
      materialsEffectiveness: 3,
    },
    suggestions: 'Khóa học rất hay và thực tế. Tuy nhiên, phần tài liệu về Promises có thể chi tiết hơn một chút.',
  },
  {
    id: 'eval2',
    courseId: '2', // Nguyên tắc Quản lý Dự án
    traineeId: 'mock-trainee-beta', // Thay đổi từ '3'
    submissionDate: '2024-10-05T14:30:00Z',
    ratings: {
      contentRelevance: 4,
      clarity: 5,
      structureLogic: 5,
      durationAppropriateness: 4,
      materialsEffectiveness: 4,
    },
    suggestions: 'Giảng viên nhiệt tình, nội dung dễ hiểu. Nên có thêm bài tập thực hành nhóm.',
  },
  {
    id: 'eval3',
    courseId: '1', // JavaScript Nâng cao
    traineeId: 'mock-trainee-gamma', // Thay đổi từ 'mock-trainee-2' để tránh trùng lặp nếu có
    submissionDate: '2024-09-22T11:00:00Z',
    ratings: {
      contentRelevance: 4,
      clarity: 3,
      structureLogic: 4,
      durationAppropriateness: 4,
      materialsEffectiveness: 5,
    },
    suggestions: 'Tài liệu slide rất tốt, dễ theo dõi. Phần bài tập hơi khó với người mới.',
  },
    {
    id: 'eval4',
    courseId: '5', // Python cho Khoa học Dữ liệu - Giữ nguyên traineeId: '3' để test
    traineeId: '3', // Nguyễn Văn An
    submissionDate: '2024-11-25T09:15:00Z',
    ratings: {
      contentRelevance: 5,
      clarity: 4,
      structureLogic: 5,
      durationAppropriateness: 5,
      materialsEffectiveness: 4,
    },
    suggestions: 'Rất thích phần thực hành với Pandas. Có thể thêm một module về triển khai mô hình đơn giản.',
  },
];
