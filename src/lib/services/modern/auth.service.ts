
import { BaseService } from "../../core";
import type {
  UserApiResponse,
  LoginDTO,
  ChangePasswordRequest,
  UserProfileUpdateRequest,
} from "@/lib/types/user.types";
import { API_CONFIG } from "@/lib/config";
import { cookieManager } from "@/lib/cache";

export class AuthService extends BaseService<UserApiResponse> {
  constructor() {
    super(API_CONFIG.endpoints.auth.login);
  }

  async login(credentials: LoginDTO): Promise<UserApiResponse> {
    console.log("🔒 [AuthService] Attempting login for:", credentials.email);
    // The post method in BaseService now correctly returns the 'data' part of the response.
    const response = await this.post<UserApiResponse>(
      API_CONFIG.endpoints.auth.login,
      credentials
    );
    console.log("✅ [AuthService] Login API Response:", response);
    return response;
  }

  async logout(): Promise<void> {
    try {
      // Call backend logout endpoint if available
      await this.post<void>("/Users/logout", {});
    } catch (error) {
      // Continue with logout even if backend call fails
      console.warn("Backend logout failed:", error);
    } finally {
      // Clear all auth-related data
      cookieManager.remove("auth_token");
      cookieManager.remove("refresh_token");
    }
  }

  async changePassword(payload: ChangePasswordRequest): Promise<void> {
    await this.patch<any>(API_CONFIG.endpoints.auth.changePassword, payload);
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
    console.log("👤 [AuthService] Fetching current user...");
    // The get method now correctly returns the 'data' from the API response
    const response = await this.get<UserApiResponse>(
      API_CONFIG.endpoints.users.me
    );
    console.log("✅ [AuthService] GetCurrentUser API Response:", response);
    return response;
  }

  async validateToken(): Promise<boolean> {
    try {
      await this.get<void>(API_CONFIG.endpoints.users.me);
      return true;
    } catch (error: any) {
      // If token is invalid, clear all auth data
      if (error?.response?.status === 401) {
        cookieManager.remove("auth_token");
        cookieManager.remove("refresh_token");
      }
      return false;
    }
  }

  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = cookieManager.get("refresh_token");
      if (!refreshToken) return null;

      const response = await this.post<{ accessToken: string }>(
        "/Users/refresh",
        { refreshToken }
      );

      // Update stored token
      const newToken = response.accessToken;
      cookieManager.setAuth("auth_token", newToken, { expires: 1 }); // 1 day

      return newToken;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return null;
    }
  }
}

export const authService = new AuthService();
export default authService;
