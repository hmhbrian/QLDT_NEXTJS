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
    staleTime: 5 * 60 * 1000, // 5 phút
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      const status = (error as any)?.response?.status;
      if (status >= 400 && status < 500) return false;
      return true;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
// Hook thống nhất cho báo cáo data-report (nhận month, quarter, year)
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
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      const status = (error as any)?.response?.status;
      if (status >= 400 && status < 500) return false;
      return true;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Hook cho báo cáo theo năm
export function useYearlyReport(year: number, enabled: boolean = true) {
  console.log(
    `🔍 useYearlyReport called with year=${year}, enabled=${enabled}`
  );
  const result = useDataReport({ year, enabled });
  console.log(`📊 useYearlyReport result:`, result.data);
  return result;
}

// Hook cho báo cáo theo quý
export function useQuarterlyReport(
  quarter: number,
  year: number,
  enabled: boolean = true
) {
  console.log(
    `🔍 useQuarterlyReport called with quarter=${quarter}, year=${year}, enabled=${enabled}`
  );
  const result = useDataReport({ quarter, year, enabled });
  console.log(`📊 useQuarterlyReport result:`, result.data);
  return result;
}

// Hook cho báo cáo theo tháng
export function useMonthlyReport(
  month: number,
  year: number,
  enabled: boolean = true
) {
  console.log(
    `🔍 useMonthlyReport called with month=${month}, year=${year}, enabled=${enabled}`
  );
  const result = useDataReport({ month, year, enabled });
  console.log(`📊 useMonthlyReport result:`, result.data);
  return result;
}

// Hook cho danh sách khóa học và đánh giá (không filter vì chưa có API)
export function useCourseAndAvgFeedbackReport(enabled: boolean = true) {
  return useQuery<CourseAndAvgFeedback[], Error>({
    queryKey: [REPORTS_QUERY_KEY, "course-and-avg-feedback"],
    queryFn: () => reportService.getCourseAndAvgFeedback(),
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      const status = (error as any)?.response?.status;
      if (status >= 400 && status < 500) return false;
      return true;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Hook cho số học viên theo khóa học (không filter vì chưa có API)
export function useStudentsOfCourseReport(enabled: boolean = true) {
  return useQuery<StudentsOfCourse[], Error>({
    queryKey: [REPORTS_QUERY_KEY, "students-of-course"],
    queryFn: () => reportService.getStudentsOfCourse(),
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      const status = (error as any)?.response?.status;
      if (status >= 400 && status < 500) return false;
      return true;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Hook for top departments report
export function useTopDepartments(enabled: boolean = true) {
  return useQuery<TopDepartment[], Error>({
    queryKey: [REPORTS_QUERY_KEY, "top-departments"],
    queryFn: () => reportService.getTopDepartments(),
    enabled,
    staleTime: 5 * 60 * 1000,
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

// Hook for course status distribution report
export function useCourseStatusDistribution(enabled: boolean = true) {
  return useQuery<CourseStatusDistribution[], Error>({
    queryKey: [REPORTS_QUERY_KEY, "course-status-distribution"],
    queryFn: () => reportService.getCourseStatusDistribution(),
    enabled,
    staleTime: 5 * 60 * 1000,
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
