import type { Course, Lesson } from "@/lib/types/course.types";
import type { Question, Test } from "@/lib/types/test.types";
import { categoryOptions } from "../config/constants";

// --- Sample Lessons and Tests Data ---
const sampleLessons: Lesson[] = [
  {
    id: 1,
    title: "Bài 1: Giới thiệu về JavaScript",
    type: "pdf_url",
    content:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    fileUrl:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    duration: "15 phút",
  },
  {
    id: 2,
    title: "Bài 2: Biến và Kiểu dữ liệu",
    type: "pdf_url",
    content:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    fileUrl:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    duration: "20 phút",
  },
  {
    id: 3,
    title: "Bài 3: Hàm và Phạm vi",
    type: "text",
    content: "Đây là nội dung văn bản cho bài học về hàm và phạm vi.",
    fileUrl: null,
    duration: "10 phút",
  },
];

const sampleQuestions: Question[] = [
  {
    id: 1,
    text: "JavaScript là ngôn ngữ gì?",
    options: ["Biên dịch", "Thông dịch", "Cả hai", "Không phải cả hai"],
    correctAnswerIndex: 1,
    correctAnswerIndexes: [1],
  },
  {
    id: 2,
    text: "`let` và `const` được giới thiệu trong phiên bản JavaScript nào?",
    options: ["ES5", "ES6 (ES2015)", "ES7", "ES2018"],
    correctAnswerIndex: 1,
    correctAnswerIndexes: [1],
  },
];

const sampleTests: Test[] = [
  {
    id: 1,
    title: "Kiểm tra cuối Chương 1",
    questions: sampleQuestions,
    passingScorePercentage: 70,
    isDone: false, // Ensure isDone is initialized
    timeTest: 30,
    countQuestion: sampleQuestions.length,
  },
  {
    id: 2,
    title: "Kiểm tra giữa kỳ",
    questions: [
      ...sampleQuestions,
      {
        id: 3,
        text: "`typeof null` trả về gì?",
        options: ["object", "null", "undefined", "string"],
        correctAnswerIndex: 0,
        correctAnswerIndexes: [0],
      },
    ],
    passingScorePercentage: 70,
    isDone: false, // Ensure isDone is initialized
    timeTest: 45,
    countQuestion: 3,
  },
];
// --- End Sample Data ---

