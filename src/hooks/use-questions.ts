import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { questionsService } from "@/lib/services";
import type {
  CreateQuestionPayload,
  UpdateQuestionPayload,
  Question,
} from "@/lib/types/course.types";
import { useToast } from "@/components/ui/use-toast";
import { extractErrorMessage } from "@/lib/core";
import { mapApiQuestionToUi } from "@/lib/mappers/question.mapper";

export const QUESTIONS_QUERY_KEY = "questions";

export function useQuestions(testId: number | undefined) {
  const queryKey = [QUESTIONS_QUERY_KEY, testId];

  const {
    data,
    isLoading,
    error,
    refetch: reloadQuestions,
  } = useQuery<Question[], Error>({
    queryKey,
    queryFn: async () => {
      if (!testId) return [];
      const paginatedResponse = await questionsService.getQuestions(testId, {
        SortField: "position",
        SortType: "asc",
        Limit: 50, // Reduced limit as requested
      });
      return (paginatedResponse.items || []).map(mapApiQuestionToUi);
    },
    enabled: !!testId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    questions: data ?? [],
    isLoading,
    error,
    reloadQuestions,
  };
}

export function useCreateQuestion() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    Question,
    Error,
    { testId: number; payload: CreateQuestionPayload }
  >({
    mutationFn: async (variables) => {
      const apiQuestion = await questionsService.createQuestion(
        variables.testId,
        variables.payload
      );
      return mapApiQuestionToUi(apiQuestion);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUESTIONS_QUERY_KEY, variables.testId],
      });
      toast({
        title: "Thành công",
        description: "Đã thêm câu hỏi mới.",
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Thêm câu hỏi thất bại",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
  });
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    Question,
    Error,
    { testId: number; questionId: number; payload: UpdateQuestionPayload }
  >({
    mutationFn: async (variables) => {
      const apiQuestion = await questionsService.updateQuestion(
        variables.testId,
        variables.questionId,
        variables.payload
      );
      return mapApiQuestionToUi(apiQuestion);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUESTIONS_QUERY_KEY, variables.testId],
      });
      toast({
        title: "Thành công",
        description: "Đã cập nhật câu hỏi.",
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Cập nhật câu hỏi thất bại",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, { testId: number; questionIds: number[] }>({
    mutationFn: (variables) =>
      questionsService.deleteQuestions(variables.testId, variables.questionIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUESTIONS_QUERY_KEY, variables.testId],
      });
      toast({
        title: "Thành công",
        description: "Đã xóa câu hỏi.",
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Xóa câu hỏi thất bại",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
  });
}
