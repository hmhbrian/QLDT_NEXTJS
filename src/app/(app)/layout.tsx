
'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ActualSidebar } from '@/components/layout/ActualSidebar'; // Import ActualSidebar
import { Header } from '@/components/layout/Header'; // Import Header
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loadingAuth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loadingAuth && !user) {
      // Redirect to login only if not already on the login page
      if (pathname !== '/login') {
        router.replace('/login');
      }
      return;
    }

    // Redirect logged-in users from root to dashboard
    if (!loadingAuth && user && pathname === '/') {
        router.replace('/dashboard');
    }
  }, [loadingAuth, user, router, pathname]);

  // Show a loading spinner while checking authentication
  if (loadingAuth) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, render nothing as the redirect is being handled
  if (!user) {
    return null;
  }

  // Render the full app layout for authenticated users
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
