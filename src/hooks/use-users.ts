
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersService } from "@/lib/services";
import {
  User,
  UserApiResponse,
  CreateUserRequest,
  UpdateUserRequest,
} from "@/lib/types/user.types";
import type { PaginatedResponse, QueryParams } from "@/lib/core";
import { useError } from "./use-error";
import { mapUserApiToUi } from "@/lib/mappers/user.mapper";

export const USERS_QUERY_KEY = "users";

export function useUsers(params?: QueryParams) {
  const queryKey = [USERS_QUERY_KEY, params];

  const {
    data,
    isLoading,
    error,
    refetch: reloadUsers,
  } = useQuery<PaginatedResponse<UserApiResponse>, Error>({
    queryKey,
    queryFn: async () => {
      const response = await usersService.getUsersWithPagination(params);
      return {
        items: response.items || [],
        pagination: response.pagination,
      };
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });

  return {
    users: (data?.items ?? []).map(mapUserApiToUi),
    paginationInfo: data?.pagination,
    isLoading,
    error,
    isError: !!error,
    reloadUsers,
  };
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient();
  const { showError } = useError();
  return useMutation<UserApiResponse, Error, CreateUserRequest>({
    mutationFn: (payload) => usersService.createUser(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      showError({
        success: true,
        message: `Đã tạo người dùng "${response.fullName}" thành công.`,
      });
    },
    onError: (error) => {
      showError(error);
    },
  });
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();
  const { showError } = useError();
  return useMutation<
    UserApiResponse,
    Error,
    { id: string; payload: UpdateUserRequest }
  >({
    mutationFn: ({ id, payload }) => usersService.updateUserByAdmin(id, payload),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY, variables.id] });
      showError({
        success: true,
        message: `Đã cập nhật người dùng "${response.fullName}" thành công.`,
      });
    },
    onError: (error) => {
      showError(error);
    },
  });
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();
  const { showError } = useError();
  return useMutation<any, Error, string[]>({
    mutationFn: (userIds: string[]) => usersService.deleteUsers(userIds),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      showError({ success: true, message: "Đã xóa người dùng thành công." });
    },
    onError: (error) => {
      showError(error);
    },
  });
}
