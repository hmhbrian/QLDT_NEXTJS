/**
 * App Provider - Tổng hợp tất cả providers
 */

"use client";

import React from "react";
import { QueryProvider } from "./query-provider";
import { CustomThemeProvider } from "./theme-provider";
import { ToastProvider } from "./toast-provider";
import { LoadingProvider } from "./loading-provider";
import { AuthProvider } from "@/hooks/useAuth";

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <CustomThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryProvider>
        <LoadingProvider>
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </LoadingProvider>
      </QueryProvider>
    </CustomThemeProvider>
  );
}
