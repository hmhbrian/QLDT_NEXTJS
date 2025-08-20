import { useQuery } from "@tanstack/react-query";
import { activityLogService, ActivityLogParams } from "@/lib/services/modern/activity-log.service";
import { ActivityLog } from "@/lib/types/course.types";

export const ACTIVITY_LOGS_QUERY_KEY = "activity-logs";

export function useActivityLogs(
  courseId?: string, // Make courseId optional
  params?: Omit<ActivityLogParams, 'courseId'>,
  enabled: boolean = true
) {
  return useQuery<ActivityLog[], Error>({
    queryKey: [ACTIVITY_LOGS_QUERY_KEY, courseId, params],
    queryFn: () => {
      // Use mock data for now - replace with real API call when backend is ready
      return activityLogService.getMockActivityLogs(courseId, params);
      // return activityLogService.getCourseActivityLogs(courseId, params);
    },
    enabled: enabled, // Query runs if enabled, regardless of courseId
    staleTime: 2 * 60 * 1000, // 2 minutes - tối ưu caching
    refetchOnWindowFocus: true, 
  });
}

export function useCreateActivityLog() {
  return {
    // This would be implemented when we have the backend endpoint
    mutate: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
      console.log("Would create activity log:", log);
      // return activityLogService.createActivityLog(log);
    }
  };
}

    