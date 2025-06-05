
'use client';

import type { User, Role } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loadingAuth: boolean;
  login: (email: string, password?: string) => Promise<void>; 
  logout: () => void;
  updateAvatar: (newAvatarUrl: string) => Promise<void>;
  changePassword: (newPassword: string, confirmNewPassword: string) => Promise<void>;
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
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const baseUser = mockUsers[email.toLowerCase()]; 
    
    if (baseUser) {
      const loggedInUser: User = { ...baseUser, email: email.toLowerCase() };
      setUser(loggedInUser);
      localStorage.setItem('becamex-user', JSON.stringify(loggedInUser));
      router.push('/dashboard');
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

  const changePassword = async (newPassword: string, confirmNewPassword: string) => {
    if (!user) return;
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));

    if (!newPassword || newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Lỗi đổi mật khẩu",
        description: "Mật khẩu mới phải có ít nhất 6 ký tự.",
      });
      throw new Error("Mật khẩu mới quá ngắn.");
    }

    if (newPassword !== confirmNewPassword) {
      toast({
        variant: "destructive",
        title: "Lỗi đổi mật khẩu",
        description: "Mật khẩu mới và xác nhận mật khẩu không khớp.",
      });
      throw new Error("Mật khẩu không khớp.");
    }
    // In a real app, you would send this to the backend to update.
    // For this mock, we just show a success message.
    toast({
        title: "Thành công",
        description: "Mật khẩu của bạn đã được thay đổi (giả lập).",
    });
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
