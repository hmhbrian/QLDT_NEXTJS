"use client";

import { useQuery } from "@tanstack/react-query";
import {
  reportService,
  AvgFeedbackData,
  ReportData,
  CourseAndAvgFeedback,
  StudentsOfCourse,
  CourseStatusDistribution,
} from "@/lib/services/modern/report.service";
import { TopDepartment } from "@/lib/types/report.types";

export const REPORTS_QUERY_KEY = "reports";

// Hook cho báo cáo đánh giá trung bình (không filter)
export function useAvgFeedbackReport(enabled: boolean = true) {
  return useQuery<AvgFeedbackData, Error>({
    queryKey: [REPORTS_QUERY_KEY, "avg-feedback"],
    queryFn: () => reportService.getAvgFeedback(),
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes - reports change less frequently
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      const status = (error as any)?.response?.status;
      if (status >= 400 && status < 500) return false;
      return true;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
// Hook thống nhất cho báo cáo data-report - ALWAYS CALL HOOK (Rules of Hooks)
export function useDataReport(params: {
  month?: number;
  quarter?: number;
  year?: number;
  enabled?: boolean;
}) {
  const { month, quarter, year, enabled = true } = params;

  return useQuery<ReportData, Error>({
    queryKey: [REPORTS_QUERY_KEY, "data-report", { month, quarter, year }],
    queryFn: () => reportService.getDataReport({ month, quarter, year }),
    enabled: enabled && !!year, // Only run if enabled AND year is provided
    staleTime: 10 * 60 * 1000, // 10 minutes for reports
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      const status = (error as any)?.response?.status;
      if (status >= 400 && status < 500) return false;
      return true;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Hook cho báo cáo theo năm - ALWAYS CALL HOOK (Rules of Hooks)
export function useYearlyReport(year: number, shouldFetch: boolean = true) {
  console.log(
    `🔍 useYearlyReport called with year=${year}, enabled=${shouldFetch}`
  );
  const result = useDataReport({ year, enabled: shouldFetch });
  console.log(`📊 useYearlyReport result:`, result.data);
  return result;
}

// Hook cho báo cáo theo quý - ALWAYS CALL HOOK (Rules of Hooks)
export function useQuarterlyReport(
  quarter: number,
  year: number,
  shouldFetch: boolean = true
) {
  console.log(
    `🔍 useQuarterlyReport called with quarter=${quarter}, year=${year}, enabled=${shouldFetch}`
  );
  const result = useDataReport({ quarter, year, enabled: shouldFetch });
  console.log(`📊 useQuarterlyReport result:`, result.data);
  return result;
}

// Hook cho báo cáo theo tháng - ALWAYS CALL HOOK (Rules of Hooks)
export function useMonthlyReport(
  month: number,
  year: number,
  shouldFetch: boolean = true
) {
  console.log(
    `🔍 useMonthlyReport called with month=${month}, year=${year}, enabled=${shouldFetch}`
  );
  const result = useDataReport({ month, year, enabled: shouldFetch });
  console.log(`📊 useMonthlyReport result:`, result.data);
  return result;
}

// Hook cho báo cáo toàn bộ thời gian - ALWAYS CALL HOOK (Rules of Hooks)
export function useAllTimeReport(shouldFetch: boolean = true) {
  console.log(`🔍 useAllTimeReport called with enabled=${shouldFetch}`);

  const result = useQuery<ReportData, Error>({
    queryKey: [REPORTS_QUERY_KEY, "data-report", "all-time"],
    queryFn: () => reportService.getDataReport({}), // Gọi API mà không có params
    enabled: shouldFetch, // Conditionally enable but always call hook
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      const status = (error as any)?.response?.status;
      if (status >= 400 && status < 500) return false;
      return true;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  console.log(`📊 useAllTimeReport result:`, result.data);
  return result;
}

// Hook cho danh sách khóa học và đánh giá - ALWAYS CALL HOOK (Rules of Hooks)
export function useCourseAndAvgFeedbackReport() {
  return useQuery<CourseAndAvgFeedback[], Error>({
    queryKey: [REPORTS_QUERY_KEY, "course-and-avg-feedback"],
    queryFn: () => reportService.getCourseAndAvgFeedback(),
    enabled: true, // Always enabled - no conditional logic
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      const status = (error as any)?.response?.status;
      if (status >= 400 && status < 500) return false;
      return true;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Hook cho số học viên theo khóa học - ALWAYS CALL HOOK (Rules of Hooks)
export function useStudentsOfCourseReport() {
  return useQuery<StudentsOfCourse[], Error>({
    queryKey: [REPORTS_QUERY_KEY, "students-of-course"],
    queryFn: () => reportService.getStudentsOfCourse(),
    enabled: true, // Always enabled - no conditional logic
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      const status = (error as any)?.response?.status;
      if (status >= 400 && status < 500) return false;
      return true;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Hook for top departments report - ALWAYS CALL HOOK (Rules of Hooks)
export function useTopDepartments() {
  return useQuery<TopDepartment[], Error>({
    queryKey: [REPORTS_QUERY_KEY, "top-departments"],
    queryFn: () => reportService.getTopDepartments(),
    enabled: true, // Always enabled - no conditional logic
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Chỉ retry 2 lần và không retry cho lỗi 4xx
      if (failureCount >= 2) return false;
      const status = (error as any)?.response?.status;
      if (status >= 400 && status < 500) return false;
      return true;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Hook for course status distribution report - ALWAYS CALL HOOK (Rules of Hooks)
export function useCourseStatusDistribution() {
  return useQuery<CourseStatusDistribution[], Error>({
    queryKey: [REPORTS_QUERY_KEY, "course-status-distribution"],
    queryFn: () => reportService.getCourseStatusDistribution(),
    enabled: true, // Always enabled - no conditional logic
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Chỉ retry 2 lần và không retry cho lỗi 4xx
      if (failureCount >= 2) return false;
      const status = (error as any)?.response?.status;
      if (status >= 400 && status < 500) return false;
      return true;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
