import apiClient from '@/lib/api-client';
import { User, Trainee } from '@/lib/types/index';
import { ApiResponse, FilterParams, PaginationParams } from '../api-utils';
import { BaseService } from '../base-service';
import { API_CONFIG } from '../config';

export interface UserFilterParams extends FilterParams {
    role?: string;
    departmentId?: string;
}

export interface UserSortParams {
    sortBy?: 'firstName' | 'lastName' | 'email' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
}

// Create modified pagination params without sortBy to avoid conflict
type ModifiedPaginationParams = Omit<PaginationParams, 'sortBy' | 'sortOrder'>;

export interface UserQueryParams extends ModifiedPaginationParams, UserFilterParams, UserSortParams { }

export interface CreateUserPayload {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    departmentId?: string;
    // Additional fields based on your User type
}

export interface UpdateUserPayload {
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    departmentId?: string;
    // Additional fields based on your User type
}

/**
 * Users Service
 * Handles all API operations related to users
 */
class UsersService extends BaseService<User, CreateUserPayload, UpdateUserPayload> {
    constructor() {
        super(API_CONFIG.endpoints.users.base);
    }

    /**
     * Get all users (with optional filtering)
     * @override
     */
    async getAllUsers(params?: UserQueryParams): Promise<User[]> {
        if (!params) {
            return this.getAll();
        }

        const response = await apiClient.get<ApiResponse<User[]>>(this.endpoint, {
            params
        });
        return response.data.data;
    }

    /**
     * Get a user by ID
     * @override
     */
    async getUserById(id: string): Promise<User> {
        return this.getById(id);
    }

    /**
     * Create a new user
     * @override
     */
    async createUser(payload: CreateUserPayload): Promise<User> {
        return this.create(payload);
    }

    /**
     * Update an existing user
     * @override
     */
    async updateUser(id: string, payload: UpdateUserPayload): Promise<User> {
        return this.update(id, payload);
    }

    /**
     * Delete a user
     * @override
     */
    async deleteUser(id: string): Promise<void> {
        return this.delete(id);
    }

    /**
     * Trainee specific endpoints
     */
    async getTraineeProfile(): Promise<Trainee> {
        const response = await apiClient.get<ApiResponse<Trainee>>('/trainee/profile');
        return response.data.data;
    }

    /**
     * Update trainee profile
     */
    async updateTraineeProfile(payload: UpdateUserPayload): Promise<Trainee> {
        const response = await apiClient.put<ApiResponse<Trainee>>('/trainee/profile', payload);
        return response.data.data;
    }

    /**
     * Change user password
     */
    async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
        await apiClient.post<ApiResponse<void>>(`${this.endpoint}/${userId}/change-password`, {
            currentPassword,
            newPassword
        });
    }

    /**
     * Reset user password (admin only)
     */
    async resetPassword(userId: string): Promise<{ temporaryPassword: string }> {
        const response = await apiClient.post<ApiResponse<{ temporaryPassword: string }>>(`${this.endpoint}/${userId}/reset-password`);
        return response.data.data;
    }
}

// Create a singleton instance
export const usersService = new UsersService();

export default usersService; 