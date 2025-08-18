"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { feedbackService } from "@/lib/services";
import type { Feedback, CreateFeedbackPayload } from "@/lib/types/course.types";
import { useToast } from "@/components/ui/use-toast";
import { extractErrorMessage } from "@/lib/core";
import { useAuth } from "./useAuth";

export const FEEDBACK_QUERY_KEY = "feedbacks";

export function useFeedbacks(courseId: string) {
  const { user } = useAuth();
  const queryKey = [FEEDBACK_QUERY_KEY, courseId];

  const {
    data,
    isLoading,
    error,
    refetch: reloadFeedbacks,
  } = useQuery<Feedback[], Error>({
    queryKey,
    queryFn: () => feedbackService.getFeedbacks(courseId),
    enabled: !!courseId, // Enable for all roles to check if trainee has submitted
    staleTime: 0, // Set to 0 to always refetch fresh data
    refetchOnWindowFocus: true, // Enable refetch when user comes back to tab
    refetchOnMount: true, // Enable refetch when component mounts
  });

  return {
    feedbacks: data ?? [],
    isLoading,
    error,
    reloadFeedbacks,
  };
}

export function useCreateFeedback(courseId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, CreateFeedbackPayload>({
    mutationFn: (payload) => feedbackService.createFeedback(courseId, payload),
    onSuccess: () => {
      // Invalidate both feedbacks and the specific course to update UI states
      queryClient.invalidateQueries({
        queryKey: [FEEDBACK_QUERY_KEY, courseId],
      });
      queryClient.invalidateQueries({ queryKey: ["courses", courseId] });

      toast({
        title: "Cảm ơn bạn!",
        description: "Đánh giá của bạn đã được gửi thành công.",
        variant: "success",
      });
    },
    onError: (error) => {
      const errorMessage = extractErrorMessage(error);

      // Check if error indicates user has already submitted
      if (
        errorMessage.includes("đã đánh giá") ||
        errorMessage.includes("already")
      ) {
        // Refresh data to update UI state immediately
        queryClient.invalidateQueries({
          queryKey: [FEEDBACK_QUERY_KEY, courseId],
        });

        toast({
          title: "Thông báo",
          description: "Bạn đã đánh giá khóa học này rồi.",
          variant: "default",
        });
        return;
      }

      toast({
        title: "Gửi đánh giá thất bại",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
}
