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
  isChunkError: boolean;
  retryCount: number;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private retryTimeoutId?: NodeJS.Timeout;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, retryCount: 0, isChunkError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Detect chunk loading errors
    const isChunkError = ErrorBoundary.isChunkLoadError(error);
    
    return { 
      hasError: true, 
      error, 
      isChunkError,
      retryCount: 0
    };
  }

  static isChunkLoadError(error: Error): boolean {
    const errorString = (error.toString() + (error.stack || '')).toLowerCase();
    const chunkErrorIndicators = [
      'chunkloaderror',
      'loading chunk',
      'webpack',
      '__webpack_require__',
      'loading css chunk',
      'failed to fetch dynamically imported module'
    ];
    
    return chunkErrorIndicators.some(indicator => 
      errorString.includes(indicator)
    );
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Handle error with our error system
    ErrorHandler.handle(
      new AppError(error.message, ErrorType.CLIENT, undefined, { errorInfo }),
      false
    ); // Don't show toast in error boundary

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // Auto-retry for chunk errors with limited attempts
    if (this.state.isChunkError && this.state.retryCount < 2) {
      this.retryTimeoutId = setTimeout(() => {
        this.setState(prevState => ({
          hasError: false,
          error: undefined,
          retryCount: prevState.retryCount + 1,
          isChunkError: false
        }));
      }, 2000 + (this.state.retryCount * 1000)); // Increasing delay
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  resetError = () => {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
    this.setState({ hasError: false, error: undefined, retryCount: 0, isChunkError: false });
  };

  clearCacheAndReload = () => {
    // Clear browser caches if available
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
    
    // Clear localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    
    // Force reload with cache bust
    window.location.href = window.location.href + '?t=' + Date.now();
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

      // Default error UI with chunk error support
      return (
        <DefaultErrorFallback
          error={this.state.error}
          resetError={this.resetError}
          isChunkError={this.state.isChunkError}
          onClearCacheAndReload={this.clearCacheAndReload}
          retryCount={this.state.retryCount}
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
  isChunkError?: boolean;
  onClearCacheAndReload?: () => void;
  retryCount?: number;
}

export function DefaultErrorFallback({
  error,
  resetError,
  isChunkError = false,
  onClearCacheAndReload,
  retryCount = 0,
}: ErrorFallbackProps) {
  const isRetrying = retryCount > 0 && retryCount < 2;

  if (isChunkError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
        <div className="mb-6">
          <AlertTriangle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Lỗi Tải Ứng Dụng
          </h2>
          <p className="text-muted-foreground max-w-md mb-4">
            Ứng dụng gặp lỗi khi tải một số thành phần. Điều này thường xảy ra do 
            cache cũ hoặc kết nối mạng không ổn định.
          </p>
          
          {isRetrying && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                Đang thử tự động khôi phục... (Lần {retryCount}/2)
              </p>
            </div>
          )}

          {retryCount >= 2 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-800 font-medium">ChunkLoadError</p>
              <p className="text-xs text-red-600 mt-1">
                Tự động khôi phục không thành công
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3 w-full max-w-sm">
          <Button onClick={resetError} className="w-full gap-2">
            <RefreshCw className="h-4 w-4" />
            Thử Lại
          </Button>
          
          {onClearCacheAndReload && (
            <Button 
              onClick={onClearCacheAndReload} 
              variant="outline" 
              className="w-full gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Xóa Cache & Làm Mới
            </Button>
          )}
          
          <Button 
            onClick={() => window.location.href = '/dashboard'} 
            variant="ghost" 
            className="w-full text-gray-500"
            size="sm"
          >
            Về Trang Chủ
          </Button>
        </div>

        {process.env.NODE_ENV === "development" && (
          <details className="mt-6 text-left w-full max-w-2xl">
            <summary className="cursor-pointer text-sm font-medium mb-2">
              Chi tiết lỗi (Development)
            </summary>
            <pre className="bg-muted p-4 rounded-md text-xs overflow-auto">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    );
  }

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
