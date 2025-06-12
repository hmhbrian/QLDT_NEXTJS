import apiClient from '@/lib/api-client';
import { Course, PublicCourse, DisplayCourse, StudentCourseEvaluation } from '@/lib/types/index';

export interface CourseQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    departmentId?: string;
    status?: string;
}

export interface CreateCoursePayload {
    title: string;
    description: string;
    startDate?: string;
    endDate?: string;
    departmentId?: string;
    status?: string;
    isPublic?: boolean;
    // Add other course creation fields as needed
}

export interface UpdateCoursePayload {
    title?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    departmentId?: string;
    status?: string;
    isPublic?: boolean;
    // Add other course update fields as needed
}

export interface EvaluationPayload {
    rating: number;
    comment: string;
}

export const coursesService = {
    // Admin and HR routes
    getAllCourses: async (params?: CourseQueryParams): Promise<Course[]> => {
        const response = await apiClient.get<Course[]>('/courses', { params });
        return response.data;
    },

    getCourseById: async (id: string): Promise<Course> => {
        const response = await apiClient.get<Course>(`/courses/${id}`);
        return response.data;
    },

    createCourse: async (payload: CreateCoursePayload): Promise<Course> => {
        const response = await apiClient.post<Course>('/courses', payload);
        return response.data;
    },

    updateCourse: async (id: string, payload: UpdateCoursePayload): Promise<Course> => {
        const response = await apiClient.put<Course>(`/courses/${id}`, payload);
        return response.data;
    },

    deleteCourse: async (id: string): Promise<void> => {
        await apiClient.delete(`/courses/${id}`);
    },

    // Public routes
    getPublicCourses: async (params?: CourseQueryParams): Promise<PublicCourse[]> => {
        const response = await apiClient.get<PublicCourse[]>('/courses/public', { params });
        return response.data;
    },

    // Trainee routes
    getTraineeCourses: async (): Promise<DisplayCourse[]> => {
        const response = await apiClient.get<DisplayCourse[]>('/trainee/courses');
        return response.data;
    },

    enrollInCourse: async (courseId: string): Promise<{ success: boolean }> => {
        const response = await apiClient.post<{ success: boolean }>(`/trainee/courses/${courseId}/enroll`);
        return response.data;
    },

    unenrollFromCourse: async (courseId: string): Promise<{ success: boolean }> => {
        const response = await apiClient.delete<{ success: boolean }>(`/trainee/courses/${courseId}/enroll`);
        return response.data;
    },

    // Evaluations
    getCourseEvaluations: async (courseId: string): Promise<StudentCourseEvaluation[]> => {
        const response = await apiClient.get<StudentCourseEvaluation[]>(`/courses/${courseId}/evaluations`);
        return response.data;
    },

    submitEvaluation: async (courseId: string, payload: EvaluationPayload): Promise<StudentCourseEvaluation> => {
        const response = await apiClient.post<StudentCourseEvaluation>(`/courses/${courseId}/evaluations`, payload);
        return response.data;
    },

    updateEvaluation: async (courseId: string, evaluationId: string, payload: EvaluationPayload): Promise<StudentCourseEvaluation> => {
        const response = await apiClient.put<StudentCourseEvaluation>(
            `/courses/${courseId}/evaluations/${evaluationId}`,
            payload
        );
        return response.data;
    }
};

export default coursesService; 