/**
 * App Provider - Tổng hợp tất cả providers và cache system
 * Tương tự cách GitHub tổ chức application providers
 */

"use client";

import React, { useEffect } from "react";
import { QueryProvider } from "./query-provider";
import { CustomThemeProvider } from "./theme-provider";
import { ToastProvider } from "./toast-provider";
import { LoadingProvider } from "./loading-provider";
import { AuthProvider } from "@/hooks/useAuth";
import { CacheMonitor } from "@/components/common/CacheMonitor";
import {
  useUserDataSync,
  useCourseDataSync,
  useSystemDataSync,
} from "@/hooks/use-data-sync";
import { stateSyncManager, cookieManager } from "@/lib/cache";

interface AppProvidersProps {
  children: React.ReactNode;
}

// Internal component to handle data sync setup
function DataSyncSetup() {
  const userSync = useUserDataSync();
  const courseSync = useCourseDataSync();
  const systemSync = useSystemDataSync();

  useEffect(() => {
    // Setup global error handlers
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason);

      // If it's an auth error, handle it gracefully
      if (event.reason?.response?.status === 401) {
        userSync.invalidateData("current_user");
      }
    };

    const handleError = (event: ErrorEvent) => {
      console.error("Global error:", event.error);
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleError);

    // Setup service worker for offline support (if available)
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered: ", registration);
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError);
        });
    }

    return () => {
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
      window.removeEventListener("error", handleError);
    };
  }, [userSync]);

  // Don't render anything, this is just for setup
  return null;
}

// Cookie Consent Component
function CookieConsent() {
  const [showConsent, setShowConsent] = React.useState(false);

  useEffect(() => {
    const consent = cookieManager.getConsent();
    if (!consent) {
      setShowConsent(true);
    }
  }, []);

  const handleAcceptAll = () => {
    cookieManager.setConsent(["necessary", "analytics", "marketing"]);
    setShowConsent(false);
  };

  const handleAcceptNecessary = () => {
    cookieManager.setConsent(["necessary"]);
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg p-4">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm">
          <p>
            Chúng tôi sử dụng cookies để cải thiện trải nghiệm người dùng và
            phân tích lưu lượng truy cập.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAcceptNecessary}
            className="px-4 py-2 text-sm border rounded hover:bg-muted"
          >
            Chỉ cần thiết
          </button>
          <button
            onClick={handleAcceptAll}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Chấp nhận tất cả
          </button>
        </div>
      </div>
    </div>
  );
}

// Performance Monitor (Development only)
function PerformanceMonitor() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    // Monitor performance
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === "measure") {
          console.log(`${entry.name}: ${entry.duration}ms`);
        }
      }
    });

    observer.observe({ entryTypes: ["measure"] });

    // Measure page load time
    window.addEventListener("load", () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType(
          "navigation"
        )[0] as PerformanceNavigationTiming;
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        console.log(`Page load time: ${loadTime}ms`);
      }, 0);
    });

    return () => observer.disconnect();
  }, []);

  return null;
}

export function AppProviders({ children }: AppProvidersProps) {
  useEffect(() => {
    // Initialize cache and state management
    console.log("Initializing app providers...");

    // Restore any preserved state after redirect
    // No redirect manager cleanup needed

    // Setup visibility change handler for background sync
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page became visible - sync critical data
        stateSyncManager.forceSync("current_user", { immediate: true });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      // Cleanup on unmount
      stateSyncManager.destroy();
      // No redirect manager cleanup needed
    };
  }, []);

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
            <ToastProvider>
              <DataSyncSetup />
              <PerformanceMonitor />
              <CookieConsent />
              <CacheMonitor />
              {children}
            </ToastProvider>
          </AuthProvider>
        </LoadingProvider>
      </QueryProvider>
    </CustomThemeProvider>
  );
}
