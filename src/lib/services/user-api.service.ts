import apiClient from "@/lib/api-client";
import { CreateUserRequest, User } from "@/lib/types";
import { API_CONFIG } from "@/lib/api/config";
import axios from "axios";

export interface ApiResponse<T = any> {
  message: string;
  statusCode: number;
  code: string;
  data?: T;
  errors?: string[];
}

export interface PaginationData {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  totalPages: number;
}

export interface PaginatedApiResponse<T = any> {
  items: T[];
  pagination: PaginationData;
}

export class UserApiService {
  /**
   * Kiểm tra xem có sử dụng API hay không
   */
  static shouldUseApi(): boolean {
    return API_CONFIG.useApi;
  }

  /**
   * Tạo user mới qua API
   */
  static async createUser(userData: CreateUserRequest): Promise<ApiResponse> {
    if (!this.shouldUseApi()) {
      throw {
        message: "API đã được tắt. Vui lòng bật API để sử dụng chức năng này.",
        statusCode: 503,
        code: "API_DISABLED",
        errors: ["API_DISABLED"],
      };
    }

    try {
      console.log("Creating user with data:", userData);

      // Log chi tiết payload để debug
      console.log("Payload JSON:", JSON.stringify(userData, null, 2));

      // URL API của backend
      const apiUrl = `${API_CONFIG.baseURL}/Users/create`;
      console.log("Sending request to:", apiUrl); // Gửi request qua apiClient (có auth header)
      const response = await apiClient.post<ApiResponse>(
        "/Users/create",
        userData
      );

      console.log("User creation response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error creating user:", error);      // Log chi tiết hơn về lỗi
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
        
        // Log chi tiết validation errors nếu có
        if (error.response.data?.errors) {
          console.error("Validation errors details:", error.response.data.errors);
        }
      } else if (error.request) {
        console.error("Error request:", error.request);
      } else {
        console.error("Error message:", error.message);
      }
      console.error("Error config:", error.config);      // Xử lý lỗi từ API
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Xử lý validation errors từ .NET
        if (errorData.errors && typeof errorData.errors === 'object') {
          // Chuyển đổi object validation errors thành array messages
          const validationErrors: string[] = [];
          Object.keys(errorData.errors).forEach(field => {
            const fieldErrors = errorData.errors[field];
            if (Array.isArray(fieldErrors)) {
              fieldErrors.forEach(err => {
                validationErrors.push(`${field}: ${err}`);
              });
            } else {
              validationErrors.push(`${field}: ${fieldErrors}`);
            }
          });
          
          throw {
            message: errorData.title || errorData.message || "Dữ liệu không hợp lệ",
            statusCode: errorData.status || error.response.status,
            code: "VALIDATION_ERROR",
            errors: validationErrors,
          };
        }
        
        // Xử lý các lỗi khác
        throw {
          message: errorData.message || errorData.title || "Đã xảy ra lỗi khi tạo người dùng",
          statusCode: errorData.statusCode || errorData.status || error.response.status,
          code: errorData.code || "API_ERROR",
          errors: errorData.errors || [error.message],
        };
      }

      // Xử lý lỗi network hoặc timeout
      if (error.code === "ECONNREFUSED" || error.code === "NETWORK_ERROR") {
        throw {
          message:
            "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
          statusCode: 503,
          code: "NETWORK_ERROR",
          errors: ["Kết nối mạng bị lỗi"],
        };
      }

