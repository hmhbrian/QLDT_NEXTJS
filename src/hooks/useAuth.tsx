'use client';

import type { User, Role } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useError } from './use-error';

interface AuthContextType {
  user: User | null;
  loadingAuth: boolean;
  login: (email: string, password?: string) => Promise<void>; 
  logout: () => void;
  updateAvatar: (newAvatarUrl: string) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUsers: Record<string, Omit<User, 'email'>> = {
  'admin@becamex.com': { id: '1', name: 'Quản trị viên', role: 'Admin', avatar: 'https://avatars.githubusercontent.com/u/92621536?s=96&v=4' },
  'hr@becamex.com': { id: '2', name: 'Quản lý nhân sự', role: 'HR', avatar: 'https://placehold.co/100x100.png' },
  'trainee@becamex.com': { id: '3', name: 'Học viên Một', role: 'Trainee', avatar: 'https://placehold.co/100x100.png' },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const { showError } = useError();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('becamex-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Không thể phân tích người dùng từ localStorage", error);
      localStorage.removeItem('becamex-user');
    }
    setLoadingAuth(false);
  }, []);

  const login = async (email: string, password?: string) => { 
    setLoadingAuth(true);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const baseUser = mockUsers[email.toLowerCase()]; 
    
    if (baseUser) {
      const loggedInUser: User = { ...baseUser, email: email.toLowerCase() };
      setUser(loggedInUser);
      localStorage.setItem('becamex-user', JSON.stringify(loggedInUser));
      // Đợi toast hiển thị xong rồi mới chuyển trang
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
      showError('SUCCESS003');

    } else {
      setLoadingAuth(false); 
      throw new Error('Không tìm thấy người dùng hoặc thông tin đăng nhập không hợp lệ.');
    }
    setLoadingAuth(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('becamex-user');
    router.push('/login');
  };

  const updateAvatar = async (newAvatarUrl: string) => {
    if (!user) return;
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    if (!newAvatarUrl || !newAvatarUrl.startsWith('http')) {
        toast({
            variant: "destructive",
            title: "Lỗi cập nhật ảnh đại diện",
            description: "Vui lòng cung cấp một URL hợp lệ cho ảnh đại diện.",
        });
        throw new Error("URL ảnh đại diện không hợp lệ.");
    }
    const updatedUser = { ...user, avatar: newAvatarUrl };
    setUser(updatedUser);
    localStorage.setItem('becamex-user', JSON.stringify(updatedUser));
    toast({
        title: "Thành công",
        description: "Ảnh đại diện đã được cập nhật.",
    });
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    try {
      // Validate password length
      if (newPassword.length < 8) {
        throw new Error('PASSWORD001');
      }

      // Validate password strength
      const hasUpperCase = /[A-Z]/.test(newPassword);
      const hasLowerCase = /[a-z]/.test(newPassword);
      const hasNumbers = /\d/.test(newPassword);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

      if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar)) {
        throw new Error('PASSWORD002');
      }

      // Validate old password
      if (oldPassword === newPassword) {
        throw new Error('PASSWORD003');
      }

      // Call API to change password
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.code || 'PASSWORD004');
      }

      showError('SUCCESS002'); // Thông báo đổi mật khẩu thành công
      return true;
    } catch (error: any) {
      const errorCode = error.message || 'SYS002';
      showError(errorCode);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loadingAuth, login, logout, updateAvatar, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth phải được sử dụng trong một AuthProvider');
  }
  return context;
}
