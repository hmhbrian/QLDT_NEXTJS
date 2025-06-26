"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// Import trực tiếp để tránh lỗi module resolution
import { coursesService } from "@/lib/services/modern/courses.service";
import { useToast } from "@/hooks/use-toast";
import type {
  Course,
  CourseApiResponse,
  CreateCourseRequest,
  UpdateCourseRequest,
  CourseSearchParams,
} from "@/lib/types";
import type { QueryParams } from "@/lib/core";

export const COURSES_QUERY_KEY = "courses";

export function useCourses(params?: QueryParams) {
  const {
    data,
    isLoading,
    error,
    refetch: reloadCourses,
  } = useQuery<Course[], Error>({
    queryKey: [COURSES_QUERY_KEY, params],
    queryFn: async () => {
      const apiCourses = await coursesService.getCourses(params);
      return apiCourses.map((course) =>
        coursesService.transformToCourse(course)
      );
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return {
    courses: data ?? [],
    isLoading,
    error,
    reloadCourses,
  };
}

export function useCourse(courseId: string) {
  const {
    data,
    isLoading,
    error,
    refetch: reloadCourse,
  } = useQuery<Course, Error>({
    queryKey: [COURSES_QUERY_KEY, courseId],
    queryFn: async () => {
      const apiCourse = await coursesService.getCourseById(courseId);
      return coursesService.transformToCourse(apiCourse);
    },
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    course: data,
    isLoading,
    error,
    reloadCourse,
  };
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<Course, Error, Partial<Course>>({
    mutationFn: async (course) => {
      try {
        // Use service transformation to convert frontend Course to API payload
        const payload = coursesService.transformToCreatePayload(course);
        console.log("🔄 Transformed payload being sent:", payload);

        const apiCourse = await coursesService.createCourse(payload);
        const transformedCourse = coursesService.transformToCourse(apiCourse);
        console.log("✅ Course created successfully:", transformedCourse);
        return transformedCourse;
      } catch (error) {
        console.error("❌ Create course error:", error);
        // Re-throw để onError có thể handle
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COURSES_QUERY_KEY] });
      toast({
        title: "Thành công",
        description: "Khóa học đã được tạo thành công.",
      });
    },
    onError: (error) => {
      // Extract backend validation errors from api-utils
      const errorMessage = error.message || "Có lỗi xảy ra khi tạo khóa học.";

      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });

      // Re-throw to let form handle field-specific errors
      throw error;
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    Course,
    Error,
    { courseId: string; payload: UpdateCourseRequest }
  >({
    mutationFn: async ({ courseId, payload }) => {
      const apiCourse = await coursesService.updateCourse(courseId, payload);
      return coursesService.transformToCourse(apiCourse);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COURSES_QUERY_KEY] });
      toast({
        title: "Thành công",
        description: "Khóa học đã được cập nhật thành công.",
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: error.message || "Có lỗi xảy ra khi cập nhật khóa học.",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteCourses() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, string[]>({
    mutationFn: coursesService.softDeleteCourses.bind(coursesService),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COURSES_QUERY_KEY] });
      toast({
        title: "Thành công",
        description: "Khóa học đã được xóa thành công.",
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: error.message || "Có lỗi xảy ra khi xóa khóa học.",
        variant: "destructive",
      });
    },
  });
}

export function useSearchCourses(params: CourseSearchParams) {
  const { data, isLoading, error, refetch } = useQuery<Course[], Error>({
    queryKey: [COURSES_QUERY_KEY, "search", params],
    queryFn: async () => {
      const apiCourses = await coursesService.searchCourses(params);
      return apiCourses.map((course) =>
        coursesService.transformToCourse(course)
      );
    },
    enabled: !!params.keyword,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });

  return {
    searchResults: data ?? [],
    isSearching: isLoading,
    searchError: error,
    refetch,
  };
}
