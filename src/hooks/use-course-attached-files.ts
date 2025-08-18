"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { courseAttachedFilesService } from "@/lib/services/modern/course-attached-files.service";
import type {
  CourseMaterial,
  CourseMaterialType,
} from "@/lib/types/course.types";
import { useToast } from "@/components/ui/use-toast";
import { extractErrorMessage } from "@/lib/core";
import { CourseAttachedFilePayload } from "@/lib/services/modern/course-attached-files.service";

export const ATTACHED_FILES_QUERY_KEY = "attachedFiles";

export function useAttachedFiles(courseId: string | null) {
  const queryKey = [ATTACHED_FILES_QUERY_KEY, courseId];

  const { data, isLoading, error, refetch } = useQuery<CourseMaterial[], Error>(
    {
      queryKey,
      queryFn: async () => {
        if (!courseId) return [];
        return await courseAttachedFilesService.getAttachedFiles(courseId);
      },
      enabled: !!courseId,
      staleTime: 10 * 60 * 1000, // 10 minutes - reasonable cache time
      gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
      refetchOnWindowFocus: true, // Enable revalidate on window focus for student screens
      refetchOnMount: "always", // Smart refetch on mount
      placeholderData: (previousData) => previousData, // Keep previous data while refetching
    }
  );

  return {
    attachedFiles: data ?? [],
    isLoading,
    error,
    refetch,
  };
}

export function useCreateAttachedFiles() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    any,
    Error,
    { courseId: string; files: CourseAttachedFilePayload[] },
    { previousFiles?: CourseMaterial[] }
  >({
    mutationFn: (variables) =>
      courseAttachedFilesService.uploadAttachedFiles(
        variables.courseId,
        variables.files
      ),
    // Optimistic update - update UI immediately
    onMutate: async (variables) => {
      const queryKey = [ATTACHED_FILES_QUERY_KEY, variables.courseId];

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousFiles =
        queryClient.getQueryData<CourseMaterial[]>(queryKey);

      // Optimistically add new files
      queryClient.setQueryData<CourseMaterial[]>(queryKey, (old = []) => [
        ...old,
        ...variables.files.map(
          (file, index) =>
            ({
              id: Date.now() + index, // Temporary ID
              courseId: variables.courseId,
              title: file.title,
              type: "PDF" as CourseMaterialType,
              link: file.link || "",
              createdAt: new Date().toISOString(),
              modifiedAt: null,
            } as CourseMaterial)
        ),
      ]);

      return { previousFiles };
    },
    onSuccess: (response, variables) => {
      toast({
        title: "Thành công",
        description: `Đã thêm ${variables.files.length} tài liệu mới.`,
        variant: "success",
      });

      // Update with real data from server
      const queryKey = [ATTACHED_FILES_QUERY_KEY, variables.courseId];
      queryClient.setQueryData(queryKey, response);
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousFiles) {
        const queryKey = [ATTACHED_FILES_QUERY_KEY, variables.courseId];
        queryClient.setQueryData(queryKey, context.previousFiles);
      }

      toast({
        title: "Thêm tài liệu thất bại",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
    // Only refetch if optimistic update failed
    onSettled: (data, error, variables) => {
      if (error) {
        queryClient.invalidateQueries({
          queryKey: [ATTACHED_FILES_QUERY_KEY, variables.courseId],
        });
      }
    },
  });
}

export function useDeleteAttachedFile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    any,
    Error,
    { courseId: string; fileId: number },
    { previousFiles?: CourseMaterial[] }
  >({
    mutationFn: (variables) =>
      courseAttachedFilesService.deleteAttachedFile(variables),
    // Optimistic update - remove file immediately
    onMutate: async (variables) => {
      const queryKey = [ATTACHED_FILES_QUERY_KEY, variables.courseId];

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousFiles =
        queryClient.getQueryData<CourseMaterial[]>(queryKey);

      // Optimistically remove file
      queryClient.setQueryData<CourseMaterial[]>(queryKey, (old = []) =>
        old.filter((file) => file.id !== variables.fileId)
      );

      return { previousFiles };
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Thành công",
        description: "Đã xóa tài liệu thành công.",
        variant: "success",
      });
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousFiles) {
        const queryKey = [ATTACHED_FILES_QUERY_KEY, variables.courseId];
        queryClient.setQueryData(queryKey, context.previousFiles);
      }

      toast({
        title: "Xóa tài liệu thất bại",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
    // Only refetch if optimistic update failed
    onSettled: (data, error, variables) => {
      if (error) {
        queryClient.invalidateQueries({
          queryKey: [ATTACHED_FILES_QUERY_KEY, variables.courseId],
        });
      }
    },
  });
}
