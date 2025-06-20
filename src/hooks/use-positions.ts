import useSWR from "swr";
import { positionsApiService } from "@/lib/services";

const fetcher = () => positionsApiService.getPositions();

export const usePositions = () => {
  const { data, error, isLoading } = useSWR("api/positions", fetcher);

  return {
    positions: data,
    loading: isLoading,
    error,
  };
};
