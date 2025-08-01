
'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ActualSidebar } from '@/components/layout/ActualSidebar';
import { Header } from '@/components/layout/Header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Loader2 } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loadingAuth } = useAuth();

  // Show a loading spinner while checking authentication state.
  // This is crucial to prevent rendering the layout with a null user
  // during the initial auth check, which causes the "N/A" issue.
  if (loadingAuth) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Đang xác thực...</p>
        </div>
      </div>
    );
  }

  // If the auth check is complete and there's still no user,
  // it means the user should be redirected to login. The AuthProvider handles this.
  // We render null here to avoid a flash of the layout.
  if (!user) {
    return null;
  }

  // Render the full app layout only for authenticated users
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
