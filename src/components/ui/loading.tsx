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

// Loading button component for inline loading
export const LoadingButton = React.forwardRef<HTMLButtonElement, {
  children: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  [key: string]: any;
}>(({ children, isLoading, disabled, className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        "relative inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200",
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        children
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
