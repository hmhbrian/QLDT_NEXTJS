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
import { mapApiLessonToUi } from "@/lib/mappers/lesson.mapper";

export const LESSONS_QUERY_KEY = "lessons";

export function useLessons(
  courseId: string | undefined,
  enabled: boolean = true
) {
  const queryKey = [LESSONS_QUERY_KEY, courseId];

  const { data, isLoading, error } = useQuery<Lesson[], Error>({
    queryKey,
    queryFn: async () => {
      if (!courseId) return [];
      const apiLessons = await lessonsService.getLessons(courseId);
      return (apiLessons || []).map(mapApiLessonToUi);
    },
    enabled: !!courseId && enabled,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: false,
    placeholderData: (previousData) => previousData,
  });

  return {
    lessons: data ?? [],
    isLoading,
    error,
  };
}

export function useCreateLesson() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    ApiLesson,
    Error,
    { courseId: string } & CreateLessonPayload,
    { previousLessons?: Lesson[] }
  >({
    mutationFn: (variables) =>
      lessonsService.createLesson(variables.courseId, variables),
    onSuccess: (data, variables) => {
      toast({
        title: "Thành công",
        description: `Bài học "${variables.Title}" đã được tạo.`,
        variant: "success",
      });
    },
    onError: (error, variables, context) => {
      if (context?.previousLessons) {
        queryClient.setQueryData(
          [LESSONS_QUERY_KEY, variables.courseId],
          context.previousLessons
        );
      }
      toast({
        title: "Tạo bài học thất bại",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: [LESSONS_QUERY_KEY, variables.courseId],
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
    },
    { previousLessons?: Lesson[] }
  >({
    mutationFn: (variables) =>
      lessonsService.updateLesson(
        variables.courseId,
        Number(variables.lessonId),
        variables.payload
      ),
    onSuccess: (data, variables) => {
      toast({
        title: "Thành công",
        description: `Bài học "${variables.payload.Title}" đã được cập nhật.`,
        variant: "success",
      });
    },
    onError: (error, variables, context) => {
      if (context?.previousLessons) {
        queryClient.setQueryData(
          [LESSONS_QUERY_KEY, variables.courseId],
          context.previousLessons
        );
      }
      toast({
        title: "Cập nhật bài học thất bại",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: [LESSONS_QUERY_KEY, variables.courseId],
      });
    },
  });
}

export function useDeleteLesson() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    void,
    Error,
    { courseId: string; lessonIds: number[] },
    { previousLessons?: Lesson[] }
  >({
    mutationFn: (variables) =>
      lessonsService.deleteLessons(variables.courseId, variables.lessonIds),
    onSuccess: (_, variables) => {
      toast({
        title: "Thành công",
        description: `Đã xóa ${variables.lessonIds.length} bài học.`,
        variant: "success",
      });
    },
    onError: (error, variables, context) => {
      if (context?.previousLessons) {
        queryClient.setQueryData(
          [LESSONS_QUERY_KEY, variables.courseId],
          context.previousLessons
        );
      }
      toast({
        title: "Xóa bài học thất bại",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: [LESSONS_QUERY_KEY, variables.courseId],
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
    { courseId: string; payload: ReorderLessonPayload },
    { previousLessons?: Lesson[] }
  >({
    mutationFn: (variables) =>
      lessonsService.reorderLesson(variables.courseId, variables.payload),
    // Optimistic update for reordering is complex, so we'll just invalidate on success.
    // The onMutate in the component handles local state update.
    onSuccess: (_, variables) => {
      toast({
        title: "Thành công",
        description: "Đã sắp xếp lại thứ tự bài học.",
        variant: "success",
      });
    },
    onError: (error, variables, context) => {
      // Revert if optimistic update was implemented
      toast({
        title: "Sắp xếp bài học thất bại",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
    onSettled: (data, error, variables) => {
      // Always invalidate to ensure the order is correct from the server
      queryClient.invalidateQueries({
        queryKey: [LESSONS_QUERY_KEY, variables.courseId],
      });
    },
  });
}
