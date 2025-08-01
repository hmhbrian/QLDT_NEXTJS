
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { testsService } from "@/lib/services/modern/tests.service";
import {
  Test,
  CreateTestPayload,
  UpdateTestPayload,
  SelectedAnswer,
  TestSubmissionResponse,
  DetailedTestResult,
} from "@/lib/types/test.types";
import { useToast } from "@/components/ui/use-toast";
import { extractErrorMessage } from "@/lib/core";
import { mapApiTestToUiTest } from "@/lib/mappers/test.mapper";
import { useError } from "@/hooks/use-error";

export const TESTS_QUERY_KEY = "tests";

export function useTests(
  courseId: string | undefined,
  enabled: boolean = true
) {
  const queryKey = [TESTS_QUERY_KEY, courseId];

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<Test[], Error>({
    queryKey,
    queryFn: async () => {
      if (!courseId) return [];
      const apiTests = await testsService.getTests(courseId);
      return apiTests.map(mapApiTestToUiTest);
    },
    enabled: !!courseId && enabled,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: (previousData) => previousData,
  });

  return {
    tests: data ?? [],
    isLoading,
    error,
    refetch,
  };
}

export function useCreateTest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<Test, Error, { courseId: string; payload: CreateTestPayload }, { previousTests?: Test[] }>({
    mutationFn: async (variables) => {
      const apiTest = await testsService.createTest(
        variables.courseId,
        variables.payload
      );
      return mapApiTestToUiTest(apiTest);
    },
    onMutate: async ({ courseId, payload }) => {
        const queryKey = [TESTS_QUERY_KEY, courseId];
        await queryClient.cancelQueries({ queryKey });

        const previousTests = queryClient.getQueryData<Test[]>(queryKey);

        const optimisticTest: Test = {
            id: Date.now(),
            title: payload.Title,
            passingScorePercentage: payload.PassThreshold,
            timeTest: payload.TimeTest,
            questions: [],
            countQuestion: payload.Questions.length,
            isDone: false,
        };

        queryClient.setQueryData<Test[]>(queryKey, (old = []) => [...old, optimisticTest]);

        return { previousTests };
    },
    onSuccess: (data, variables) => {
       toast({
        title: "Thành công",
        description: `Bài kiểm tra "${variables.payload.Title}" đã được tạo thành công.`,
        variant: "success",
      });
    },
    onError: (error, variables, context) => {
        if (context?.previousTests) {
            queryClient.setQueryData([TESTS_QUERY_KEY, variables.courseId], context.previousTests);
        }
      toast({
        title: "Lỗi",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
    onSettled: (data, error, variables) => {
        queryClient.invalidateQueries({ queryKey: [TESTS_QUERY_KEY, variables.courseId] });
    },
  });
}

export function useUpdateTest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<any, Error, { courseId: string; testId: number; payload: UpdateTestPayload }, { previousTests?: Test[] }>({
    mutationFn: async (variables) => {
      const response = await testsService.updateTest(
        variables.courseId,
        variables.testId,
        variables.payload
      );
      return response;
    },
    onMutate: async ({ courseId, testId, payload }) => {
        const queryKey = [TESTS_QUERY_KEY, courseId];
        await queryClient.cancelQueries({ queryKey });

        const previousTests = queryClient.getQueryData<Test[]>(queryKey);
        
        queryClient.setQueryData<Test[]>(queryKey, (old = []) => 
            old.map(test => test.id === testId ? { ...test, ...payload } : test)
        );

        return { previousTests };
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Thành công",
        description: `Bài kiểm tra "${variables.payload.Title}" đã được cập nhật.`,
        variant: "success",
      });
    },
    onError: (error, variables, context) => {
      if (context?.previousTests) {
        queryClient.setQueryData([TESTS_QUERY_KEY, variables.courseId], context.previousTests);
      }
      toast({
        title: "Lỗi",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: [TESTS_QUERY_KEY, variables.courseId] });
    },
  });
}

export function useDeleteTest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, { courseId: string; testId: number }, { previousTests: Test[] | undefined }>({
    mutationFn: (variables) =>
      testsService.deleteTest(variables.courseId, variables.testId),
    onMutate: async ({ courseId, testId }) => {
      const queryKey = [TESTS_QUERY_KEY, courseId];
      await queryClient.cancelQueries({ queryKey });
      
      const previousTests = queryClient.getQueryData<Test[]>(queryKey);
      
      queryClient.setQueryData<Test[]>(queryKey, (old) =>
        old?.filter((t) => t.id !== testId)
      );
      return { previousTests };
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã xóa bài kiểm tra thành công.",
        variant: "success",
      });
    },
    onError: (err, { courseId }, context) => {
      if (context?.previousTests) {
        queryClient.setQueryData([TESTS_QUERY_KEY, courseId], context.previousTests);
      }
      toast({
        title: "Lỗi",
        description: extractErrorMessage(err),
        variant: "destructive",
      });
    },
    onSettled: (data, error, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: [TESTS_QUERY_KEY, courseId] });
    },
  });
}

export function useSubmitTest(courseId: string, testId: number) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation<
    TestSubmissionResponse,
    Error,
    { answers: SelectedAnswer[]; startedAt: string }
  >({
    mutationFn: async ({ answers, startedAt }) => {
      return await testsService.submitTest(courseId, testId, answers, startedAt);
    },
    onSuccess: (data) => {
      const scorePercent =
        typeof data.score === "number" ? data.score.toFixed(1) : "N/A";
      const correctCount = data.correctAnswerCount ?? 0;
      const totalQuestions = correctCount + (data.incorrectAnswerCount ?? 0);

      toast({
        title: "Nộp bài thành công!",
        description: `Điểm: ${scorePercent}% (${correctCount}/${totalQuestions}) - ${data.isPassed ? "ĐẠT" : "KHÔNG ĐẠT"}`,
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Invalidate both the list of tests and the specific test result
      queryClient.invalidateQueries({ queryKey: [TESTS_QUERY_KEY, courseId] });
      queryClient.invalidateQueries({ queryKey: ["testResult", courseId, testId] });
    },
  });
}

export function useTestResult(
  courseId: string,
  testId: number,
  enabled: boolean = true
) {
  return useQuery<DetailedTestResult, Error>({
    queryKey: ["testResult", courseId, testId],
    queryFn: async () => {
      return await testsService.getTestResult(courseId, testId);
    },
    enabled: !!courseId && !!testId && enabled,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      if (error?.message?.includes("chưa làm bài") || error?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useHasSubmittedTest(courseId: string, testId: number) {
  const {
    data: testResult,
    isLoading,
    error,
  } = useTestResult(courseId, testId, true);

  const hasSubmitted = !!testResult && !error;

  return {
    hasSubmitted,
    isLoading,
    testResult,
  };
}
