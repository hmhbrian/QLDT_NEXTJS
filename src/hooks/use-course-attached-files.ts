"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { courseAttachedFilesService } from "@/lib/services/modern/course-attached-files.service";
import type { CourseMaterial } from "@/lib/types/course.types";
import { useToast } from "@/components/ui/use-toast";
import { extractErrorMessage } from "@/lib/core";

export const ATTACHED_FILES_QUERY_KEY = "courseAttachedFiles";

export function useAttachedFiles(courseId: string | undefined) {
  const queryKey = [ATTACHED_FILES_QUERY_KEY, courseId];

  const {
    data,
    isLoading,
    error,
    refetch: reloadAttachedFiles,
  } = useQuery<CourseMaterial[], Error>({
    queryKey,
    queryFn: async () => {
      if (!courseId) return [];
      return await courseAttachedFilesService.getAttachedFiles(courseId);
    },
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    attachedFiles: data ?? [],
    isLoading,
    error,
    reloadAttachedFiles,
  };
}

export function useDeleteAttachedFile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<any, Error, { courseId: string; fileId: number }>({
    mutationFn: (variables) =>
      courseAttachedFilesService.deleteAttachedFile(variables),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [ATTACHED_FILES_QUERY_KEY, variables.courseId],
      });

      // Show success message from backend if available
      if (data && typeof data === "object" && "message" in data) {
        toast({
          title: "Thành công",
          description: data.message,
          variant: "success",
        });
      } else {
        toast({
          title: "Thành công",
          description: "Đã xóa tài liệu thành công.",
          variant: "success",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Xóa tài liệu thất bại",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
  });
}
