import { BaseService, ApiResponse, BaseCreatePayload } from "../../core";
import type { User, LoginDTO } from "../../types/user.types";
import { API_CONFIG } from "@/lib/config";

export interface LoginResponse extends ApiResponse<User> {}

export interface ChangePasswordPayload extends BaseCreatePayload {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export class AuthService extends BaseService<User> {
  constructor() {
    super(API_CONFIG.endpoints.auth.login); // Endpoint isn't really used for this service
  }

  async login(credentials: LoginDTO): Promise<LoginResponse> {
    const response = await this.post<LoginResponse>(
      API_CONFIG.endpoints.auth.login,
      credentials
    );
    return response;
  }

  async logout(): Promise<void> {
    // Optional: Call logout endpoint if it exists
    // await this.post<void>('/Account/logout');
  }

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    // For change password, we don't need to extract data, just ensure the request succeeds
    await this.post<any>(API_CONFIG.endpoints.auth.changePassword, payload);
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.get<ApiResponse<User>>(
      API_CONFIG.endpoints.auth.me
    );
    return this.extractData(response);
  }

  async validateToken(): Promise<boolean> {
    try {
      await this.get<void>(API_CONFIG.endpoints.auth.validate);
      return true;
    } catch {
      return false;
    }
  }
}

export const authService = new AuthService();
export default authService;
