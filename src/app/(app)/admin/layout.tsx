"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loadingAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loadingAuth) {
      if (!user) {
        router.replace("/login");
      } else if (user.role !== "ADMIN" && user.role !== "HR") {
        router.replace("/dashboard");
      }
    }
  }, [user, loadingAuth, router]);

  // Show loading state
  if (loadingAuth) {
    console.log("⏳ [AdminLayout] Still loading auth...");
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Đang xác thực...</p>
        </div>
      </div>
    );
  }

  // Check if user exists
  if (!user) {
    console.log("❌ [AdminLayout] No user found");
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Đang chuyển hướng...</p>
        </div>
      </div>
    );
  }

  // Check permissions
  if (user.role !== "ADMIN" && user.role !== "HR") {
    console.log("🚫 [AdminLayout] Insufficient permissions");
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Không có quyền truy cập
          </p>
        </div>
      </div>
    );
  }

  // Nếu là HR và cố gắng truy cập một số trang chỉ dành cho Admin (ví dụ: /admin/settings), có thể thêm logic chuyển hướng ở đây nếu cần.
  // Ví dụ: if (user.role === 'HR' && someAdminOnlyPaths.includes(pathname)) router.replace('/hr/trainees');

  return <div className="space-y-6">{children}</div>;
}
