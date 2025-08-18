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

  const { data, isLoading, error, isError } = useQuery<
    PaginatedResponse<User>,
    Error
  >({
    queryKey,
    queryFn: async () => {
      console.log(`♻️ [useUsers] Refetching users with params:`, params);
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
    mutationFn: (payload) => {
      console.log(
        "▶️ [useCreateUserMutation] Mutation started with payload:",
        payload
      );
      return usersService.createUser(payload);
    },
    onSuccess: (data, variables) => {
      console.log("✅ [useCreateUserMutation] Mutation successful:", data);
      const displayName = variables.fullName || data.fullName || "người dùng";
      toast({
        title: "Thành công",
        description: `Đã tạo người dùng "${displayName}" thành công.`,
        variant: "success",
      });
    },
    onError: (error) => {
      console.error("❌ [useCreateUserMutation] Mutation failed:", error);
      toast({
        title: "Lỗi",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
    onSettled: () => {
      console.log(`🔄 [useCreateUserMutation] Invalidating queries with key:`, [
        USERS_QUERY_KEY,
      ]);
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
    mutationFn: ({ id, payload }) => {
      console.log(
        `▶️ [useUpdateUserMutation] Mutation started for user ${id} with payload:`,
        payload
      );
      return usersService.updateUserByAdmin(id, payload);
    },
    onSuccess: (data, variables) => {
      console.log("✅ [useUpdateUserMutation] Mutation successful");
      const displayName =
        variables.payload.fullName || data?.fullName || "người dùng";
      toast({
        title: "Thành công",
        description: `Đã cập nhật người dùng "${displayName}" thành công.`,
        variant: "success",
      });
    },
    onError: (err, variables, context) => {
      console.error("❌ [useUpdateUserMutation] Mutation failed:", err);
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
      console.log(`🔄 [useUpdateUserMutation] Invalidating queries with key:`, [
        USERS_QUERY_KEY,
      ]);
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
    mutationFn: (userIds: string[]) => {
      console.log(
        "▶️ [useDeleteUserMutation] Mutation started for IDs:",
        userIds
      );
      return usersService.deleteUsers(userIds);
    },
    onSuccess: () => {
      console.log("✅ [useDeleteUserMutation] Mutation successful");
      toast({
        title: "Thành công",
        description: "Đã xóa người dùng thành công.",
        variant: "success",
      });
    },
    onError: (err) => {
      console.error("❌ [useDeleteUserMutation] Mutation failed:", err);
      toast({
        title: "Lỗi",
        description: extractErrorMessage(err),
        variant: "destructive",
      });
    },
    onSettled: () => {
      console.log(`🔄 [useDeleteUserMutation] Invalidating queries with key:`, [
        USERS_QUERY_KEY,
      ]);
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
  });
}

export function useManagersForDepartments() {
  const queryKey = [USERS_QUERY_KEY, "managers-for-departments"];

  const { data, isLoading, error, isError } = useQuery<
    Array<{ id: string; name: string; email: string }>,
    Error
  >({
    queryKey,
    queryFn: async () => {
      try {
        const result = await usersService.getManagersForDepartments();
        return result;
      } catch (error) {
        console.error("❌ [useManagersForDepartments] Error:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: true,
  });

  return {
    managers: data ?? [],
    isLoading,
    error,
    isError,
  };
}
