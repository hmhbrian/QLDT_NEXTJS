import { useQuery } from "@tanstack/react-query";
import { positionsService } from "@/lib/services";
import type { Position } from "@/lib/types/user.types";

export const POSITIONS_QUERY_KEY = "positions";

export const usePositions = () => {
  const { data, error, isLoading } = useQuery<Position[], Error>({
    queryKey: [POSITIONS_QUERY_KEY],
    queryFn: () => positionsService.getPositions(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return {
    positions: data ?? [],
    loading: isLoading,
    error,
  };
};
