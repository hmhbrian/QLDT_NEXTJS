
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./useAuth";
import { useError } from "./use-error";
import { toast } from "@/components/ui/use-toast";
import { authService } from "@/lib/services";
import { mapUserApiToUi } from "@/lib/mappers/user.mapper";

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAuth();
  const { showError } = useError();

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.login({ email, password });

      if (response && response.accessToken) {
        const userToStore = mapUserApiToUi(response);
        setUser(userToStore);

        toast({
          title: "Thành công",
          description: "Đăng nhập thành công!",
          variant: "success",
        });

        router.push("/dashboard");
      } else {
        throw new Error("Đăng nhập thất bại do dữ liệu không hợp lệ.");
      }
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    isLoading,
  };
}
