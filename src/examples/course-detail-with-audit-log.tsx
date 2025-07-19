// Ví dụ sử dụng trong Course Detail Page
// File: src/app/(app)/admin/courses/[courseId]/page.tsx

import { AuditLog } from "@/components/audit-log";
import { useAuth } from "@/hooks/useAuth";

export default function CourseDetailPage({
  params,
}: {
  params: { courseId: string };
}) {
  const { user } = useAuth();

  // Chỉ cho phép HR và ADMIN xem audit log
  const canViewAuditLog = user?.role === "ADMIN" || user?.role === "HR";

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Course Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">{/* Course details content */}</div>

        {/* Audit Log - Only for HR and ADMIN */}
        {canViewAuditLog && (
          <div className="lg:col-span-1">
            <AuditLog courseId={params.courseId} />
          </div>
        )}
      </div>

      {/* Full width audit log for better view */}
      {canViewAuditLog && (
        <div className="w-full">
          <AuditLog courseId={params.courseId} className="w-full" />
        </div>
      )}
    </div>
  );
}
