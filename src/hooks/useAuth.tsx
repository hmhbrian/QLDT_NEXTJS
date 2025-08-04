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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { navigateInstant } = useInstantNavigation();
  const pathname = usePathname();

  const logout = useCallback(() => {
    console.log("🔒 [AuthProvider] Logging out...");
    authService.logout(); // This will also clear the auth header in httpClient
    setUser(null);
    localStorage.removeItem(API_CONFIG.storage.token);
    localStorage.removeItem("qldt_user_info"); // Xóa user info
    cookieManager.removeSecureAuth(); // Clear secure auth cookies
    queryClient.clear();
    navigateInstant("/login");
  }, [queryClient, navigateInstant]);

  const refreshUserData = useCallback(async () => {
    try {
      console.log("🔄 [AuthProvider] Refreshing user data...");
      const currentUserData = await authService.getCurrentUser();
      const mappedUser = mapUserApiToUi(currentUserData);
      setUser(mappedUser);
      console.log("✅ [AuthProvider] User data refreshed:", mappedUser);
    } catch (error) {
      console.warn("Could not refresh user data, logging out.", error);
      logout();
    }
  }, [logout]);

  const initializeAuth = useCallback(async () => {
    console.log("🔄 [AuthProvider] Initializing authentication...");

    // Check for token from secure cookies first
    const token = cookieManager.getSecureAuth();
    console.log(
      "🔍 [AuthProvider] Token from cookie:",
      token ? "Found" : "Not found"
    );

    if (!token) {
      console.log("ℹ️ [AuthProvider] No auth token found in cookies.");
      setUser(null);
      httpClient.clearAuthorizationHeader();
      setLoadingAuth(false);
      return;
    }

    // Set the authorization header with the token
    httpClient.setAuthorizationHeader(token);

    try {
      const currentUserData = await authService.getCurrentUser();
      console.log("🔍 [AuthProvider] Raw user data from API:", currentUserData);

      const mappedUser = mapUserApiToUi(currentUserData);
      console.log("🔍 [AuthProvider] Mapped user data:", mappedUser);

      // Validation đơn giản hơn - chỉ cần có ID
      if (!mappedUser || !mappedUser.id) {
        console.warn(
          "⚠️ [AuthProvider] Invalid user data received, clearing auth:",
          mappedUser
        );
        throw new Error("Invalid user data - missing ID");
      }

      setUser(mappedUser);
      console.log(
        "✅ [AuthProvider] User authenticated from token:",
        mappedUser
      );
    } catch (error) {
      console.log(
        "ℹ️ [AuthProvider] Token is invalid or user data invalid, clearing auth data.",
        error
      );
      setUser(null);
      cookieManager.removeSecureAuth();
      httpClient.clearAuthorizationHeader();
    } finally {
      console.log("🏁 [AuthProvider] Authentication check finished.");
      setLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    console.log(
      `🔄 [RedirectEffect] Running... loadingAuth: ${loadingAuth}, user: ${!!user}, pathname: ${pathname}`
    );
    if (loadingAuth) {
      console.log("⏳ [RedirectEffect] Waiting for auth to complete...");
      return;
    }

    const isAuthPage = pathname === "/login";

    // Đơn giản hóa: chỉ cần có user object və ID hợp lệ
    const isValidUser = user && user.id && user.id.length > 0;

    console.log("🔍 [RedirectEffect] Debug info:", {
      hasUser: !!user,
      userId: user?.id,
      userIdLength: user?.id?.length,
      isValidUser,
      userRole: user?.role,
    });

    if (isValidUser) {
      if (isAuthPage) {
        const redirectUrl =
          user.role === "ADMIN"
            ? "/admin/users"
            : user.role === "HR"
            ? "/hr/trainees"
            : "/dashboard";
        console.log(
          `➡️ [RedirectEffect] User is on auth page, redirecting to ${redirectUrl}`
        );
        navigateInstant(redirectUrl);
      }
    } else {
      if (!isAuthPage) {
        console.log(
          "➡️ [RedirectEffect] User not logged in, redirecting to /login"
        );
        navigateInstant("/login");
      }
    }
  }, [user, loadingAuth, pathname, navigateInstant]);

  const login = async (credentials: LoginDTO, rememberMe: boolean = false) => {
    console.log(
      `🚀 [AuthProvider] Attempting login for ${credentials.email}...`
    );
    setLoadingAuth(true);
    try {
      const loginResponse = await authService.login(credentials);
      console.log("🔍 [Login] Login response:", loginResponse);

      const mappedUser = mapUserApiToUi(loginResponse);
      console.log("🔍 [Login] Mapped user:", mappedUser);

      // Lưu token vào cookie và httpClient
      if (loginResponse.accessToken) {
        // Set token vào httpClient
        httpClient.setAuthorizationHeader(loginResponse.accessToken);

        // Lưu token vào cookie - persistent cho đến khi logout
        cookieManager.setSecureAuth(loginResponse.accessToken, true);
        console.log("🔒 [Login] Set persistent secure auth cookie");

        // Lưu user info vào localStorage cho đến khi logout
        localStorage.setItem("qldt_user_info", JSON.stringify(loginResponse));
        console.log("💾 [Login] Saved user info to localStorage");
      }

      // Set user state
      setUser(mappedUser);
      console.log("✅ [Login] User state set successfully:", mappedUser);

      console.log(
        "✅ [AuthProvider] Login successful, user state set:",
        mappedUser
      );

      toast({
        title: "Đăng nhập thành công",
        description: "Chào mừng bạn đã quay trở lại!",
        variant: "success",
      });
    } catch (error: any) {
      setUser(null);
      httpClient.clearAuthorizationHeader(); // Clear header on failed login
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
