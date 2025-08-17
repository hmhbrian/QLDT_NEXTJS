"use client";

import { useAuth } from "@/hooks/useAuth";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { HrDashboard } from "@/components/dashboard/HrDashboard";
import { TraineeDashboard } from "@/components/dashboard/TraineeDashboard";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { user, loadingAuth } = useAuth();

  if (loadingAuth || !user) {
    return (
      <div className="space-y-6 container mx-auto px-2 sm:px-4 md:px-6">
        <Skeleton className="h-10 w-2/3 md:w-1/3" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 md:w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 container mx-auto px-2 sm:px-4 md:px-6">
      <h1 className="text-2xl md:text-3xl font-headline font-semibold">
        Chào mừng, {user.fullName}!
      </h1>
      {user.role === "ADMIN" && <AdminDashboard />}
      {user.role === "HR" && <HrDashboard />}
      {user.role === "HOCVIEN" && <TraineeDashboard />}
    </div>
  );
}
