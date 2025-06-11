'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ActualSidebar } from '@/components/layout/ActualSidebar'; // Import ActualSidebar
import { Header } from '@/components/layout/Header'; // Import Header
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Loader2 } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loadingAuth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loadingAuth && !user) {
      router.replace('/login');
      return;
    }

    // Nếu người dùng đã đăng nhập nhưng đang ở trang gốc, chuyển hướng đến dashboard
    if (!loadingAuth && user && pathname === '/') {
        router.replace('/dashboard');
    }
  }, [loadingAuth, user, router, pathname]);

  // Hiển thị trạng thái đang tải khi đang kiểm tra xác thực
  if (loadingAuth) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Nếu không có người dùng, không hiển thị bất kỳ nội dung nào (sẽ chuyển hướng)
  if (!user) {
    return null;
  }

  // Không hiển thị layout cho các trang đặc biệt
  if (pathname === '/login' || pathname === '/register' || pathname === '/forgot-password') {
    return <>{children}</>;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <ActualSidebar />
      <div className="flex flex-col flex-1 min-w-0"> 
        <Header />
        <SidebarInset className="flex-1 overflow-auto">
          <main className="p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

