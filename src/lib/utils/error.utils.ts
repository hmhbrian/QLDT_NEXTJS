/**
 * Error Handling System
 * Centralized error handling with proper logging and user feedback
 */

import { toast } from "@/components/ui/use-toast";

// Error types enumeration
export enum ErrorType {
  NETWORK = "NETWORK",
  AUTHENTICATION = "AUTHENTICATION",
  AUTHORIZATION = "AUTHORIZATION",
  VALIDATION = "VALIDATION",
  SERVER = "SERVER",
  CLIENT = "CLIENT",
  UNKNOWN = "UNKNOWN",
}

// Custom error class with additional context
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly statusCode?: number;
  public readonly context?: Record<string, any>;
  public readonly timestamp: Date;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    statusCode?: number,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = "AppError";
    this.type = type;
    this.statusCode = statusCode;
    this.context = context;
    this.timestamp = new Date();
  }
}

// Error handler utility
export class ErrorHandler {
  // Handle and display errors to user
  static handle(error: unknown, showToast: boolean = true): AppError {
    const appError = this.normalize(error);

    // Log error for debugging
    if (process.env.NODE_ENV === "development") {
      console.error("🔴 Error handled:", {
        message: appError.message,
        type: appError.type,
        statusCode: appError.statusCode,
        context: appError.context,
        timestamp: appError.timestamp,
        stack: appError.stack,
      });
    }

    // Show user-friendly message
    if (showToast) {
      this.showErrorToast(appError);
    }

    return appError;
  }

  // Normalize different error types to AppError
  static normalize(error: unknown): AppError {
    if (error instanceof AppError) {
      return error;
    }

    if (error instanceof Error) {
      // Network errors
      if (error.message.includes("fetch")) {
        return new AppError(
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.",
          ErrorType.NETWORK
        );
      }

      return new AppError(error.message, ErrorType.CLIENT);
    }

    // API response errors
    if (typeof error === "object" && error !== null) {
      const err = error as any;

      if (err.statusCode) {
        const type = this.getErrorTypeFromStatus(err.statusCode);
        return new AppError(
          err.message || "Đã xảy ra lỗi",
          type,
          err.statusCode,
          err
        );
      }
    }

    // Fallback for unknown errors
    return new AppError("Đã xảy ra lỗi không xác định", ErrorType.UNKNOWN);
  }

  // Get error type from HTTP status code
  private static getErrorTypeFromStatus(statusCode: number): ErrorType {
    if (statusCode === 401) return ErrorType.AUTHENTICATION;
    if (statusCode === 403) return ErrorType.AUTHORIZATION;
    if (statusCode >= 400 && statusCode < 500) return ErrorType.VALIDATION;
    if (statusCode >= 500) return ErrorType.SERVER;
    return ErrorType.UNKNOWN;
  }

  // Show appropriate toast message
  private static showErrorToast(error: AppError) {
    const config = this.getToastConfig(error);

    toast({
      variant: "destructive",
      title: config.title,
      description: config.description,
    });
  }

  // Get toast configuration based on error type
  private static getToastConfig(error: AppError) {
    switch (error.type) {
      case ErrorType.NETWORK:
        return {
          title: "Lỗi kết nối",
          description: error.message,
        };

      case ErrorType.AUTHENTICATION:
        return {
          title: "Lỗi xác thực",
          description: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
        };

      case ErrorType.AUTHORIZATION:
        return {
          title: "Không có quyền",
          description: "Bạn không có quyền thực hiện hành động này.",
        };

      case ErrorType.VALIDATION:
        return {
          title: "Dữ liệu không hợp lệ",
          description: error.message,
        };

      case ErrorType.SERVER:
        return {
          title: "Lỗi máy chủ",
          description: "Máy chủ đang gặp sự cố. Vui lòng thử lại sau.",
        };

      default:
        return {
          title: "Lỗi",
          description: error.message || "Đã xảy ra lỗi không xác định",
        };
    }
  }
}

// Async error handler for use with async functions
export const handleAsyncError = <T extends any[], R>(
  fn: (...args: T) => Promise<R>
) => {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      ErrorHandler.handle(error);
      return null;
    }
  };
};

// React error boundary helper
export const createErrorBoundary = (
  fallback: React.ComponentType<{ error: Error }>
) => {
  return class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error?: Error }
  > {
    constructor(props: { children: React.ReactNode }) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
      return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      ErrorHandler.handle(
        new AppError(error.message, ErrorType.CLIENT, undefined, { errorInfo })
      );
    }

    render() {
      if (this.state.hasError && this.state.error) {
        const FallbackComponent = fallback;
        return React.createElement(FallbackComponent, {
          error: this.state.error,
        });
      }

      return this.props.children;
    }
  };
};

import React from "react";
