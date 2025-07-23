
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
    refetch: reloadTests,
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
  });

  return {
    tests: data ?? [],
    isLoading,
    error,
    reloadTests,
  };
}

export function useCreateTest() {
  const queryClient = useQueryClient();
  const { showError } = useError();

  return useMutation<
    Test,
    Error,
    { courseId: string; payload: CreateTestPayload }
  >({
    mutationFn: async (variables) => {
      const apiTest = await testsService.createTest(
        variables.courseId,
        variables.payload
      );
      return mapApiTestToUiTest(apiTest);
    },
    onSuccess: (newTest, variables) => {
      queryClient.invalidateQueries({
        queryKey: [TESTS_QUERY_KEY, variables.courseId],
      });

      showError({
        success: true,
        message: `Bài kiểm tra "${newTest.title}" đã được tạo thành công.`,
      });
    },
    onError: (error) => {
      showError(error);
    },
  });
}

export function useUpdateTest() {
  const queryClient = useQueryClient();
  const { showError } = useError();

  return useMutation<
    any,
    Error,
    {
      courseId: string;
      testId: number;
      payload: UpdateTestPayload;
    }
  >({
    mutationFn: async (variables) => {
      const response = await testsService.updateTest(
        variables.courseId,
        variables.testId,
        variables.payload
      );
      return response;
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({
        queryKey: [TESTS_QUERY_KEY, variables.courseId],
      });

      showError(response);
    },
    onError: (error) => {
      showError(error);
    },
  });
}

export function useDeleteTest() {
  const queryClient = useQueryClient();
  const { showError } = useError();

  return useMutation<void, Error, { courseId: string; testId: number }>({
    mutationFn: (variables) =>
      testsService.deleteTest(variables.courseId, variables.testId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [TESTS_QUERY_KEY, variables.courseId],
      });
      showError({
        success: true,
        message: "Đã xóa bài kiểm tra thành công.",
      });
    },
    onError: (error) => {
      showError(error);
    },
  });
}

export function useSubmitTest(courseId: string, testId: number) {
  const { showError } = useError();
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
      queryClient.invalidateQueries({ queryKey: [TESTS_QUERY_KEY, courseId] });
      queryClient.invalidateQueries({
        queryKey: ["testResult", courseId, testId],
      });

      const scorePercent =
        typeof data.score === "number" ? data.score.toFixed(1) : "N/A";
      const correctCount = data.correctAnswerCount ?? 0;
      const totalQuestions = correctCount + (data.incorrectAnswerCount ?? 0);

      showError({
        success: true,
        title: "Nộp bài thành công!",
        message: `Điểm: ${scorePercent}% (${correctCount}/${totalQuestions}) - ${
          data.isPassed ? "ĐẠT" : "KHÔNG ĐẠT"
        }`,
      });
    },
    onError: (error) => {
      showError(error);
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
  } = useTestResult(courseId, testId, true); // Always enable to check for submission

  const hasSubmitted = !!testResult && !error;

  return {
    hasSubmitted,
    isLoading,
    testResult,
  };
}
