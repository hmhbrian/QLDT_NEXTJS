/**
 * Users API Service
 * Handles all user-related API operations using the base service
 */
import {
  BaseApiService,
  ApiResponse,
  PaginatedResponse,
  QueryParams,
} from "./base-api.service";
import { User, CreateUserRequest } from "@/lib/types";

export interface UserQueryParams extends QueryParams {
  department?: string;
  role?: string;
  status?: string;
}

export type CreateUserPayload = CreateUserRequest;

export type UpdateUserPayload = Partial<CreateUserRequest>;

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordPayload {
  newPassword: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

class UsersApiService extends BaseApiService {
  constructor() {
    super("/Users");
  }

  /**
   * Get all users with pagination and filters
   */
  async getUsers(params?: UserQueryParams): Promise<PaginatedResponse<User>> {
    const response = await this.getAll<User>(params);
    return (
      response.data || {
        items: [],
        pagination: {
          totalItems: 0,
          itemsPerPage: 10,
          currentPage: 1,
          totalPages: 0,
        },
      }
    );
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User> {
    const response = await this.getById<User>(id);
    return response.data!;
  }

  /**
   * Create new user
   */
  async createUser(userData: CreateUserPayload): Promise<User> {
    const response = await this.create<User, CreateUserPayload>(userData);
    return response.data!;
  }

  /**
   * Update user by admin
   */
  async updateUserByAdmin(
    id: string,
    userData: UpdateUserPayload
  ): Promise<User> {
    const response = await this.put<ApiResponse<User>>(
      `/Users/admin/${id}/update`,
      userData
    );
    return response.data!;
  }

  /**
   * Update user profile (self)
   */
  async updateUserProfile(userData: UpdateUserPayload): Promise<User> {
    const response = await this.put<ApiResponse<User>>(
      "/Users/update",
      userData
    );
    return response.data!;
  }

  /**
   * Change password
   */
  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await this.patch<ApiResponse<void>>("/Users/change-password", payload);
  }

  /**
   * Reset user password (admin only)
   */
  async resetUserPassword(
    id: string,
    payload: ResetPasswordPayload
  ): Promise<void> {
    await this.patch<ApiResponse<void>>(`/Users/${id}/reset-password`, payload);
  }

  /**
   * Soft delete user
   */
  async softDeleteUser(id: string): Promise<void> {
    await this.delete<ApiResponse<void>>(`/Users/${id}/soft-delete`);
  }

  /**
   * Search users
   */
  async searchUsers(keyword: string): Promise<PaginatedResponse<User>> {
    const response = await this.get<ApiResponse<PaginatedResponse<User>>>(
      `/Users/search/${encodeURIComponent(keyword)}`
    );
    return response.data!;
  }

  /**
   * Login user
   */
  async loginUser(payload: LoginPayload): Promise<ApiResponse> {
    return this.post<ApiResponse>("/Users/login", payload);
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const response = await this.get<ApiResponse<User>>("/Users/me");
    return response.data!;
  }
}

// Export singleton instance
export const usersApiService = new UsersApiService();
export default usersApiService;