      throw {
        message: error.message || "Đã xảy ra lỗi không xác định",
        statusCode: 500,
        code: "SYSTEM_ERROR",
        errors: [error.message || "Unknown error"],
      };
    }
  }
  /**
   * Lấy danh sách user qua API
   */
  static async getUsers(): Promise<User[]> {
    if (!this.shouldUseApi()) {
      throw {
        message: "API đã được tắt. Vui lòng bật API để sử dụng chức năng này.",
        statusCode: 503,
        code: "API_DISABLED",
        errors: ["API_DISABLED"],
      };
    }

    try {
      const response = await apiClient.get<
        ApiResponse<PaginatedApiResponse<User>>
      >(API_CONFIG.endpoints.users.base);
      // Backend trả về: { data: { items: [...], pagination: {...} } }
      return response.data.data?.items || [];
    } catch (error: any) {
      console.error("Error fetching users:", error);
      throw {
        message: "Không thể tải danh sách người dùng từ server.",
        statusCode: error.response?.status || 500,
        code: "FETCH_USERS_ERROR",
        errors: [error.message || "Unknown error"],
      };
    }
  }

  /**
   * Lấy thông tin chi tiết của một user
   */
  static async getUserById(userId: string): Promise<ApiResponse<User>> {
    if (!this.shouldUseApi()) {
      throw {
        message: "API đã được tắt. Vui lòng bật API để sử dụng chức năng này.",
        statusCode: 503,
        code: "API_DISABLED",
        errors: ["API_DISABLED"],
      };
    }

    try {
      const response = await apiClient.get<ApiResponse<User>>(
        `/Users/${userId}`
      );

      return response.data;
    } catch (error: any) {
      console.error("Error fetching user:", error);

      if (error.response?.data) {
        throw error.response.data;
      }

      throw {
        message: "Không thể tải thông tin người dùng từ server.",
        statusCode: error.response?.status || 500,
        code: "FETCH_USER_ERROR",
        errors: [error.message || "Unknown error"],
      };
    }
  }

  /**
   * Cập nhật user bởi admin qua API
   */
  static async updateUserByAdmin(
    userId: string,
    userData: Partial<CreateUserRequest>
  ): Promise<ApiResponse> {
    if (!this.shouldUseApi()) {
      throw {
        message: "API đã được tắt. Vui lòng bật API để sử dụng chức năng này.",
        statusCode: 503,
        code: "API_DISABLED",
        errors: ["API_DISABLED"],
      };
    }
    try {
      console.log("Updating user with admin privileges:", { userId, userData });

      const response = await apiClient.put<ApiResponse>(
        `/Users/admin/${userId}/update`,
        userData
      );

      return response.data;
    } catch (error: any) {
      console.error("Error updating user by admin:", error);

      if (error.response?.data) {
        throw error.response.data;
      }

      throw {
        message: "Đã xảy ra lỗi khi cập nhật người dùng",
        statusCode: error.response?.status || 500,
        code: "UPDATE_USER_ERROR",
        errors: [error.message || "Unknown error"],
      };
    }
  }
  /**
   * Tìm kiếm người dùng theo từ khóa
   */
  static async searchUsers(
    keyword: string
  ): Promise<ApiResponse<PaginatedApiResponse<User>>> {
    if (!this.shouldUseApi()) {
      throw {
        message: "API đã được tắt. Vui lòng bật API để sử dụng chức năng này.",
        statusCode: 503,
        code: "API_DISABLED",
        errors: ["API_DISABLED"],
      };
    }
    try {
      const response = await apiClient.get<
        ApiResponse<PaginatedApiResponse<User>>
      >(`/Users/search/${encodeURIComponent(keyword)}`);

      return response.data;
    } catch (error: any) {
      console.error("Error searching users:", error);

      if (error.response?.data) {
        throw error.response.data;
      }

      throw {
        message: "Không thể tìm kiếm người dùng từ server.",
        statusCode: error.response?.status || 500,
        code: "SEARCH_USERS_ERROR",
        errors: [error.message || "Unknown error"],
      };
    }
  }
  /**
   * Cập nhật user qua API (dành cho user tự cập nhật profile)
   */
  static async updateUser(
    userId: string,
    userData: Partial<CreateUserRequest>
  ): Promise<ApiResponse> {
    if (!this.shouldUseApi()) {
      throw {
        message: "API đã được tắt. Vui lòng bật API để sử dụng chức năng này.",
        statusCode: 503,
        code: "API_DISABLED",
        errors: ["API_DISABLED"],
      };
    }
    try {
      console.log("Updating user profile:", { userId, userData });

      const response = await apiClient.put<ApiResponse>(
        "/Users/update",
        userData
      );

      return response.data;
    } catch (error: any) {
      console.error("Error updating user:", error);

      if (error.response?.data) {
        throw error.response.data;
      }

      throw {
        message: "Đã xảy ra lỗi khi cập nhật người dùng",
        statusCode: error.response?.status || 500,
        code: "UPDATE_USER_ERROR",
        errors: [error.message || "Unknown error"],
      };
    }
  }

  /**
   * Thay đổi mật khẩu của user hiện tại
   */
  static async changePassword(
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<ApiResponse> {
    if (!this.shouldUseApi()) {
      throw {
        message: "API đã được tắt. Vui lòng bật API để sử dụng chức năng này.",
        statusCode: 503,
        code: "API_DISABLED",
        errors: ["API_DISABLED"],
      };
    }
    try {
      const payload = {
        currentPassword,
        newPassword,
        confirmPassword,
      };

      const response = await apiClient.patch<ApiResponse>(
        "/Users/change-password",
        payload
      );

      return response.data;
    } catch (error: any) {
      console.error("Error changing password:", error);

      if (error.response?.data) {
        throw error.response.data;
      }

      throw {
        message: "Đã xảy ra lỗi khi thay đổi mật khẩu",
        statusCode: error.response?.status || 500,
        code: "CHANGE_PASSWORD_ERROR",
        errors: [error.message || "Unknown error"],
      };
    }
  }

  /**
   * Reset mật khẩu của một user (chỉ admin)
   */
  static async resetUserPassword(
    userId: string,
    newPassword: string
  ): Promise<ApiResponse> {
    if (!this.shouldUseApi()) {
      throw {
        message: "API đã được tắt. Vui lòng bật API để sử dụng chức năng này.",
        statusCode: 503,
        code: "API_DISABLED",
        errors: ["API_DISABLED"],
      };
    }
    try {
      const payload = { newPassword };

      const response = await apiClient.patch<ApiResponse>(
        `/Users/${userId}/reset-password`,
        payload
      );

      return response.data;
    } catch (error: any) {
      console.error("Error resetting user password:", error);

      if (error.response?.data) {
        throw error.response.data;
      }

      throw {
        message: "Đã xảy ra lỗi khi reset mật khẩu",
        statusCode: error.response?.status || 500,
        code: "RESET_PASSWORD_ERROR",
        errors: [error.message || "Unknown error"],
      };
    }
  }

  /**
   * Xóa mềm user qua API
   */
  static async softDeleteUser(userId: string): Promise<ApiResponse> {
    if (!this.shouldUseApi()) {
      throw {
        message: "API đã được tắt. Vui lòng bật API để sử dụng chức năng này.",
        statusCode: 503,
        code: "API_DISABLED",
        errors: ["API_DISABLED"],
      };
    }
    try {
      const response = await apiClient.delete<ApiResponse>(
        `/Users/${userId}/soft-delete`
      );

      return response.data;
    } catch (error: any) {
      console.error("Error soft deleting user:", error);

      if (error.response?.data) {
        throw error.response.data;
      }

      throw {
        message: "Đã xảy ra lỗi khi xóa người dùng",
        statusCode: error.response?.status || 500,
        code: "SOFT_DELETE_USER_ERROR",
        errors: [error.message || "Unknown error"],
      };
    }
  }

  /**
   * Đăng nhập user qua API
   */
  static async loginUser(
    email: string,
    password: string
  ): Promise<ApiResponse> {
    if (!this.shouldUseApi()) {
      throw {
        message: "API đã được tắt. Vui lòng bật API để sử dụng chức năng này.",
        statusCode: 503,
        code: "API_DISABLED",
        errors: ["API_DISABLED"],
      };
    }
    try {
      const loginData = { email, password };

      console.log("Logging in user:", { email });

      const response = await apiClient.post<ApiResponse>(
        "/Users/login",
        loginData
      );

      return response.data;
    } catch (error: any) {
      console.error("Error logging in user:", error);

      if (error.response?.data) {
        throw error.response.data;
      }

      throw {
        message: "Đăng nhập thất bại",
        statusCode: error.response?.status || 500,
        code: "LOGIN_ERROR",
        errors: [error.message || "Unknown error"],
      };
    }
  }
}

export default UserApiService;
