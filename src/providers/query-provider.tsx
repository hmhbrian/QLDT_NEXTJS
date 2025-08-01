"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes garbage collection time
            refetchOnWindowFocus: true, // Refetch when the window gains focus
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
              // Retry up to 2 times for other errors (e.g., network, 5xx)
              return failureCount < 2;
            },
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
          },
          mutations: {
            retry: 1, // Retry mutations once on failure
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
