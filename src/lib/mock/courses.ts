import type { Course } from '../types';

// Mock Courses List for admin
export const mockCourses: Course[] = [
    {
        id: '1',
        title: 'JavaScript Nâng cao',
        courseCode: 'JS001',
        description: 'Tìm hiểu sâu về các tính năng JavaScript hiện đại và các phương pháp hay nhất.',
        objectives: 'Nắm vững ES6+, async/await, và các pattern hiện đại',
        category: 'programming',
        instructor: 'TS. Code',
        duration: {
            sessions: 12,
            hoursPerSession: 2
        },
        learningType: 'online',
        image: 'https://placehold.co/600x400',
        status: 'draft',
        department: ['it'],
        level: ['beginner', 'intermediate'],
        startDate: '2024-03-01',
        endDate: '2024-04-15',
        location: 'https://meet.google.com/abc-xyz',
        materials: [
            {
                type: 'pdf',
                title: 'Tài liệu JavaScript',
                url: 'https://example.com/js.pdf'
            }
        ],
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        createdBy: '1',
        modifiedBy: '1'
    },
    {
        id: '2',
        title: 'Nguyên tắc Quản lý Dự án',
        courseCode: 'PM001',
        description: 'Học các yếu tố cần thiết để quản lý dự án hiệu quả.',
        objectives: 'Nắm vững các nguyên tắc quản lý dự án và áp dụng vào thực tế',
        category: 'business',
        instructor: 'CN. Planner',
        duration: {
            sessions: 8,
            hoursPerSession: 2
        },
        learningType: 'online',
        image: 'https://placehold.co/600x400',
        status: 'published',
        department: ['hr'],
        level: ['intermediate', 'advanced'],
        startDate: '2024-04-01',
        endDate: '2024-04-30',
        location: 'https://meet.google.com/def-ghi',
        materials: [
            {
                type: 'pdf',
                title: 'Tài liệu quản lý dự án',
                url: 'https://example.com/pm.pdf'
            }
        ],
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        createdBy: '1',
        modifiedBy: '1'
    },
    {
        id: '3',
        title: 'Nguyên tắc Thiết kế UI/UX',
        courseCode: 'UI001',
        description: 'Nắm vững các nguyên tắc cốt lõi của thiết kế giao diện và trải nghiệm người dùng.',
        objectives: 'Hiểu và áp dụng các nguyên tắc thiết kế UI/UX vào thực tế',
        category: 'design',
        instructor: 'KS. Pixel',
        duration: {
            sessions: 16,
            hoursPerSession: 2
        },
        learningType: 'online',
        image: 'https://placehold.co/600x400',
        status: 'draft',
        department: ['it'],
        level: ['beginner', 'intermediate'],
        startDate: '2024-05-01',
        endDate: '2024-06-30',
        location: 'https://meet.google.com/jkl-mno',
        materials: [
            {
                type: 'pdf',
                title: 'Tài liệu thiết kế UI/UX',
                url: 'https://example.com/uiux.pdf'
            }
        ],
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        createdBy: '1',
        modifiedBy: '1'
    },
    {
        id: '4',
        title: 'Chiến lược Tiếp thị Kỹ thuật số',
        courseCode: 'MKT001',
        description: 'Phát triển và triển khai các chiến lược tiếp thị kỹ thuật số hiệu quả.',
        objectives: 'Xây dựng và triển khai chiến lược marketing số hiệu quả',
        category: 'marketing',
        instructor: 'CN. Click',
        duration: {
            sessions: 10,
            hoursPerSession: 2
        },
        learningType: 'online',
        image: 'https://placehold.co/600x400',
        status: 'archived',
        department: ['marketing'],
        level: ['intermediate', 'advanced'],
        startDate: '2024-02-01',
        endDate: '2024-03-10',
        location: 'https://meet.google.com/pqr-stu',
        materials: [
            {
                type: 'pdf',
                title: 'Tài liệu marketing số',
                url: 'https://example.com/marketing.pdf'
            }
        ],
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        createdBy: '1',
        modifiedBy: '1'
    }
];

// Mock Course Detail
export const mockCourseDetail = {
    id: '1',
    title: 'JavaScript Nâng cao',
    description: 'Tìm hiểu sâu về các tính năng JavaScript hiện đại và các phương pháp hay nhất.',
    category: 'programming',
    instructor: 'TS. Code',
    duration: '6 Tuần',
    image: 'https://placehold.co/600x400',
    status: 'active',
    startDate: '2024-03-01',
    endDate: '2024-04-15',
    maxParticipants: 30,
    prerequisites: [
        'Kiến thức cơ bản về JavaScript',
        'Hiểu biết về HTML và CSS',
        'Có kinh nghiệm lập trình web'
    ],
    syllabus: [
        {
            title: 'Tuần 1: Giới thiệu',
            content: 'Tổng quan về khóa học và các công nghệ sẽ sử dụng',
            duration: '1 tuần'
        },
        {
            title: 'Tuần 2: ES6+ Features',
            content: 'Các tính năng mới trong ES6 và các phiên bản sau',
            duration: '1 tuần'
        }
    ],
    slides: [
        {
            title: 'Giới thiệu khóa học',
            url: '/slides/introduction.pdf',
            type: 'pdf'
        },
        {
            title: 'ES6 Features',
            url: '/slides/es6-features.pdf',
            type: 'pdf'
        }
    ]
};

