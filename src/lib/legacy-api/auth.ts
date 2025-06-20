import apiClient from "../api-client";
import { API_CONFIG } from "./config";
import type { UserLoginDto, User } from "../types";

// Types for auth responses
interface LoginResponse {
  message: string;
  statusCode: number;
  code: string;
  data: User;
  accessToken: string;
}

/**
 * Đăng nhập người dùng
 * @param credentials Email và password
 */
export const loginApi = async (
  credentials: UserLoginDto
): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>(
    API_CONFIG.endpoints.auth.login,
    credentials
  );
  return response.data;
};

/**
 * Đăng nhập với email và password riêng biệt (để tương thích ngược)
 * @param email Email người dùng
 * @param password Mật khẩu
 */
export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  return loginApi({ email, password });
};

/**
 * Đăng xuất người dùng
 */
export const logout = async (): Promise<void> => {
  // Clear local storage
  localStorage.removeItem(API_CONFIG.storage.token);
  localStorage.removeItem(API_CONFIG.storage.user);

  // Redirect to login page
  window.location.href = "/login";
};

/**
 * Kiểm tra token có hợp lệ không
 */
export const validateToken = async (): Promise<boolean> => {
  try {
    const token = localStorage.getItem(API_CONFIG.storage.token);
    if (!token) return false;

    // Có thể gọi API để validate token nếu backend có endpoint
    // const response = await apiClient.get("/auth/validate");
    // return response.status === 200;

    return true;
  } catch (error) {
    return false;
  }
};
