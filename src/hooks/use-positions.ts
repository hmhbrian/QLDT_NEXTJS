import useSWR from "swr";
import { positionsService } from "@/lib/services";

const fetcher = () => positionsService.getPositions();

export const usePositions = () => {
  const { data, error, isLoading } = useSWR("api/positions", fetcher);

  return {
    positions: data,
    loading: isLoading,
    error,
  };
};
