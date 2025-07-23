import {
  BaseService,
  PaginatedResponse,
  QueryParams,
} from "@/lib/core";
import { User, CreateUserRequest, UpdateUserRequest, UserApiResponse, ResetPasswordRequest } from "@/lib/types/user.types";
import { API_CONFIG } from "@/lib/config";

export class UsersService extends BaseService<
  UserApiResponse,
  CreateUserRequest,
  UpdateUserRequest
> {
  constructor() {
    super(API_CONFIG.endpoints.users.base);
  }

  async getUsersWithPagination(
    params?: QueryParams
  ): Promise<PaginatedResponse<UserApiResponse>> {
    const isSearch = params?.keyword && String(params.keyword).trim() !== "";
    const endpoint = isSearch
      ? API_CONFIG.endpoints.users.search
      : this.endpoint;

    const backendParams: Record<string, any> = {};
    if (params) {
      if (params.page) backendParams.Page = params.page;
      if (params.limit) backendParams.Limit = params.limit;
      if (params.sortBy) backendParams.SortField = params.sortBy;
      if (params.sortOrder) backendParams.SortType = params.sortOrder;
      if (params.role) backendParams.RoleName = params.role;
      if (isSearch) {
        backendParams.keyword = params.keyword;
      }
    }

    const response = await this.get<PaginatedResponse<UserApiResponse>>(endpoint, {
      params: backendParams,
    });

    return {
      items: response.items || [],
      pagination: response.pagination,
    };
  }

  async getUserById(id: string): Promise<UserApiResponse> {
    const response = await this.get<UserApiResponse>(`${this.endpoint}/${id}`);
    return response;
  }

  async createUser(payload: CreateUserRequest): Promise<UserApiResponse> {
    const response = await this.post<UserApiResponse>(API_CONFIG.endpoints.users.create, payload);
    return response;
  }

  async updateUserByAdmin(
    userId: string,
    payload: UpdateUserRequest
  ): Promise<UserApiResponse> {
    const url = API_CONFIG.endpoints.users.updateAdmin(userId);
    const response = await this.put<UserApiResponse>(url, payload);
    return response;
  }
  
  async deleteUsers(userIds: string[]): Promise<any> {
    if (userIds.length === 0) return;
    
    // Backend expects array of strings in the body for bulk delete.
    const promises = userIds.map(id => 
        this.delete(API_CONFIG.endpoints.users.softDelete(id))
    );
    return Promise.all(promises);
  }

  async resetPassword(
    userId: string,
    payload: ResetPasswordRequest
  ): Promise<void> {
    const url = API_CONFIG.endpoints.users.resetPassword(userId);
    await this.patch<void>(url, payload);
  }
}

export const usersService = new UsersService();
export default usersService;
