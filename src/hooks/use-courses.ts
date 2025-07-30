"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coursesService } from "@/lib/services/modern/courses.service";
import type {
  Course,
  CreateCourseRequest,
  UpdateCourseRequest,
  CourseApiResponse,
  UserEnrollCourseDto,
  UserCourseProgressDto,
  UserCourseProgressDetailDto,
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

  const queryKey = [COURSES_QUERY_KEY, "public", apiParams];

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
    enabled: true, // Always enable fetching, let filtering happen after both load
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });

  return {
    courses: data?.items ?? [],
    paginationInfo: data?.pagination,
    isLoading: isLoading, // Simplified loading state
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
      queryClient.invalidateQueries({ queryKey: [ENROLLED_COURSES_QUERY_KEY] }); // Invalidate enrolled courses
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

  return useMutation<
    any,
    Error,
    string[],
    { previousCourses: PaginatedResponse<Course> | undefined }
  >({
    mutationFn: (ids) => coursesService.softDeleteCourses(ids),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: [COURSES_QUERY_KEY] });
      const previousCourses = queryClient.getQueryData<
        PaginatedResponse<Course>
      >([COURSES_QUERY_KEY]);

      queryClient.setQueryData<PaginatedResponse<Course>>(
        [COURSES_QUERY_KEY],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.filter((c) => !ids.includes(c.id)),
          };
        }
      );

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
    },
  });
}

export function useEnrollCourse() {
  const queryClient = useQueryClient();
  const { showError } = useError();

  return useMutation<any, Error, string>({
    mutationFn: (courseId) => coursesService.enrollCourse(courseId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [ENROLLED_COURSES_QUERY_KEY] }); // Invalidate enrolled courses
      showError({ success: true, message: "Đăng ký khóa học thành công." });
    },
    onError: (error) => {
      showError(error);
    },
  });
}

export function useCompletedCoursesCount() {
  const { user } = useAuth();

  return useQuery<{ count: number; courses: Course[] }, Error>({
    queryKey: ["completedCoursesCount", user?.id],
    queryFn: async () => {
      console.log("🚀 Starting to fetch completed courses data...");

      // Call both APIs in parallel
      const [coursesResponse, countResponse] = await Promise.all([
        coursesService.getCompletedCourses(), // Changed to getCompletedCourses
        coursesService.getCompletedCoursesCount(),
      ]);

      console.log("🚀 Courses response:", coursesResponse);
      console.log("🚀 Count response:", countResponse);

      // Map the API response to Course format
      const courses = (coursesResponse.items || []).map((item) => {
        console.log("🔄 Mapping item:", item);
        return {
          id: item.id || "",
          title: item.name || "", // API returns 'name', we need 'title'
          courseCode: "",
          description: item.description || "",
          objectives: "",
          image: item.thumbUrl || "",
          location: "",
          status: "completed",
          statusId: 1,
          enrollmentType: "optional" as const,
          isPublic: true,
          instructor: "",
          duration: { sessions: 0, hoursPerSession: 0 },
          learningType: "online" as const,
          maxParticipants: 0,
          startDate: null,
          endDate: null,
          registrationStartDate: null,
          registrationDeadline: null,
          department: [],
          level: [],
          category: "",
          materials: [],
          lessons: [],
          tests: [],
          userIds: [],
          createdAt: "",
          modifiedAt: "",
          createdBy: "",
          modifiedBy: null,
        };
      });

      // Use the count from the dedicated endpoint if available, otherwise fall back to pagination
      const finalCount =
        countResponse ||
        coursesResponse.pagination?.totalItems ||
        coursesResponse.items?.length ||
        0;

      console.log("🔄 Final mapped courses:", courses);
      console.log("🔄 Final count:", finalCount);

      return {
        count: finalCount,
        courses,
      };
    },
    enabled: !!user && user.role === "HOCVIEN", // Only fetch for students
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useUpcomingCourses() {
  const { user } = useAuth();

  return useQuery<Course[], Error>({
    queryKey: ["upcomingCourses", user?.id],
    queryFn: async () => {
      console.log("🚀 Starting to fetch upcoming courses data...");
      const apiResponse = await coursesService.getUpcomingCourses();
      console.log("🚀 Raw Upcoming Courses API response:", apiResponse);
      return (apiResponse || []).map(mapCourseApiToUi);
    },
    enabled: !!user && user.role === "HOCVIEN",
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useCourseProgressList(courseId: string, params?: QueryParams) {
  return useQuery<PaginatedResponse<UserCourseProgressDto>, Error>({
    queryKey: ["courseProgressList", courseId, params],
    queryFn: async () => {
      console.log(
        `🚀 Starting to fetch progress list for course ${courseId}...`
      );
      const response = await coursesService.getCourseProgressList(
        courseId,
        params
      );
      console.log("🚀 Raw Course Progress List response:", response);
      return response;
    },
    enabled: !!courseId, // Only fetch if courseId is provided
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useCourseProgressDetail(courseId: string, userId: string) {
  return useQuery<UserCourseProgressDetailDto, Error>({
    queryKey: ["courseProgressDetail", courseId, userId],
    queryFn: async () => {
      console.log(
        `🚀 Starting to fetch progress detail for user ${userId} in course ${courseId}...`
      );
      const response = await coursesService.getCourseProgressDetail(
        courseId,
        userId
      );
      console.log("🚀 Raw Course Progress Detail response:", response);
      return response;
    },
    enabled: !!courseId && !!userId, // Only fetch if both courseId and userId are provided
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useCompletedLessonsCount(courseId: string) {
  return useQuery<number, Error>({
    queryKey: ["completedLessonsCount", courseId],
    queryFn: async () => {
      console.log(
        `🚀 Starting to fetch completed lessons count for course ${courseId}...`
      );
      const response = await coursesService.getCompletedLessonsCountByCourseId(
        courseId
      );
      console.log("🚀 Raw Completed Lessons Count response:", response);
      return response;
    },
    enabled: !!courseId, // Only fetch if courseId is provided
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
