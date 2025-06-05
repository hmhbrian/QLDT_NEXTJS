'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useError } from './use-error';

interface LoginResponse {
  success: boolean;
  message?: string;
}

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { showError } = useError();

  const validateInput = (email: string, password: string): boolean => {
    // Kiểm tra email trống
    if (!email.trim()) {
      showError('LOGIN001');
      return false;
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError('LOGIN002');
      return false;
    }

    // Kiểm tra password trống
    if (!password.trim()) {
      showError('LOGIN003');
      return false;
    }

    // Kiểm tra độ dài password
    if (password.length < 6) {
      showError('LOGIN004');
      return false;
    }

    return true;
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      // Validate input trước khi gọi API
      if (!validateInput(email, password)) {
        return false;
      }

      // Giả lập gọi API đăng nhập
      const response = await mockLoginAPI(email, password);
      
      if (response.success) {
        showError('SUCCESS003');
        // Đợi 1 giây trước khi chuyển hướng để người dùng thấy thông báo thành công
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
        return true;
      } else {
        showError('LOGIN005');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      showError('SYS001');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm giả lập API đăng nhập
  const mockLoginAPI = async (email: string, password: string): Promise<LoginResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Giả sử đăng nhập thành công nếu email là admin@example.com và password là password123
        const success = email === 'admin@example.com' && password === 'password123';
        resolve({ 
          success,
          message: success ? 'Đăng nhập thành công' : 'Email hoặc mật khẩu không chính xác'
        });
      }, 1000);
    });
  };

  return {
    login,
    isLoading
  };
} 