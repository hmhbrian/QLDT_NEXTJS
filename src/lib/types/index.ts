// Auth types
export interface LoginResponse {
    token: string;
    user: User;
}

// User types
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    departmentId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Trainee extends User {
    // Additional trainee-specific fields
    progress?: number;
    completedCourses?: number;
    enrolledCourses?: number;
}

// Course types
export interface Course {
    id: string;
    title: string;
    description: string;
    startDate?: string;
    endDate?: string;
    departmentId?: string;
    status: string;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface PublicCourse {
    id: string;
    title: string;
    description: string;
    status: string;
}

export interface DisplayCourse extends Course {
    progress?: number;
    enrolled?: boolean;
}

export interface StudentCourseEvaluation {
    id: string;
    courseId: string;
    userId: string;
    rating: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
}

// Department types
export interface DepartmentInfo {
    id: string;
    name: string;
    description?: string;
    parentId?: string | null;
    level?: number;
    path?: string[];
    children?: DepartmentInfo[];
    createdAt: string;
    updatedAt: string;
} 