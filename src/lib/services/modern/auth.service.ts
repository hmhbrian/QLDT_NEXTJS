/**
 * Modern Auth Service
 * Uses core architecture for clean and consistent authentication operations
 */

import { 
  BaseService, 
  ApiResponse,
  BaseCreatePayload,
  BaseUpdatePayload
} from '../../core';
import type { User } from '../../types';

// Auth specific types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  statusCode: number;
  code: string;
  data: User;
  accessToken: string;
}

export interface ChangePasswordPayload extends BaseCreatePayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  user: User;
}

/**
 * Modern Auth Service
 * Provides clean, typed API for authentication operations
 */
export class AuthService extends BaseService<User> {
  constructor() {
    super('/auth');
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await this.post<LoginResponse>('/Users/login', credentials);
    return response;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await this.post<void>('/Account/logout');
    localStorage.clear();
  }

  /**
   * Change password
   */
  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await this.post<void>('/Users/change-password', payload);
  }

  /**
   * Refresh token
   */
  async refreshToken(): Promise<RefreshTokenResponse> {
    const response = await this.post<RefreshTokenResponse>('/Account/refresh');
    return response;
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const response = await this.get<ApiResponse<User>>('/Account/me');
    return response.data;
  }

  /**
   * Validate token
   */
  async validateToken(): Promise<boolean> {
    try {
      await this.get<void>('/Account/validate');
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
