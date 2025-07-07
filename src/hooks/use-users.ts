
"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersService } from "@/lib/services";
import type { User, CreateUserRequest } from "@/lib/types/user.types";
import type { QueryParams, PaginatedResponse } from "@/lib/core";
import { toast } from "@/components/ui/use-toast";
import { extractErrorMessage } from "@/lib/core";

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
  return useMutation({
    mutationFn: (payload: CreateUserRequest) =>
      usersService.createUser(payload),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Người dùng mới đã được tạo thành công.",
        variant: "success",
      });
      // Invalidate the users query to refetch the list
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
    onError: (error) => {
      toast({
        title: "Tạo người dùng thất bại",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
  });
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateUserRequest>;
    }) => usersService.updateUserByAdmin(id, payload),
    onSuccess: (data, variables) => {
      toast({
        title: "Thành công",
        description: "Thông tin người dùng đã được cập nhật.",
        variant: "success",
      });
      // Invalidate the main users list query to get fresh data
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
    onError: (error) => {
      toast({
        title: "Cập nhật người dùng thất bại",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
  });
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => usersService.deleteUser(userId),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Người dùng đã được xóa.",
        variant: "success",
      });
      // Invalidate the users query to refetch the list
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
    onError: (error) => {
      toast({
        title: "Xóa người dùng thất bại",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
  });
}
