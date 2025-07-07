/**
 * Enhanced Error Hook
 * Modern error handling with better user experience
 */

"use client";

import { useState, useCallback } from "react";
import { ErrorHandler, AppError, ErrorType } from "@/lib/utils/error.utils";
import { useToast } from "@/components/ui/use-toast";
import { errorMessages, type ErrorMessage } from "@/lib/error-messages";

export type ErrorCode = keyof typeof errorMessages;

export interface UseErrorReturn {
  error: AppError | null;
  isError: boolean;
  clearError: () => void;
  handleError: (error: unknown) => AppError;
  setError: (error: AppError | string) => void;
  showError: (error: ErrorCode | Error | unknown) => void;
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
function isBackendResponse(error: any): error is BackendResponse {
  return error && typeof error.success === "boolean";
}

// Định nghĩa cấu trúc cho lỗi nghiệp vụ từ backend (legacy format)
interface BusinessError {
  title: string;
  detail: string;
  success: boolean;
}

// Type guard để kiểm tra xem một đối tượng có phải là BusinessError không
function isBusinessError(error: any): error is BusinessError {
  return (
    error &&
    typeof error.title === "string" &&
    typeof error.detail === "string" &&
    typeof error.success === "boolean"
  );
}

export function useError(): UseErrorReturn {
  const [error, setErrorState] = useState<AppError | null>(null);
  const { toast } = useToast();

  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  const handleError = useCallback((error: unknown) => {
    const appError = ErrorHandler.handle(error, true);
    setErrorState(appError);
    return appError;
  }, []);

  const setError = useCallback((error: AppError | string) => {
    const appError =
      typeof error === "string" ? new AppError(error, ErrorType.CLIENT) : error;
    setErrorState(appError);
  }, []);

  const showError = useCallback(
    (error: ErrorCode | Error | unknown) => {
      // Debug: log để xem backend trả về gì
      console.log("showError received:", error);

      let title = "Đã có lỗi xảy ra";
      let description = "Vui lòng thử lại sau.";
      let variant: "default" | "destructive" | "success" = "destructive";

      if (typeof error === "string" && error in errorMessages) {
        // Xử lý lỗi theo mã lỗi đã định nghĩa
        const errorDetails: ErrorMessage = errorMessages[error as ErrorCode];
        title = errorDetails.title;
        description = errorDetails.message;
        variant = errorDetails.variant || "destructive";
      } else if (isBackendResponse(error)) {
        // Xử lý phản hồi từ backend (format mới)
        title = error.success ? "Thành công" : "Đã có lỗi xảy ra";

        // Ưu tiên message từ backend, fallback sang detail, rồi mới dùng default
        if (error.message && error.message.trim()) {
          description = error.message;
        } else if (error.detail && error.detail.trim()) {
          description = error.detail;
        } else {
          description = error.success
            ? "Thao tác thành công."
            : "Vui lòng thử lại sau.";
        }

        variant = error.success ? "success" : "destructive";
      } else if (isBusinessError(error)) {
        // Xử lý lỗi nghiệp vụ từ backend (format cũ)
        title = error.title; // "Lỗi nghiệp vụ"
        description = error.detail || "Thao tác thành công."; // Fallback message
        variant = error.success === false ? "destructive" : "success";
      } else if (error instanceof Error) {
        // Xử lý lỗi JavaScript thông thường
        description = error.message;
      } else if (error === undefined || error === null) {
        // Xử lý trường hợp không có response (có thể là thành công)
        console.log("No response received, assuming success");
        title = "Thành công";
        description = "Thao tác thành công.";
        variant = "success";
      } else {
        // Fallback cho các trường hợp khác
        console.log("Unknown error type, using default message");
        // Giữ nguyên giá trị mặc định đã set ở trên
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
