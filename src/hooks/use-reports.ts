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

const reportQueryOptions = {
  staleTime: 10 * 60 * 1000, // 10 minutes
  refetchOnWindowFocus: true, // Refetch on focus to get fresh data
  refetchOnMount: true,       // Refetch when component mounts
  retry: (failureCount: number, error: any) => {
    if (failureCount >= 2) return false;
    const status = error?.response?.status;
    if (status >= 400 && status < 500) return false;
    return true;
  },
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
};


// Hook cho báo cáo đánh giá trung bình (không filter)
export function useAvgFeedbackReport(enabled: boolean = true) {
  return useQuery<AvgFeedbackData, Error>({
    queryKey: [REPORTS_QUERY_KEY, "avg-feedback"],
    queryFn: () => reportService.getAvgFeedback(),
    enabled,
    ...reportQueryOptions,
  });
}

// Hook thống nhất cho báo cáo data-report
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
    enabled: enabled && !!year,
    ...reportQueryOptions,
  });
}

// Hook cho báo cáo theo năm
export function useYearlyReport(year: number, shouldFetch: boolean = true) {
  return useDataReport({ year, enabled: shouldFetch });
}

// Hook cho báo cáo theo quý
export function useQuarterlyReport(
  quarter: number,
  year: number,
  shouldFetch: boolean = true
) {
  return useDataReport({ quarter, year, enabled: shouldFetch });
}

// Hook cho báo cáo theo tháng
export function useMonthlyReport(
  month: number,
  year: number,
  shouldFetch: boolean = true
) {
  return useDataReport({ month, year, enabled: shouldFetch });
}

// Hook cho báo cáo toàn bộ thời gian
export function useAllTimeReport(shouldFetch: boolean = true) {
  return useQuery<ReportData, Error>({
    queryKey: [REPORTS_QUERY_KEY, "data-report", "all-time"],
    queryFn: () => reportService.getDataReport({}),
    enabled: shouldFetch,
    ...reportQueryOptions,
  });
}

// Hook cho danh sách khóa học và đánh giá trung bình
export function useCourseAndAvgFeedbackReport() {
  return useQuery<CourseAndAvgFeedback[], Error>({
    queryKey: [REPORTS_QUERY_KEY, "course-and-avg-feedback"],
    queryFn: () => reportService.getCourseAndAvgFeedback(),
    ...reportQueryOptions,
  });
}

// Hook cho số học viên theo khóa học
export function useStudentsOfCourseReport() {
  return useQuery<StudentsOfCourse[], Error>({
    queryKey: [REPORTS_QUERY_KEY, "students-of-course"],
    queryFn: () => reportService.getStudentsOfCourse(),
    ...reportQueryOptions,
  });
}

// Hook for top departments report
export function useTopDepartments() {
  return useQuery<TopDepartment[], Error>({
    queryKey: [REPORTS_QUERY_KEY, "top-departments"],
    queryFn: () => reportService.getTopDepartments(),
    ...reportQueryOptions,
  });
}

// Hook for course status distribution report
export function useCourseStatusDistribution() {
  return useQuery<CourseStatusDistribution[], Error>({
    queryKey: [REPORTS_QUERY_KEY, "course-status-distribution"],
    queryFn: () => reportService.getCourseStatusDistribution(),
    ...reportQueryOptions,
  });
}