// Mock Courses List for admin
export const mockCourses: Course[] = [
  {
    id: "1",
    title: "JavaScript Nâng cao",
    courseCode: "JS001",
    description:
      "Tìm hiểu sâu về các tính năng JavaScript hiện đại và các phương pháp hay nhất.",
    objectives:
      "Nắm vững ES6+, async/await, và các pattern hiện đại. Xây dựng ứng dụng thực tế với kiến thức đã học. Hiểu rõ về tối ưu hóa hiệu suất trong JavaScript.",
    category: { id: 1, categoryName: "Lập trình" }, // Fixed type
    instructor: "TS. Code",
    duration: {
      sessions: 12,
      hoursPerSession: 2,
    },
    learningType: "online",
    image: "https://placehold.co/600x400.png",
    status: "Lưu nháp",
    department: ["it"],
    level: ["intern", "probation"],
    departments: [{ departmentId: 1, departmentName: "IT" }], // Added
    eLevels: [
      { eLevelId: 1, eLevelName: "Thực tập" },
      { eLevelId: 2, eLevelName: "Thử việc" },
    ], // Added
    startDate: "2024-08-01",
    endDate: "2024-09-15",
    location: "https://meet.google.com/abc-xyz",
    materials: [
      {
        id: 201,
        courseId: "1",
        type: "PDF",
        title: "Tài liệu JavaScript căn bản",
        link: "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf",
        createdAt: new Date().toISOString(),
        modifiedAt: null,
      },
      {
        id: 202,
        courseId: "1",
        type: "Link",
        title: "Slide bài giảng tuần 1",
        link: "https://placehold.co/800x600.png?text=Slide+Tuan+1",
        createdAt: new Date().toISOString(),
        modifiedAt: null,
      },
    ],
    lessons: sampleLessons.slice(0, 2),
    tests: [sampleTests[0]],
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    createdBy: "1",
    modifiedBy: "1",
    enrollmentType: "optional",
    registrationStartDate: "2024-07-15",
    registrationDeadline: "2024-07-25",
    userIds: ["3"],
    isPrivate: true,
    maxParticipants: 25,
  },
  {
    id: "2",
    title: "Nguyên tắc Quản lý Dự án",
    courseCode: "PM001",
    description: "Học các yếu tố cần thiết để quản lý dự án hiệu quả.",
    objectives:
      "Nắm vững các nguyên tắc quản lý dự án và áp dụng vào thực tế. Lập kế hoạch, theo dõi và báo cáo tiến độ dự án. Quản lý rủi ro và các bên liên quan.",
    category: { id: 2, categoryName: "Kinh doanh" }, // Fixed type
    instructor: "CN. Planner",
    duration: {
      sessions: 8,
      hoursPerSession: 2,
    },
    learningType: "online",
    image: "https://placehold.co/600x400.png",
    status: "Đang mở",
    department: ["hr"],
    level: ["employee", "middle_manager"],
    departments: [{ departmentId: 2, departmentName: "HR" }], // Added
    eLevels: [
      { eLevelId: 3, eLevelName: "Nhân viên" },
      { eLevelId: 4, eLevelName: "Quản lý cấp trung" },
    ], // Added
    startDate: "2024-09-01",
    endDate: "2024-09-30",
    location: "https://meet.google.com/def-ghi",
    materials: [
      {
        id: 203,
        courseId: "2",
        type: "PDF",
        title: "Sổ tay quản lý dự án",
        link: "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf",
        createdAt: new Date().toISOString(),
        modifiedAt: null,
      },
    ],
    lessons: [],
    tests: [],
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    createdBy: "1",
    modifiedBy: "1",
    enrollmentType: "mandatory",
    userIds: ["3"],
    isPrivate: true,
    registrationStartDate: null,
    registrationDeadline: null,
    maxParticipants: 50,
  },
  {
    id: "3",
    title: "Nguyên tắc Thiết kế UI/UX",
    courseCode: "UI001",
    description:
      "Nắm vững các nguyên tắc cốt lõi của thiết kế giao diện và trải nghiệm người dùng.",
    objectives:
      "Hiểu và áp dụng các nguyên tắc thiết kế UI/UX vào thực tế. Tạo wireframes, prototypes và user flows. Thực hiện user testing và cải thiện thiết kế.",
    category: { id: 3, categoryName: "Thiết kế" }, // Fixed type
    instructor: "KS. Pixel",
    duration: {
      sessions: 16,
      hoursPerSession: 2,
    },
    learningType: "online",
    image: "https://placehold.co/600x400.png",
    status: "Lưu nháp",
    department: ["it"],
    level: ["intern", "probation"],
    departments: [{ departmentId: 1, departmentName: "IT" }], // Added
    eLevels: [
      { eLevelId: 1, eLevelName: "Thực tập" },
      { eLevelId: 2, eLevelName: "Thử việc" },
    ], // Added
    startDate: "2024-10-01",
    endDate: "2024-11-30",
    location: "https://meet.google.com/jkl-mno",
    materials: [],
    lessons: [],
    tests: [],
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    createdBy: "1",
    modifiedBy: "1",
    enrollmentType: "optional",
    registrationStartDate: "2024-09-01",
    registrationDeadline: "2024-09-20",
    isPrivate: false,
    userIds: [],
    maxParticipants: 20,
  },
  {
    id: "4",
    title: "Chiến lược Tiếp thị Kỹ thuật số",
    courseCode: "MKT001",
    description:
      "Phát triển và triển khai các chiến lược tiếp thị kỹ thuật số hiệu quả.",
    objectives:
      "Xây dựng và triển khai chiến lược marketing số hiệu quả. Phân tích đối thủ và thị trường. Đo lường và tối ưu hóa chiến dịch.",
    category: { id: 4, categoryName: "Tiếp thị" }, // Fixed type
    instructor: "CN. Click",
    duration: { sessions: 10, hoursPerSession: 2 },
    learningType: "online",
    image: "https://placehold.co/600x400.png",
    status: "Hủy",
    department: ["marketing"],
    level: ["employee", "middle_manager"],
    departments: [{ departmentId: 5, departmentName: "Marketing" }], // Added
    eLevels: [
      { eLevelId: 3, eLevelName: "Nhân viên" },
      { eLevelId: 4, eLevelName: "Quản lý cấp trung" },
    ], // Added
    startDate: "2024-07-01",
    endDate: "2024-08-10",
    location: "https://meet.google.com/pqr-stu",
    materials: [],
    lessons: [],
    tests: [],
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    createdBy: "1",
    modifiedBy: "1",
    enrollmentType: "mandatory",
    userIds: [],
    isPrivate: true,
    registrationStartDate: null,
    registrationDeadline: null,
    maxParticipants: 100,
  },
  {
    id: "5",
    title: "Python cho Khoa học Dữ liệu",
    courseCode: "PYDS001",
    description:
      "Khám phá Python cho phân tích dữ liệu, học máy và trực quan hóa.",
    objectives:
      "Sử dụng Pandas, NumPy, Matplotlib. Xây dựng mô hình học máy cơ bản. Trực quan hóa dữ liệu hiệu quả.",
    category: { id: 1, categoryName: "Lập trình" }, // Fixed type
    instructor: "Dr. Data",
    duration: { sessions: 15, hoursPerSession: 3 },
    learningType: "online",
    image: "https://placehold.co/600x400.png",
    status: "Đang mở",
    department: ["it", "operations"],
    level: ["employee", "middle_manager"],
    departments: [
      { departmentId: 1, departmentName: "IT" },
      { departmentId: 6, departmentName: "Vận hành" },
    ], // Added
    eLevels: [
      { eLevelId: 3, eLevelName: "Nhân viên" },
      { eLevelId: 4, eLevelName: "Quản lý cấp trung" },
    ], // Added
    startDate: "2024-09-05",
    endDate: "2024-11-20",
    location: "https://zoom.us/j/python-ds",
    materials: [],
    lessons: sampleLessons,
    tests: sampleTests,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    createdBy: "ADMIN",
    modifiedBy: "ADMIN",
    enrollmentType: "optional",
    registrationStartDate: "2024-08-15",
    registrationDeadline: "2024-08-30",
    isPrivate: true,
    userIds: ["3"],
    maxParticipants: 30,
  },
  {
    id: "6",
    title: "Kỹ năng Giao tiếp Hiệu quả",
    courseCode: "COMMS001",
    description: "Nâng cao kỹ năng giao tiếp trong công việc và cuộc sống.",
    objectives:
      "Lắng nghe chủ động. Trình bày ý tưởng rõ ràng. Giải quyết xung đột hiệu quả.",
    category: { id: 5, categoryName: "Kỹ năng mềm" }, // Fixed type
    instructor: "Chuyên gia Tâm lý",
    duration: { sessions: 6, hoursPerSession: 1.5 },
    learningType: "online",
    image: "https://placehold.co/600x400.png",
    status: "Đang mở",
    department: ["hr", "sales", "marketing"],
    level: [
      "intern",
      "probation",
      "employee",
      "middle_manager",
      "senior_manager",
    ],
    departments: [
      { departmentId: 2, departmentName: "HR" },
      { departmentId: 4, departmentName: "Kinh doanh" },
      { departmentId: 5, departmentName: "Marketing" },
    ], // Added
    eLevels: [
      { eLevelId: 1, eLevelName: "Thực tập" },
      { eLevelId: 2, eLevelName: "Thử việc" },
      { eLevelId: 3, eLevelName: "Nhân viên" },
      { eLevelId: 4, eLevelName: "Quản lý cấp trung" },
      { eLevelId: 5, eLevelName: "Quản lý cấp cao" },
    ], // Added
    startDate: "2024-08-15",
    endDate: "2024-09-20",
    location: "https://teams.microsoft.com/comms-skills",
    materials: [],
    lessons: [],
    tests: [],
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    createdBy: "hr_user",
    modifiedBy: "hr_user",
    enrollmentType: "mandatory",
    isPrivate: false,
    registrationStartDate: null,
    registrationDeadline: null,
    userIds: [],
    maxParticipants: 40,
  },
];

