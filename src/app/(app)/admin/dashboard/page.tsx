
"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Users,
  BookOpen,
  Building,
  Settings,
  BarChart3,
  UserCheck,
  CheckCircle,
  Activity,
  Target,
  Star,
  GraduationCap,
  Play,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCourses } from "@/hooks/use-courses";
import { useUsers } from "@/hooks/use-users";
import { useDepartments } from "@/hooks/use-departments";
import { useActivityLogs } from "@/hooks/use-activity-logs";
import { useAllTimeReport, useAvgFeedbackReport } from "@/hooks/use-reports";

import {
  PageHeader,
  GridLayout,
  LoadingState,
  StatsCard,
} from "@/components/layout/optimized-layouts";
import { OptimizedCard } from "@/components/ui/optimized";
import { ClientTime } from "@/components/ClientTime";

const quickActions = [
  {
    title: "Thêm khóa học",
    description: "Tạo khóa học đào tạo mới",
    icon: <BookOpen className="h-5 w-5" />,
    href: "/admin/courses/edit/new",
    color: "bg-blue-500",
  },
  {
    title: "Thêm người dùng",
    description: "Thêm nhân viên vào hệ thống",
    icon: <Users className="h-5 w-5" />,
    href: "/admin/users/edit/new",
    color: "bg-green-500",
  },
  {
    title: "Quản lý phòng ban",
    description: "Cấu hình phòng ban và chức vụ",
    icon: <Building className="h-5 w-5" />,
    href: "/admin/departments",
    color: "bg-purple-500",
  },
  {
    title: "Báo cáo tổng quan",
    description: "Xem báo cáo hiệu suất đào tạo",
    icon: <BarChart3 className="h-5 w-5" />,
    href: "/admin/reports/overview",
    color: "bg-orange-500",
  },
];

const getActionIcon = (action: string) => {
  switch (action) {
    case "CREATE":
      return <BookOpen className="h-4 w-4 text-green-500" />;
    case "ENROLL":
      return <UserCheck className="h-4 w-4 text-blue-500" />;
    case "COMPLETE_LESSON":
      return <CheckCircle className="h-4 w-4 text-teal-500" />;
    default:
      return <Activity className="h-4 w-4 text-gray-500" />;
  }
};

