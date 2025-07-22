"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { testsService } from "@/lib/services/modern/tests.service";
import type {
  Test,
  CreateTestPayload,
  UpdateTestPayload,
  SelectedAnswer,
  TestSubmissionResponse,
  DetailedTestResult,
} from "@/lib/types/course.types";
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

/**
 * Hook để submit test với các câu trả lời đã chọn
 * @param courseId ID của khóa học
 * @param testId ID của test
 * @returns Mutation object để submit test
 */
export function useSubmitTest(courseId: string, testId: number) {
  const { showError } = useError();
  const queryClient = useQueryClient();

  return useMutation<
    TestSubmissionResponse,
    Error,
    { answers: SelectedAnswer[]; startedAt: string }
  >({
    mutationFn: async ({ answers, startedAt }) => {
      console.log("🔄 useSubmitTest mutation called:", {
        courseId,
        testId,
        answers,
        startedAt,
      });

      const result = await testsService.submitTest(
        courseId,
        testId,
        answers,
        startedAt
      );
      console.log("🎉 useSubmitTest mutation successful:", result);
      return result;
    },
    onSuccess: (data) => {
      console.log("✅ useSubmitTest onSuccess:", data);

      // Refresh test data
      queryClient.invalidateQueries({
        queryKey: [TESTS_QUERY_KEY, courseId],
      });

      // Tính phần trăm điểm, tránh NaN
      const percent =
        data && data.totalQuestions && data.totalQuestions > 0
          ? ((data.score / data.totalQuestions) * 100).toFixed(1)
          : "0.0";
      showError({
        success: true,
        message: `Nộp bài thành công! Điểm: ${percent}% (${data.correctAnswers}/${data.totalQuestions} câu đúng)`,
        description: `Số câu đúng: ${data.correctAnswers}/${
          data.totalQuestions
        } - ${data.isPassed ? "ĐẠT" : "KHÔNG ĐẠT"}`,
      });
    },
    onError: (error) => {
      console.error("❌ useSubmitTest onError:", error);
      showError(error);
    },
  });
}

/**
 * Hook để lấy chi tiết kết quả test đã submit
 * @param courseId ID của khóa học
 * @param testId ID của test
 * @returns Query object với chi tiết kết quả test
 */
export function useTestResult(courseId: string, testId: number) {
  return useQuery<DetailedTestResult, Error>({
    queryKey: ["testResult", courseId, testId],
    queryFn: async () => {
      console.log("🔍 Fetching test result:", { courseId, testId });
      const result = await testsService.getTestResult(courseId, testId);
      console.log("✅ Test result fetched:", result);
      return result;
    },
    enabled: !!courseId && !!testId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      // Don't retry if user hasn't submitted the test yet
      if (error?.message?.includes("chưa làm bài") || error?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

/**
 * Hook để kiểm tra xem user đã submit test chưa
 * @param courseId ID của khóa học
 * @param testId ID của test
 * @returns boolean indicating if test has been submitted
 */
export function useHasSubmittedTest(courseId: string, testId: number) {
  const {
    data: testResult,
    isLoading,
    error,
  } = useTestResult(courseId, testId);

  return {
    hasSubmitted: !!testResult && !error,
    isLoading,
    testResult,
  };
}
