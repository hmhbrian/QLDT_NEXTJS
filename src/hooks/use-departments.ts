"use client";

import { useQuery } from "@tanstack/react-query";
import { departmentsService } from "@/lib/services";
import type { DepartmentInfo } from "@/lib/types/department.types";

export const DEPARTMENTS_QUERY_KEY = "departments";

export function useDepartments() {
  const {
    data,
    isLoading,
    error,
    refetch: reloadDepartments,
  } = useQuery<DepartmentInfo[], Error>({
    queryKey: [DEPARTMENTS_QUERY_KEY],
    queryFn: () => departmentsService.getDepartments(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const activeDepartments =
    data?.filter((dept) => dept.status === "active") ?? [];

  return {
    departments: data ?? [],
    isLoading,
    error,
    activeDepartments,
    reloadDepartments,
  };
}
