
import {
  BaseService,
  PaginatedResponse,
  QueryParams,
  ApiResponse,
  extractErrorMessage,
} from "@/lib/core";
import { User, CreateUserRequest } from "@/lib/types/user.types";
import { API_CONFIG } from "@/lib/config";

export type UpdateUserPayload = Partial<CreateUserRequest> & {
  UrlAvatar?: File | null;
};

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

  private async _updateWithFormData(
    url: string,
    payload: UpdateUserPayload
  ): Promise<User> {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    const headers = this.getAuthHeaders() as Record<string, string>;
    // When sending FormData with fetch, we must not set the 'Content-Type' header.
    // The browser automatically sets it to 'multipart/form-data' with the correct boundary.
    // Manually setting it (e.g., to 'application/json' from a default header function)
    // prevents the server from parsing the form data correctly.
    delete headers["Content-Type"];

    const response = await fetch(`${API_CONFIG.baseURL}${url}`, {
      method: "PUT",
      headers,
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(extractErrorMessage(data));
    }

    return this.extractData(data);
  }

  async getUsersWithPagination(params?: QueryParams): Promise<PaginatedResponse<User>> {
    const isSearch = params?.search && String(params.search).trim() !== "";
    const endpoint = isSearch
      ? API_CONFIG.endpoints.users.search
      : this.endpoint;
  
    const backendParams: Record<string, any> = {};
    if (params) {
      if (params.page) backendParams.Page = params.page;
      if (params.limit) backendParams.Limit = params.limit;
      if (params.sortBy) backendParams.SortField = params.sortBy;
      if (params.sortOrder) backendParams.SortType = params.sortOrder;
      
      // The search endpoint expects 'keyword' for the search term.
      if (isSearch) {
        backendParams.keyword = params.search;
      }
    }
  
    const response = await this.get<PaginatedResponse<User>>(
      endpoint,
      { params: backendParams }
    );
  
    return {
      items: response.items || [],
      pagination: response.pagination || {
        totalItems: response.items?.length || 0,
        itemsPerPage: backendParams.Limit || 10,
        currentPage: backendParams.Page || 1,
        totalPages: 1,
      },
    };
  }

  async getUsers(params?: QueryParams): Promise<User[]> {
    const response = await this.getUsersWithPagination(params);
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
    if (payload.UrlAvatar instanceof File) {
      return this._updateWithFormData(url, payload);
    }
    return this.put<User>(url, payload);
  }

  async update(userId: string, payload: UpdateUserPayload): Promise<User> {
    return this.updateUserByAdmin(userId, payload);
  }

  async updateProfile(payload: UpdateUserPayload): Promise<User> {
    const url = API_CONFIG.endpoints.users.updateUsers;
    if (payload.UrlAvatar instanceof File) {
      return this._updateWithFormData(url, payload);
    }
    return this.put<User>(url, payload);
  }

  async deleteUser(userId: string): Promise<any> {
    const url = API_CONFIG.endpoints.users.softDelete(userId);
    return await this.delete(url);
  }

  async resetPassword(
    userId: string,
    payload: ResetPasswordPayload
  ): Promise<void> {
    const url = API_CONFIG.endpoints.users.resetPassword(userId);
    await this.patch<void>(url, payload);
  }

}

export const usersService = new UsersService();
export default usersService;
