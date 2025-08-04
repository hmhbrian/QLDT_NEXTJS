
'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ActualSidebar } from '@/components/layout/ActualSidebar';
import { Header } from '@/components/layout/Header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Loader2 } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loadingAuth } = useAuth();

  // Hiển thị màn hình loading toàn trang trong khi chờ xác thực
  if (loadingAuth) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background" suppressHydrationWarning={true}>
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Đang xác thực...</p>
        </div>
      </div>
    );
  }

  // Nếu quá trình xác thực hoàn tất và không có người dùng,
  // AuthProvider sẽ xử lý việc điều hướng. Trả về null để tránh render bất cứ thứ gì.
  if (!user) {
    return null;
  }

  // Nếu có người dùng, render layout hoàn chỉnh của ứng dụng
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
