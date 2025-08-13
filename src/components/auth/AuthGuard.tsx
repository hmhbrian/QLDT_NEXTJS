"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  fallbackPath?: string;
  showFallback?: boolean;
}

export function AuthGuard({
  children,
  requiredRoles = [],
  fallbackPath = "/login",
  showFallback = true,
}: AuthGuardProps) {
  const { user, loadingAuth } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);
  const [isClient, setIsClient] = useState(false);

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle authentication checks
  useEffect(() => {
    if (!isClient || loadingAuth || hasRedirected.current) return;

    // No user found
    if (!user) {
      hasRedirected.current = true;
      router.replace(fallbackPath);
      return;
    }

    // Check role permissions
    if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
      hasRedirected.current = true;
      router.replace("/dashboard"); // Default fallback for insufficient permissions
      return;
    }
  }, [user, loadingAuth, router, fallbackPath, requiredRoles, isClient]);

  // Show loading during SSR or auth loading
  if (!isClient || loadingAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Đang xác thực...</p>
          <div className="mt-4 space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="block text-xs text-blue-500 hover:underline mx-auto"
            >
              Làm mới
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = "/login";
              }}
              className="block text-xs text-red-500 hover:underline mx-auto"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User not found
  if (!user) {
    if (!showFallback) return null;

    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Đang chuyển hướng...</p>
        </div>
      </div>
    );
  }

  // Check role permissions
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    if (!showFallback) return null;

    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Không có quyền truy cập
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-2 text-xs text-blue-500 hover:underline"
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
