
"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Loading } from "@/components/ui/loading";

interface LoadingContextType {
  isLoading: boolean;
  loadingText: string;
  showLoading: (text?: string) => void;
  hideLoading: () => void;
  setLoadingText: (text: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Đang tải...");

  const showLoading = (text: string = "Đang tải...") => {
    setLoadingText(text);
    // Don't show loading immediately - give navigation a chance
    setTimeout(() => setIsLoading(true), 150);
  };

  const hideLoading = () => {
    setIsLoading(false);
  };

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        loadingText,
        showLoading,
        hideLoading,
        setLoadingText,
      }}
    >
      {" "}
      {children}
      {isLoading && <Loading variant="overlay" />}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}
