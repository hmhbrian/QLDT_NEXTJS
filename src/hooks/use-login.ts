
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './useAuth';
import { mockLoginAPI, type LoginResponse } from '@/lib/mock';

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { setUser } = useAuth(); // Giả sử useAuth cung cấp hàm setUser

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await mockLoginAPI(email, password);

      if (response.success && response.user) {
        setUser(response.user); // Cập nhật user trong AuthContext
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
    } catch (error) {
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
