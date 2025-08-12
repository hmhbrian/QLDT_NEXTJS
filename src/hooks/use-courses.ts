"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coursesService } from "@/lib/services/modern/courses.service";
import type {
  Course,
  CreateCourseRequest,
  UpdateCourseRequest,
  CourseApiResponse,
  UserEnrollCourseDto,
  CompletedCourseDto,
  UserCourseProgressDto,
  UserCourseProgressDetailDto,
} from "@/lib/types/course.types";
import {
  mapCourseApiToUi,
  mapUserEnrollCourseDtoToCourse,
} from "@/lib/mappers/course.mapper";
import type { PaginatedResponse, QueryParams } from "@/lib/core";
import { useAuth } from "./useAuth";
import { useToast } from "@/components/ui/use-toast";
import { extractErrorMessage } from "@/lib/core";
import { API_CONFIG } from "@/lib/config";
import {
  buildPaginationParams,
  normalizePaginationMeta,
} from "@/lib/utils/pagination";

export const COURSES_QUERY_KEY = "courses";
export const ENROLLED_COURSES_QUERY_KEY = "enrolledCourses";

export function useCourses(
  params: QueryParams & { publicOnly?: boolean } = {}
) {
  const queryKey = [COURSES_QUERY_KEY, "list", params];

  const { data, isLoading, error } = useQuery<PaginatedResponse<Course>, Error>(
    {
      queryKey,
      queryFn: async ({ signal }) => {
        const apiResponse = await coursesService.getCourses(params);
        return {
          items: (apiResponse.items || []).map(mapCourseApiToUi),
          pagination: apiResponse.pagination,
        };
      },
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    }
  );

  return {
    courses: data?.items ?? [],
    paginationInfo: data?.pagination,
    isLoading,
    error,
  };
}

