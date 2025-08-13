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
import { usePathname } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { authService, httpClient } from "@/lib/services";
import { extractErrorMessage } from "@/lib/core";
import { useQueryClient } from "@tanstack/react-query";
import { useInstantNavigation } from "@/hooks/useInstantNavigation";
import { mapUserApiToUi } from "@/lib/mappers/user.mapper";
import { API_CONFIG } from "@/lib/config";
import { cookieManager } from "@/lib/utils/cookie-manager";

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [authAttempts, setAuthAttempts] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { navigateInstant } = useInstantNavigation();
  const pathname = usePathname();
  const maxAuthAttempts = 3;

  const logout = useCallback(() => {
    // Clear auth service state
    authService.logout();

    // Clear React state
    setUser(null);
    setLoadingAuth(false); // Ensure we're not stuck in loading state

    // Clear all storage
    localStorage.removeItem(API_CONFIG.storage.token);
    localStorage.removeItem("qldt_user_info");

    // Clear secure cookies
    cookieManager.removeSecureAuth();

    // Clear HTTP client authorization
    httpClient.clearAuthorizationHeader();

    // Clear all React Query cache
    queryClient.clear();

    navigateInstant("/login");
  }, [queryClient, navigateInstant]);
  const refreshUserData = useCallback(async () => {
    try {
      // Ensure we have a valid token
      const token = cookieManager.getSecureAuth();
      if (!token) {
        logout();
        return;
      }

      // Ensure httpClient has the token
      if (!httpClient.getAuthorizationToken()) {
        httpClient.setAuthorizationHeader(token);
      }

      const currentUserData = await authService.getCurrentUser();
      const mappedUser = mapUserApiToUi(currentUserData);
      setUser(mappedUser);
    } catch (error: any) {
      // If it's an auth error, logout
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout();
      }
    }
  }, [logout]);

  const initializeAuth = useCallback(async () => {
    try {
      // Check for token from secure cookies first
      const token = cookieManager.getSecureAuth();

      if (!token) {
        setUser(null);
        httpClient.clearAuthorizationHeader();
        localStorage.removeItem("qldt_user_info");
        setLoadingAuth(false);
        return;
      }

      // Set the authorization header with the token
      httpClient.setAuthorizationHeader(token);

      // Get user data from API
      const currentUserData = await authService.getCurrentUser();
      const mappedUser = mapUserApiToUi(currentUserData);

      // Validation đơn giản hơn - chỉ cần có ID
      if (!mappedUser || !mappedUser.id) {
        throw new Error("Invalid user data - missing ID");
      }

      setUser(mappedUser);
    } catch (error: any) {
      setAuthAttempts((prev) => prev + 1);

      // Clear all auth data
      setUser(null);
      cookieManager.removeSecureAuth();
      httpClient.clearAuthorizationHeader();
      localStorage.removeItem("qldt_user_info");
    } finally {
      // ALWAYS set loading to false regardless of success or failure
      setLoadingAuth(false);
    }
  }, [authAttempts, maxAuthAttempts]);

  useEffect(() => {
    initializeAuth();

    // Safety net: force loading to false after 5 seconds to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loadingAuth) {
        setLoadingAuth(false);
      }
    }, 5000); // Reduced from 10 to 5 seconds

    return () => {
      clearTimeout(timeoutId);
    };
  }, [initializeAuth]);

  // Listen for authentication errors from httpClient
  useEffect(() => {
    const handleAuthError = (event: CustomEvent) => {
      const { status } = event.detail;

      // Only logout on 401 (unauthorized), not 403 (forbidden/insufficient permissions)
      if (status === 401) {
        logout();
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("auth-error", handleAuthError as EventListener);
      return () => {
        window.removeEventListener(
          "auth-error",
          handleAuthError as EventListener
        );
      };
    }
  }, [logout]);

  useEffect(() => {
    if (loadingAuth) {
      return;
    }

    const isAuthPage = pathname === "/login";
    const isValidUser = user && user.id && user.id.length > 0;

    if (isValidUser) {
      if (isAuthPage) {
        const redirectUrl =
          user.role === "ADMIN"
            ? "/admin/users"
            : user.role === "HR"
            ? "/hr/trainees"
            : "/dashboard";
        navigateInstant(redirectUrl);
      }
    } else {
      if (!isAuthPage) {
        navigateInstant("/login");
      }
    }
  }, [user, loadingAuth, pathname, navigateInstant]);

  const login = async (credentials: LoginDTO, rememberMe: boolean = false) => {
    setLoadingAuth(true);

    try {
      const loginResponse = await authService.login(credentials);
      const mappedUser = mapUserApiToUi(loginResponse);

      // Lưu token vào cookie và httpClient
      if (loginResponse.accessToken) {
        httpClient.setAuthorizationHeader(loginResponse.accessToken);
        cookieManager.setSecureAuth(loginResponse.accessToken, true);
        localStorage.setItem("qldt_user_info", JSON.stringify(loginResponse));
      }

      setUser(mappedUser);
      await queryClient.invalidateQueries();

      toast({
        title: "Đăng nhập thành công",
        description: "Chào mừng bạn đã quay trở lại!",
        variant: "success",
      });
    } catch (error: any) {
      setUser(null);
      httpClient.clearAuthorizationHeader();
      toast({
        title: "Đăng nhập thất bại",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoadingAuth(false);
    }
  };

  const updateAvatar = async (newAvatarFile: File) => {
    if (!user) {
      throw new Error("User not authenticated.");
    }
    const payload: UserProfileUpdateRequest = { UrlAvatar: newAvatarFile };
    try {
      const response = await authService.updateUserProfile(payload);
      const updatedUser = mapUserApiToUi(response);
      setUser((prevUser) =>
        prevUser ? { ...prevUser, ...updatedUser } : updatedUser
      );
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
      throw new Error("User not authenticated");
    }
    try {
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

  const contextValue = {
    user,
    setUser,
    loadingAuth,
    login,
    logout,
    updateAvatar,
    changePassword,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
