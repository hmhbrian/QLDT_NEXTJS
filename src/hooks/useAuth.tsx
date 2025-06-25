"use client";

import { User, LoginDTO } from "@/lib/types";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { useError } from "./use-error";
import { API_CONFIG } from "@/lib/legacy-api/config";
import { authService } from "@/lib/services";
import { mockUsers } from "@/lib/mock";

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
  const { showError } = useError();

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
        // Optional: Validate token with backend here
        // const isValid = await authService.validateToken();
        // if (!isValid) {
        //   logout();
        // }
      } else if (
        pathname !== "/login" &&
        !pathname.startsWith("/auth") // Adjust as per your auth routes
      ) {
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
      if (API_CONFIG.useApi) {
        const response = await authService.login(credentials);

        // Kiểm tra response.code để xác nhận thành công
        if (response.code === "SUCCESS" && response.data) {
          const userToSet = response.data;

          setUser(userToSet);
          localStorage.setItem(
            API_CONFIG.storage.user,
            JSON.stringify(userToSet)
          );

          // Tìm accessToken từ nhiều vị trí có thể
          const token =
            response.accessToken ||
            (response as any).token ||
            (response.data as any).accessToken ||
            (response.data as any).token ||
            "mock-token"; // Fallback for development

          localStorage.setItem(API_CONFIG.storage.token, token);

          showError("SUCCESS005");
          handleRedirect(userToSet.role);
        } else {
          throw new Error(response.message || "Login failed");
        }
      } else {
        // Mock Login
        const mockUser = mockUsers.find(
          (u) =>
            u.email === credentials.email && u.password === credentials.password
        );
        if (!mockUser) {
          throw new Error("Invalid credentials");
        }
        setUser(mockUser);
        localStorage.setItem(API_CONFIG.storage.user, JSON.stringify(mockUser));
        showError("SUCCESS005");
        handleRedirect(mockUser.role);
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      logout(); // Đảm bảo trạng thái sạch khi lỗi
      showError("AUTH001");
      throw error; // Ném lỗi để form xử lý
    } finally {
      setLoadingAuth(false);
    }
  };

  const logout = () => {
    // Perform local cleanup immediately
    setUser(null);
    localStorage.removeItem(API_CONFIG.storage.user);
    localStorage.removeItem(API_CONFIG.storage.token);

    // Redirect to login page
    if (pathname !== "/login") {
      router.push("/login");
    }

    // Call API to logout on the server in the background
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
      showError("AUTH003");
      throw new Error("AUTH003");
    }

    if (
      !newAvatarUrl ||
      (!newAvatarUrl.startsWith("http") && !newAvatarUrl.startsWith("blob:"))
    ) {
      showError("FILE001");
      throw new Error("Invalid avatar URL or file.");
    }

    const updatedUser = { ...user, urlAvatar: newAvatarUrl };
    setUser(updatedUser);
    localStorage.setItem(API_CONFIG.storage.user, JSON.stringify(updatedUser));
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    if (!user) {
      showError("AUTH003");
      throw new Error("User not authenticated");
    }
    try {
      if (newPassword.length < 6) throw new Error("PASSWORD001");
      if (oldPassword === newPassword) throw new Error("PASSWORD003");

      if (API_CONFIG.useApi) {
        await authService.changePassword({
          oldPassword: oldPassword,
          newPassword: newPassword,
          confirmNewPassword: newPassword,
        });
      } else {
        // Mock password change logic
        console.log("Mock password change successful.");
      }

      showError("SUCCESS004");
      return true;
    } catch (error) {
      const errorCode = error instanceof Error ? error.message : "SYS002";
      showError(errorCode);
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
