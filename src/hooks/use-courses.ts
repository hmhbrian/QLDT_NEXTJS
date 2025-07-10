
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coursesService } from "@/lib/services/modern/courses.service";
import { useToast } from "@/components/ui/use-toast";
import type {
  Course,
  CreateCourseRequest,
  CourseSearchParams,
  UpdateCourseRequest,
  CourseApiResponse,
} from "@/lib/types/course.types";
import { useError } from "./use-error";
import { mapCourseApiToUi } from "@/lib/mappers/course.mapper";
import type { PaginatedResponse, PaginationParams } from "@/lib/core";

export const COURSES_QUERY_KEY = "courses";

export function useCourses(params?: CourseSearchParams & PaginationParams) {
  const queryKey = [COURSES_QUERY_KEY, params];

  const {
    data,
    isLoading,
    error,
    refetch: reloadCourses,
  } = useQuery<PaginatedResponse<Course>, Error>({
    queryKey,
    queryFn: async () => {
      const apiResponse = await coursesService.getCourses(params);
      return {
          items: (apiResponse.items || []).map(mapCourseApiToUi),
          pagination: apiResponse.pagination,
      };
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });

  return {
    courses: data?.items ?? [],
    paginationInfo: data?.pagination,
    isLoading,
    error,
    reloadCourses,
  };
}


export function useCourse(courseId: string) {
  const queryKey = [COURSES_QUERY_KEY, courseId];

  const {
    data,
    isLoading,
    error,
    refetch: reloadCourse,
  } = useQuery<Course, Error>({
    queryKey,
    queryFn: async () => {
      const apiCourse = await coursesService.getCourseById(courseId);
      return mapCourseApiToUi(apiCourse);
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
  const { showError } = useError();

  return useMutation<any, Error, CreateCourseRequest>({
    mutationFn: (courseData) => coursesService.createCourse(courseData),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [COURSES_QUERY_KEY] });
      showError(response); // Backend returns success message
    },
    onError: (error) => {
      showError(error);
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  const { showError } = useError();

  return useMutation<
    any,
    Error,
    { courseId: string; payload: UpdateCourseRequest }
  >({
    mutationFn: ({ courseId, payload }) =>
      coursesService.updateCourse(courseId, payload),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: [COURSES_QUERY_KEY] });
      // Invalidate the specific course query as well
      queryClient.invalidateQueries({ queryKey: [COURSES_QUERY_KEY, variables.courseId] });
      showError(response);
    },
    onError: (error) => {
      showError(error);
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  const { showError } = useError();

  return useMutation<any, Error, string[]>({
    mutationFn: (ids) => coursesService.softDeleteCourses(ids),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [COURSES_QUERY_KEY] });
      showError(response || { success: true, message: "Đã xóa khóa học." });
    },
    onError: (error) => {
      showError(error);
    },
  });
}
