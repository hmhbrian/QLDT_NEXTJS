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
    console.log("🔒 [AuthService] Performing client-side logout...");
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
    // Lấy user info từ localStorage (đã lưu khi login)
    const storedUser = localStorage.getItem("qldt_user_info");

    if (storedUser) {
      try {
        const userInfo = JSON.parse(storedUser);
        console.log(
          "🔍 [AuthService] Retrieved user info from localStorage:",
          userInfo
        );
        return userInfo;
      } catch (error) {
        console.error(
          "🔍 [AuthService] Failed to parse stored user info:",
          error
        );
      }
    }

    // Fallback: nếu không có trong localStorage thì throw error
    throw new Error("No user info found");
  }

  async validateToken(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const authService = new AuthService();
export default authService;
