
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coursesService } from "@/lib/services/modern/courses.service";
import { useToast } from "@/components/ui/use-toast";
import type {
  Course,
  CreateCourseRequest,
  CourseSearchParams,
  CourseApiResponse,
} from "@/lib/types/course.types";
import type { QueryParams } from "@/lib/core";
import { extractErrorMessage } from "@/lib/core";
import {
  mapCourseApiToUi,
  mapCourseUiToUpdatePayload,
} from "@/lib/mappers/course.mapper";
import { useAuth } from "./useAuth";

export const COURSES_QUERY_KEY = "courses";

export function useCourses(params?: CourseSearchParams) {
  const { user } = useAuth(); // Get current user
  // The query key includes all relevant filter parameters.
  // React Query will automatically refetch when any part of this key changes.
  const queryKey = [COURSES_QUERY_KEY, params, user?.id];

  const {
    data,
    isLoading,
    error,
    refetch: reloadCourses,
  } = useQuery<Course[], Error>({
    queryKey,
    queryFn: async () => {
      // Pass params directly to the service
      const apiCourses = await coursesService.getCourses(params);
      return apiCourses.map(mapCourseApiToUi);
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
  const { user } = useAuth(); // Also make single course fetch user-aware
  const queryKey = [COURSES_QUERY_KEY, courseId, user?.id];

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
  const { toast } = useToast();

  return useMutation<Course, Error, CreateCourseRequest>({
    mutationFn: async (courseData) => {
      const apiCourse = await coursesService.createCourse(courseData);
      return mapCourseApiToUi(apiCourse);
    },
    onSuccess: (newCourse) => {
      queryClient.invalidateQueries({ queryKey: [COURSES_QUERY_KEY] });
      toast({
        title: "Thành công",
        description: `Khóa học "${newCourse.title}" đã được tạo.`,
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Tạo khóa học thất bại",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    Course,
    Error,
    { courseId: string; payload: Partial<Course> }
  >({
    mutationFn: async ({ courseId, payload }) => {
      // Fetch all courses with a generic key to find the original course,
      // as the user-specific key might not have this course if it's being newly assigned.
      const allCourses =
        queryClient.getQueryData<Course[]>([COURSES_QUERY_KEY, undefined]) ||
        [];
      const originalCourse = allCourses.find((c) => c.id === courseId);

      // If not in the generic cache, try the user-specific cache
      const userSpecificCourses =
        queryClient.getQueryData<Course[]>([
          COURSES_QUERY_KEY,
          undefined,
          payload.enrolledTrainees?.[0], // A bit of a hack, but might work
        ]) || [];
      const finalOriginalCourse =
        originalCourse || userSpecificCourses.find((c) => c.id === courseId);

      if (!finalOriginalCourse) {
        // As a last resort, fetch the course directly
        const fetchedCourse = await coursesService.getCourseById(courseId);
        if (fetchedCourse) {
          const uiCourse = mapCourseApiToUi(fetchedCourse);
          const mergedCourse = { ...uiCourse, ...payload };
          const apiPayload = mapCourseUiToUpdatePayload(mergedCourse);
          const apiCourse = await coursesService.updateCourse(
            courseId,
            apiPayload
          );
          return mapCourseApiToUi(apiCourse);
        }
        throw new Error(
          `Không tìm thấy khóa học gốc với ID: ${courseId} trong cache hoặc API.`
        );
      }

      const mergedCourse = { ...finalOriginalCourse, ...payload };
      const apiPayload = mapCourseUiToUpdatePayload(mergedCourse);
      const apiCourse = await coursesService.updateCourse(courseId, apiPayload);

      return mapCourseApiToUi(apiCourse);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [COURSES_QUERY_KEY] });
      toast({
        title: "Thành công",
        description: `Khóa học "${data.title}" đã được cập nhật thành công.`,
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Cập nhật khóa học thất bại",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
  });
}

export function useDeleteCourses() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, string[]>({
    mutationFn: (ids) => coursesService.softDeleteCourses(ids),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [COURSES_QUERY_KEY] });
      toast({
        title: "Thành công",
        description: `Đã xóa ${variables.length} khóa học.`,
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Xóa khóa học thất bại",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
  });
}
