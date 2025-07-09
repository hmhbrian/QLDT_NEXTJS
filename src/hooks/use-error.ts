
/**
 * Enhanced Error Hook
 * Modern error handling with better user experience
 */

"use client";

import { useState, useCallback } from "react";
import { AppError, ErrorType } from "@/lib/utils/error.utils";
import { useToast } from "@/components/ui/use-toast";
import { errorMessages, type ErrorMessage } from "@/lib/error-messages";
import { extractErrorMessage } from "@/lib/core";

export type ErrorCode = keyof typeof errorMessages;

export interface UseErrorReturn {
  error: AppError | null;
  isError: boolean;
  clearError: () => void;
  handleError: (error: unknown) => AppError;
  setError: (error: AppError | string) => void;
  showError: (payload: unknown) => void;
}

// Định nghĩa cấu trúc cho phản hồi từ backend
interface BackendResponse {
  success: boolean;
  message?: string;
  title?: string;
  detail?: string;
  data?: any;
}

// Type guard để kiểm tra xem một đối tượng có phải là BackendResponse không
function isBackendResponse(payload: any): payload is BackendResponse {
  return payload && typeof payload.success === "boolean";
}

export function useError(): UseErrorReturn {
  const [error, setErrorState] = useState<AppError | null>(null);
  const { toast } = useToast();

  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  const handleError = useCallback((error: unknown) => {
    const message = extractErrorMessage(error);
    const appError = new AppError(message, ErrorType.UNKNOWN);
    setErrorState(appError);
    return appError;
  }, []);

  const setError = useCallback((error: AppError | string) => {
    const appError =
      typeof error === "string" ? new AppError(error, ErrorType.CLIENT) : error;
    setErrorState(appError);
  }, []);

  const showError = useCallback(
    (payload: unknown) => {
      let title = "Đã có lỗi xảy ra";
      let description = "Vui lòng thử lại sau.";
      let variant: "default" | "destructive" | "success" = "destructive";

      if (typeof payload === "string" && payload in errorMessages) {
        const errorDetails: ErrorMessage = errorMessages[payload as ErrorCode];
        title = errorDetails.title;
        description = errorDetails.message;
        variant = errorDetails.variant || "destructive";
      } else if (isBackendResponse(payload)) {
        title = payload.title || (payload.success ? "Thành công" : "Lỗi");
        description =
          payload.message ||
          payload.detail ||
          (payload.success
            ? "Thao tác thành công."
            : "Đã có lỗi xảy ra.");
        variant = payload.success ? "success" : "destructive";
      } else if (payload instanceof Error) {
        description = extractErrorMessage(payload);
      } else if (
        typeof payload === "object" &&
        payload !== null &&
        "response" in payload
      ) {
        description = extractErrorMessage((payload as any).response.data);
      } else {
        description = "Thao tác thành công.";
        title = "Thành công";
        variant = "success";
      }

      toast({
        title,
        description,
        variant,
      });
    },
    [toast]
  );

  return {
    error,
    isError: error !== null,
    clearError,
    handleError,
    setError,
    showError,
  };
}

// Export default for backward compatibility
export default useError;
