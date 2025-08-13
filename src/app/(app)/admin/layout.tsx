"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requiredRoles={["ADMIN", "HR"]} fallbackPath="/login">
      {children}
    </AuthGuard>
  );
}
