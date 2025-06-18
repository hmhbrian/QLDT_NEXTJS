"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "./useAuth";
import { authService } from "@/lib/api";

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { setUser } = useAuth(); // Giả sử useAuth cung cấp hàm setUser

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.login({ email, password });

      if (response.success && response.user) {
        const userWithMissingProps = {
          ...response.user,
          idCard: response.user.idCard || "",
          phoneNumber: response.user.phoneNumber || "",
          role: response.user.role as "ADMIN" | "HR" | "HOCVIEN",
        };
        setUser(userWithMissingProps);
        toast({
          title: "Thành công",
          description: response.message,
        });
        router.push("/dashboard");
      } else {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: response.message,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Đã có lỗi xảy ra khi đăng nhập",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    isLoading,
  };
}
