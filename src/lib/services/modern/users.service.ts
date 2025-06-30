
import {
  BaseService,
  PaginatedResponse,
  QueryParams,
  ApiResponse,
} from "@/lib/core";
import { User, CreateUserRequest } from "@/lib/types/user.types";
import { API_CONFIG } from "@/lib/config";

export type UpdateUserPayload = Partial<CreateUserRequest>;

export interface ResetPasswordPayload {
  newPassword: string;
  confirmNewPassword: string;
}

export class UsersService extends BaseService<
  User,
  CreateUserRequest,
  UpdateUserPayload
> {
  constructor() {
    super(API_CONFIG.endpoints.users.base);
  }

  async getUsers(params?: QueryParams): Promise<User[]> {
    if (params?.search) {
      const searchResult = await this.searchUsers(params.search as string);
      return Array.isArray(searchResult) ? searchResult : [];
    }

    const response = await this.get<PaginatedResponse<User>>(
      this.endpoint,
      { params }
    );
    return response.items || [];
  }

  async getUserById(id: string): Promise<User> {
    return super.getById(id);
  }

  async createUser(payload: CreateUserRequest): Promise<User> {
    return this.post<User>(
      API_CONFIG.endpoints.users.create,
      payload
    );
  }

  async updateUserByAdmin(
    userId: string,
    payload: UpdateUserPayload
  ): Promise<User> {
    const url = API_CONFIG.endpoints.users.updateAdmin(userId);
    return this.put<User>(url, payload);
  }

  async update(
    userId: string,
    payload: UpdateUserPayload
  ): Promise<User> {
    return this.updateUserByAdmin(userId, payload);
  }

  async updateProfile(payload: UpdateUserPayload): Promise<User> {
    return this.put<User>(
      `${this.endpoint}/update`,
      payload
    );
  }

  async deleteUser(userId: string): Promise<any> {
    const url = API_CONFIG.endpoints.users.softDelete(userId);
    return await this.delete(url);
  }

  async resetPassword(
    userId: string,
    payload: ResetPasswordPayload
  ): Promise<any> {
    const url = API_CONFIG.endpoints.users.resetPassword(userId);
    return await this.patch<any>(url, payload);
  }

  async searchUsers(keyword: string): Promise<User[]> {
    const url = API_CONFIG.endpoints.users.search;
    const response = await this.get<PaginatedResponse<User>>(url, {
      params: { keyword },
    });
    return response.items || [];
  }
}

export const usersService = new UsersService();
export default usersService;
