/**
 * App Provider - Tổng hợp tất cả providers
 */

"use client";

import React from "react";
import { QueryProvider } from "./query-provider";
import { CustomThemeProvider } from "./theme-provider";
import { ToastProvider } from "./toast-provider";
import { AuthProvider } from "@/hooks/useAuth";
import { WebSocketProvider } from "./websocket-provider";

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
        <AuthProvider>
          <WebSocketProvider>
            <ToastProvider>{children}</ToastProvider>
          </WebSocketProvider>
        </AuthProvider>
      </QueryProvider>
    </CustomThemeProvider>
  );
}
