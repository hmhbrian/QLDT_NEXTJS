
"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersService } from "@/lib/services";
import type { User, CreateUserRequest } from "@/lib/types/user.types";
import type { QueryParams, PaginatedResponse } from "@/lib/core";
import { useError } from "./use-error";

export const USERS_QUERY_KEY = "users";

export function useUsers(params?: QueryParams) {
  const queryClient = useQueryClient();
  const queryKey = [USERS_QUERY_KEY, params];

  const {
    data,
    isLoading,
    error,
    refetch: reloadUsers,
  } = useQuery<PaginatedResponse<User>, Error>({
    queryKey,
    queryFn: async () => {
      const response = await usersService.getUsersWithPagination(params);
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });

  return {
    paginatedUsers: data,
    users: data?.items ?? [],
    isLoading,
    error,
    reloadUsers,
  };
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient();
  const { showError } = useError();
  return useMutation({
    mutationFn: (payload: CreateUserRequest) =>
      usersService.createUser(payload),
    onSuccess: (response) => {
      showError(response);
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
    onError: (error) => {
      showError(error);
    },
  });
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();
  const { showError } = useError();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateUserRequest>;
    }) => usersService.updateUserByAdmin(id, payload),
    onSuccess: (response) => {
      showError(response);
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
    onError: (error) => {
      showError(error);
    },
  });
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();
  const { showError } = useError();
  return useMutation({
    mutationFn: (userIds: string[]) => usersService.deleteUsers(userIds),
    onSuccess: (response) => {
      showError(response);
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
    onError: (error) => {
      showError(error);
    },
  });
}
