/**
 * Enhanced Error Hook
 * Modern error handling with better user experience
 */

"use client";

import { useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { errorMessages, type ErrorMessage } from "@/lib/error-messages";
import { extractErrorMessage } from "@/lib/core";

export type ErrorCode = keyof typeof errorMessages;

export interface UseErrorReturn {
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
  const { toast } = useToast();

  const showError = useCallback(
    (payload: unknown) => {
      let title = "Thông báo";
      let description = "Đã có lỗi xảy ra. Vui lòng thử lại sau.";
      let variant: "default" | "destructive" | "success" = "destructive";

      if (typeof payload === "string" && payload in errorMessages) {
        const errorDetails: ErrorMessage = errorMessages[payload as ErrorCode];
        title = errorDetails.title;
        description = errorDetails.message;
        variant = errorDetails.variant || "destructive";
      } else if (isBackendResponse(payload)) {
        // Chỉ hiển thị toast nếu success là false, hoặc là true và có message
        if (payload.success === false || (payload.success === true && payload.message)) {
          variant = payload.success ? "success" : "destructive";
          title = payload.title || (payload.success ? "Thành công!" : "Thao tác thất bại");
          description =
            payload.detail ||
            payload.message ||
            (payload.success
              ? "Yêu cầu của bạn đã được thực hiện thành công."
              : "Đã có lỗi xảy ra trong quá trình xử lý.");
          
        } else {
            // Do not show a toast if success is true and there is no message
            return;
        }
      } else if (payload instanceof Error) {
        title = "Đã có lỗi xảy ra";
        description = extractErrorMessage(payload);
        variant = "destructive";
      } else if (
        typeof payload === "object" &&
        payload !== null &&
        "response" in payload
      ) {
        title = "Lỗi từ máy chủ";
        description = extractErrorMessage((payload as any).response.data);
        variant = "destructive";
      } else if (
        typeof payload === 'object' && payload !== null && 'message' in payload && typeof (payload as any).message === 'string'
      ) {
        title = "Lỗi";
        description = (payload as any).message;
        variant = "destructive";
      }

      toast({
        title,
        description,
        variant,
        duration: 5000,
      });
    },
    [toast]
  );

  return {
    showError,
  };
}

// Export default for backward compatibility
export default useError;
