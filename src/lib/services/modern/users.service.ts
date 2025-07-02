
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
    // Determine the endpoint and map parameters for the backend.
    // This handles both general listing and searching with consistent pagination.
    const isSearch = params?.search && params.search.trim() !== "";
    const endpoint = isSearch
      ? API_CONFIG.endpoints.users.search
      : this.endpoint;

    // Map frontend query params (camelCase) to backend expected params (PascalCase)
    const backendParams: Record<string, any> = {};
    if (params) {
      if (params.page) backendParams.Page = params.page;
      if (params.limit) {
        // The backend API returns an error "Value must be less than 24".
        // To prevent this validation error, we will only send the Limit parameter
        // if it meets this condition. If the requested limit is 24 or more,
        // we omit it, and the backend will use its default page size.
        if (params.limit < 24) {
          backendParams.Limit = params.limit;
        }
      }
      if (params.sortField) backendParams.SortField = params.sortField;
      if (params.sortType) backendParams.SortType = params.sortType;

      // The search endpoint expects 'keyword' for the search term.
      if (isSearch) {
        backendParams.keyword = params.search;
      }
    }

    const response = await this.get<PaginatedResponse<User>>(
      endpoint,
      { params: backendParams }
    );
    // Ensure a valid paginated response structure is always returned for the UI.
    // This provides the necessary `pagination` object for the DataTable component.
    return {
      items: response.items || [],
      pagination: response.pagination || {
        totalItems: response.items?.length || 0,
        itemsPerPage: backendParams.Limit || 24, // Use the limit sent or a default
        currentPage: backendParams.Page || 1,
        totalPages: 1, // Default to 1 page if no pagination info from API
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
  ): Promise<any> {
    const url = API_CONFIG.endpoints.users.resetPassword(userId);
    return await this.patch<any>(url, payload);
  }

}

export const usersService = new UsersService();
export default usersService;
