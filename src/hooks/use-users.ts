
"use client";
import { useQuery } from "@tanstack/react-query";
import { usersService } from "@/lib/services";
import type { User } from "@/lib/types/user.types";
import type { QueryParams } from "@/lib/core";

export const USERS_QUERY_KEY = "users";

export function useUsers(params?: QueryParams) {
  const {
    data,
    isLoading,
    error,
    refetch: reloadUsers,
  } = useQuery<User[], Error>({
    queryKey: [USERS_QUERY_KEY, params],
    queryFn: async () => {
      const response = await usersService.getUsers(params);
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return {
    users: data ?? [],
    isLoading,
    error,
    reloadUsers,
  };
}
