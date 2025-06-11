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
            {
                id: 'tpm1',
                title: 'Kiểm tra kiến thức cơ bản Quản lý dự án',
                questions: [
                    {
                        id: 'qpm1',
                        text: 'PMP là viết tắt của gì?',
                        options: [
                            'Project Management Professional',
                            'Program Management Professional',
                            'Product Management Professional',
                            'Performance Management Professional'
                        ],
                        correctAnswerIndex: 0,
                        explanation: 'PMP (Project Management Professional) là chứng chỉ quản lý dự án được công nhận trên toàn cầu, do Viện Quản lý Dự án (PMI) cấp.'
                    },
                    {
                        id: 'qpm2',
                        text: 'Tam giác ràng buộc trong quản lý dự án bao gồm những yếu tố nào?',
                        options: [
                            'Chi phí, Thời gian, Phạm vi',
                            'Con người, Quy trình, Công nghệ',
                            'Kế hoạch, Thực hiện, Giám sát',
                            'Rủi ro, Chất lượng, Tài nguyên'
                        ],
                        correctAnswerIndex: 0,
                        explanation: 'Tam giác ràng buộc (Triple Constraint) trong quản lý dự án bao gồm Chi phí (Cost), Thời gian (Time) và Phạm vi (Scope). Khi một yếu tố thay đổi, các yếu tố khác cũng bị ảnh hưởng.'
                    },
                    {
                        id: 'qpm3',
                        text: 'Phương pháp quản lý dự án Agile phù hợp nhất với loại dự án nào?',
                        options: [
                            'Dự án có yêu cầu thay đổi thường xuyên và cần phản hồi nhanh',
                            'Dự án quy mô lớn với yêu cầu ổn định và rõ ràng từ đầu',
                            'Dự án xây dựng cơ sở hạ tầng',
                            'Dự án cần tuân thủ quy định nghiêm ngặt'
                        ],
                        correctAnswerIndex: 0,
                        explanation: 'Phương pháp Agile phù hợp với các dự án có yêu cầu thay đổi thường xuyên và cần phản hồi nhanh chóng, như phát triển phần mềm. Agile tập trung vào việc linh hoạt, thích ứng và cung cấp giá trị sớm.'
                    },
                    {
                        id: 'qpm4',
                        text: 'Biểu đồ Gantt được sử dụng để làm gì trong quản lý dự án?',
                        options: [
                            'Lập kế hoạch và theo dõi tiến độ công việc theo thời gian',
                            'Phân tích rủi ro dự án',
                            'Quản lý ngân sách dự án',
                            'Phân công nhiệm vụ cho thành viên dự án'
                        ],
                        correctAnswerIndex: 0,
                        explanation: 'Biểu đồ Gantt là công cụ trực quan để lập kế hoạch dự án, hiển thị các nhiệm vụ, thời gian bắt đầu và kết thúc, cũng như mối quan hệ giữa các nhiệm vụ theo dòng thời gian.'
                    },
                    {
                        id: 'qpm5',
                        text: 'Quản lý rủi ro trong dự án bao gồm những bước nào?',
                        options: [
                            'Nhận diện, Phân tích, Lập kế hoạch ứng phó, Giám sát rủi ro',
                            'Lập ngân sách, Phân bổ nguồn lực, Theo dõi chi phí',
                            'Thu thập yêu cầu, Xác định phạm vi, Tạo WBS',
                            'Lập kế hoạch, Thực hiện, Kiểm tra, Điều chỉnh'
                        ],
                        correctAnswerIndex: 0,
                        explanation: 'Quản lý rủi ro bao gồm việc nhận diện các rủi ro tiềm ẩn, phân tích mức độ ảnh hưởng và khả năng xảy ra, lập kế hoạch ứng phó, và giám sát rủi ro trong suốt vòng đời dự án.'
                    }
                ],
                passingScorePercentage: 80
            },
            {
                id: 'tpm2',
                title: 'Kiểm tra kiến thức nâng cao Quản lý dự án',
                questions: [
                    {
                        id: 'qpm6',
                        text: 'Phương pháp đường găng (Critical Path Method) được sử dụng để:',
                        options: [
                            'Xác định chuỗi hoạt động quan trọng nhất quyết định thời gian hoàn thành dự án',
                            'Phân tích chi phí lợi ích của dự án',
                            'Lập kế hoạch truyền thông dự án',
                            'Tối ưu hóa phân bổ nguồn lực'
                        ],
                        correctAnswerIndex: 0,
                        explanation: 'Phương pháp đường găng (Critical Path Method - CPM) xác định chuỗi các hoạt động có tổng thời gian dài nhất, quyết định thời gian tối thiểu cần thiết để hoàn thành dự án.'
                    },
                    {
                        id: 'qpm7',
                        text: 'PERT trong quản lý dự án là viết tắt của:',
                        options: [
                            'Program Evaluation and Review Technique',
                            'Project Execution and Review Timing',
                            'Performance Evaluation and Risk Tracking',
                            'Project Estimation and Resource Timing'
                        ],
                        correctAnswerIndex: 0,
                        explanation: 'PERT (Program Evaluation and Review Technique) là kỹ thuật phân tích dùng để lập kế hoạch và kiểm soát dự án, đặc biệt hữu ích khi thời gian thực hiện các công việc không chắc chắn.'
                    },
                    {
                        id: 'qpm8',
                        text: 'Trong quản lý dự án, EVM là viết tắt của gì và nó đo lường điều gì?',
                        options: [
                            'Earned Value Management, đo lường hiệu suất chi phí và tiến độ dự án',
                            'Estimated Value Matrix, đo lường giá trị dự kiến của dự án',
                            'Expected Variance Method, đo lường độ lệch dự kiến của dự án',
                            'Executive Value Metrics, đo lường giá trị cấp quản lý'
                        ],
                        correctAnswerIndex: 0,
                        explanation: 'EVM (Earned Value Management) là phương pháp quản lý giá trị thu được, giúp đo lường hiệu suất chi phí và tiến độ của dự án, so sánh công việc đã hoàn thành với kế hoạch ban đầu.'
                    },
                    {
                        id: 'qpm9',
                        text: 'WBS trong quản lý dự án đại diện cho:',
                        options: [
                            'Work Breakdown Structure - Cấu trúc phân chia công việc',
                            'Work Budget System - Hệ thống ngân sách công việc',
                            'Workflow Business System - Hệ thống quy trình công việc',
                            'Weekly Backup Schedule - Lịch sao lưu hàng tuần'
                        ],
                        correctAnswerIndex: 0,
                        explanation: 'WBS (Work Breakdown Structure) là cấu trúc phân chia công việc, một công cụ phân tích phạm vi dự án bằng cách chia nhỏ công việc thành các gói công việc có thể quản lý được.'
                    },
                    {
                        id: 'qpm10',
                        text: 'Các bên liên quan (stakeholders) trong dự án là:',
                        options: [
                            'Tất cả các cá nhân, nhóm hoặc tổ chức có thể ảnh hưởng hoặc bị ảnh hưởng bởi dự án',
                            'Chỉ những người trực tiếp làm việc trong dự án',
                            'Chỉ nhà tài trợ và khách hàng của dự án',
                            'Chỉ ban quản lý cấp cao của tổ chức'
                        ],
                        correctAnswerIndex: 0,
                        explanation: 'Các bên liên quan (stakeholders) bao gồm tất cả những ai có thể ảnh hưởng hoặc bị ảnh hưởng bởi dự án, như nhóm dự án, khách hàng, nhà tài trợ, người dùng cuối, nhà cung cấp, v.v.'
                    }
                ],
                passingScorePercentage: 70
            }
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
        tests: [
            {
                id: 'tuiux1',
                title: 'Kiểm tra kiến thức Nguyên tắc Thiết kế UI/UX',
                questions: [
                    {
                        id: 'quiux1',
                        text: 'Nguyên tắc nào yêu cầu các thành phần liên quan đến nhau nên được đặt gần nhau?',
                        options: [
                            'Nguyên tắc gần nhau (Proximity)',
                            'Nguyên tắc đối xứng (Symmetry)',
                            'Nguyên tắc tương phản (Contrast)',
                            'Nguyên tắc lặp lại (Repetition)'
                        ],
                        correctAnswerIndex: 0,
                        explanation: 'Nguyên tắc gần nhau (Proximity) trong thiết kế UI/UX cho rằng các phần tử liên quan đến nhau nên được đặt gần nhau, tạo sự liên kết trực quan và giúp người dùng hiểu được mối quan hệ giữa các phần tử.'
                    },
                    {
                        id: 'quiux2',
                        text: 'Định luật Hick trong UX đề cập đến:',
                        options: [
                            'Thời gian đưa ra quyết định tăng theo số lượng lựa chọn',
                            'Khả năng nhận biết lỗi của người dùng',
                            'Tầm quan trọng của khoảng trắng trong thiết kế',
                            'Nguyên tắc thiết kế phẳng'
                        ],
                        correctAnswerIndex: 0,
                        explanation: 'Định luật Hick (Hick\'s Law) phát biểu rằng thời gian cần thiết để đưa ra quyết định tăng theo logarit của số lượng lựa chọn. Điều này giải thích tại sao giao diện đơn giản, ít lựa chọn thường dễ sử dụng hơn.'
                    },
                    {
                        id: 'quiux3',
                        text: 'Khái niệm "affordance" trong thiết kế UI/UX là gì?',
                        options: [
                            'Các thuộc tính của đối tượng cho người dùng biết cách tương tác với nó',
                            'Khả năng tùy chỉnh giao diện theo sở thích cá nhân',
                            'Tốc độ phản hồi của hệ thống khi người dùng tương tác',
                            'Tính nhất quán trong thiết kế giao diện'
                        ],
                        correctAnswerIndex: 0,
                        explanation: 'Affordance là các thuộc tính của một đối tượng cho người dùng biết cách họ có thể tương tác với nó. Ví dụ, nút có hình dạng và bóng đổ gợi ý rằng nó có thể được nhấn.'
                    },
                    {
                        id: 'quiux4',
                        text: 'Nguyên tắc nào tập trung vào việc loại bỏ các yếu tố không cần thiết trong thiết kế?',
                        options: [
                            'Nguyên tắc tối giản (Minimalism)',
                            'Nguyên tắc nhất quán (Consistency)',
                            'Nguyên tắc phản hồi (Feedback)',
                            'Nguyên tắc khả dụng (Usability)'
                        ],
                        correctAnswerIndex: 0,
                        explanation: 'Nguyên tắc tối giản (Minimalism) tập trung vào việc loại bỏ các yếu tố không cần thiết và giữ lại những gì thực sự quan trọng. Điều này giúp giảm nhiễu thông tin và cải thiện trải nghiệm người dùng.'
                    },
                    {
                        id: 'quiux5',
                        text: 'Bản phác thảo độ trung thành thấp (low-fidelity wireframe) thường được sử dụng để:',
                        options: [
                            'Khám phá và truyền đạt ý tưởng ban đầu về bố cục và cấu trúc',
                            'Trình bày thiết kế cuối cùng cho khách hàng',
                            'Kiểm tra chức năng của ứng dụng',
                            'Trình bày chi tiết màu sắc và hình ảnh'
                        ],
                        correctAnswerIndex: 0,
                        explanation: 'Bản phác thảo độ trung thành thấp (low-fidelity wireframe) thường được sử dụng trong giai đoạn đầu của quá trình thiết kế để khám phá và truyền đạt ý tưởng về bố cục, cấu trúc và luồng thông tin, mà không tập trung vào chi tiết thẩm mỹ.'
                    }
                ],
                passingScorePercentage: 70
            },
            {
                id: 'tuiux2',
                title: 'Kiểm tra kiến thức nâng cao về UI/UX',
                questions: [
                    {
                        id: 'quiux6',
                        text: 'Nguyên tắc thiết kế nào tập trung vào việc tạo ra giao diện thân thiện cho người khuyết tật?',
                        options: [
                            'Thiết kế bao gồm (Inclusive Design)',
                            'Thiết kế phẳng (Flat Design)',
                            'Thiết kế đáp ứng (Responsive Design)',
                            'Thiết kế Material'
                        ],
                        correctAnswerIndex: 0,
                        explanation: 'Thiết kế bao gồm (Inclusive Design) là phương pháp thiết kế tập trung vào việc tạo ra sản phẩm và dịch vụ có thể tiếp cận được với nhiều người nhất có thể, bao gồm cả người khuyết tật và người có nhu cầu đặc biệt.'
                    },
                    {
                        id: 'quiux7',
                        text: 'Quá trình "Information Architecture" trong UX design liên quan đến:',
                        options: [
                            'Tổ chức và cấu trúc thông tin để giúp người dùng tìm kiếm và hiểu dễ dàng',
                            'Thiết kế giao diện đồ họa và màu sắc',
                            'Phát triển các tính năng tương tác',
                            'Tối ưu hóa hiệu suất trang web'
                        ],
                        correctAnswerIndex: 0,
                        explanation: 'Information Architecture (Kiến trúc thông tin) liên quan đến việc tổ chức, cấu trúc và gắn nhãn nội dung trong hệ thống để giúp người dùng tìm kiếm thông tin và hoàn thành nhiệm vụ dễ dàng hơn.'
                    },
                    {
                        id: 'quiux8',
                        text: 'A/B Testing trong thiết kế UX được sử dụng để:',
                        options: [
                            'So sánh hai phiên bản của một trang hoặc tính năng để xác định phiên bản nào hiệu quả hơn',
                            'Kiểm tra tốc độ tải trang trên các trình duyệt khác nhau',
                            'Đánh giá chất lượng code của giao diện người dùng',
                            'Kiểm tra tính tương thích trên các thiết bị khác nhau'
                        ],
                        correctAnswerIndex: 0,
                        explanation: 'A/B Testing là phương pháp so sánh hai phiên bản của một trang web hoặc ứng dụng để xác định phiên bản nào tạo ra kết quả tốt hơn dựa trên các chỉ số quan trọng như tỷ lệ chuyển đổi hoặc thời gian sử dụng.'
                    },
                    {
                        id: 'quiux9',
                        text: 'Khái niệm "dark patterns" trong thiết kế UI/UX là gì?',
                        options: [
                            'Các kỹ thuật thiết kế giao diện đánh lừa người dùng làm điều họ không muốn',
                            'Giao diện sử dụng chế độ tối (dark mode) để giảm mỏi mắt',
                            'Các mẫu thiết kế chỉ hiển thị tốt trong điều kiện ánh sáng thấp',
                            'Các trang đăng nhập được bảo mật cao'
                        ],
                        correctAnswerIndex: 0,
                        explanation: 'Dark patterns là các kỹ thuật thiết kế giao diện người dùng được thiết kế để đánh lừa hoặc thao túng người dùng làm những việc họ không có ý định làm, như đăng ký dịch vụ trả phí hoặc chia sẻ thông tin cá nhân.'
                    },
                    {
                        id: 'quiux10',
                        text: 'Nguyên tắc "Progressive Disclosure" trong thiết kế UX đề cập đến:',
                        options: [
                            'Hiển thị thông tin theo từng giai đoạn, chỉ khi người dùng cần',
                            'Tải dần các phần của trang web để cải thiện tốc độ',
                            'Hiện thị thanh tiến trình cho người dùng biết họ đang ở đâu trong quy trình',
                            'Tiết lộ thông tin bảo mật theo thời gian'
                        ],
                        correctAnswerIndex: 0,
                        explanation: 'Progressive Disclosure (Tiết lộ tiến bộ) là kỹ thuật thiết kế giúp quản lý độ phức tạp của giao diện bằng cách chỉ hiển thị thông tin và chức năng cần thiết tại thời điểm đó, giảm quá tải thông tin cho người dùng.'
                    }
                ],
                passingScorePercentage: 75
            }
        ],
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
        tests: [
            {
                id: 'tpyds1',
                title: 'Kiểm tra kiến thức Python cho Khoa học Dữ liệu',
                questions: [
                    {
                        id: 'qpyds1',
                        text: 'Thư viện nào trong Python thường được sử dụng để xử lý dữ liệu dạng bảng?',
                        options: [
                            'Pandas',
                            'Matplotlib',
                            'TensorFlow',
                            'BeautifulSoup'
                        ],
                        correctAnswerIndex: 0,
                        explanation: 'Pandas là thư viện Python phổ biến nhất cho việc xử lý và phân tích dữ liệu dạng bảng. Nó cung cấp các cấu trúc dữ liệu mạnh mẽ như DataFrame và Series.'
                    },
                    {
                        id: 'qpyds2',
                        text: 'NumPy array khác với Python list thông thường ở điểm nào?',
                        options: [
                            'NumPy array có hiệu suất cao hơn và chiếm ít bộ nhớ hơn cho các phép tính số học',
                            'Python list không thể chứa dữ liệu số học',
                            'NumPy array không thể thay đổi kích thước sau khi tạo',
                            'Python list không hỗ trợ phép lập chỉ mục (indexing)'
                        ],
                        correctAnswerIndex: 0,
                        explanation: 'NumPy array được tối ưu hóa cho các phép tính số học, có hiệu suất cao hơn và chiếm ít bộ nhớ hơn so với Python list thông thường, đặc biệt khi làm việc với dữ liệu lớn.'
                    },
                    {
                        id: 'qpyds3',
                        text: 'Để trực quan hóa dữ liệu trong Python, thư viện nào thường được sử dụng?',
                        options: [
                            'Matplotlib và Seaborn',
                            'NumPy và SciPy',
                            'Flask và Django',
                            'Requests và BeautifulSoup'
                        ],
                        correctAnswerIndex: 0,
                        explanation: 'Matplotlib là thư viện trực quan hóa cơ bản trong Python, trong khi Seaborn xây dựng trên Matplotlib và cung cấp giao diện cấp cao hơn với các biểu đồ thống kê mặc định đẹp mắt.'
                    },
                    {
                        id: 'qpyds4',
                        text: 'Câu lệnh nào dùng để đọc tệp CSV vào DataFrame trong Pandas?',
                        options: [
                            'pd.read_csv()',
                            'pd.load_csv()',
                            'pd.import_csv()',
                            'pd.open_csv()'
                        ],
                        correctAnswerIndex: 0,
                        explanation: 'pd.read_csv() là hàm Pandas dùng để đọc dữ liệu từ tệp CSV vào DataFrame. Hàm này có nhiều tham số để tùy chỉnh cách đọc dữ liệu.'
                    },
                    {
                        id: 'qpyds5',
                        text: 'Trong Scikit-learn, phương thức nào được sử dụng để chia dữ liệu thành tập huấn luyện và tập kiểm tra?',
                        options: [
                            'train_test_split()',
                            'split_data()',
                            'data_partition()',
                            'create_test_train()'
                        ],
                        correctAnswerIndex: 0,
                        explanation: 'train_test_split() là hàm từ module model_selection của Scikit-learn, dùng để chia tập dữ liệu thành các phần riêng biệt để huấn luyện và kiểm tra mô hình học máy.'
                    }
                ],
                passingScorePercentage: 80
            },
            {
                id: 'tpyds2',
                title: 'Kiểm tra kiến thức nâng cao Python cho Khoa học Dữ liệu',
                questions: [
                    {
                        id: 'qpyds6',
                        text: 'Kỹ thuật nào được sử dụng để xử lý giá trị bị thiếu (missing values) trong DataFrame?',
                        options: [
                            'Imputation (thay thế bằng giá trị trung bình, trung vị hoặc giá trị phổ biến nhất)',
                            'Loại bỏ tất cả các hàng có giá trị bị thiếu',
                            'Loại bỏ tất cả các cột có giá trị bị thiếu',
                            'Chỉ sử dụng các giá trị không bị thiếu cho việc huấn luyện mô hình'
                        ],
                        correctAnswerIndex: 0,
                        explanation: 'Imputation là kỹ thuật thay thế giá trị bị thiếu bằng các giá trị ước tính như giá trị trung bình, trung vị hoặc giá trị phổ biến nhất của cột. Đây là phương pháp phổ biến để xử lý missing values trong khoa học dữ liệu.'
                    },
                    {
                        id: 'qpyds7',
                        text: 'One-hot encoding trong xử lý dữ liệu được sử dụng để:',
                        options: [
                            'Chuyển đổi biến phân loại thành biến số học để mô hình học máy có thể xử lý',
                            'Mã hóa dữ liệu nhạy cảm để bảo vệ quyền riêng tư',
                            'Nén dữ liệu để giảm kích thước lưu trữ',
                            'Tạo bản sao dữ liệu để huấn luyện nhiều mô hình song song'
                        ],
                        correctAnswerIndex: 0,
                        explanation: 'One-hot encoding là kỹ thuật chuyển đổi biến phân loại thành các véc-tơ nhị phân. Mỗi giá trị phân loại được biểu diễn bằng một cột mới, với giá trị 1 nếu dữ liệu thuộc danh mục đó và 0 nếu không thuộc.'
                    },
                    {
                        id: 'qpyds8',
                        text: 'Trong scikit-learn, GridSearchCV được sử dụng để:',
                        options: [
                            'Tìm kiếm tham số tối ưu cho mô hình học máy',
                            'Tạo lưới dữ liệu cho trực quan hóa',
                            'Chia dữ liệu thành lưới để xử lý song song',
                            'Tìm kiếm các điểm dữ liệu ngoại lai (outliers)'
                        ],
                        correctAnswerIndex: 0,
                        explanation: 'GridSearchCV là một kỹ thuật trong scikit-learn để tự động tìm kiếm tham số tối ưu cho mô hình học máy bằng cách thử tất cả các tổ hợp tham số có thể trong một "lưới" các giá trị đã xác định trước.'
                    },
                    {
                        id: 'qpyds9',
                        text: 'Phương pháp nào được sử dụng để đánh giá mô hình phân loại nhị phân (binary classification)?',
                        options: [
                            'ROC curve và AUC',
                            'R-squared',
                            'Mean Squared Error',
                            'Silhouette Score'
                        ],
                        correctAnswerIndex: 0,
                        explanation: 'ROC (Receiver Operating Characteristic) curve và AUC (Area Under the Curve) là các phương pháp phổ biến để đánh giá hiệu suất của mô hình phân loại nhị phân, cho phép trực quan hóa và định lượng khả năng phân biệt của mô hình ở các ngưỡng khác nhau.'
                    },
                    {
                        id: 'qpyds10',
                        text: 'Pipeline trong scikit-learn được sử dụng để:',
                        options: [
                            'Kết hợp nhiều bước xử lý dữ liệu và mô hình học máy thành một quy trình duy nhất',
                            'Tăng tốc độ huấn luyện mô hình bằng cách song song hóa',
                            'Trực quan hóa quy trình làm việc của dự án',
                            'Lưu trữ kết quả giữa các lần chạy khác nhau'
                        ],
                        correctAnswerIndex: 0,
                        explanation: 'Pipeline trong scikit-learn là một cách để kết hợp nhiều bước xử lý dữ liệu (như scaling, PCA) và mô hình học máy thành một quy trình duy nhất, giúp tránh rò rỉ dữ liệu và đơn giản hóa code.'
                    }
                ],
                passingScorePercentage: 75
            }
        ], // Using all sample tests
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
    enrolledTrainees?: string[]; // Add enrolledTrainees field
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
        enrolledTrainees: course.enrolledTrainees,
}));
