import apiClient from '@/lib/api-client';
import { LoginResponse } from '@/lib/types/index';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface ChangePasswordPayload {
    oldPassword: string;
    newPassword: string;
}

export const authService = {
    login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
        const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
        return response.data;
    },

    logout: async (): Promise<void> => {
        await apiClient.post('/auth/logout');
        localStorage.clear();
    },

    changePassword: async (payload: ChangePasswordPayload): Promise<void> => {
        await apiClient.post('/auth/change-password', payload);
    },

    refreshToken: async (): Promise<{ token: string }> => {
        const response = await apiClient.post<{ token: string }>('/auth/refresh-token');
        return response.data;
    },
};

export default authService; 