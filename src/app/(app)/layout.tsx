'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ActualSidebar } from '@/components/layout/ActualSidebar';
import { Header } from '@/components/layout/Header';
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

    // Redirect users based on role and current path
    if (!loadingAuth && user) {
      // Admin users shouldn't access HR paths
      if (user.role === 'Admin' && pathname.startsWith('/hr')) {
        router.replace('/admin/users');
        return;
      }
      
      // HR users shouldn't access Admin paths
      if (user.role === 'HR' && pathname.startsWith('/admin')) {
        router.replace('/hr/trainees');
        return;
      }
      
      // Trainee users shouldn't access Admin or HR paths
      if (user.role === 'Trainee' && (pathname.startsWith('/admin') || pathname.startsWith('/hr'))) {
        router.replace('/dashboard');
        return;
      }
    }
  }, [user, loadingAuth, router, pathname]);

  if (loadingAuth || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <ActualSidebar />
      <div className="flex flex-col flex-1 min-w-0"> {/* Added min-w-0 for better flex handling */}
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
