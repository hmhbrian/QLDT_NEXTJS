
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
      if (!user || (user.role !== "ADMIN" && user.role !== "HR")) {
        router.replace("/dashboard"); // Chuyển hướng nếu không phải Admin hoặc HR
      }
    }
  }, [user, loadingAuth, router]);


  // Kiểm tra quyền admin hoặc HR
  if (loadingAuth || !user || (user.role !== 'ADMIN' && user.role !== 'HR')) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  // Nếu là HR và cố gắng truy cập một số trang chỉ dành cho Admin (ví dụ: /admin/settings), có thể thêm logic chuyển hướng ở đây nếu cần.
  // Ví dụ: if (user.role === 'HR' && someAdminOnlyPaths.includes(pathname)) router.replace('/hr/trainees');

  return <div className="space-y-6">{children}</div>;
}
