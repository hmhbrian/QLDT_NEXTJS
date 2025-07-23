
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
  
  return useMutation<UserApiResponse, Error, CreateUserRequest, { previousUsers: PaginatedResponse<UserApiResponse> | undefined }>({
    mutationFn: (payload) => usersService.createUser(payload),
    onMutate: async (newUser) => {
      await queryClient.cancelQueries({ queryKey: [USERS_QUERY_KEY] });
      const previousUsers = queryClient.getQueryData<PaginatedResponse<UserApiResponse>>([USERS_QUERY_KEY]);
      
      const optimisticUser: User = {
        id: `temp-${Date.now()}`,
        fullName: newUser.FullName,
        email: newUser.Email,
        idCard: newUser.IdCard || '',
        phoneNumber: newUser.NumberPhone || '',
        role: "HOCVIEN", // Default role for optimistic update
      };

      queryClient.setQueryData<PaginatedResponse<UserApiResponse>>([USERS_QUERY_KEY], (old) => {
        const optimisticApiUser: UserApiResponse = {
          id: optimisticUser.id,
          fullName: optimisticUser.fullName,
          email: optimisticUser.email,
          role: optimisticUser.role,
        };
        return old ? { ...old, items: [optimisticApiUser, ...old.items] } : { items: [optimisticApiUser], pagination: { totalItems: 1, itemsPerPage: 10, currentPage: 1, totalPages: 1 } };
      });
      
      return { previousUsers };
    },
    onSuccess: (response) => {
      showError({
        success: true,
        message: `Đã tạo người dùng "${response.fullName}" thành công.`,
      });
    },
    onError: (error, newUser, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData([USERS_QUERY_KEY], context.previousUsers);
      }
      showError(error);
    },
    onSettled: () => {
        queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
  });
}


export function useUpdateUserMutation() {
  const queryClient = useQueryClient();
  const { showError } = useError();
  
  return useMutation<
    UserApiResponse,
    Error,
    { id: string; payload: UpdateUserRequest },
    { previousUsers: PaginatedResponse<UserApiResponse> | undefined }
  >({
    mutationFn: ({ id, payload }) => usersService.updateUserByAdmin(id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: [USERS_QUERY_KEY] });
      const previousUsers = queryClient.getQueryData<PaginatedResponse<UserApiResponse>>([USERS_QUERY_KEY]);
      
      queryClient.setQueryData<PaginatedResponse<UserApiResponse>>([USERS_QUERY_KEY], (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map(u => u.id === id ? { ...u, ...payload } : u),
        };
      });
      
      return { previousUsers };
    },
    onSuccess: (response) => {
      showError({
        success: true,
        message: `Đã cập nhật người dùng "${response.fullName}" thành công.`,
      });
    },
    onError: (error, variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData([USERS_QUERY_KEY], context.previousUsers);
      }
      showError(error);
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY, variables.id] });
    },
  });
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();
  const { showError } = useError();
  
  return useMutation<any, Error, string[], { previousUsers: PaginatedResponse<UserApiResponse> | undefined }>({
    mutationFn: (userIds: string[]) => usersService.deleteUsers(userIds),
    onMutate: async (userIds) => {
      await queryClient.cancelQueries({ queryKey: [USERS_QUERY_KEY] });
      const previousUsers = queryClient.getQueryData<PaginatedResponse<UserApiResponse>>([USERS_QUERY_KEY]);

      queryClient.setQueryData<PaginatedResponse<UserApiResponse>>([USERS_QUERY_KEY], (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.filter(u => u.id && !userIds.includes(u.id)),
        };
      });
      
      return { previousUsers };
    },
    onSuccess: () => {
      showError({ success: true, message: "Đã xóa người dùng thành công." });
    },
    onError: (error, variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData([USERS_QUERY_KEY], context.previousUsers);
      }
      showError(error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
  });
}
