import useSWR from "swr";
import { positionApiService } from "../lib/services/position-api.service";

const fetcher = () => positionApiService.getPositions();

export const usePositions = () => {
  const { data, error, isLoading } = useSWR("api/positions", fetcher);

  return {
    positions: data,
    loading: isLoading,
    error,
  };
};
