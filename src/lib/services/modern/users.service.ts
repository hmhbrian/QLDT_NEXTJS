import {
  BaseService,
  PaginatedResponse,
  QueryParams,
  ApiResponse,
} from "@/lib/core";
import { User, CreateUserRequest } from "@/lib/types";
import { API_CONFIG } from "@/lib/legacy-api/config";

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
    const response = await this.get<ApiResponse<PaginatedResponse<User>>>(
      this.endpoint,
      { params }
    );
    return this.extractItems(response) || [];
  }

  async getUserById(id: string): Promise<User> {
    const response = await super.getById(id);
    return this.extractData(response);
  }

  // Override create because the endpoint is non-standard
  async createUser(payload: CreateUserRequest): Promise<User> {
    const response = await this.post<ApiResponse<User>>(
      API_CONFIG.endpoints.users.create,
      payload
    );
    return this.extractData(response);
  }

  // Override the base 'update' method to use the correct admin endpoint
  async update(
    userId: string,
    payload: UpdateUserPayload
  ): Promise<ApiResponse<User>> {
    const url = API_CONFIG.endpoints.users.updateAdmin(userId);
    return this.put<ApiResponse<User>>(url, payload);
  }

  // This method remains for clarity if you need to call it explicitly
  async updateUserByAdmin(
    userId: string,
    payload: UpdateUserPayload
  ): Promise<User> {
    const response = await this.update(userId, payload);
    return this.extractData(response);
  }

  // Update user profile (for the current user)
  async updateProfile(payload: UpdateUserPayload): Promise<User> {
    // Assuming the backend has an endpoint like '/Users/profile' for self-update
    // As it is not in the provided list, this might need adjustment.
    // Let's assume a PUT to the base endpoint without ID updates the current user.
    const response = await this.put<ApiResponse<User>>(
      `${this.endpoint}/update`,
      payload
    );
    return this.extractData(response);
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
    const url = API_CONFIG.endpoints.users.search.replace("{keyword}", keyword);
    const response = await this.get<ApiResponse<User[]>>(url);
    return this.extractData(response);
  }
}

export const usersService = new UsersService();
export default usersService;
