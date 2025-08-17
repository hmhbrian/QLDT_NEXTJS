"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import React from 'react';

interface LoadingProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "overlay" | "inline" | "page";
  text?: string;
  className?: string;
  showText?: boolean;
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

export function Loading({
  size = "md",
  variant = "default",
  text,
  className,
  showText = false, // Mặc định không hiển thị text
}: LoadingProps) {
  const spinnerClasses = cn(
    "animate-spin text-primary drop-shadow-sm transition-all duration-300",
    sizeMap[size],
    className
  );

  if (variant === "inline") {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className={spinnerClasses} />
        {showText && text && (
          <span className="text-sm text-muted-foreground">{text}</span>
        )}
      </div>
    );
  }
  if (variant === "overlay") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md">
        <div className="flex items-center justify-center rounded-xl bg-card/95 p-8 shadow-2xl border border-border/50">
          <Loader2
            className={cn("animate-spin text-primary", sizeMap.xl)}
          />
        </div>
      </div>
    );
  }
  if (variant === "page") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center justify-center">
          <Loader2
            className={cn("animate-spin text-primary", sizeMap.xl)}
          />
        </div>
      </div>
    );
  }
  // Default variant
  return (
    <div className="flex items-center justify-center p-4">
      <Loader2 className={spinnerClasses} />
    </div>
  );
}

// Loading button component for inline loading with enhanced UX
export const LoadingButton = React.forwardRef<HTMLButtonElement, {
  children: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  loadingText?: string;
  showLoadingText?: boolean;
  size?: "sm" | "md" | "lg";
  [key: string]: any;
}>(({ 
  children, 
  isLoading, 
  disabled, 
  className, 
  loadingText,
  showLoadingText = false,
  size = "md",
  ...props 
}, ref) => {
  const sizeClasses = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-base", 
    lg: "h-12 px-6 text-lg"
  };

  const spinnerSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground font-medium transition-all duration-200",
        "hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50",
        "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-primary",
        // Immediate visual feedback on click
        "active:scale-[0.98] active:duration-75",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {isLoading && (
        <Loader2 className={cn("animate-spin", spinnerSizes[size])} />
      )}
      
      {isLoading && showLoadingText && loadingText ? (
        <span className="transition-opacity duration-200">{loadingText}</span>
      ) : isLoading && !showLoadingText ? (
        // Show spinner only when no text is requested
        !loadingText && <span className="sr-only">Đang xử lý...</span>
      ) : (
        <span className={cn(
          "transition-opacity duration-200",
          isLoading && showLoadingText ? "opacity-0" : "opacity-100"
        )}>
          {children}
        </span>
      )}
    </button>
  );
});
LoadingButton.displayName = "LoadingButton";


// Spinner for specific areas
export function Spinner({
  className,
  size = "md",
}: {
  className?: string;
  size?: keyof typeof sizeMap;
}) {
  return (
    <Loader2
      className={cn(
        "animate-spin text-primary transition-all",
        sizeMap[size],
        className
      )}
    />
  );
}
