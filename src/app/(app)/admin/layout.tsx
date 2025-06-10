'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loadingAuth } = useAuth();
  const router = useRouter();

  // Kiểm tra quyền admin hoặc HR
  if (loadingAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || (user.role !== 'Admin' && user.role !== 'HR')) {
    router.replace('/dashboard'); // Chuyển hướng nếu không phải Admin hoặc HR
    return null;
  }
  
  // Nếu là HR và cố gắng truy cập một số trang chỉ dành cho Admin (ví dụ: /admin/settings), có thể thêm logic chuyển hướng ở đây nếu cần.
  // Ví dụ: if (user.role === 'HR' && someAdminOnlyPaths.includes(pathname)) router.replace('/hr/trainees');


  return (
    <div className="space-y-6">
      {children}
    </div>
  );
}
