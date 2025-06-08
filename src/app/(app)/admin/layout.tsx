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

  // Kiểm tra quyền admin
  if (loadingAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'Admin') {
    router.replace('/dashboard');
    return null;
  }

  return (
    <div className="space-y-6">
      {children}
    </div>
  );
} 