// Mock My Courses for trainees
export const mockMyCourses = [
    {
        id: '1',
        title: 'JavaScript Nâng cao',
        description: 'Nắm vững các tính năng JS hiện đại.',
        progress: 75,
        image: 'https://placehold.co/600x400.png',
        dataAiHint: 'laptop code',
        nextLesson: 'Tìm hiểu sâu về Async/Await'
    },
    {
        id: '2',
        title: 'Nguyên tắc Thiết kế UI/UX',
        description: 'Học cách tạo giao diện trực quan.',
        progress: 40,
        image: 'https://placehold.co/600x400.png',
        dataAiHint: 'mobile design',
        nextLesson: 'Tạo Persona Người dùng'
    },
    {
        id: '3',
        title: 'Chiến lược Tiếp thị Kỹ thuật số',
        description: 'Phát triển chiến lược trực tuyến hiệu quả.',
        progress: 100,
        image: 'https://placehold.co/600x400.png',
        dataAiHint: 'social media analytics',
        nextLesson: 'Khóa học đã hoàn thành'
    }
];

// Mock Public Courses List
export interface PublicCourse {
    id: string;
    title: string;
    description: string;
    category: 'Lập trình' | 'Kinh doanh' | 'Thiết kế' | 'Tiếp thị' | 'Kỹ năng mềm';
    instructor: string;
    duration: string;
    image: string;
    dataAiHint?: string;
}

export const mockPublicCourses: PublicCourse[] = [
    {
        id: '1',
        title: 'JavaScript Nâng cao',
        description: 'Tìm hiểu sâu về các tính năng JavaScript hiện đại và các phương pháp hay nhất.',
        category: 'Lập trình',
        instructor: 'TS. Code',
        duration: '6 Tuần',
        image: 'https://placehold.co/600x400.png',
        dataAiHint: 'technology code'
    },
    {
        id: '2',
        title: 'Nguyên tắc Quản lý Dự án',
        description: 'Học các yếu tố cần thiết để quản lý dự án hiệu quả.',
        category: 'Kinh doanh',
        instructor: 'CN. Planner',
        duration: '4 Tuần',
        image: 'https://placehold.co/600x400.png',
        dataAiHint: 'office meeting'
    },
    {
        id: '3',
        title: 'Nguyên tắc Thiết kế UI/UX',
        description: 'Nắm vững các nguyên tắc cốt lõi của thiết kế giao diện và trải nghiệm người dùng.',
        category: 'Thiết kế',
        instructor: 'KS. Pixel',
        duration: '8 Tuần',
        image: 'https://placehold.co/600x400.png',
        dataAiHint: 'design art'
    },
    {
        id: '4',
        title: 'Chiến lược Tiếp thị Kỹ thuật số',
        description: 'Phát triển và triển khai các chiến lược tiếp thị kỹ thuật số hiệu quả.',
        category: 'Tiếp thị',
        instructor: 'CN. Click',
        duration: '5 Tuần',
        image: 'https://placehold.co/600x400.png',
        dataAiHint: 'marketing social media'
    },
    {
        id: '5',
        title: 'Machine Learning Cơ bản',
        description: 'Khám phá các khái niệm cơ bản về học máy và ứng dụng thực tế.',
        category: 'Lập trình',
        instructor: 'TS. AI',
        duration: '10 Tuần',
        image: 'https://placehold.co/600x400.png',
        dataAiHint: 'artificial intelligence'
    },
    {
        id: '6',
        title: 'Kỹ năng Thuyết trình',
        description: 'Phát triển kỹ năng thuyết trình chuyên nghiệp và tự tin trước đám đông.',
        category: 'Kỹ năng mềm',
        instructor: 'ThS. Speaker',
        duration: '3 Tuần',
        image: 'https://placehold.co/600x400.png',
        dataAiHint: 'presentation skills'
    },
    {
        id: '7',
        title: 'Phân tích Dữ liệu với Python',
        description: 'Học cách xử lý và phân tích dữ liệu sử dụng Python và các thư viện phổ biến.',
        category: 'Lập trình',
        instructor: 'TS. Data',
        duration: '8 Tuần',
        image: 'https://placehold.co/600x400.png',
        dataAiHint: 'data analysis python'
    },
    {
        id: '8',
        title: 'Quản lý Thời gian Hiệu quả',
        description: 'Các phương pháp và công cụ để quản lý thời gian và tăng năng suất làm việc.',
        category: 'Kỹ năng mềm',
        instructor: 'ThS. Time',
        duration: '4 Tuần',
        image: 'https://placehold.co/600x400.png',
        dataAiHint: 'time management'
    }
]; 