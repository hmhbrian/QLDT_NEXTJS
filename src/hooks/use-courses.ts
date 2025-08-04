
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

export const COURSES_QUERY_KEY = "courses";
export const ENROLLED_COURSES_QUERY_KEY = "enrolledCourses";

export function useCourses(
  params: QueryParams & { publicOnly?: boolean } = {}
) {
  const queryKey = [COURSES_QUERY_KEY, "list", params];

  const {
    data,
    isLoading,
    error,
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
    refetchOnWindowFocus: true,
  });

  return {
    courses: data?.items ?? [],
    paginationInfo: data?.pagination,
    isLoading,
    error,
  };
}

export function useEnrolledCourses(enabled: boolean = true) {
  const { user } = useAuth();
  const queryKey = [ENROLLED_COURSES_QUERY_KEY, user?.id];

  const {
    data,
    isLoading,
    error,
  } = useQuery<Course[], Error>({
    queryKey,
    queryFn: async () => {
      const enrolledResponse = await coursesService.getEnrolledCourses();
      return (enrolledResponse.items || []).map(mapUserEnrollCourseDtoToCourse);
    },
    enabled: enabled && !!user,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  return {
    enrolledCourses: data ?? [],
    isLoadingEnrolled: isLoading,
    errorEnrolled: error,
  };
}

export function useCourse(courseId: string) {
  const queryKey = [COURSES_QUERY_KEY, "detail", courseId];

  const {
    data,
    isLoading,
    error,
  } = useQuery<Course, Error>({
    queryKey,
    queryFn: async () => mapCourseApiToUi(await coursesService.getCourseById(courseId)),
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
    mutationFn: (courseData) => coursesService.createCourse(courseData),
    onSuccess: (data) => {
       toast({
        title: "Thành công",
        description: `Đã tạo khóa học "${data.name}" thành công.`,
        variant: "success",
      });
    },
    onError: (error) => {
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

  return useMutation<any, Error, { courseId: string; payload: UpdateCourseRequest }, { previousCourses?: PaginatedResponse<Course>; previousCourseDetail?: Course }>({
    mutationFn: ({ courseId, payload }) => coursesService.updateCourse(courseId, payload),
    onMutate: async ({ courseId, payload }) => {
        await queryClient.cancelQueries({ queryKey: [COURSES_QUERY_KEY, 'detail', courseId] });
        await queryClient.cancelQueries({ queryKey: [COURSES_QUERY_KEY, 'list'] });
        
        const previousCourseDetail = queryClient.getQueryData<Course>([COURSES_QUERY_KEY, 'detail', courseId]);
        const previousCourses = queryClient.getQueryData<PaginatedResponse<Course>>([COURSES_QUERY_KEY, 'list']);

        if (previousCourseDetail) {
            queryClient.setQueryData<Course>([COURSES_QUERY_KEY, 'detail', courseId], (old) => old ? { ...old, title: payload.Name || old.title, ...payload } : undefined);
        }

        if (previousCourses) {
            queryClient.setQueryData<PaginatedResponse<Course>>([COURSES_QUERY_KEY, 'list'], (old) => old ? ({
              ...old,
              items: old.items.map(course => course.id === courseId ? { ...course, title: payload.Name || course.title, ...payload } : course),
            }) : old);
        }

        return { previousCourses, previousCourseDetail };
    },
    onSuccess: (data, variables) => {
       toast({
        title: "Thành công",
        description: `Đã cập nhật khóa học "${variables.payload.Name}" thành công.`,
        variant: "success",
      });
    },
    onError: (err, { courseId }, context) => {
       if (context?.previousCourses) {
           queryClient.setQueryData([COURSES_QUERY_KEY, 'list'], context.previousCourses);
       }
       if (context?.previousCourseDetail) {
           queryClient.setQueryData([COURSES_QUERY_KEY, 'detail', courseId], context.previousCourseDetail);
       }
       toast({
        title: "Lỗi",
        description: extractErrorMessage(err),
        variant: "destructive",
      });
    },
    onSettled: (data, error, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: [COURSES_QUERY_KEY, 'list'] });
      queryClient.invalidateQueries({ queryKey: [COURSES_QUERY_KEY, 'detail', courseId] });
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, string[], { previousCourses?: PaginatedResponse<Course> }>({
    mutationFn: (ids) => coursesService.softDeleteCourses(ids),
    onMutate: async (idsToDelete) => {
      const queryKey = [COURSES_QUERY_KEY, "list"];
      await queryClient.cancelQueries({ queryKey });
      
      const previousCourses = queryClient.getQueryData<PaginatedResponse<Course>>(queryKey);
      
      if(previousCourses) {
        queryClient.setQueryData<PaginatedResponse<Course>>(queryKey, (old) => old ? ({
          ...old,
          items: old.items.filter(course => !idsToDelete.includes(course.id)),
        }) : old);
      }
      
      return { previousCourses };
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã xóa khóa học thành công.",
        variant: "success",
      });
    },
    onError: (err, id, context) => {
      if (context?.previousCourses) {
        queryClient.setQueryData([COURSES_QUERY_KEY, 'list'], context.previousCourses);
      }
      toast({
        title: "Lỗi",
        description: extractErrorMessage(err),
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [COURSES_QUERY_KEY] });
    },
  });
}

export function useEnrollCourse() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<any, Error, string>({
    mutationFn: (courseId) => coursesService.enrollCourse(courseId),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đăng ký khóa học thành công.",
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [ENROLLED_COURSES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [COURSES_QUERY_KEY] });
    }
  });
}

function getAbsoluteImageUrl(thumbUrl: string | null | undefined, name?: string): string {
    const defaultImageUrl = `https://placehold.co/600x400/f97316/white?text=${encodeURIComponent(name || 'Course')}`;
    if (!thumbUrl || thumbUrl.toLowerCase().includes("formfile")) return defaultImageUrl;
    if (thumbUrl.startsWith("http") || thumbUrl.startsWith("data:")) return thumbUrl;
    const baseUrl = API_CONFIG.baseURL.replace('/api', '');
    return `${baseUrl}${thumbUrl.startsWith('/') ? '' : '/'}${thumbUrl}`;
}

export function useUpcomingCourses() {
  const { user } = useAuth();

  return useQuery<Course[], Error>({
    queryKey: ["upcomingCourses", user?.id],
    queryFn: async () => {
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
    queryFn: () => coursesService.getCourseProgressList(courseId, params),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useCourseProgressDetail(courseId: string, userId: string) {
  return useQuery<UserCourseProgressDetailDto, Error>({
    queryKey: ["courseProgressDetail", courseId, userId],
    queryFn: () => coursesService.getCourseProgressDetail(courseId, userId),
    enabled: !!courseId && !!userId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useCompletedLessonsCount(courseId: string) {
  return useQuery<number, Error>({
    queryKey: ["completedLessonsCount", courseId],
    queryFn: () => coursesService.getCompletedLessonsCountByCourseId(courseId),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useCompletedCoursesCount() {
    const { user } = useAuth();
  
    return useQuery<{ count: number; courses: Course[] }, Error>({
      queryKey: ["completedCoursesCount", user?.id],
      queryFn: async () => {
        const [coursesResponse, countResponse] = await Promise.all([
          coursesService.getCompletedCourses(),
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
        }));
  
        const finalCount = countResponse ?? coursesResponse.pagination?.totalItems ?? 0;
  
        return {
          count: finalCount,
          courses,
        };
      },
      enabled: !!user && user.role === "HOCVIEN",
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: true,
    });
  }
