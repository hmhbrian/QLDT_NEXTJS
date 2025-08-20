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
  QuestionNoAnswer,
} from "@/lib/types/test.types";
import { useToast } from "@/components/ui/use-toast";
import { extractErrorMessage } from "@/lib/core";
import { mapApiTestToUiTest } from "@/lib/mappers/test.mapper";

export const TESTS_QUERY_KEY = "tests";

export function useTests(
  courseId: string | undefined,
  enabled: boolean = true
) {
  const queryKey = [TESTS_QUERY_KEY, courseId];

  const { data, isLoading, error, refetch } = useQuery<Test[], Error>({
    queryKey,
    queryFn: async () => {
      console.log(`♻️ [useTests] Refetching tests for course: ${courseId}`);
      if (!courseId) return [];
      const apiTests = await testsService.getTests(courseId);
      return apiTests.map(mapApiTestToUiTest);
    },
    enabled: !!courseId && enabled,
    staleTime: 0, // Set to 0 to always refetch fresh data
    refetchOnWindowFocus: true, // Ensure student sees fresh test list when returning to tab
    refetchOnMount: true, // Enable refetch when component mounts
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

  return useMutation<
    Test,
    Error,
    { courseId: string; payload: CreateTestPayload },
    { previousTests?: Test[] }
  >({
    mutationFn: async (variables) => {
      console.log(
        "▶️ [useCreateTest] Mutation started with payload:",
        variables.payload
      );
      const apiTest = await testsService.createTest(
        variables.courseId,
        variables.payload
      );
      return mapApiTestToUiTest(apiTest);
    },
    onSuccess: (data, variables) => {
      console.log("✅ [useCreateTest] Mutation successful:", data);
      toast({
        title: "Thành công",
        description: `Bài kiểm tra "${variables.payload.Title}" đã được tạo thành công.`,
        variant: "success",
      });
    },
    onError: (error, variables, context) => {
      console.error("❌ [useCreateTest] Mutation failed:", error);
    },
    onSettled: (data, error, variables) => {
      console.log(`🔄 [useCreateTest] Invalidating queries with key:`, [
        TESTS_QUERY_KEY,
        variables.courseId,
      ]);
      queryClient.invalidateQueries({
        queryKey: [TESTS_QUERY_KEY, variables.courseId],
      });
    },
  });
}

export function useUpdateTest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    any,
    Error,
    { courseId: string; testId: number; payload: UpdateTestPayload },
    { previousTests?: Test[] }
  >({
    mutationFn: async (variables) => {
      console.log(
        `▶️ [useUpdateTest] Mutation started for test ${variables.testId} with payload:`,
        variables.payload
      );
      const response = await testsService.updateTest(
        variables.courseId,
        variables.testId,
        variables.payload
      );
      return response;
    },
    onSuccess: (data, variables) => {
      console.log("✅ [useUpdateTest] Mutation successful:", data);
      toast({
        title: "Thành công",
        description: `Bài kiểm tra "${variables.payload.Title}" đã được cập nhật.`,
        variant: "success",
      });
    },
    onError: (error, variables, context) => {
      console.error("❌ [useUpdateTest] Mutation failed:", error);
    },
    onSettled: (data, error, variables) => {
      console.log(`🔄 [useUpdateTest] Invalidating queries with key:`, [
        TESTS_QUERY_KEY,
        variables.courseId,
      ]);
      queryClient.invalidateQueries({
        queryKey: [TESTS_QUERY_KEY, variables.courseId],
      });
    },
  });
}

export function useDeleteTest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    void,
    Error,
    { courseId: string; testId: number },
    { previousTests: Test[] | undefined }
  >({
    mutationFn: (variables) => {
      console.log(
        `▶️ [useDeleteTest] Mutation started for test ${variables.testId}`
      );
      return testsService.deleteTest(variables.courseId, variables.testId);
    },
    onSuccess: () => {
      console.log("✅ [useDeleteTest] Mutation successful");
      toast({
        title: "Thành công",
        description: "Đã xóa bài kiểm tra thành công.",
        variant: "success",
      });
    },
    onError: (err, { courseId }, context) => {
      console.error("❌ [useDeleteTest] Mutation failed:", err);
    },
    onSettled: (data, error, { courseId }) => {
      console.log(`🔄 [useDeleteTest] Invalidating queries with key:`, [
        TESTS_QUERY_KEY,
        courseId,
      ]);
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
      console.log("▶️ [useSubmitTest] Mutation started with payload:", {
        answers,
        startedAt,
      });
      return await testsService.submitTest(
        courseId,
        testId,
        answers,
        startedAt
      );
    },
    onSuccess: (data) => {
      console.log("✅ [useSubmitTest] Mutation successful:", data);
      const scorePercent =
        typeof data.score === "number" ? data.score.toFixed(1) : "Không có";
      const correctCount = data.correctAnswerCount ?? 0;
      const totalQuestions = correctCount + (data.incorrectAnswerCount ?? 0);

      toast({
        title: "Nộp bài thành công!",
        description: `Điểm: ${scorePercent}% (${correctCount}/${totalQuestions}) - ${
          data.isPassed ? "ĐẠT" : "KHÔNG ĐẠT"
        }`,
        variant: "success",
      });
    },
    onError: (error) => {
      console.error("❌ [useSubmitTest] Mutation failed:", error);
      toast({
        title: "Lỗi",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
    onSettled: () => {
      const testsQueryKey = [TESTS_QUERY_KEY, courseId];
      const resultQueryKey = ["testResult", courseId, testId];
      console.log(
        `🔄 [useSubmitTest] Invalidating queries with keys:`,
        testsQueryKey,
        resultQueryKey
      );
      queryClient.invalidateQueries({ queryKey: testsQueryKey });
      queryClient.invalidateQueries({ queryKey: resultQueryKey });
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
      console.log(
        `♻️ [useTestResult] Refetching test result for test: ${testId}`
      );
      return await testsService.getTestResult(courseId, testId);
    },
    enabled: !!courseId && !!testId && enabled,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: (failureCount, error: any) => {
      if (error?.message?.includes("chưa làm bài") || error?.status === 404) {
        console.log(
          `[useTestResult] No submission found for test ${testId}. Not retrying.`
        );
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
  console.log(`[useHasSubmittedTest] Check for test ${testId}:`, {
    hasSubmitted,
    isLoading,
    error: error?.message,
  });

  return {
    hasSubmitted,
    isLoading,
    testResult,
  };
}

/**
 * Hook để lấy câu hỏi test không có câu trả lời (bảo mật)
 * Chỉ được gọi khi user thực sự bắt đầu làm bài
 */
export function useTestQuestionsNoAnswer(
  courseId: string,
  testId: number,
  enabled: boolean = false
) {
  return useQuery<QuestionNoAnswer[], Error>({
    queryKey: ["testQuestionsNoAnswer", courseId, testId],
    queryFn: async () => {
      console.log(
        `♻️ [useTestQuestionsNoAnswer] Fetching secure questions for test: ${testId}`
      );
      return await testsService.getTestNoAnswer(courseId, testId);
    },
    enabled: !!courseId && !!testId && enabled,
    staleTime: Infinity, // Cache cho đến hết session làm bài
    refetchOnWindowFocus: true,
    refetchOnMount: false,
    retry: 2,
  });
}
