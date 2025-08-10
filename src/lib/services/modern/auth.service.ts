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
      // Lấy user info từ localStorage (đã lưu khi login)
      const storedUser = localStorage.getItem("qldt_user_info");

      if (storedUser) {
        try {
          const userInfo = JSON.parse(storedUser);

          // Đảm bảo token được set trong httpClient
          const currentToken = httpClient.getAuthorizationToken();
          if (!currentToken && userInfo.accessToken) {
            httpClient.setAuthorizationHeader(userInfo.accessToken);
          }

          return userInfo;
        } catch (error) {
          throw new Error("Invalid stored user data");
        }
      }

      // Fallback: nếu không có trong localStorage thì throw error
      throw new Error("No user info found");
    } catch (error: any) {
      // Clear invalid data
      localStorage.removeItem("qldt_user_info");
      httpClient.clearAuthorizationHeader();

      throw error;
    }
  }

  async validateToken(): Promise<boolean> {
    try {
      // Kiểm tra xem có user info trong localStorage không
      const storedUser = localStorage.getItem("qldt_user_info");
      if (!storedUser) {
        return false;
      }

      const userInfo = JSON.parse(storedUser);
      if (!userInfo || !userInfo.id || !userInfo.accessToken) {
        return false;
      }

      // Ensure token is set in httpClient
      const currentToken = httpClient.getAuthorizationToken();
      if (!currentToken) {
        httpClient.setAuthorizationHeader(userInfo.accessToken);
      }

      return true;
    } catch (error: any) {
      return false;
    }
  }
}

export const authService = new AuthService();
export default authService;
