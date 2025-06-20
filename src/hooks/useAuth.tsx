"use client";

import { User } from "@/lib/types";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useError } from "./use-error";
import { useUserStore } from "@/stores/user-store";
import {
  loginApi,
  logout as apiLogout,
  validateToken,
} from "@/lib/legacy-api/auth";
import { API_CONFIG } from "@/lib/legacy-api/config";

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loadingAuth: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateAvatar: (newAvatarUrl: string) => Promise<void>;
  changePassword: (
    oldPassword: string,
    newPassword: string
  ) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const router = useRouter();
  const { showError } = useError();
  const users = useUserStore((state) => state.users);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(API_CONFIG.storage.user);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Không thể phân tích người dùng từ localStorage", error);
      localStorage.removeItem("becamex-user");
    }
    setLoadingAuth(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoadingAuth(true);
    try {
      const res = await loginApi({ email, password });
      // Sửa lấy user từ res.data
      const user = res.data;
      const token = res.accessToken;
      if (!user || !user.role) {
        setLoadingAuth(false);
        throw new Error("Đăng nhập thất bại hoặc dữ liệu trả về không hợp lệ.");
      }
      setUser(user);
      localStorage.setItem(API_CONFIG.storage.user, JSON.stringify(user));
      localStorage.setItem(API_CONFIG.storage.token, token);

      // Navigate immediately without delay
      if (user.role === "ADMIN") {
        router.push("/admin/users");
      } else if (user.role === "HR") {
        router.push("/hr/trainees");
      } else {
        router.push("/dashboard");
      }

      showError("SUCCESS005");
    } catch (error: any) {
      setLoadingAuth(false);
      throw new Error(error?.response?.data?.message || "Đăng nhập thất bại.");
    }
    setLoadingAuth(false);
  };

  const logout = () => {
    // Xóa dữ liệu cục bộ và chuyển hướng đến trang đăng nhập
    setUser(null);
    localStorage.removeItem(API_CONFIG.storage.user);
    localStorage.removeItem(API_CONFIG.storage.token);
    router.push("/login");
  };

  const updateAvatar = async (newAvatarUrl: string) => {
    if (!user) {
      showError("AUTH003");
      throw new Error("AUTH003");
    }
    // NO DELAY - Instant avatar update
    // await new Promise((resolve) => setTimeout(resolve, 300)); // Removed delay

    // Cho phép URL http, https và blob cho prototype
    if (
      !newAvatarUrl ||
      (!newAvatarUrl.startsWith("http") && !newAvatarUrl.startsWith("blob:"))
    ) {
      showError("FILE001");
      throw new Error("URL ảnh đại diện không hợp lệ hoặc file không hợp lệ.");
    }

    const updatedUser = { ...user, urlAvatar: newAvatarUrl };
    setUser(updatedUser);
    localStorage.setItem(API_CONFIG.storage.user, JSON.stringify(updatedUser));
    // Toast thành công thường được xử lý bởi component gọi, nhưng có thể thêm ở đây nếu cần
    // toast({
    //     title: "Thành công",
    //     description: "Ảnh đại diện đã được cập nhật.",
    //     variant: "success",
    // });
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    try {
      // Kiểm tra độ dài mật khẩu
      if (newPassword.length < 6) {
        throw new Error("PASSWORD001");
      }

      // Kiểm tra độ mạnh mật khẩu
      const hasUpperCase = /[A-Z]/.test(newPassword);
      const hasLowerCase = /[a-z]/.test(newPassword);
      const hasNumbers = /\d/.test(newPassword);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

      if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar)) {
        throw new Error("PASSWORD002");
      }

      // Kiểm tra mật khẩu cũ
      if (oldPassword === newPassword) {
        throw new Error("PASSWORD003");
      }

      // Gọi API để thay đổi mật khẩu (giả lập)
      // Trong ứng dụng thực tế, đây sẽ là một cuộc gọi API. Hiện tại, giả sử mật khẩu cũ là đúng.
      console.log("Attempting to change password (mocked)", {
        oldPassword,
        newPassword,
      });
      // NO DELAY - Instant password change
      // await new Promise((resolve) => setTimeout(resolve, 500)); // Removed delay
      // const response = await fetch('/api/auth/change-password', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ oldPassword, newPassword }),
      // });

      // if (!response.ok) {
      //   const data = await response.json();
      //   throw new Error(data.code || 'PASSWORD004');
      // }

      showError("SUCCESS004"); // Thông báo đổi mật khẩu thành công
      return true;
    } catch (error) {
      const errorCode = error instanceof Error ? error.message : "SYS002";
      showError(errorCode);
      throw error; // Ném lại lỗi để component gọi có thể xử lý nếu cần
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loadingAuth,
        login,
        logout,
        updateAvatar,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth phải được sử dụng trong một AuthProvider");
  }
  return context;
}