// Mock Course Detail
export const mockCourseDetail: Course = {
  id: "1", // Matches one of the mockCourses for consistency
  title: "JavaScript Nâng cao: Từ Cơ Bản Đến Chuyên Sâu",
  courseCode: "JSADV001",
  description:
    "Khóa học này cung cấp kiến thức toàn diện về JavaScript, từ các khái niệm cốt lõi đến các kỹ thuật nâng cao và các pattern thiết kế hiện đại. Bạn sẽ học cách viết code sạch, hiệu quả và dễ bảo trì.",
  objectives: `Sau khóa học, bạn sẽ có thể:
- Nắm vững các tính năng mới nhất của ES6+ (bao gồm let/const, arrow functions, classes, modules, destructuring, spread/rest operators).
- Hiểu sâu về cơ chế bất đồng bộ trong JavaScript: Promises, async/await.
- Áp dụng các design patterns phổ biến trong JavaScript.
- Kỹ thuật tối ưu hóa hiệu năng và gỡ lỗi (debugging) hiệu quả.
- Xây dựng một dự án nhỏ hoàn chỉnh để áp dụng kiến thức đã học.
- Tự tin làm việc với các framework JavaScript hiện đại như React, Angular, hoặc Vue.js.`,
  category: { id: 1, categoryName: "Lập trình" }, // Fixed type
  instructor: "TS. Code Master",
  duration: { sessions: 20, hoursPerSession: 2.5 },
  learningType: "online",
  image: "https://placehold.co/1200x400.png?text=JavaScript+Advanced+Banner",
  status: "Đang mở",
  department: ["it", "operations"],
  level: ["employee", "middle_manager"],
  departments: [
    { departmentId: 1, departmentName: "IT" },
    { departmentId: 6, departmentName: "Vận hành" },
  ], // Added
  eLevels: [
    { eLevelId: 3, eLevelName: "Nhân viên" },
    { eLevelId: 4, eLevelName: "Quản lý cấp trung" },
  ], // Added
  startDate: "2024-08-01",
  endDate: "2024-10-15",
  location: "https://meet.google.com/js-advanced-class",
  materials: [
    {
      id: 801,
      courseId: "1",
      type: "PDF",
      title: "Giáo trình JavaScript Nâng cao (PDF)",
      link: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      createdAt: new Date().toISOString(),
      modifiedAt: null,
    },
    {
      id: 802,
      courseId: "1",
      type: "Link",
      title: "Slide Bài 1: Tổng quan ES6+",
      link: "https://placehold.co/800x600.png?text=ES6+Overview+Slides",
      createdAt: new Date().toISOString(),
      modifiedAt: null,
    },
  ],
  lessons: sampleLessons,
  tests: sampleTests,
  maxParticipants: 30,
  createdAt: new Date().toISOString(),
  modifiedAt: new Date().toISOString(),
  createdBy: "1",
  modifiedBy: "1",
  enrollmentType: "optional",
  registrationStartDate: "2024-07-01",
  registrationDeadline: "2024-07-25",
  userIds: ["3"],
  isPrivate: true,
};

