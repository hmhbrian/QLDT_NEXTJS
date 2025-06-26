/**
 * Enhanced Error Hook
 * Modern error handling with better user experience
 */

"use client";

import { useState, useCallback } from "react";
import { ErrorHandler, AppError, ErrorType } from "@/lib/utils/error.utils";

export interface UseErrorReturn {
  error: AppError | null;
  isError: boolean;
  clearError: () => void;
  handleError: (error: unknown) => AppError;
  setError: (error: AppError | string) => void;
  showError: (error: AppError | string) => void; // Add backward compatibility
}

export function useError(): UseErrorReturn {
  const [error, setErrorState] = useState<AppError | null>(null);

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

  // Backward compatibility alias
  const showError = setError;

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
