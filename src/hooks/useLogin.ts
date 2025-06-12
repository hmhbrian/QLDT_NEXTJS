'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './useAuth';
import { mockLoginAPI } from '@/lib/mock';

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { setUser } = useAuth();

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await mockLoginAPI(email, password);

      if (response.success && response.user) {
        const userWithMissingProps = {
          ...response.user,
          idCard: '',
          phoneNumber: '',
          role: response.user.role as 'Admin' | 'HR' | 'Trainee'
        };
        setUser(userWithMissingProps);
        toast({
          title: 'Thành công',
          description: response.message,
        });
        router.push('/dashboard');
      } else {
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: response.message,
        });
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Đã có lỗi xảy ra khi đăng nhập',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    isLoading
  };
} 