import type { Course, TraineeLevel, Department, CourseCategory } from './types';

// Các tùy chọn trạng thái khóa học
export const statusOptions = [
    { value: 'draft', label: 'Lưu nháp' },
    { value: 'published', label: 'Đã xuất bản' },
    { value: 'archived', label: 'Đã lưu trữ' }
] as const;

// Các biến thể badge cho từng trạng thái
export const statusBadgeVariant: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
    draft: 'secondary',
    published: 'default',
    archived: 'destructive'
};

// Các tùy chọn phòng ban
export const departmentOptions = [
    { value: 'it', label: 'IT' },
    { value: 'hr', label: 'HR' },
    { value: 'finance', label: 'Tài chính' },
    { value: 'sales', label: 'Kinh doanh' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'operations', label: 'Vận hành' }
] as const;

// Các tùy chọn cấp độ
export const levelOptions = [
    { value: 'beginner', label: 'Mới bắt đầu' },
    { value: 'intermediate', label: 'Trung cấp' },
    { value: 'advanced', label: 'Nâng cao' },
    { value: 'expert', label: 'Chuyên gia' }
] as const;

// Mapping cấp độ học viên sang tiếng Việt
export const traineeLevelLabels: Record<TraineeLevel, string> = {
    beginner: 'Mới bắt đầu',
    intermediate: 'Trung cấp',
    advanced: 'Nâng cao',
    expert: 'Chuyên gia'
};

// Các tùy chọn danh mục khóa học
export const categoryOptions = [
    { value: 'programming', label: 'Lập trình' },
    { value: 'business', label: 'Kinh doanh' },
    { value: 'design', label: 'Thiết kế' },
    { value: 'marketing', label: 'Tiếp thị' },
    { value: 'soft_skills', label: 'Kỹ năng mềm' }
] as const;

// Mock data cho khóa học
export const mockCourses: Course[] = [
    {
        id: '1',
        title: 'Khóa học React cơ bản',
        courseCode: 'REACT001',
        description: 'Học React từ cơ bản đến nâng cao',
        objectives: 'Nắm vững kiến thức cơ bản về React và có thể xây dựng ứng dụng web',
        category: 'programming',
        instructor: 'John Doe',
        duration: {
            sessions: 15,
            hoursPerSession: 2
        },
        learningType: 'online',
        startDate: '2024-03-01',
        endDate: '2024-04-01',
        location: 'https://meet.google.com/abc-xyz',
        image: 'https://placehold.co/600x400',
        status: 'draft',
        department: ['it'],
        level: ['beginner', 'intermediate'],
        materials: [
            {
                type: 'pdf',
                title: 'Giáo trình React',
                url: 'https://example.com/react.pdf'
            }
        ],
        createdAt: '2024-03-01T00:00:00Z',
        modifiedAt: '2024-03-01T00:00:00Z',
        createdBy: 'admin',
        modifiedBy: 'admin'
    }
];