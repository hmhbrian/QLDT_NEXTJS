
import {
  BaseService,
  PaginatedResponse,
  QueryParams,
} from "@/lib/core";
import { UserApiResponse, CreateUserRequest, UpdateUserRequest, ResetPasswordRequest } from "@/lib/types/user.types";
import { API_CONFIG } from "@/lib/config";
import { mapUserApiToUi } from "@/lib/mappers/user.mapper";

export class UsersService extends BaseService<
  UserApiResponse,
  CreateUserRequest,
  UpdateUserRequest
> {
  constructor() {
    super(API_CONFIG.endpoints.users.base);
  }

  async getUsersWithPagination(
    params: QueryParams = {}
  ): Promise<PaginatedResponse<UserApiResponse>> {
    const backendParams: Record<string, any> = {};
    if (params.Page) backendParams.Page = params.Page;
    if (params.Limit) backendParams.Limit = params.Limit;
    if (params.SortField) backendParams.SortField = params.SortField;
    if (params.SortType) backendParams.SortType = params.SortType;
    if (params.keyword) backendParams.Keyword = params.keyword;
    if (params.RoleName) backendParams.RoleName = params.RoleName;
    
    const isSearch = !!params.keyword || !!params.RoleName;
    const endpoint = isSearch
      ? API_CONFIG.endpoints.users.search
      : this.endpoint;

    const response = await this.get<PaginatedResponse<UserApiResponse>>(endpoint, {
      params: backendParams,
    });
    
    return response;
  }

  async getUserById(id: string): Promise<UserApiResponse> {
    return this.get<UserApiResponse>(`${this.endpoint}/${id}`);
  }

  async createUser(payload: CreateUserRequest): Promise<UserApiResponse> {
    return this.post<UserApiResponse>(API_CONFIG.endpoints.users.create, payload);
  }

  async updateUserByAdmin(
    userId: string,
    payload: UpdateUserRequest
  ): Promise<UserApiResponse> {
    const url = API_CONFIG.endpoints.users.updateAdmin(userId);
    return this.put<UserApiResponse>(url, payload);
  }
  
  async deleteUsers(userIds: string[]): Promise<any> {
    if (!userIds || userIds.length === 0) {
      return Promise.resolve({ success: true, message: "No users to delete." });
    }
    
    // The backend seems to expect individual delete requests.
    // Promise.allSettled is safer than Promise.all for this use case.
    const deletePromises = userIds.map(id => 
        this.delete(API_CONFIG.endpoints.users.softDelete(id)).catch(e => ({ id, error: e }))
    );
    
    const results = await Promise.allSettled(deletePromises);

    const failedDeletes = results.filter(result => result.status === 'rejected');

    if (failedDeletes.length > 0) {
      // Aggregate error messages or handle partial success scenario
      const errorMessage = `Failed to delete ${failedDeletes.length} user(s).`;
      console.error(errorMessage, failedDeletes);
      throw new Error(errorMessage);
    }

    return { success: true, message: "All selected users deleted successfully."};
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
