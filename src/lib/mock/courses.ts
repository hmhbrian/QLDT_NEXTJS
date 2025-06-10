import type { Course, CourseMaterial, Lesson, Test, Question } from '../types';
import { categoryOptions } from '../constants';

// --- Sample Lessons and Tests Data ---
const sampleLessons: Lesson[] = [
    { id: 'l1', title: 'Bài 1: Giới thiệu về JavaScript', contentType: 'video_url', content: 'https://www.youtube.com/watch?v=DHvZL2xTBNs', duration: '45 phút' },
    { id: 'l2', title: 'Bài 2: Biến và Kiểu dữ liệu', contentType: 'pdf_url', content: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', duration: '60 phút' },
    { id: 'l3', title: 'Bài 3: Hàm và Phạm vi', contentType: 'text', content: '### Hàm trong JavaScript\nMột hàm là một khối mã được thiết kế để thực hiện một tác vụ cụ thể...', duration: '75 phút' },
];

const sampleQuestions: Question[] = [
    { id: 'q1', text: 'JavaScript là ngôn ngữ gì?', options: ['Biên dịch', 'Thông dịch', 'Cả hai', 'Không phải cả hai'], correctAnswerIndex: 1 },
    { id: 'q2', text: '`let` và `const` được giới thiệu trong phiên bản JavaScript nào?', options: ['ES5', 'ES6 (ES2015)', 'ES7', 'ES2018'], correctAnswerIndex: 1 },
];

const sampleTests: Test[] = [
    { id: 't1', title: 'Kiểm tra cuối Chương 1', questions: sampleQuestions, passingScorePercentage: 70 },
    { id: 't2', title: 'Kiểm tra giữa kỳ', questions: [...sampleQuestions, { id: 'q3', text: '`typeof null` trả về gì?', options: ['object', 'null', 'undefined', 'string'], correctAnswerIndex: 0 }], passingScorePercentage: 70 },
];
// --- End Sample Data ---

// Mock Courses List for admin
export const mockCourses: Course[] = [
    {
        id: '1',
        title: 'JavaScript Nâng cao',
        courseCode: 'JS001',
        description: 'Tìm hiểu sâu về các tính năng JavaScript hiện đại và các phương pháp hay nhất.',
        objectives: 'Nắm vững ES6+, async/await, và các pattern hiện đại. Xây dựng ứng dụng thực tế với kiến thức đã học. Hiểu rõ về tối ưu hóa hiệu suất trong JavaScript.',
        category: 'programming',
        instructor: 'TS. Code',
        duration: {
            sessions: 12,
            hoursPerSession: 2
        },
        learningType: 'online',
        image: 'https://placehold.co/600x400.png',
        status: 'draft',
        department: ['it'],
        level: ['intern', 'probation'],
        startDate: '2024-08-01',
        endDate: '2024-09-15',
        location: 'https://meet.google.com/abc-xyz',
        materials: [
            {
                id: 'mat-js-001',
                type: 'pdf',
                title: 'Tài liệu JavaScript căn bản',
                url: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'
            },
            {
                id: 'mat-js-002',
                type: 'slide',
                title: 'Slide bài giảng tuần 1',
                url: 'https://placehold.co/800x600.png?text=Slide+Tuan+1'
            }
        ],
        lessons: sampleLessons.slice(0, 2),
        tests: [sampleTests[0]],
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        createdBy: '1',
        modifiedBy: '1',
        enrollmentType: 'optional',
        registrationDeadline: '2024-07-25',
        enrolledTrainees: ['3'],
        isPublic: true,
    },
    {
        id: '2',
        title: 'Nguyên tắc Quản lý Dự án',
        courseCode: 'PM001',
        description: 'Học các yếu tố cần thiết để quản lý dự án hiệu quả.',
        objectives: 'Nắm vững các nguyên tắc quản lý dự án và áp dụng vào thực tế. Lập kế hoạch, theo dõi và báo cáo tiến độ dự án. Quản lý rủi ro và các bên liên quan.',
        category: 'business',
        instructor: 'CN. Planner',
        duration: {
            sessions: 8,
            hoursPerSession: 2
        },
        learningType: 'online',
        image: 'https://placehold.co/600x400.png',
        status: 'published',
        department: ['hr'],
        level: ['employee', 'middle_manager'],
        startDate: '2024-09-01',
        endDate: '2024-09-30',
        location: 'https://meet.google.com/def-ghi',
        materials: [
            {
                id: 'mat-pm-001',
                type: 'pdf',
                title: 'Sổ tay quản lý dự án',
                url: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'
            }
        ],
        lessons: [
            { id: 'lpm1', title: 'Bài 1: Giới thiệu Quản lý dự án', contentType: 'video_url', content: 'https://www.youtube.com/watch?v=some_pm_video', duration: '30 phút' },
            { id: 'lpm2', title: 'Bài 2: Lập kế hoạch dự án', contentType: 'slide_url', content: 'https://placehold.co/800x600.png?text=Project+Planning+Slides', duration: '90 phút' },
        ],
        tests: [
            { id: 'tpm1', title: 'Kiểm tra kiến thức cơ bản QLDA', questions: [{ id: 'qpm1', text: 'PMP là viết tắt của gì?', options: ['Project Management Professional', 'Program Management Professional', 'Product Management Professional'], correctAnswerIndex: 0 }], passingScorePercentage: 75 }
        ],
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        createdBy: '1',
        modifiedBy: '1',
        enrollmentType: 'mandatory',
        enrolledTrainees: ['3'],
        isPublic: true,
    },
    {
        id: '3',
        title: 'Nguyên tắc Thiết kế UI/UX',
        courseCode: 'UI001',
        description: 'Nắm vững các nguyên tắc cốt lõi của thiết kế giao diện và trải nghiệm người dùng.',
        objectives: 'Hiểu và áp dụng các nguyên tắc thiết kế UI/UX vào thực tế. Tạo wireframes, prototypes và user flows. Thực hiện user testing và cải thiện thiết kế.',
        category: 'design',
        instructor: 'KS. Pixel',
        duration: {
            sessions: 16,
            hoursPerSession: 2
        },
        learningType: 'online',
        image: 'https://placehold.co/600x400.png',
        status: 'draft',
        department: ['it'],
        level: ['intern', 'probation'],
        startDate: '2024-10-01',
        endDate: '2024-11-30',
        location: 'https://meet.google.com/jkl-mno',
        materials: [
            {
                id: 'mat-ui-001',
                type: 'slide',
                title: 'Nguyên tắc vàng trong thiết kế UI',
                url: 'https://placehold.co/800x600.png?text=UI+Design+Principles'
            }
        ],
        lessons: [],
        tests: [],
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        createdBy: '1',
        modifiedBy: '1',
        enrollmentType: 'optional',
        registrationDeadline: '2024-09-20',
        isPublic: false,
    },
    {
        id: '4',
        title: 'Chiến lược Tiếp thị Kỹ thuật số',
        courseCode: 'MKT001',
        description: 'Phát triển và triển khai các chiến lược tiếp thị kỹ thuật số hiệu quả.',
        objectives: 'Xây dựng và triển khai chiến lược marketing số hiệu quả. Phân tích đối thủ và thị trường. Đo lường và tối ưu hóa chiến dịch.',
        category: 'marketing',
        instructor: 'CN. Click',
        duration: {
            sessions: 10,
            hoursPerSession: 2
        },
        learningType: 'online',
        image: 'https://placehold.co/600x400.png',
        status: 'archived',
        department: ['marketing'],
        level: ['employee', 'middle_manager'],
        startDate: '2024-07-01',
        endDate: '2024-08-10',
        location: 'https://meet.google.com/pqr-stu',
        materials: [
            {
                id: 'mat-mkt-001',
                type: 'link',
                title: 'Blog về Digital Marketing Trends',
                url: 'https://blog.hubspot.com/marketing/digital-marketing-trends'
            }
        ],
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        createdBy: '1',
        modifiedBy: '1',
        enrollmentType: 'mandatory',
        enrolledTrainees: [],
        isPublic: true,
    },
    {
        id: '5',
        title: 'Python cho Khoa học Dữ liệu',
        courseCode: 'PYDS001',
        description: 'Khám phá Python cho phân tích dữ liệu, học máy và trực quan hóa.',
        objectives: 'Sử dụng Pandas, NumPy, Matplotlib. Xây dựng mô hình học máy cơ bản. Trực quan hóa dữ liệu hiệu quả.',
        category: 'programming',
        instructor: 'Dr. Data',
        duration: { sessions: 15, hoursPerSession: 3 },
        learningType: 'online',
        image: 'https://placehold.co/600x400.png',
        status: 'published',
        department: ['it', 'operations'],
        level: ['employee', 'middle_manager'],
        startDate: '2024-09-05',
        endDate: '2024-11-20',
        location: 'https://zoom.us/j/python-ds',
        materials: [{ id: 'mat-pyds-001', type: 'link', title: 'Tài liệu Pandas chính thức', url: 'https://pandas.pydata.org/docs/' }],
        lessons: sampleLessons, // Using all sample lessons
        tests: sampleTests, // Using all sample tests
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        createdBy: 'admin',
        modifiedBy: 'admin',
        enrollmentType: 'optional',
        registrationDeadline: '2024-08-30',
        isPublic: true,
        enrolledTrainees: ['3']
    },
    {
        id: '6',
        title: 'Kỹ năng Giao tiếp Hiệu quả',
        courseCode: 'COMMS001',
        description: 'Nâng cao kỹ năng giao tiếp trong công việc và cuộc sống.',
        objectives: 'Lắng nghe chủ động. Trình bày ý tưởng rõ ràng. Giải quyết xung đột hiệu quả.',
        category: 'soft_skills',
        instructor: 'Chuyên gia Tâm lý',
        duration: { sessions: 6, hoursPerSession: 1.5 },
        learningType: 'online',
        image: 'https://placehold.co/600x400.png',
        status: 'published',
        department: ['hr', 'sales', 'marketing'],
        level: ['intern', 'probation', 'employee', 'middle_manager', 'senior_manager'], // All levels
        startDate: '2024-08-15',
        endDate: '2024-09-20',
        location: 'https://teams.microsoft.com/comms-skills',
        materials: [{ id: 'mat-comms-001', type: 'pdf', title: 'Sách: Giao tiếp không bạo lực', url: 'https://example.com/nvc.pdf' }],
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        createdBy: 'hr_user',
        modifiedBy: 'hr_user',
        enrollmentType: 'mandatory',
        isPublic: false, // Internal mandatory course
    }
];

// Mock Course Detail
export const mockCourseDetail: Course = {
    id: '1', // Matches one of the mockCourses for consistency
    title: 'JavaScript Nâng cao: Từ Cơ Bản Đến Chuyên Sâu',
    courseCode: 'JSADV001',
    description: 'Khóa học này cung cấp kiến thức toàn diện về JavaScript, từ các khái niệm cốt lõi đến các kỹ thuật nâng cao và các pattern thiết kế hiện đại. Bạn sẽ học cách viết code sạch, hiệu quả và dễ bảo trì.',
    objectives: `Sau khóa học, bạn sẽ có thể:
- Nắm vững các tính năng mới nhất của ES6+ (bao gồm let/const, arrow functions, classes, modules, destructuring, spread/rest operators).
- Hiểu sâu về cơ chế bất đồng bộ trong JavaScript: Promises, async/await.
- Áp dụng các design patterns phổ biến trong JavaScript.
- Kỹ thuật tối ưu hóa hiệu năng và gỡ lỗi (debugging) hiệu quả.
- Xây dựng một dự án nhỏ hoàn chỉnh để áp dụng kiến thức đã học.
- Tự tin làm việc với các framework JavaScript hiện đại như React, Angular, hoặc Vue.js.`,
    category: 'programming',
    instructor: 'TS. Code Master',
    duration: { sessions: 20, hoursPerSession: 2.5 },
    learningType: 'online',
    image: 'https://placehold.co/1200x400.png?text=JavaScript+Advanced+Banner',
    status: 'published',
    department: ['it', 'operations'],
    level: ['employee', 'middle_manager'],
    startDate: '2024-08-01',
    endDate: '2024-10-15',
    location: 'https://meet.google.com/js-advanced-class',
    materials: [
        {
            id: 'mat-jsadv-001',
            type: 'pdf',
            title: 'Giáo trình JavaScript Nâng cao (PDF)',
            url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        },
        {
            id: 'mat-jsadv-002',
            type: 'slide',
            title: 'Slide Bài 1: Tổng quan ES6+',
            url: 'https://placehold.co/800x600.png?text=ES6+Overview+Slides',
        },
        {
            id: 'mat-jsadv-003',
            type: 'video',
            title: 'Video: Xử lý bất đồng bộ với Promises',
            url: 'https://www.youtube.com/watch?v=DHvZL2xTBNs',
        },
        {
            id: 'mat-jsadv-004',
            type: 'link',
            title: 'Tài liệu tham khảo: MDN Web Docs - JavaScript',
            url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
        },
        {
            id: 'mat-jsadv-005',
            type: 'pdf',
            title: 'Bài tập thực hành Chương 1',
            url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        },
    ],
    lessons: sampleLessons,
    tests: sampleTests,
    maxParticipants: 30,
    prerequisites: [
        'Kiến thức cơ bản về JavaScript (biến, hàm, vòng lặp, điều kiện).',
        'Hiểu biết về HTML và CSS.',
        'Có kinh nghiệm làm việc với Git và các công cụ dòng lệnh là một lợi thế.'
    ],
    syllabus: [
        {
            title: 'Tuần 1-2: Ôn tập JavaScript Cơ bản & Giới thiệu ES6+',
            content: 'Tổng quan về khóa học. Cài đặt môi trường. Các khái niệm cơ bản của JS. Giới thiệu về let, const, arrow functions, template literals, default parameters, rest/spread operators.',
            duration: '2 tuần'
        },
        {
            title: 'Tuần 3-4: Lập trình Hướng đối tượng (OOP) với Classes & Modules',
            content: 'Classes, constructors, inheritance, static methods, getters/setters. JavaScript Modules: import/export.',
            duration: '2 tuần'
        },
        {
            title: 'Tuần 5-6: Xử lý Bất đồng bộ',
            content: 'Callbacks, Promises (then, catch, finally, Promise.all, Promise.race), Async/Await.',
            duration: '2 tuần'
        }
    ],
    slides: [
        {
            title: 'Bài giảng 1: ES6+ Overview',
            url: 'https://placehold.co/800x600.png?text=ES6+Slide+1',
            type: 'image' as 'pdf' | 'image',
        },
        {
            title: 'Bài giảng 2: Promises Deep Dive (PDF)',
            url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            type: 'pdf' as 'pdf' | 'image',
        }
    ],
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    createdBy: '1',
    modifiedBy: '1',
    enrollmentType: 'optional',
    registrationDeadline: '2024-07-25',
    enrolledTrainees: ['3'],
    isPublic: true,
};


// Mock My Courses for trainees
export const mockMyCourses = [
    {
        id: '1', // Matches mockCourseDetail and first course in mockCourses
        title: 'JavaScript Nâng cao',
        description: 'Nắm vững các tính năng JS hiện đại.',
        progress: 75,
        image: 'https://placehold.co/600x400.png',
        dataAiHint: 'laptop code',
        nextLesson: 'Tìm hiểu sâu về Async/Await'
    },
    {
        id: '2', // Matches second course in mockCourses
        title: 'Nguyên tắc Thiết kế UI/UX',
        description: 'Học cách tạo giao diện trực quan.',
        progress: 40,
        image: 'https://placehold.co/600x400.png',
        dataAiHint: 'mobile design',
        nextLesson: 'Tạo Persona Người dùng'
    },
    {
        id: '3', // Matches third course in mockCourses
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
    enrollmentType?: 'optional' | 'mandatory';
    registrationDeadline?: string | null;
    isPublic?: boolean; // Added to align with Course type
}

export const mockPublicCourses: PublicCourse[] = mockCourses
    .filter(course => course.isPublic) // Filter for public courses
    .map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        category: categoryOptions.find(c => c.value === course.category)?.label as PublicCourse['category'] || 'Lập trình',
        instructor: course.instructor,
        duration: `${course.duration.sessions} buổi (${course.duration.hoursPerSession}h/buổi)`,
        image: course.image,
        dataAiHint: course.category,
        enrollmentType: course.enrollmentType,
        registrationDeadline: course.registrationDeadline,
        isPublic: course.isPublic,
    }));
