
import { BaseService } from "../../core";
import type { UserApiResponse, LoginDTO, ChangePasswordRequest, UserProfileUpdateRequest } from "@/lib/types/user.types";
import { API_CONFIG } from "@/lib/config";


export class AuthService extends BaseService<UserApiResponse> {
  constructor() {
    super(API_CONFIG.endpoints.auth.login);
  }

  async login(credentials: LoginDTO): Promise<UserApiResponse> {
    const response = await this.post<UserApiResponse>(
      API_CONFIG.endpoints.auth.login,
      credentials
    );
    return response;
  }

  async logout(): Promise<void> {
    // Implement if backend provides a logout endpoint
  }

  async changePassword(payload: ChangePasswordRequest): Promise<void> {
    await this.patch<any>(API_CONFIG.endpoints.auth.changePassword, payload);
  }

  async updateUserProfile(payload: UserProfileUpdateRequest): Promise<UserApiResponse> {
      return await this.put<UserApiResponse>(
        API_CONFIG.endpoints.users.update,
        payload
      );
  }

  async getCurrentUser(): Promise<UserApiResponse> {
    const response = await this.get<UserApiResponse>(
      API_CONFIG.endpoints.users.me
    );
    return response;
  }

  async validateToken(): Promise<boolean> {
    try {
      await this.get<void>(API_CONFIG.endpoints.users.me);
      return true;
    } catch {
      return false;
    }
  }
}

export const authService = new AuthService();
export default authService;
