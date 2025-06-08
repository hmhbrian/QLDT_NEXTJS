import type { User, Trainee, WorkStatus, TraineeLevel } from '../types';

// Mock Users Data
export const mockUsers: User[] = [
    {
        id: '1',
        fullName: 'Quản trị viên',
        email: 'admin@becamex.com',
        idCard: 'CMND001',
        phoneNumber: '0901234567',
        role: 'Admin',
        urlAvatar: 'https://placehold.co/40x40.png',
        startWork: new Date('2024-01-01'),
        createdAt: new Date(),
        modifiedAt: new Date(),
        status: 'working' as WorkStatus,
        department: 'Admin',
        position: 'System Administrator'
    },
    {
        id: '2',
        fullName: 'Quản lý nhân sự',
        email: 'hr@becamex.com',
        idCard: 'CMND002',
        phoneNumber: '0902345678',
        role: 'HR',
        urlAvatar: 'https://placehold.co/40x40.png',
        startWork: new Date('2024-01-01'),
        createdAt: new Date(),
        modifiedAt: new Date(),
        status: 'working' as WorkStatus,
        department: 'HR',
        position: 'HR Manager'
    },
    {
        id: '3',
        fullName: 'Nguyễn Văn A',
        email: 'trainee@becamex.com',
        idCard: 'CMND003',
        phoneNumber: '0903456789',
        role: 'Trainee',
        position: 'Intern',
        urlAvatar: 'https://placehold.co/40x40.png',
        startWork: new Date('2024-01-01'),
        createdAt: new Date(),
        modifiedAt: new Date(),
        status: 'working' as WorkStatus,
        department: 'IT',
        level: 'beginner' as TraineeLevel,
        employeeId: 'EMP001'
    }
];

// Mock Trainee Profile Data
export const mockTrainee: Trainee = {
    id: '3',
    employeeId: 'EMP001',
    fullName: 'Nguyễn Văn A',
    email: 'trainee@becamex.com',
    phoneNumber: '0903456789',
    department: 'it',
    position: 'Intern',
    level: 'beginner' as TraineeLevel,
    joinDate: '2024-01-01',
    managerId: '2',
    workStatus: 'working',
    managerName: 'Quản lý nhân sự',
    createdAt: new Date(),
    modifiedAt: new Date(),
    completedCourses: [
        {
            courseId: 'C1',
            courseName: 'JavaScript Fundamentals',
            completionDate: '2024-02-15',
            grade: 85,
            feedback: 'Good understanding of core concepts',
        },
        {
            courseId: 'C2',
            courseName: 'React Basics',
            completionDate: '2024-03-01',
            grade: 90,
            feedback: 'Excellent project work',
        }
    ],
    certificates: [
        {
            id: 'CERT1',
            name: 'JavaScript Developer',
            issueDate: '2024-02-20',
            issuingOrganization: 'Tech Academy',
            credentialId: 'JS-2024-001',
        }
    ],
    evaluations: [
        {
            id: 'E1',
            evaluator: 'Quản lý nhân sự',
            evaluationDate: '2024-03-15',
            type: 'monthly',
            criteria: [
                { name: 'Technical Skills', score: 4, maxScore: 5, comment: 'Good technical foundation' },
                { name: 'Communication', score: 4, maxScore: 5, comment: 'Clear and effective communication' },
                { name: 'Problem Solving', score: 3, maxScore: 5, comment: 'Shows potential, needs more practice' }
            ],
            overallScore: 4,
            strengths: ['Quick learner', 'Team player'],
            weaknesses: ['Complex problem solving'],
            recommendations: ['Focus on advanced problem-solving scenarios'],
            status: 'approved'
        }
    ]
}; 