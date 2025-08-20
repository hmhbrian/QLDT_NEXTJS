"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 10 * 60 * 1000, // 10 minutes - increased for better caching
            gcTime: 30 * 60 * 1000, // 30 minutes garbage collection time
            refetchOnWindowFocus: true, 
            refetchOnReconnect: true, // Refetch when network reconnects
            refetchOnMount: "always", // Smart refetch on mount
            networkMode: "online", // Only run queries when online
            retry: (failureCount, error: any) => {
              // Do not retry on 4xx client errors (except for 408, 429)
              if (
                error?.response?.status >= 400 &&
                error?.response?.status < 500
              ) {
                return (
                  error?.response?.status === 408 || // Request Timeout
                  error?.response?.status === 429 // Too Many Requests
                );
              }
              // Retry up to 3 times for other errors (e.g., network, 5xx)
              return failureCount < 3;
            },
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff with max 10s
          },
          mutations: {
            retry: (failureCount, error: any) => {
              // Only retry network errors, not validation errors
              if (failureCount >= 2) return false;
              const status = error?.response?.status;
              return (
                !status || status >= 500 || status === 408 || status === 429
              );
            },
            retryDelay: (attemptIndex) =>
              Math.min(500 * 2 ** attemptIndex, 5000), // Faster retry for mutations
            networkMode: "online",
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