// Mock My Courses for trainees
export const mockMyCourses = [
  {
    id: "1", // Matches mockCourseDetail and first course in mockCourses
    title: "JavaScript Nâng cao",
    description: "Nắm vững các tính năng JS hiện đại.",
    progress: 75,
    image: "https://placehold.co/600x400.png",
    dataAiHint: "laptop code",
    nextLesson: "Tìm hiểu sâu về Async/Await",
  },
  {
    id: "2", // Matches second course in mockCourses
    title: "Nguyên tắc Thiết kế UI/UX",
    description: "Học cách tạo giao diện trực quan.",
    progress: 40,
    image: "https://placehold.co/600x400.png",
    dataAiHint: "mobile design",
    nextLesson: "Tạo Persona Người dùng",
  },
  {
    id: "3", // Matches third course in mockCourses
    title: "Chiến lược Tiếp thị Kỹ thuật số",
    description: "Phát triển chiến lược trực tuyến hiệu quả.",
    progress: 100,
    image: "https://placehold.co/600x400.png",
    dataAiHint: "social media analytics",
    nextLesson: "Khóa học đã hoàn thành",
  },
];

// Mock Public Courses List
export interface PublicCourse {
  id: string;
  title: string;
  description: string;
  category: { id: number; categoryName: string }; // Changed to object type
  instructor: string;
  duration: string; // Added
  image: string; // Added
  dataAiHint?: string;
  enrollmentType?: "optional" | "mandatory" | "";
  registrationDeadline?: string | null;
  isPublic?: boolean;
  userIds?: string[];
}

export const mockPublicCourses: PublicCourse[] = mockCourses
  .filter((course) => course.isPrivate) // Filter for public courses
  .map((course) => ({
    id: course.id,
    title: course.title,
    description: course.description,
    category: course.category as { id: number; categoryName: string }, // Cast to the correct type
    instructor: course.instructor,
    duration: `${course.duration.sessions} buổi (${course.duration.hoursPerSession}h/buổi)`,
    image: course.image,
    dataAiHint: course.category?.categoryName || "Lập trình", // Ensure dataAiHint is a string
    enrollmentType: course.enrollmentType,
    registrationDeadline: course.registrationDeadline,
    isPrivate: course.isPrivate,
    userIds: course.userIds,
  }));
