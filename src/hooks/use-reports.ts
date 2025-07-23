"use client";

import { useQuery } from "@tanstack/react-query";
import {
  reportService,
  AvgFeedbackData,
  MonthlyReportData,
  CourseAndAvgFeedback,
  StudentsOfCourse,
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
  });
}

// Hook cho báo cáo theo tháng (sử dụng API mới)
export function useMonthlyReport(month: number, enabled: boolean = true) {
  return useQuery<MonthlyReportData, Error>({
    queryKey: [REPORTS_QUERY_KEY, "monthly-report", month],
    queryFn: () => reportService.getMonthlyReport(month),
    enabled: enabled && month >= 1 && month <= 12,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook cho danh sách khóa học và đánh giá (không filter vì chưa có API)
export function useCourseAndAvgFeedbackReport(enabled: boolean = true) {
  return useQuery<CourseAndAvgFeedback[], Error>({
    queryKey: [REPORTS_QUERY_KEY, "course-and-avg-feedback"],
    queryFn: () => reportService.getCourseAndAvgFeedback(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook cho số học viên theo khóa học (không filter vì chưa có API)
export function useStudentsOfCourseReport(enabled: boolean = true) {
  return useQuery<StudentsOfCourse[], Error>({
    queryKey: [REPORTS_QUERY_KEY, "students-of-course"],
    queryFn: () => reportService.getStudentsOfCourse(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for top departments report
export function useTopDepartments(enabled: boolean = true) {
    return useQuery<TopDepartment[], Error>({
        queryKey: [REPORTS_QUERY_KEY, 'top-departments'],
        queryFn: () => reportService.getTopDepartments(),
        enabled,
        staleTime: 5 * 60 * 1000,
    });
}
