
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coursesService } from "@/lib/services/modern/courses.service";
import type {
  Course,
  CreateCourseRequest,
  UpdateCourseRequest,
  CourseApiResponse,
  UserEnrollCourseDto,
} from "@/lib/types/course.types";
import { useError } from "./use-error";
import {
  mapCourseApiToUi,
  mapUserEnrollCourseDtoToCourse,
} from "@/lib/mappers/course.mapper";
import type { PaginatedResponse, QueryParams } from "@/lib/core";
import { useAuth } from "./useAuth";

export const COURSES_QUERY_KEY = "courses";
export const ENROLLED_COURSES_QUERY_KEY = "enrolledCourses";

export function useCourses(
  params: QueryParams & { publicOnly?: boolean } = {}
) {
  const { publicOnly = false, ...apiParams } = params;
  const { user } = useAuth();
  const { enrolledCourses, isLoadingEnrolled } = useEnrolledCourses(
    !!user && publicOnly
  );

  const queryKey = [
    COURSES_QUERY_KEY,
    "public",
    apiParams,
    enrolledCourses.map((c) => c.id).join(","),
  ];

  const {
    data,
    isLoading,
    error,
    refetch: reloadCourses,
  } = useQuery<PaginatedResponse<Course>, Error>({
    queryKey,
    queryFn: async () => {
      const apiResponse = await coursesService.getCourses(apiParams);
      const allCourses = (apiResponse.items || []).map(mapCourseApiToUi);
      
      return {
        items: allCourses,
        pagination: apiResponse.pagination,
      };
    },
    enabled: publicOnly ? !isLoadingEnrolled : true,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });

  return {
    courses: data?.items ?? [],
    paginationInfo: data?.pagination,
    isLoading: isLoading || (publicOnly && isLoadingEnrolled),
    error,
    reloadCourses,
  };
}

export function useEnrolledCourses(enabled: boolean = true) {
  const queryClient = useQueryClient();
  const queryKey = [ENROLLED_COURSES_QUERY_KEY];

  const { data, isLoading, error, refetch } = useQuery<Course[], Error>({
    queryKey,
    queryFn: async () => {
      const enrolledResponse = await coursesService.getEnrolledCourses();
      return (enrolledResponse.items || []).map(mapUserEnrollCourseDtoToCourse);
    },
    enabled: enabled,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  return {
    enrolledCourses: data ?? [],
    isLoadingEnrolled: isLoading,
    errorEnrolled: error,
    reloadEnrolledCourses: refetch,
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
      showError({ success: true, message: "Đã tạo khóa học thành công." });
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
      queryClient.invalidateQueries({
        queryKey: [COURSES_QUERY_KEY, variables.courseId],
      });
      queryClient.invalidateQueries({ queryKey: [COURSES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [ENROLLED_COURSES_QUERY_KEY] });
      showError({ success: true, message: "Đã cập nhật khóa học thành công." });
    },
    onError: (error) => {
      showError(error);
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  const { showError } = useError();

  return useMutation<any, Error, string[], { previousCourses: PaginatedResponse<Course> | undefined }>({
    mutationFn: (ids) => coursesService.softDeleteCourses(ids),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: [COURSES_QUERY_KEY] });
      const previousCourses = queryClient.getQueryData<PaginatedResponse<Course>>([COURSES_QUERY_KEY]);
      
      queryClient.setQueryData<PaginatedResponse<Course>>([COURSES_QUERY_KEY], (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.filter(c => !ids.includes(c.id)),
        };
      });

      return { previousCourses };
    },
    onSuccess: (response) => {
      showError(
        response || { success: true, message: "Đã xóa khóa học thành công." }
      );
    },
    onError: (error, variables, context) => {
      if (context?.previousCourses) {
          queryClient.setQueryData([COURSES_QUERY_KEY], context.previousCourses);
      }
      showError(error);
    },
    onSettled: () => {
        queryClient.invalidateQueries({ queryKey: [COURSES_QUERY_KEY] });
    }
  });
}

export function useEnrollCourse() {
  const queryClient = useQueryClient();
  const { showError } = useError();

  return useMutation<any, Error, string>({
    mutationFn: (courseId) => coursesService.enrollCourse(courseId),
    onSuccess: (response, courseId) => {
      queryClient.invalidateQueries({ queryKey: [ENROLLED_COURSES_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [COURSES_QUERY_KEY, "public"],
      });
      queryClient.invalidateQueries({
        queryKey: [COURSES_QUERY_KEY, courseId],
      });
      queryClient.invalidateQueries({ queryKey: [COURSES_QUERY_KEY] });
      showError(
        response || { success: true, message: "Đăng ký khóa học thành công!" }
      );
    },
    onError: (error) => {
      showError(error);
    },
  });
}
