
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersService } from "@/lib/services";
import {
  User,
  UserApiResponse,
  CreateUserRequest,
  UpdateUserRequest,
} from "@/lib/types/user.types";
import type { PaginatedResponse, QueryParams } from "@/lib/core";
import { mapUserApiToUi } from "@/lib/mappers/user.mapper";
import { useToast } from "@/components/ui/use-toast";
import { extractErrorMessage } from "@/lib/core";

export const USERS_QUERY_KEY = "users";

export function useUsers(params?: QueryParams) {
  const queryKey = [USERS_QUERY_KEY, "list", params];

  const {
    data,
    isLoading,
    error,
    isError,
  } = useQuery<PaginatedResponse<User>, Error>({
    queryKey,
    queryFn: async () => {
      const response = await usersService.getUsersWithPagination(params);
      return {
        items: (response.items || []).map(mapUserApiToUi),
        pagination: response.pagination,
      };
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    placeholderData: (previousData) => previousData,
  });

  return {
    users: data?.items ?? [],
    paginationInfo: data?.pagination,
    isLoading,
    error,
    isError,
  };
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<UserApiResponse, Error, CreateUserRequest>({
    mutationFn: (payload) => usersService.createUser(payload),
    onSuccess: (data) => {
      toast({
        title: "Thành công",
        description: `Đã tạo người dùng "${data.fullName}" thành công.`,
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
  });
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    UserApiResponse,
    Error,
    { id: string; payload: UpdateUserRequest },
    { previousUsers?: PaginatedResponse<User> }
  >({
    mutationFn: ({ id, payload }) =>
      usersService.updateUserByAdmin(id, payload),
    onMutate: async ({ id, payload }) => {
      const queryKey = [USERS_QUERY_KEY, "list"];
      await queryClient.cancelQueries({ queryKey });

      const previousUsers =
        queryClient.getQueryData<PaginatedResponse<User>>(queryKey);

      if (previousUsers) {
        queryClient.setQueryData<PaginatedResponse<User>>(queryKey, (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((user) =>
              user.id === id ? { ...user, ...payload } : user
            ),
          };
        });
      }

      return { previousUsers };
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Thành công",
        description: `Đã cập nhật người dùng "${variables.payload.FullName}" thành công.`,
        variant: "success",
      });
    },
    onError: (err, variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(
          [USERS_QUERY_KEY, "list"],
          context.previousUsers
        );
      }
      toast({
        title: "Lỗi",
        description: extractErrorMessage(err),
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
  });
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    any,
    Error,
    string[],
    { previousUsers?: PaginatedResponse<User> }
  >({
    mutationFn: (userIds: string[]) => usersService.deleteUsers(userIds),
    onMutate: async (idsToDelete) => {
      const queryKey = [USERS_QUERY_KEY, "list"];
      await queryClient.cancelQueries({ queryKey });

      const previousUsers =
        queryClient.getQueryData<PaginatedResponse<User>>(queryKey);

      if (previousUsers) {
        queryClient.setQueryData<PaginatedResponse<User>>(queryKey, (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.filter((user) => !idsToDelete.includes(user.id)),
          };
        });
      }

      return { previousUsers };
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã xóa người dùng thành công.",
        variant: "success",
      });
    },
    onError: (err, id, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(
          [USERS_QUERY_KEY, "list"],
          context.previousUsers
        );
      }
      toast({
        title: "Lỗi",
        description: extractErrorMessage(err),
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
  });
}
