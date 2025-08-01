"use client";

import {
  User,
  LoginDTO,
  UserApiResponse,
  ChangePasswordRequest,
  UserProfileUpdateRequest,
} from "@/lib/types/user.types";
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
import {
  COURSES_QUERY_KEY,
  ENROLLED_COURSES_QUERY_KEY,
} from "@/hooks/use-courses";
import { mapUserApiToUi } from "@/lib/mappers/user.mapper";
import { cacheManager, cookieManager, stateSyncManager } from "@/lib/cache";
import { useInstantNavigation } from "@/hooks/useInstantNavigation";

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loadingAuth: boolean;
  login: (credentials: LoginDTO, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  updateAvatar: (newAvatarFile: File) => Promise<void>;
  changePassword: (
    oldPassword: string,
    newPassword: string
  ) => Promise<boolean>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { navigateInstant } = useInstantNavigation();

  const handleRedirect = useCallback(
    (userRole: string) => {
      const redirectUrl = (() => {
        switch (userRole) {
          case "ADMIN":
            return "/admin/users";
          case "HR":
            return "/hr/trainees";
          default:
            return "/dashboard";
        }
      })();

      // Use instant navigation - GitHub style
      // Navigate immediately without waiting for any async operations
      navigateInstant(redirectUrl);
    },
    [navigateInstant]
  );

  const initializeAuth = useCallback(async () => {
    try {
      // Try to get user from cache first
      let cachedUser = cacheManager.get<User>("current_user");
      const token =
        cookieManager.get("auth_token") ||
        localStorage.getItem(API_CONFIG.storage.token);

      if (!cachedUser) {
        // Fallback to localStorage
        const storedUser = localStorage.getItem(API_CONFIG.storage.user);
        if (storedUser) {
          cachedUser = JSON.parse(storedUser);
          // Cache for next time
          cacheManager.set("current_user", cachedUser, {
            maxAge: 24 * 60 * 60 * 1000,
          });
        }
      }

      if (cachedUser && token) {
        setUser(cachedUser);

        // Subscribe to user data changes
        stateSyncManager.subscribe<User>("current_user", (newUser) => {
          if (newUser && newUser !== null) {
            setUser(newUser);
            localStorage.setItem(
              API_CONFIG.storage.user,
              JSON.stringify(newUser)
            );
          }
        });

        // Validate token in background
        try {
          await authService.validateToken();
        } catch (error) {
          console.warn("Token validation failed, clearing auth data");
          logout();
          return;
        }
      } else if (pathname !== "/login" && !pathname.startsWith("/auth")) {
        navigateInstant("/login");
      }
    } catch (error) {
      console.error("Failed to initialize auth state:", error);
      setUser(null);
      clearAuthData();
      navigateInstant("/login");
    } finally {
      setLoadingAuth(false);
    }
  }, [pathname, router, navigateInstant]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const clearAuthData = useCallback(() => {
    // Clear all auth-related data
    localStorage.removeItem(API_CONFIG.storage.user);
    localStorage.removeItem(API_CONFIG.storage.token);
    cookieManager.remove("auth_token");
    cookieManager.remove("refresh_token");
    cacheManager.invalidate("current_user");
    stateSyncManager.invalidateState("current_user");
  }, []);

  const login = async (credentials: LoginDTO, rememberMe: boolean = false) => {
    setLoadingAuth(true);
    try {
      if (API_CONFIG.useApi) {
        const response = await authService.login(credentials);
        if (response && response.accessToken) {
          const { accessToken, ...apiUser } = response;
          const userToStore = mapUserApiToUi(apiUser as UserApiResponse);

          setUser(userToStore);

          // Store in multiple locations for reliability
          localStorage.setItem(
            API_CONFIG.storage.user,
            JSON.stringify(userToStore)
          );
          localStorage.setItem(API_CONFIG.storage.token, accessToken);

          // Use secure cookies for sensitive data
          if (rememberMe) {
            cookieManager.setAuth("auth_token", accessToken, { expires: 30 }); // 30 days
          } else {
            cookieManager.setSession("auth_token", accessToken); // Session only
          }

          // Cache user data
          cacheManager.set("current_user", userToStore, {
            maxAge: 24 * 60 * 60 * 1000,
          });
          stateSyncManager.updateState("current_user", userToStore);

          toast({
            title: "Đăng nhập thành công",
            description: "Chào mừng bạn đã quay trở lại!",
            variant: "success",
          });

          // Navigate immediately, don't await
          handleRedirect(userToStore.role);
        } else {
          throw new Error("Đăng nhập thất bại do dữ liệu không hợp lệ.");
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

        try {
          cacheManager.set("current_user", mockUser, {
            maxAge: 24 * 60 * 60 * 1000,
          });
        } catch (cacheError) {
          console.warn("Failed to cache user data:", cacheError);
          // Continue without caching
        }

        toast({
          title: "Đăng nhập thành công",
          description: "Chào mừng bạn đã quay trở lại! (Chế độ offline)",
          variant: "success",
        });

        // Navigate immediately, don't await
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

  const logout = useCallback(() => {
    setUser(null);
    clearAuthData();

    // Invalidate all user-related queries and cache
    queryClient.invalidateQueries({ queryKey: [ENROLLED_COURSES_QUERY_KEY] });
    queryClient.invalidateQueries({ queryKey: [COURSES_QUERY_KEY] });
    queryClient.clear(); // Clear all queries

    // Clear sensitive cache data
    cacheManager.invalidateByPattern("^user_");
    cacheManager.invalidateByPattern("^courses_");

    if (pathname !== "/login") {
      navigateInstant("/login");
    }
  }, [pathname, queryClient, clearAuthData, navigateInstant]);

  const refreshUserData = useCallback(async () => {
    if (!user) return;

    try {
      const response = await authService.getCurrentUser();
      const updatedUser = mapUserApiToUi(response);

      setUser(updatedUser);
      localStorage.setItem(
        API_CONFIG.storage.user,
        JSON.stringify(updatedUser)
      );
      cacheManager.set("current_user", updatedUser, {
        maxAge: 24 * 60 * 60 * 1000,
      });
      stateSyncManager.updateState("current_user", updatedUser);
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      // Don't logout on refresh failure, just log the error
    }
  }, [user]);

  const updateAvatar = async (newAvatarFile: File) => {
    if (!user) {
      toast({
        title: "Lỗi xác thực",
        description: "Vui lòng đăng nhập để thực hiện thao tác này.",
        variant: "destructive",
      });
      throw new Error("User not authenticated.");
    }

    const payload: UserProfileUpdateRequest = {
      UrlAvatar: newAvatarFile,
    };

    try {
      const response = await authService.updateUserProfile(payload);
      const updatedUser = mapUserApiToUi(response);

      setUser((prevUser) =>
        prevUser ? { ...prevUser, ...updatedUser } : updatedUser
      );

      // Update all storage locations
      localStorage.setItem(
        API_CONFIG.storage.user,
        JSON.stringify(updatedUser)
      );
      cacheManager.set("current_user", updatedUser, {
        maxAge: 24 * 60 * 60 * 1000,
      });
      stateSyncManager.updateState("current_user", updatedUser);

      toast({
        title: "Thành công",
        description: "Ảnh đại diện đã được cập nhật.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Lỗi cập nhật ảnh đại diện",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
      throw error;
    }
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

      await authService.changePassword({
        OldPassword: oldPassword,
        NewPassword: newPassword,
        ConfirmNewPassword: newPassword,
      });

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

  // Setup periodic refresh for user data
  useEffect(() => {
    if (!user) return;

    const refreshInterval = setInterval(() => {
      refreshUserData();
    }, 15 * 60 * 1000); // Refresh every 15 minutes

    return () => clearInterval(refreshInterval);
  }, [user, refreshUserData]);

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
        refreshUserData,
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