export function useEnrolledCourses(
  enabled: boolean = true,
  page: number = 1,
  limit: number = 9
) {
  const { user } = useAuth();
  const queryKey = [ENROLLED_COURSES_QUERY_KEY, user?.id, page, limit];

  const { data, isLoading, error } = useQuery<
    {
      courses: Course[];
      pagination: {
        totalItems: number;
        itemsPerPage: number;
        currentPage: number;
        totalPages: number;
      };
    },
    Error
  >({
    queryKey,
    queryFn: async ({ signal }) => {
      const enrolledResponse = await coursesService.getEnrolledCourses(
        buildPaginationParams(
          { page, pageSize: limit },
          { pageKey: "Page", sizeKey: "Limit" }
        )
      );
      return {
        courses: (enrolledResponse.items || []).map(
          mapUserEnrollCourseDtoToCourse
        ),
        pagination: normalizePaginationMeta(enrolledResponse.pagination, {}),
      };
    },
    enabled: enabled && !!user,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  return {
    enrolledCourses: data?.courses ?? [],
    enrolledPagination: data?.pagination,
    isLoadingEnrolled: isLoading,
    errorEnrolled: error,
  };
}

export function useCourse(courseId: string) {
  const queryKey = [COURSES_QUERY_KEY, "detail", courseId];

  const { data, isLoading, error } = useQuery<Course, Error>({
    queryKey,
    queryFn: async () => {
      console.log(
        `♻️ [useCourse] Refetching course detail for ID: ${courseId}`
      );
      return mapCourseApiToUi(await coursesService.getCourseById(courseId));
    },
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  return { course: data, isLoading, error };
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<CourseApiResponse, Error, CreateCourseRequest>({
    mutationFn: (courseData) => {
      return coursesService.createCourse(courseData);
    },
    onSuccess: (data, variables) => {
      const displayName = data?.name || variables?.Name || "khóa học";
      toast({
        title: "Thành công",
        description: `Đã tạo khóa học "${displayName}" thành công.`,
        variant: "success",
      });
    },
    onError: (error) => {
      console.error("❌ [useCreateCourse] Mutation failed:", error);
      toast({
        title: "Lỗi",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [COURSES_QUERY_KEY] });
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    any,
    Error,
    { courseId: string; payload: UpdateCourseRequest },
    {
      previousCourses?: PaginatedResponse<Course>;
      previousCourseDetail?: Course;
    }
  >({
    mutationFn: ({ courseId, payload }) => {
      return coursesService.updateCourse(courseId, payload);
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Thành công",
        description: `Đã cập nhật khóa học "${
          variables.payload.Name || "khóa học"
        }" thành công.`,
        variant: "success",
      });
    },
    onError: (err, variables, context) => {
      console.error("❌ [useUpdateCourse] Mutation failed:", err);
      toast({
        title: "Lỗi",
        description: extractErrorMessage(err),
        variant: "destructive",
      });
    },
    onSettled: (data, error, { courseId }) => {
      console.log(
        `🔄 [useUpdateCourse] Invalidating queries for course list and detail ${courseId}`
      );
      // Invalidate all course-related queries
      queryClient.invalidateQueries({ queryKey: [COURSES_QUERY_KEY] });
      // Force refetch the specific course detail
      queryClient.refetchQueries({
        queryKey: [COURSES_QUERY_KEY, "detail", courseId],
      });
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    void,
    Error,
    string,
    { previousCourses?: PaginatedResponse<Course> }
  >({
    mutationFn: (courseId) => {
      console.log("▶️ [useDeleteCourse] Mutation started for ID:", courseId);
      return coursesService.softDeleteCourse(courseId);
    },
    onSuccess: () => {
      console.log("✅ [useDeleteCourse] Mutation successful");
      toast({
        title: "Thành công",
        description: "Đã xóa khóa học thành công.",
        variant: "success",
      });
    },
    onError: (err) => {
      console.error("❌ [useDeleteCourse] Mutation failed:", err);
      toast({
        title: "Lỗi",
        description: extractErrorMessage(err),
        variant: "destructive",
      });
    },
    onSettled: () => {
      console.log(`🔄 [useDeleteCourse] Invalidating queries with key:`, [
        COURSES_QUERY_KEY,
      ]);
      queryClient.invalidateQueries({ queryKey: [COURSES_QUERY_KEY] });
    },
  });
}

export function useEnrollCourse() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<any, Error, string>({
    mutationFn: (courseId) => {
      console.log(
        `▶️ [useEnrollCourse] Mutation started for course ${courseId}`
      );
      return coursesService.enrollCourse(courseId);
    },
    onSuccess: () => {
      console.log("✅ [useEnrollCourse] Mutation successful");
      toast({
        title: "Thành công",
        description: "Đăng ký khóa học thành công.",
        variant: "success",
      });
    },
    onError: (error) => {
      console.error("❌ [useEnrollCourse] Mutation failed:", error);
      toast({
        title: "Lỗi",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
    onSettled: () => {
      console.log(
        `🔄 [useEnrollCourse] Invalidating enrolled courses and all courses.`
      );
      queryClient.invalidateQueries({ queryKey: [ENROLLED_COURSES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [COURSES_QUERY_KEY] });
    },
  });
}

export function useCancelEnrollCourse() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<any, Error, string>({
    mutationFn: (courseId) => {
      console.log(
        `▶️ [useCancelEnrollCourse] Mutation started for course ${courseId}`
      );
      return coursesService.cancelEnrollCourse(courseId);
    },
    onSuccess: () => {
      console.log("✅ [useCancelEnrollCourse] Mutation successful");
      toast({
        title: "Thành công",
        description: "Đã hủy đăng ký khóa học thành công.",
        variant: "success",
      });
    },
    onError: (error) => {
      console.error("❌ [useCancelEnrollCourse] Mutation failed:", error);
      toast({
        title: "Lỗi",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
    onSettled: () => {
      console.log(
        `🔄 [useCancelEnrollCourse] Invalidating enrolled courses and all courses.`
      );
      queryClient.invalidateQueries({ queryKey: [ENROLLED_COURSES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [COURSES_QUERY_KEY] });
    },
  });
}

function getAbsoluteImageUrl(
  thumbUrl: string | null | undefined,
  name?: string
): string {
  // Provide plain text; Next/Image will encode when proxying to /_next/image
  const defaultImageUrl = `https://placehold.co/600x400/f97316/white?text=${
    name || "Course"
  }`;
  if (!thumbUrl || thumbUrl.toLowerCase().includes("formfile"))
    return defaultImageUrl;
  if (thumbUrl.startsWith("http") || thumbUrl.startsWith("data:"))
    return thumbUrl;
  const baseUrl = API_CONFIG.baseURL.replace("/api", "");
  return `${baseUrl}${thumbUrl.startsWith("/") ? "" : "/"}${thumbUrl}`;
}

export function useUpcomingCourses() {
  const { user } = useAuth();

  return useQuery<Course[], Error>({
    queryKey: ["upcomingCourses", user?.id],
    queryFn: async () => {
      console.log(`♻️ [useUpcomingCourses] Refetching upcoming courses.`);
      const apiResponse = await coursesService.getUpcomingCourses();
      return (apiResponse || []).map(mapCourseApiToUi);
    },
    enabled: !!user && user.role === "HOCVIEN",
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useCourseProgressList(courseId: string, params?: QueryParams) {
  return useQuery<PaginatedResponse<UserCourseProgressDto>, Error>({
    queryKey: ["courseProgressList", courseId, params],
    queryFn: () => {
      console.log(
        `♻️ [useCourseProgressList] Refetching progress list for course ${courseId}.`
      );
      return coursesService.getCourseProgressList(courseId, params);
    },
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useCourseProgressDetail(courseId: string, userId: string) {
  return useQuery<UserCourseProgressDetailDto, Error>({
    queryKey: ["courseProgressDetail", courseId, userId],
    queryFn: () => {
      console.log(
        `♻️ [useCourseProgressDetail] Refetching progress detail for course ${courseId}, user ${userId}.`
      );
      return coursesService.getCourseProgressDetail(courseId, userId);
    },
    enabled: !!courseId && !!userId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useCompletedLessonsCount(courseId: string) {
  return useQuery<number, Error>({
    queryKey: ["completedLessonsCount", courseId],
    queryFn: () => {
      console.log(
        `♻️ [useCompletedLessonsCount] Refetching completed lessons count for course ${courseId}.`
      );
      return coursesService.getCompletedLessonsCountByCourseId(courseId);
    },
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export interface CompletedCourse extends Course {
  completedAt?: string;
  score?: number;
}

export function useCompletedCoursesCount(page: number = 1, limit: number = 10) {
  const { user } = useAuth();

  return useQuery<
    {
      count: number;
      courses: CompletedCourse[];
      pagination: {
        totalItems: number;
        itemsPerPage: number;
        currentPage: number;
        totalPages: number;
      };
    },
    Error
  >({
    queryKey: ["completedCoursesCount", user?.id, page, limit],
    queryFn: async () => {
      console.log(
        `♻️ [useCompletedCoursesCount] Refetching completed courses count.`
      );
      const [coursesResponse, countResponse] = await Promise.all([
        coursesService.getCompletedCourses(
          buildPaginationParams(
            { page, pageSize: limit },
            { pageKey: "Page", sizeKey: "Limit" }
          )
        ),
        coursesService.getCompletedCoursesCount(),
      ]);

      const courses = (coursesResponse.items || []).map((item) => ({
        id: item.id || "",
        title: item.name || "",
        courseCode: "",
        description: item.description || "",
        objectives: "",
        image: getAbsoluteImageUrl(item.thumbUrl, item.name),
        location: "",
        status: "completed",
        statusId: 4,
        enrollmentType: "optional" as const,
        isPrivate: true,
        instructor: "",
        duration: { sessions: 0, hoursPerSession: 0 },
        learningType: "online" as const,
        maxParticipants: 0,
        startDate: null,
        endDate: null,
        registrationStartDate: null,
        registrationDeadline: null,
        // Add required new fields
        departments: [],
        eLevels: [],
        category: null,
        // Legacy fields
        department: [],
        level: [],
        materials: [],
        lessons: [],
        tests: [],
        userIds: [],
        createdAt: "",
        modifiedAt: "",
        createdBy: "",
        modifiedBy: null,
        // Extended fields for completed courses - remove fake data
        completedAt: undefined,
        score: undefined,
      }));

      const finalCount =
        countResponse ?? coursesResponse.pagination?.totalItems ?? 0;

      const meta = normalizePaginationMeta(coursesResponse.pagination, {
        totalItemsKey: "totalItems",
        itemsPerPageKey: "itemsPerPage",
        currentPageKey: "currentPage",
        totalPagesKey: "totalPages",
      });

      return { count: finalCount, courses, pagination: meta };
    },
    enabled: !!user && user.role === "HOCVIEN",
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
