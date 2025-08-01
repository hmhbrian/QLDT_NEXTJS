
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
import { extractErrorMessage } from "@/lib/core";
import { useQueryClient } from "@tanstack/react-query";
import { cookieManager } from "@/lib/cache";
import { useInstantNavigation } from "@/hooks/useInstantNavigation";
import { mapUserApiToUi } from "@/lib/mappers/user.mapper";
import { Loading } from "@/components/ui/loading";

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
  const [loadingAuth, setLoadingAuth] = useState(true); // Always start loading
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { navigateInstant } = useInstantNavigation();
  const pathname = usePathname();

  const clearAuthData = useCallback(() => {
    cookieManager.remove("auth_token");
    cookieManager.remove("refresh_token");
    setUser(null); // Ensure user state is cleared
  }, []);
  
  const initializeAuth = useCallback(async () => {
    console.log("🔄 [AuthProvider] Initializing authentication...");
    const token = cookieManager.get("auth_token");

    if (token) {
      try {
        const currentUserData = await authService.getCurrentUser();
        if (currentUserData && currentUserData.id) {
            const mappedUser = mapUserApiToUi(currentUserData);
            console.log("✅ [AuthProvider] User authenticated from token:", mappedUser);
            setUser(mappedUser);
        } else {
            console.warn("⚠️ [AuthProvider] Token found, but failed to get user data. Clearing data.");
            clearAuthData();
        }
      } catch (error) {
        console.error("❌ [AuthProvider] Auth initialization failed:", error);
        clearAuthData();
      }
    } else {
        console.log("ℹ️ [AuthProvider] No auth token found.");
        setUser(null);
    }
    // Defer setting loading to false to prevent race conditions
    setTimeout(() => {
        console.log("🏁 [AuthProvider] Authentication check finished.");
        setLoadingAuth(false)
    }, 100);
  }, [clearAuthData]);

  useEffect(() => {
    initializeAuth();
  }, []);

  // Effect to handle redirection based on auth state
  useEffect(() => {
    // Don't redirect until the initial auth check is complete
    if (loadingAuth) {
      console.log("⏳ [RedirectEffect] Waiting for auth to complete...");
      return;
    }

    const isAuthPage = pathname === "/login";

    if (user && user.id !== 'N/A') {
      console.log(`➡️ [RedirectEffect] User is logged in (Role: ${user.role}). Current path: ${pathname}`);
      // If user is logged in and on the login page, redirect them away
      if (isAuthPage) {
        const redirectUrl = (() => {
          switch (user.role) {
            case "ADMIN": return "/admin/users";
            case "HR": return "/hr/trainees";
            default: return "/dashboard";
          }
        })();
        console.log(`➡️ [RedirectEffect] Redirecting to ${redirectUrl}...`);
        navigateInstant(redirectUrl);
      }
    } else {
      console.log(`➡️ [RedirectEffect] User is not logged in. Current path: ${pathname}`);
      // If user is not logged in and not on the login page, redirect them to login
      if (!isAuthPage) {
        console.log("➡️ [RedirectEffect] Redirecting to /login...");
        navigateInstant("/login");
      }
    }
  }, [user, loadingAuth, pathname, navigateInstant]);

  const login = async (credentials: LoginDTO, rememberMe: boolean = false) => {
    setLoadingAuth(true); // Set loading true during login process
    try {
      const response = await authService.login(credentials);
      if (response && response.accessToken && response.id) {
        const userToStore = mapUserApiToUi(response);
        console.log("✅ [Login] Mapped user data:", userToStore);

        const cookieOptions = rememberMe ? { expires: 30 } : undefined;
        cookieManager.setAuth("auth_token", response.accessToken, cookieOptions);
        
        console.log("✅ [Login] Setting user state...");
        setUser(userToStore);

        toast({
          title: "Đăng nhập thành công",
          description: "Chào mừng bạn đã quay trở lại!",
          variant: "success",
        });
        // Redirection is now handled by the useEffect hook
      } else {
        throw new Error("Phản hồi đăng nhập không hợp lệ từ API.");
      }
    } catch (error: any) {
      console.error("❌ [Login] Login failed:", error);
      clearAuthData(); // Ensure cleanup on failed login
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
    console.log("🚪 [Logout] Logging out user...");
    authService.logout();
    setUser(null);
    queryClient.clear();
    // Redirection is handled by the useEffect hook
  }, [queryClient]);
  
  const refreshUserData = useCallback(async () => {
    if (!user) return;
    try {
      const response = await authService.getCurrentUser();
      const updatedUser = mapUserApiToUi(response);
      setUser(updatedUser);
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      logout();
    }
  }, [user, logout]);

  const updateAvatar = async (newAvatarFile: File) => {
    if (!user) {
      toast({
        title: "Lỗi xác thực",
        description: "Vui lòng đăng nhập để thực hiện thao tác này.",
        variant: "destructive",
      });
      throw new Error("User not authenticated.");
    }
    const payload: UserProfileUpdateRequest = { UrlAvatar: newAvatarFile };
    try {
      const response = await authService.updateUserProfile(payload);
      const updatedUser = mapUserApiToUi(response);
      setUser((prevUser) => (prevUser ? { ...prevUser, ...updatedUser } : updatedUser));
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
  
  // Render a loading screen while the initial auth check is in progress.
  // This prevents the app from rendering with a null user and then flickering.
  if (loadingAuth && pathname !== '/login') {
    return (
        <div className="flex h-screen w-screen items-center justify-center bg-background">
            <Loading variant="page" text="Đang xác thực..." />
        </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
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
