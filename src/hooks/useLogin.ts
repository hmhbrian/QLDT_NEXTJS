"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./useAuth";
import { authService } from "@/lib/services";
import { useError } from "./use-error";
import { toast } from "@/components/ui/use-toast";

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAuth();
  const { handleError } = useError();

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.login({ email, password });

      if (response.statusCode === 200 && response.data) {
        const userWithMissingProps = {
          ...response.data,
          idCard: response.data.idCard || "",
          phoneNumber: response.data.phoneNumber || "",
          role: response.data.role as "ADMIN" | "HR" | "HOCVIEN",
        };
        setUser(userWithMissingProps);

        toast({
          title: "Thành công",
          description: response.message,
        });

        router.push("/dashboard");
      } else {
        throw new Error(response.message || "Đăng nhập thất bại");
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    isLoading,
  };
}
