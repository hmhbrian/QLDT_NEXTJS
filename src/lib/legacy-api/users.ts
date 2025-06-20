import apiClient from "../api-client";
import { API_CONFIG } from "./config";
import type { BaseQueryParam, User, UserCreateDto } from "../types";

// Types for API responses
interface UsersResponse {
  message: string;
  code: string;
  data: {
    items: User[];
    pagination: {
      totalItems: number;
      itemsPerPage: number;
      currentPage: number;
      totalPages: number;
    };
  };
}

interface UserResponse {
  data: User;
}

/**
 * Lấy danh sách người dùng có phân trang
 * @param params Tham số phân trang và lọc (Page, Limit, SortField, SortType)
 */
export const fetchUsers = async (
  params: Partial<BaseQueryParam> = {
    Page: 1,
    Limit: 10, // Backend chỉ cho phép 1-24
    SortField: "created.at",
    SortType: "desc",
  }
): Promise<UsersResponse> => {
  try {
    const response = await apiClient.get<UsersResponse>(
      API_CONFIG.endpoints.users.base,
      {
        params,
        headers: {
          Accept: "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error fetching users:", {
      message: error.message,
      status: error.response?.status,
      endpoint: API_CONFIG.endpoints.users.base,
    }); // Fallback to mock data in development only
    if (process.env.NODE_ENV === "development") {
      return {
        message: "Successfully retrieved user list (mock)",
        code: "GET_ALL_USERS_SUCCESS",
        data: {
          items: [
            {
              id: "mock-1",
              email: "admin@becamex.com",
              fullName: "Quản trị viên",
              role: "ADMIN" as const,
              idCard: "123456789",
              phoneNumber: "0123456789",
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: "mock-2",
              email: "user@becamex.com",
              fullName: "Người dùng test",
              role: "HOCVIEN" as const,
              idCard: "987654321",
              phoneNumber: "0987654321",
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          pagination: {
            totalItems: 2,
            itemsPerPage: params.Limit || 10,
            currentPage: params.Page || 1,
            totalPages: 1,
          },
        },
      };
    }

    throw error;
  }
};

/**
 * Lấy thông tin chi tiết của một người dùng theo ID
 * @param userId ID của người dùng cần lấy thông tin
 */
export const getUserById = async (userId: string): Promise<User> => {
  const url = API_CONFIG.endpoints.users.get.replace("{userId}", userId);
  const response = await apiClient.get<UserResponse>(url);
  return response.data.data;
};

/**
 * Tạo người dùng mới (chức năng dành cho admin)
 * @param userData Thông tin người dùng cần tạo
 */
export const createUser = async (userData: UserCreateDto): Promise<User> => {
  const response = await apiClient.post<UserResponse>(
    API_CONFIG.endpoints.users.create,
    userData
  );
  return response.data.data;
};
