import apiClient from '@/lib/api-client';

export interface ProgressData {
    month: string;
    count: number;
}

export interface CourseCompletionData {
    name: string;
    value: number;
}

export interface DepartmentPerformanceData {
    name: string;
    value: number;
}

export const analyticsService = {
    getProgressData: async (): Promise<ProgressData[]> => {
        const response = await apiClient.get<ProgressData[]>('/analytics/progress');
        return response.data;
    },

    getCourseCompletionData: async (): Promise<CourseCompletionData[]> => {
        const response = await apiClient.get<CourseCompletionData[]>('/analytics/course-completion');
        return response.data;
    },

    getDepartmentPerformanceData: async (): Promise<DepartmentPerformanceData[]> => {
        const response = await apiClient.get<DepartmentPerformanceData[]>('/analytics/department-performance');
        return response.data;
    },

    // Add other analytics endpoints as needed
    getUserActivityData: async (): Promise<any> => {
        const response = await apiClient.get('/analytics/user-activity');
        return response.data;
    },

    getCourseEnrollmentTrends: async (): Promise<any> => {
        const response = await apiClient.get('/analytics/enrollment-trends');
        return response.data;
    }
};

export default analyticsService; 