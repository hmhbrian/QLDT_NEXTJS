"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { lessonsService } from "@/lib/services/modern/lessons.service";
import type {
  Lesson,
  CreateLessonPayload,
  UpdateLessonPayload,
  ApiLesson,
} from "@/lib/types/course.types";
import { useToast } from "@/components/ui/use-toast";
import { extractErrorMessage } from "@/lib/core";
import { ReorderLessonPayload } from "@/lib/services/modern/lessons.service";

export const LESSONS_QUERY_KEY = "lessons";

export function useLessons(courseId: string | undefined) {
  const queryKey = [LESSONS_QUERY_KEY, courseId];

  const {
    data,
    isLoading,
    error,
    refetch: reloadLessons,
  } = useQuery<Lesson[], Error>({
    queryKey,
    queryFn: async () => {
      if (!courseId) return [];
      const apiLessons = await lessonsService.getLessons(courseId);
      // Map API response to UI Lesson type
      return (apiLessons || []).map(
        (apiLesson: ApiLesson): Lesson => ({
          ...apiLesson,
          id: apiLesson.id,
          content: apiLesson.urlPdf,
          contentType: "pdf_url",
          duration: "N/A", // Add default or map from API if available
          link: apiLesson.urlPdf,
        })
      );
    },
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    lessons: data ?? [],
    isLoading,
    error,
    reloadLessons,
  };
}

export function useCreateLesson() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    ApiLesson,
    Error,
    { courseId: string } & CreateLessonPayload
  >({
    mutationFn: (variables) =>
      lessonsService.createLesson(variables.courseId, variables),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [LESSONS_QUERY_KEY, variables.courseId],
      });
      toast({
        title: "Thành công",
        description: `Bài học "${variables.title}" đã được tạo.`,
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Tạo bài học thất bại",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
  });
}

export function useUpdateLesson() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    ApiLesson,
    Error,
    {
      courseId: string;
      lessonId: number | string;
      payload: UpdateLessonPayload;
    }
  >({
    mutationFn: (variables) =>
      lessonsService.updateLesson(
        variables.courseId,
        Number(variables.lessonId),
        variables.payload
      ),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [LESSONS_QUERY_KEY, variables.courseId],
      });
      toast({
        title: "Thành công",
        description: `Bài học "${variables.payload.title}" đã được cập nhật.`,
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Cập nhật bài học thất bại",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
  });
}

export function useDeleteLesson() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, { courseId: string; lessonIds: number[] }>({
    mutationFn: (variables) =>
      lessonsService.deleteLesson(variables.courseId, variables.lessonIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [LESSONS_QUERY_KEY, variables.courseId],
      });
      toast({
        title: "Thành công",
        description: `Đã xóa ${variables.lessonIds.length} bài học.`,
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Xóa bài học thất bại",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
  });
}

export function useReorderLesson() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    void,
    Error,
    { courseId: string; payload: ReorderLessonPayload }
  >({
    mutationFn: (variables) =>
      lessonsService.reorderLesson(variables.courseId, variables.payload),
    onSuccess: (_, variables) => {
      // Invalidate queries to re-fetch the updated lesson order from server
      queryClient.invalidateQueries({
        queryKey: [LESSONS_QUERY_KEY, variables.courseId],
      });
      toast({
        title: "Thành công",
        description: "Đã sắp xếp lại thứ tự bài học.",
        variant: "success",
      });
    },
    onError: (error, variables) => {
      toast({
        title: "Sắp xếp bài học thất bại",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
      // On error, invalidate to revert the UI to the server's state.
      queryClient.invalidateQueries({
        queryKey: [LESSONS_QUERY_KEY, variables.courseId],
      });
    },
  });
}
