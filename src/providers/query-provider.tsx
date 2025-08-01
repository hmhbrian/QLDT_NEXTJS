"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";
import { cacheManager } from "@/lib/cache";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 10 * 60 * 1000, // 10 minutes
            retry: (failureCount, error: any) => {
              if (
                error?.response?.status >= 400 &&
                error?.response?.status < 500
              ) {
                return (
                  error?.response?.status === 408 ||
                  error?.response?.status === 429
                );
              }
              return failureCount < 3;
            },
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  useEffect(() => {
    // Cleanup cache periodically
    const cleanupInterval = setInterval(() => {
      const stats = cacheManager.getStats();
      if (stats.expired > 0) {
        console.log(`Cleaning up ${stats.expired} expired cache entries`);
      }
    }, 5 * 60 * 1000);

    // Setup online/offline handlers
    const handleOnline = () => {
      console.log("App back online - invalidating stale queries");
      queryClient.invalidateQueries({ stale: true });
    };

    const handleOffline = () => {
      console.log("App went offline");
    };

    // Focus refetch
    const handleFocus = () => {
      queryClient.invalidateQueries({ stale: true });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(cleanupInterval);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("focus", handleFocus);
    };
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
