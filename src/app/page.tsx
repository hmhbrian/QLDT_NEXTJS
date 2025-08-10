"use client";

import { Loader2 } from "lucide-react";

/**
 * Root page component.
 * This page's sole purpose is to show a loading indicator.
 * All redirection logic is now handled by the middleware.
 */
export default function HomePage() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Đang tải...</p>
    </div>
  );
}