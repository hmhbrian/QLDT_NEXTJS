"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { dashboardService } from "@/lib/services/modern/dashboard.service";
import type { StudentDashboardData } from "@/lib/services/modern/dashboard.service";

// Re-export type for convenience
export type { StudentDashboardData } from "@/lib/services/modern/dashboard.service";

interface ApiResponse {
  success: boolean;
  message: string | null;
  data: StudentDashboardData;
}

export function useStudentDashboard() {
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const dashboardData = await dashboardService.getStudentDashboard();
        
        setData(dashboardData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred";
        console.error("❌ [useStudentDashboard] Error occurred:", err);
        console.error("❌ [useStudentDashboard] Error message:", errorMessage);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  return {
    data,
    isLoading,
    error,
    refetch: () => {
      if (user) {
        setIsLoading(true);
        setError(null);
        
        dashboardService.getStudentDashboard()
          .then(dashboardData => {
            setData(dashboardData);
          })
          .catch(err => {
            setError(err instanceof Error ? err.message : "An error occurred");
            console.error("Error fetching student dashboard data:", err);
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    },
  };
}
