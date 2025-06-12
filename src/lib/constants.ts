import type { Course, TraineeLevel } from './types';

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
    { value: 'intern', label: 'Thực tập' },
    { value: 'probation', label: 'Thử việc' },
    { value: 'employee', label: 'Nhân viên' },
    { value: 'middle_manager', label: 'Quản lý cấp trung' },
    { value: 'senior_manager', label: 'Quản lý cấp cao' }
] as const;

// Mapping cấp độ học viên sang tiếng Việt
export const traineeLevelLabels: Record<TraineeLevel, string> = {
    intern: 'Thực tập',
    probation: 'Thử việc',
    employee: 'Nhân viên',
    middle_manager: 'Quản lý cấp trung',
    senior_manager: 'Quản lý cấp cao'
};

// Các tùy chọn danh mục khóa học
export const categoryOptions = [
    { value: 'programming', label: 'Lập trình' },
    { value: 'business', label: 'Kinh doanh' },
    { value: 'design', label: 'Thiết kế' },
    { value: 'marketing', label: 'Tiếp thị' },
    { value: 'soft_skills', label: 'Kỹ năng mềm' }
] as const;

// Giá trị đặc biệt cho Select khi không chọn phòng ban hoặc cấp độ
export const NO_DEPARTMENT_VALUE = "__NO_DEPARTMENT__";
export const NO_LEVEL_VALUE = "__NO_LEVEL__";


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
        enrollmentType: 'optional',
        learningType: 'online',
        startDate: '2024-03-01',
        endDate: '2024-04-01',
        location: 'https://meet.google.com/abc-xyz',
        image: 'https://placehold.co/600x400',
        status: 'draft',
        department: ['it'],
        level: ['intern', 'probation'],
        materials: [
            {
                id: 'mat-react-001',
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
