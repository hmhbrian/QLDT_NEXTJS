
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { testsService } from "@/lib/services/modern/tests.service";
import type {
  Test,
  CreateTestPayload,
  UpdateTestPayload,
} from "@/lib/types/course.types";
import { useToast } from "@/components/ui/use-toast";
import { extractErrorMessage } from "@/lib/core";
import { mapApiTestToUiTest } from "@/lib/mappers/test.mapper";

export const TESTS_QUERY_KEY = "tests";

export function useTests(courseId: string | undefined) {
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
    enabled: !!courseId,
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
  const { toast } = useToast();

  return useMutation<Test, Error, { courseId: string; payload: CreateTestPayload }>({
    mutationFn: async (variables) => {
        const apiTest = await testsService.createTest(variables.courseId, variables.payload);
        return mapApiTestToUiTest(apiTest);
    },
    onSuccess: (newTest, variables) => {
      queryClient.invalidateQueries({ queryKey: [TESTS_QUERY_KEY, variables.courseId] });
      toast({
        title: "Thành công",
        description: `Bài kiểm tra "${newTest.title}" đã được tạo.`,
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Tạo bài kiểm tra thất bại",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
  });
}

export function useUpdateTest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    Test,
    Error,
    {
      courseId: string;
      testId: number;
      payload: UpdateTestPayload;
    }
  >({
    mutationFn: async (variables) => {
        const apiTest = await testsService.updateTest(variables.courseId, variables.testId, variables.payload);
        return mapApiTestToUiTest(apiTest);
    },
    onSuccess: (updatedTest, variables) => {
      queryClient.invalidateQueries({ queryKey: [TESTS_QUERY_KEY, variables.courseId] });
      toast({
        title: "Thành công",
        description: `Bài kiểm tra "${updatedTest.title}" đã được cập nhật.`,
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Cập nhật bài kiểm tra thất bại",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
  });
}

export function useDeleteTest() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
  
    return useMutation<void, Error, { courseId: string; testId: number }>({
      mutationFn: (variables) =>
        testsService.deleteTest(variables.courseId, variables.testId),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: [TESTS_QUERY_KEY, variables.courseId] });
        toast({
          title: "Thành công",
          description: "Đã xóa bài kiểm tra.",
          variant: "success",
        });
      },
      onError: (error) => {
        toast({
          title: "Xóa bài kiểm tra thất bại",
          description: extractErrorMessage(error),
          variant: "destructive",
        });
      },
    });
  }
