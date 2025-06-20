/**
 * Modern Users Service
 * Uses the new unified core system
 */
import { BaseService, QueryParams, ApiResponse } from "@/lib/core";
import { User } from "@/lib/types";

// Specific types for Users
export interface UserFilterParams {
  role?: string;
  departmentId?: string;
  status?: string;
}

export interface UserSortParams {
  sortBy?: "firstName" | "lastName" | "email" | "createdAt";
  sortOrder?: "asc" | "desc";
}

// Create safe query params without conflicts
export interface UserQueryParams
  extends Omit<QueryParams, "sortBy" | "sortOrder">,
    UserFilterParams,
    UserSortParams {}

export interface CreateUserPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  departmentId?: string;
  [key: string]: unknown;
}

export interface UpdateUserPayload {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  departmentId?: string;
  [key: string]: unknown;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Modern Users Service
 * Centralized user management with consistent patterns
 */
class ModernUsersService extends BaseService<
  User,
  CreateUserPayload,
  UpdateUserPayload
> {
  constructor() {
    super("/Users");
  }

  // ==================== Helper Methods ====================

  /**
   * Convert generic query params to user-specific params
   */
  private toUserQueryParams(
    params: Record<string, unknown> = {}
  ): UserQueryParams {
    return {
      ...params,
      sortBy: (params.sortBy as UserSortParams["sortBy"]) || "email",
      sortOrder: (params.sortOrder as "asc" | "desc") || "asc",
    } as UserQueryParams;
  }

  // ==================== Enhanced User Operations ====================

  /**
   * Get all users with enhanced filtering
   */
  async getUsers(params?: UserQueryParams): Promise<User[]> {
    const response = await this.getAll(params);
    return this.extractItems(response);
  }

  /**
   * Get user by ID with error handling
   */
  async getUserById(id: string): Promise<User> {
    const response = await this.getById(id);
    return this.extractData(response);
  }

  /**
   * Create user with validation
   */
  async createUser(payload: CreateUserPayload): Promise<User> {
    const response = await this.create(payload);
    return this.extractData(response);
  }

  /**
   * Update user with partial data
   */
  async updateUser(id: string, payload: UpdateUserPayload): Promise<User> {
    const response = await this.update(id, payload);
    return this.extractData(response);
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(id: string): Promise<void> {
    await this.remove(id);
  }
  // ==================== User-Specific Operations ====================

  /**
   * Search users by keyword
   */
  async searchUsers(
    keyword: string,
    params?: Record<string, unknown>
  ): Promise<User[]> {
    const searchParams = this.toUserQueryParams({ ...params, search: keyword });
    return this.getUsers(searchParams);
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    payload: ChangePasswordPayload
  ): Promise<void> {
    await this.post(`${this.endpoint}/${userId}/change-password`, payload);
  }

  /**
   * Reset user password (admin only)
   */
  async resetPassword(userId: string): Promise<{ temporaryPassword: string }> {
    const response = await this.post<
      ApiResponse<{ temporaryPassword: string }>
    >(`${this.endpoint}/${userId}/reset-password`, {});
    return this.extractData(response);
  }

  /**
   * Get users by department
   */
  async getUsersByDepartment(
    departmentId: string,
    params?: Record<string, unknown>
  ): Promise<User[]> {
    const departmentParams = this.toUserQueryParams({
      ...params,
      departmentId,
    });
    return this.getUsers(departmentParams);
  }

  /**
   * Get users by role
   */
  async getUsersByRole(
    role: string,
    params?: Record<string, unknown>
  ): Promise<User[]> {
    const roleParams = this.toUserQueryParams({ ...params, role });
    return this.getUsers(roleParams);
  }

  /**
   * Update user profile (self)
   */
  async updateProfile(payload: UpdateUserPayload): Promise<User> {
    const response = await this.put<ApiResponse<User>>(
      `${this.endpoint}/profile`,
      payload
    );
    return this.extractData(response);
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const response = await this.get<ApiResponse<User>>(`${this.endpoint}/me`);
    return this.extractData(response);
  }

  // ==================== Bulk Operations ====================

  /**
   * Bulk create users
   */
  async bulkCreateUsers(users: CreateUserPayload[]): Promise<User[]> {
    const response = await this.post<ApiResponse<User[]>>(
      `${this.endpoint}/bulk`,
      { users }
    );
    return this.extractData(response);
  }

  /**
   * Bulk update users
   */
  async bulkUpdateUsers(
    updates: Array<{ id: string; data: UpdateUserPayload }>
  ): Promise<User[]> {
    const response = await this.put<ApiResponse<User[]>>(
      `${this.endpoint}/bulk`,
      { updates }
    );
    return this.extractData(response);
  }

  /**
   * Bulk delete users
   */
  async bulkDeleteUsers(userIds: string[]): Promise<void> {
    await this.delete(`${this.endpoint}/bulk?ids=${userIds.join(",")}`);
  }
}

// Create singleton instance
export const usersService = new ModernUsersService();
export default usersService;
