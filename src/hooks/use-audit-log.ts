import { useQuery } from "@tanstack/react-query";
import { auditLogService } from "@/lib/services/modern/audit-log.service";
import { AuditLogParams } from "@/lib/types/audit-log.types";
import { useAuth } from "./useAuth";

export function useAuditLog(params?: AuditLogParams) {
  const { user } = useAuth();

  // Chỉ cho phép HR và ADMIN xem audit log
  const canViewAuditLog = user?.role === "ADMIN" || user?.role === "HR";

  return useQuery({
    queryKey: ["audit-log", params],
    queryFn: () => auditLogService.getAuditLog(params),
    enabled: canViewAuditLog,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: false,
  });
}

export function useCourseAuditLog(courseId: string, params?: AuditLogParams) {
  const { user } = useAuth();

  // Chỉ cho phép HR và ADMIN xem audit log
  const canViewAuditLog = user?.role === "ADMIN" || user?.role === "HR";

  return useQuery({
    queryKey: ["audit-log", "course", courseId, params],
    queryFn: () => auditLogService.getCourseAuditLog(courseId, params),
    enabled: canViewAuditLog && !!courseId,
    staleTime: 5 * 60 * 1000, // 5 minutes for course audit logs
    refetchOnWindowFocus: true,
    refetchOnMount: false,
  });
}

export function useUserAuditLog(userId: string, params?: AuditLogParams) {
  const { user } = useAuth();

  // Chỉ cho phép HR và ADMIN xem audit log
  const canViewAuditLog = user?.role === "ADMIN" || user?.role === "HR";

  return useQuery({
    queryKey: ["audit-log", "user", userId, params],
    queryFn: () => auditLogService.getUserAuditLog(userId, params),
    enabled: canViewAuditLog && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
