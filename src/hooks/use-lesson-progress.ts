import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { lessonProgressService } from "@/lib/services/modern/lesson-progress.service";
import type {
  ApiLessonProgress,
  UpsertLessonProgressPayload,
} from "@/lib/types/course.types";
import { extractErrorMessage } from "@/lib/core";

export const LESSON_PROGRESS_QUERY_KEY = "lessonProgress";

interface LessonProgressContext {
  previousProgress?: ApiLessonProgress[];
}

export function useLessonProgress(courseId: string, enabled: boolean = true) {
  const queryKey = [LESSON_PROGRESS_QUERY_KEY, courseId];

  const { data, isLoading, error, refetch } = useQuery<
    ApiLessonProgress[],
    Error
  >({
    queryKey,
    queryFn: () => lessonProgressService.getLessonProgress(courseId),
    enabled: !!courseId && enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes - balance between freshness and performance
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
    refetchOnWindowFocus: true, // Enable revalidate on window focus for student screens
    refetchOnMount: "always", // Smart refetch on mount
    placeholderData: (previousData) => previousData, // Keep previous data while refetching
    networkMode: "online", // Only run when online
  });

  return {
    lessonProgresses: data ?? [],
    isLoading,
    error,
    reloadProgress: refetch,
  };
}

export function useUpsertLessonProgress(courseId: string) {
  const queryClient = useQueryClient();
  const queryKey = [LESSON_PROGRESS_QUERY_KEY, courseId];

  return useMutation<
    void,
    Error,
    UpsertLessonProgressPayload,
    LessonProgressContext
  >({
    mutationFn: (payload) =>
      lessonProgressService.upsertLessonProgress(payload),
    // Retry configuration for network issues
    retry: (failureCount, error) => {
      // Only retry on network errors, not validation errors
      if (failureCount >= 3) return false;
      const errorMessage = extractErrorMessage(error);
      return (
        !errorMessage.includes("validation") && !errorMessage.includes("400")
      );
    },
    // Optimistically update the progress in the UI
    onMutate: async (newProgress) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousProgress =
        queryClient.getQueryData<ApiLessonProgress[]>(queryKey);

      // Optimistically update to the new value
      queryClient.setQueryData<ApiLessonProgress[]>(queryKey, (oldData) => {
        if (!oldData) return [];
        const newData = oldData.map((progress) => {
          if (progress.id === newProgress.lessonId) {
            return {
              ...progress,
              currentPage: newProgress.currentPage ?? progress.currentPage,
              currentTimeSecond:
                newProgress.currentTimeSecond ?? progress.currentTimeSecond,
            };
          }
          return progress;
        });
        return newData;
      });

      // Return a context object with the snapshotted value
      return { previousProgress };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, newProgress, context) => {
      if (context?.previousProgress) {
        queryClient.setQueryData(queryKey, context.previousProgress);
      }
      console.error(
        "Failed to update lesson progress:",
        extractErrorMessage(err)
      );
    },
    // Smart refetch strategy:
    onSettled: (data, error) => {
      // Only invalidate on error or after significant delay to batch updates
      if (error) {
        queryClient.invalidateQueries({
          queryKey,
          refetchType: "active",
        });
      } else {
        // Batch invalidations for better performance
        setTimeout(() => {
          queryClient.invalidateQueries({
            queryKey,
            refetchType: "active",
          });
        }, 3000); // 3 second delay to batch multiple updates
      }
    },
  });
}
