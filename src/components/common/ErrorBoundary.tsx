/**
 * Error Boundary Components
 * Enterprise-grade error handling components
 */

"use client";

import React, { ErrorInfo, ReactNode } from "react";
import { ErrorHandler, AppError, ErrorType } from "@/lib/utils/error.utils";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Handle error with our error system
    ErrorHandler.handle(
      new AppError(error.message, ErrorType.CLIENT, undefined, { errorInfo }),
      false
    ); // Don't show toast in error boundary

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback;

      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={this.state.error}
            resetError={this.resetError}
          />
        );
      }

      // Default error UI
      return (
        <DefaultErrorFallback
          error={this.state.error}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

// Default error fallback component
interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

export function DefaultErrorFallback({
  error,
  resetError,
}: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div className="mb-6">
        <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Oops! Có lỗi xảy ra
        </h2>
        <p className="text-muted-foreground max-w-md">
          Đã xảy ra lỗi không mong muốn. Vui lòng thử lại hoặc liên hệ với bộ
          phận hỗ trợ.
        </p>
      </div>

      {process.env.NODE_ENV === "development" && (
        <details className="mb-6 text-left w-full max-w-2xl">
          <summary className="cursor-pointer text-sm font-medium mb-2">
            Chi tiết lỗi (Development)
          </summary>
          <pre className="bg-muted p-4 rounded-md text-xs overflow-auto">
            {error.stack}
          </pre>
        </details>
      )}

      <Button onClick={resetError} className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Thử lại
      </Button>
    </div>
  );
}

// Page-level error boundary
export function PageErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={DefaultErrorFallback}
      onError={(error, errorInfo) => {
        // Log to monitoring service in production
        if (process.env.NODE_ENV === "production") {
          // Sentry.captureException(error, { extra: errorInfo });
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

// Component-level error boundary for smaller components
export function ComponentErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={({ resetError }) => (
        <div className="p-4 border border-destructive/20 rounded-md bg-destructive/10">
          <p className="text-sm text-destructive mb-2">
            Component không thể hiển thị
          </p>
          <Button size="sm" variant="outline" onClick={resetError}>
            Thử lại
          </Button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
