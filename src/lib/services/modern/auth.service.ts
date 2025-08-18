"use client";

import { BaseService } from "../../core";
import type {
  UserApiResponse,
  LoginDTO,
  ChangePasswordRequest,
  UserProfileUpdateRequest,
} from "@/lib/types/user.types";
import { API_CONFIG } from "@/lib/config";
import { CustomHttpClient } from "@/lib/http-client";

export const httpClient = new CustomHttpClient({
  baseURL: API_CONFIG.baseURL,
  headers: API_CONFIG.defaultHeaders,
  timeout: API_CONFIG.timeout,
});

export class AuthService extends BaseService<UserApiResponse> {
  constructor() {
    super(API_CONFIG.endpoints.auth.login);
  }

  async login(credentials: LoginDTO): Promise<UserApiResponse> {
    const response = await this.post<UserApiResponse>(
      API_CONFIG.endpoints.auth.login,
      credentials
    );

    if (response.accessToken) {
      httpClient.setAuthorizationHeader(response.accessToken);
    }
    return response;
  }

  async logout(): Promise<void> {
    // Chỉ logout trên frontend, không gọi backend
    httpClient.clearAuthorizationHeader();
  }

  async changePassword(payload: ChangePasswordRequest): Promise<void> {
    await this.patch<void>(API_CONFIG.endpoints.auth.changePassword, payload);
  }

  async updateUserProfile(
    payload: UserProfileUpdateRequest
  ): Promise<UserApiResponse> {
    return await this.put<UserApiResponse>(
      API_CONFIG.endpoints.users.update,
      payload
    );
  }

  async getCurrentUser(): Promise<UserApiResponse> {
    try {
      // Quick localStorage check with minimal processing
      const storedUser = localStorage.getItem("qldt_user_info");

      if (storedUser) {
        const userInfo = JSON.parse(storedUser);

        // Enhanced validation
        if (userInfo && userInfo.id && userInfo.accessToken) {
          // Only set token if not already set (avoid redundant operations)
          const currentToken = httpClient.getAuthorizationToken();
          if (!currentToken || currentToken !== userInfo.accessToken) {
            httpClient.setAuthorizationHeader(userInfo.accessToken);
          }

          return userInfo;
        }
      }

      // If no valid stored data, throw error immediately
      throw new Error("No valid user info found");
    } catch (error: any) {
      // Efficient cleanup - only clear if something was actually set
      const hasStoredData = localStorage.getItem("qldt_user_info");
      if (hasStoredData) {
        localStorage.removeItem("qldt_user_info");
      }

      const hasToken = httpClient.getAuthorizationToken();
      if (hasToken) {
        httpClient.clearAuthorizationHeader();
      }

      throw error;
    }
  }

  async validateToken(): Promise<boolean> {
    try {
      // Optimized validation - minimal operations
      const storedUser = localStorage.getItem("qldt_user_info");
      if (!storedUser) {
        return false;
      }

      const userInfo = JSON.parse(storedUser);
      if (!userInfo?.id || !userInfo?.accessToken) {
        return false;
      }

      // Only set token if needed
      const currentToken = httpClient.getAuthorizationToken();
      if (!currentToken) {
        httpClient.setAuthorizationHeader(userInfo.accessToken);
      }

      return true;
    } catch (error: any) {
      return false;
    }
  }

  // New method for quick auth check without full user data
  isAuthenticated(): boolean {
    try {
      const token = httpClient.getAuthorizationToken();
      const storedUser = localStorage.getItem("qldt_user_info");

      if (!token || !storedUser) {
        return false;
      }

      const userInfo = JSON.parse(storedUser);
      return !!(userInfo?.id && userInfo?.accessToken);
    } catch {
      return false;
    }
  }
}

export const authService = new AuthService();
export default authService;
