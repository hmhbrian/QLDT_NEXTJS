import { useQuery } from "@tanstack/react-query";
import { EmployeeLevelService } from "@/lib/services";
import type { EmployeeLevel } from "@/lib/types/user.types";

export const EmployeeLevel_QUERY_KEY = "EmployeeLevel";

export const useEmployeeLevel = () => {
  const { data, error, isLoading } = useQuery<EmployeeLevel[], Error>({
    queryKey: [EmployeeLevel_QUERY_KEY],
    queryFn: () => EmployeeLevelService.getEmployeeLevel(),
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: false,
  });

  return {
    EmployeeLevel: data ?? [],
    loading: isLoading,
    error,
  };
};
