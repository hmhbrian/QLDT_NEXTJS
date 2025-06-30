"use client";

import { User, LoginDTO } from "@/lib/types/user.types";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { API_CONFIG } from "@/lib/config";
import { authService } from "@/lib/services";
import { mockUsers } from "@/lib/mock";
import { extractErrorMessage } from "@/lib/core";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loadingAuth: boolean;
  login: (credentials: LoginDTO) => Promise<void>;
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
  const pathname = usePathname();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleRedirect = useCallback(
    (userRole: string) => {
      switch (userRole) {
        case "ADMIN":
          router.push("/admin/users");
          break;
        case "HR":
          router.push("/hr/trainees");
          break;
        default:
          router.push("/dashboard");
          break;
      }
    },
    [router]
  );

  const initializeAuth = useCallback(async () => {
    try {
      const storedUser = localStorage.getItem(API_CONFIG.storage.user);
      const token = localStorage.getItem(API_CONFIG.storage.token);

      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
      } else if (pathname !== "/login" && !pathname.startsWith("/auth")) {
        router.push("/login");
      }
    } catch (error) {
      console.error("Failed to initialize auth state:", error);
      setUser(null);
      localStorage.clear();
      router.push("/login");
    } finally {
      setLoadingAuth(false);
    }
  }, [pathname, router]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async (credentials: LoginDTO) => {
    setLoadingAuth(true);
    try {
      console.log("Login response 1:", Response);
      if (API_CONFIG.useApi) {
        const response = await authService.login(credentials);
        console.log("Login response 2:", response);
        // The API response is an object { success, message, data: { user, accessToken } }
        // We need to check for success and the presence of the data object.
        if (response.success && response) {
          // The actual user object, which includes the token, is in response.data
          const userWithToken = response;
          console.log("User data from API:", userWithToken);

          // Separate token from user data for cleaner state management
          const { accessToken: token, ...userToStore } = userWithToken;

          // setUser(userToStore);
          localStorage.setItem(
            API_CONFIG.storage.user,
            JSON.stringify(userToStore)
          );
          localStorage.setItem(API_CONFIG.storage.token, token);

          toast({
            title: "Đăng nhập thành công",
            description: "Chào mừng bạn đã quay trở lại!",
            variant: "success",
          });
          // handleRedirect(userToStore.role);
        } else {
          // Use the message from the API for more specific feedback
          throw new Error(
            response.message || "Đăng nhập thất bại do dữ liệu không hợp lệ."
          );
        }
      } else {
        const mockUser = mockUsers.find(
          (u) =>
            u.email === credentials.email && u.password === credentials.password
        );
        if (!mockUser) {
          throw new Error("Invalid credentials");
        }
        setUser(mockUser);
        localStorage.setItem(API_CONFIG.storage.user, JSON.stringify(mockUser));
        toast({
          title: "Đăng nhập thành công",
          description: "Chào mừng bạn đã quay trở lại! (Chế độ offline)",
          variant: "success",
        });
        handleRedirect(mockUser.role);
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      logout();
      toast({
        title: "Đăng nhập thất bại",
        description: "Email hoặc mật khẩu không chính xác. Vui lòng thử lại.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoadingAuth(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(API_CONFIG.storage.user);
    localStorage.removeItem(API_CONFIG.storage.token);

    // Xóa toàn bộ cache của React Query để đảm bảo dữ liệu mới được tải lại
    queryClient.clear();

    if (pathname !== "/login") {
      router.push("/login");
    }

    if (API_CONFIG.useApi) {
      authService.logout().catch((err) => {
        console.error(
          "API logout failed, but user is logged out locally:",
          err
        );
      });
    }
  };

  const updateAvatar = async (newAvatarUrl: string) => {
    if (!user) {
      toast({
        title: "Lỗi xác thực",
        description: "Vui lòng đăng nhập để thực hiện thao tác này.",
        variant: "destructive",
      });
      throw new Error("User not authenticated.");
    }

    if (
      !newAvatarUrl ||
      (!newAvatarUrl.startsWith("http") && !newAvatarUrl.startsWith("blob:"))
    ) {
      toast({
        title: "Lỗi tệp tin",
        description: "URL ảnh đại diện không hợp lệ.",
        variant: "destructive",
      });
      throw new Error("Invalid avatar URL or file.");
    }

    const updatedUser = { ...user, urlAvatar: newAvatarUrl };
    setUser(updatedUser);
    localStorage.setItem(API_CONFIG.storage.user, JSON.stringify(updatedUser));
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    if (!user) {
      toast({
        title: "Lỗi xác thực",
        description: "Vui lòng đăng nhập để thực hiện thao tác này.",
        variant: "destructive",
      });
      throw new Error("User not authenticated");
    }
    try {
      if (newPassword.length < 6) {
        throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự.");
      }
      if (oldPassword === newPassword) {
        throw new Error("Mật khẩu mới không được trùng với mật khẩu cũ.");
      }

      if (API_CONFIG.useApi) {
        await authService.changePassword({
          oldPassword: oldPassword,
          newPassword: newPassword,
          confirmNewPassword: newPassword,
        });
      } else {
        console.log("Mock password change successful.");
      }

      toast({
        title: "Thành công",
        description: "Mật khẩu của bạn đã được thay đổi thành công.",
        variant: "success",
      });
      return true;
    } catch (error) {
      toast({
        title: "Đổi mật khẩu thất bại",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
      throw error;
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
