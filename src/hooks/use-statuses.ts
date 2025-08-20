
"use client";

import { useToast } from "@/components/ui/use-toast";
import type {
  Status,
  CreateStatusRequest,
  UpdateStatusRequest,
} from "@/lib/types/status.types";
import { statusService } from "@/lib/services/modern/status.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const COURSE_STATUSES_QUERY_KEY = "courseStatuses";
export const USER_STATUSES_QUERY_KEY = "userStatuses";

// Course Status Hooks
export function useCourseStatuses() {
  const {
    data,
    isLoading,
    error,
    refetch: reloadCourseStatuses,
  } = useQuery<Status[], Error>({
    queryKey: [COURSE_STATUSES_QUERY_KEY],
    queryFn: () => statusService.getCourseStatuses(),
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes since statuses rarely change
    refetchOnWindowFocus: true,
    refetchOnMount: false,
  });

  return {
    courseStatuses: data ?? [],
    isLoading,
    error,
    reloadCourseStatuses,
  };
}

export function useCreateCourseStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<Status, Error, CreateStatusRequest>({
    mutationFn: async (payload) => {
      return await statusService.createCourseStatus(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COURSE_STATUSES_QUERY_KEY] });
      toast({
        title: "Thành công",
        description: "Trạng thái khóa học đã được tạo thành công.",
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description:
          error.message || "Có lỗi xảy ra khi tạo trạng thái khóa học.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateCourseStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    Status,
    Error,
    { id: string; payload: UpdateStatusRequest }
  >({
    mutationFn: async ({ id, payload }) => {
      return await statusService.updateCourseStatus(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COURSE_STATUSES_QUERY_KEY] });
      toast({
        title: "Thành công",
        description: "Trạng thái khóa học đã được cập nhật thành công.",
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description:
          error.message || "Có lỗi xảy ra khi cập nhật trạng thái khóa học.",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteCourseStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await statusService.deleteCourseStatus(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COURSE_STATUSES_QUERY_KEY] });
      toast({
        title: "Thành công",
        description: "Trạng thái khóa học đã được xóa thành công.",
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description:
          error.message || "Có lỗi xảy ra khi xóa trạng thái khóa học.",
        variant: "destructive",
      });
    },
  });
}

// User Status Hooks
export function useUserStatuses() {
  const {
    data,
    isLoading,
    error,
    refetch: reloadUserStatuses,
  } = useQuery<Status[], Error>({
    queryKey: [USER_STATUSES_QUERY_KEY],
    queryFn: () => statusService.getUserStatuses(),
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: false,
  });

  return {
    userStatuses: data ?? [],
    isLoading,
    error,
    reloadUserStatuses,
  };
}

export function useCreateUserStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<Status, Error, CreateStatusRequest>({
    mutationFn: async (payload) => {
      return await statusService.createUserStatus(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USER_STATUSES_QUERY_KEY] });
      toast({
        title: "Thành công",
        description: "Trạng thái người dùng đã được tạo thành công.",
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description:
          error.message || "Có lỗi xảy ra khi tạo trạng thái người dùng.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    Status,
    Error,
    { id: string; payload: UpdateStatusRequest }
  >({
    mutationFn: async ({ id, payload }) => {
      return await statusService.updateUserStatus(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USER_STATUSES_QUERY_KEY] });
      toast({
        title: "Thành công",
        description: "Trạng thái người dùng đã được cập nhật thành công.",
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description:
          error.message || "Có lỗi xảy ra khi cập nhật trạng thái người dùng.",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteUserStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await statusService.deleteUserStatus(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USER_STATUSES_QUERY_KEY] });
      toast({
        title: "Thành công",
        description: "Trạng thái người dùng đã được xóa thành công.",
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description:
          error.message || "Có lỗi xảy ra khi xóa trạng thái người dùng.",
        variant: "destructive",
      });
    },
  });
}