export default function AdminDashboard() {
  const { user: currentUser } = useAuth();
  const router = useRouter();

  // Fetch data
  const { courses, paginationInfo: coursePagination } = useCourses();
  const { users, paginationInfo: usersPagination } = useUsers();
  const { departments, isLoading: isLoadingDepts } = useDepartments();
  const { data: allTimeReport, isLoading: isLoadingReport } =
    useAllTimeReport(true);
  const { data: avgFeedback, isLoading: isLoadingFeedback } =
    useAvgFeedbackReport(true);
  const { data: activityLogs, isLoading: isLoadingLogs } = useActivityLogs(
    undefined,
    { pageSize: 5 }
  );

  const isLoading =
    isLoadingDepts ||
    isLoadingReport ||
    isLoadingFeedback ||
    isLoadingLogs ||
    !coursePagination ||
    !usersPagination;

  // Calculate dashboard stats
  const dashboardStats = useMemo(() => {
    const totalUsers = allTimeReport?.numberOfStudents || 0;
    const activeUsers =
      users?.filter((u) => u.userStatus?.name === "Đang làm việc").length || 0;
    const totalCourses = allTimeReport?.numberOfCourses || 0;
    const activeCourses =
      courses?.filter((c) => {
        const statusName =
          typeof c.status === "object" ? c.status.name : c.status;
        return statusName === "Đang mở";
      }).length || 0;
    const totalDepartments = departments.length;

    return {
      totalUsers,
      activeUsers,
      totalCourses,
      activeCourses,
      totalDepartments,
      userGrowth:
        totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0,
      completionRate: allTimeReport?.averangeCompletedPercentage || 0,
      averageRating:
        avgFeedback && avgFeedback.q1_relevanceAvg > 0 // Check if feedback data is meaningful
          ? (avgFeedback.q1_relevanceAvg +
              avgFeedback.q2_clarityAvg +
              avgFeedback.q3_structureAvg +
              avgFeedback.q4_durationAvg +
              avgFeedback.q5_materialAvg) /
            5
          : 0,
    };
  }, [
    users,
    courses,
    departments,
    allTimeReport,
    avgFeedback,
  ]);

  const canAccessAdmin =
    currentUser?.role === "ADMIN" || currentUser?.role === "HR";

  if (!canAccessAdmin) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-muted-foreground">
            Bạn không có quyền truy cập trang này
          </h2>
          <Button onClick={() => router.push("/dashboard")} className="mt-4">
            Quay về Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <PageHeader
          title="Dashboard Quản trị"
          description="Tổng quan hệ thống đào tạo nội bộ"
        />
        <LoadingState type="grid" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title={`Chào mừng, ${currentUser?.fullName}!`}
        description="Tổng quan hệ thống đào tạo và quản lý nhân sự"
        actions={
          <Button onClick={() => router.push("/admin/settings")}>
            <Settings className="mr-2 h-4 w-4" />
            Cài đặt hệ thống
          </Button>
        }
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Tổng số học viên"
          value={dashboardStats.totalUsers}
          icon={<Users className="h-5 w-5" />}
          trend={`+${dashboardStats.userGrowth}%`}
          trendUp={dashboardStats.userGrowth > 50}
        />
        <StatsCard
          title="Người dùng hoạt động"
          value={dashboardStats.activeUsers}
          icon={<UserCheck className="h-5 w-5" />}
          trend={`${Math.round(
            (dashboardStats.activeUsers / (dashboardStats.totalUsers || 1)) *
              100
          )}%`}
          trendUp={true}
        />
        <StatsCard
          title="Tổng số khóa học"
          value={dashboardStats.totalCourses}
          icon={<BookOpen className="h-5 w-5" />}
          trend={`${dashboardStats.activeCourses} đang mở`}
        />
        <StatsCard
          title="Phòng ban"
          value={dashboardStats.totalDepartments}
          icon={<Building className="h-5 w-5" />}
        />
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Thao tác nhanh</h2>
        </div>
        <GridLayout>
          {quickActions.map((action) => (
            <OptimizedCard
              key={action.title}
              hover
              className="cursor-pointer group"
              onClick={() => router.push(action.href)}
            >
              <div className="p-6 space-y-4">
                <div
                  className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center text-white group-hover:scale-110 transition-transform`}
                >
                  {action.icon}
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </div>
            </OptimizedCard>
          ))}
        </GridLayout>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <OptimizedCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Hoạt động gần đây</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/admin/reports/overview")}
              >
                Xem tất cả
              </Button>
            </div>
            <div className="space-y-4">
              {activityLogs?.map((activity: any) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    {getActionIcon(activity.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      <ClientTime date={activity.timestamp} /> • bởi{" "}
                      {activity.userName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </OptimizedCard>

        {/* Quick Stats */}
        <OptimizedCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Thống kê nhanh</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/admin/reports/overview")}
              >
                Chi tiết
                <BarChart3 className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Tỷ lệ hoàn thành khóa học</span>
                </div>
                <span className="text-sm font-medium">
                  {dashboardStats.completionRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Điểm đánh giá trung bình</span>
                </div>
                <span className="text-sm font-medium">
                  {dashboardStats.averageRating > 0
                    ? `${dashboardStats.averageRating.toFixed(1)}/5`
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Học viên hoạt động</span>
                </div>
                <span className="text-sm font-medium">
                  {dashboardStats.activeUsers}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Play className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Khóa học đang mở</span>
                </div>
                <span className="text-sm font-medium">
                  {dashboardStats.activeCourses}
                </span>
              </div>
            </div>
          </div>
        </OptimizedCard>
      </div>
    </div>
  );
}
