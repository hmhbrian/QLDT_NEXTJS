/**
 * Auth API Service
 * Handles authentication-related API operations
 */
import { BaseApiService, ApiResponse } from "./base-api.service";
import { User } from "@/lib/types";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export interface RefreshTokenResponse {
  token: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  success: boolean;
  message: string;
}

class AuthApiService extends BaseApiService {
  constructor() {
    super("/auth");
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await this.post<LoginResponse>("/auth/login", credentials);
    return response;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await this.post<void>("/auth/logout");
    localStorage.clear();
  }

  /**
   * Change password
   */
  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await this.post<void>("/auth/change-password", payload);
  }

  /**
   * Refresh token
   */
  async refreshToken(): Promise<RefreshTokenResponse> {
    const response = await this.post<RefreshTokenResponse>(
      "/auth/refresh-token"
    );
    return response;
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const response = await this.get<ApiResponse<User>>("/auth/me");
    return response.data!;
  }

  /**
   * Validate token
   */
  async validateToken(): Promise<boolean> {
    try {
      await this.get<void>("/auth/validate");
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const authApiService = new AuthApiService();
export default authApiService;
