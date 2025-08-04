"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  BookOpen,
  Building,
  Award,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  Clock,
  ArrowRight,
  Plus,
  Settings,
  BarChart3,
  PieChart,
  Target,
  UserCheck,
  GraduationCap,
  Star,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCourses } from "@/hooks/use-courses";
import { useUsers } from "@/hooks/use-users";
import { useDepartments } from "@/hooks/use-departments";

// Optimized components
import {
  PageHeader,
  GridLayout,
  LoadingState,
  StatsCard,
} from "@/components/layout/optimized-layouts";
import { OptimizedCard, ActionButtons } from "@/components/ui/optimized";

// Quick Actions Config
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
    href: "/admin/reports",
    color: "bg-orange-500",
  },
];

// Recent Activities Mock Data (in real app, this would come from API)
const recentActivities = [
  {
    id: "1",
    type: "course_created",
    title: "Khóa học 'An toàn lao động' đã được tạo",
    user: "Nguyễn Văn A",
    time: "2 giờ trước",
    icon: <BookOpen className="h-4 w-4" />,
  },
  {
    id: "2",
    type: "user_registered",
    title: "5 nhân viên mới đã đăng ký khóa 'Kỹ năng giao tiếp'",
    user: "Hệ thống",
    time: "3 giờ trước",
    icon: <UserCheck className="h-4 w-4" />,
  },
  {
    id: "3",
    type: "course_completed",
    title: "Trần Thị B đã hoàn thành khóa 'Excel nâng cao'",
    user: "Trần Thị B",
    time: "5 giờ trước",
    icon: <GraduationCap className="h-4 w-4" />,
  },
  {
    id: "4",
    type: "certificate_issued",
    title: "Chứng chỉ đã được cấp cho 12 học viên",
    user: "Hệ thống",
    time: "1 ngày trước",
    icon: <Award className="h-4 w-4" />,
  },
];

export default function AdminDashboard() {
  const { user: currentUser } = useAuth();
  const router = useRouter();

  // Fetch data with limited results for dashboard overview
  const { courses, isLoading: isLoadingCourses } = useCourses({
    Page: 1,
    Limit: 5,
  });

  const {
    users,
    paginationInfo: usersPagination,
    isLoading: isLoadingUsers,
  } = useUsers({
    Page: 1,
    Limit: 5,
  });

  const { departments: allDepartments, isLoading: isLoadingDepts } =
    useDepartments();

  const isLoading = isLoadingCourses || isLoadingUsers || isLoadingDepts;

  // Calculate dashboard stats
  const dashboardStats = useMemo(() => {
    const totalUsers = usersPagination?.totalItems || 0;
    const activeUsers =
      users?.filter((u) => u.userStatus?.name === "active" || u.role).length ||
      0;
    const totalCourses = courses?.length || 0;
    const activeCourses =
      courses?.filter((c) => c.status === "Đang mở").length || 0;
    const totalDepartments = Array.isArray(allDepartments)
      ? allDepartments.length
      : 0;

    return {
      totalUsers,
      activeUsers,
      totalCourses,
      activeCourses,
      totalDepartments,
      userGrowth:
        totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0,
      courseProgress:
        totalCourses > 0 ? Math.round((activeCourses / totalCourses) * 100) : 0,
    };
  }, [users, courses, allDepartments, usersPagination]);

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
          title="Tổng số người dùng"
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
            (dashboardStats.activeUsers / dashboardStats.totalUsers) * 100 || 0
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
                <div className="flex justify-end">
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
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
                onClick={() => router.push("/admin/activity-logs")}
              >
                Xem tất cả
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
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
                onClick={() => router.push("/admin/reports")}
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
                <span className="text-sm font-medium">85%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Điểm đánh giá trung bình</span>
                </div>
                <span className="text-sm font-medium">4.3/5</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Thời gian học trung bình</span>
                </div>
                <span className="text-sm font-medium">12h</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Chứng chỉ đã cấp</span>
                </div>
                <span className="text-sm font-medium">147</span>
              </div>
            </div>
          </div>
        </OptimizedCard>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <OptimizedCard className="lg:col-span-2">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Khóa học gần đây</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/admin/courses")}
              >
                Quản lý khóa học
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {courses?.slice(0, 5).map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{course.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {course.courseCode}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {typeof course.status === "string"
                        ? course.status
                        : "N/A"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(() => {
                        if (typeof course.instructor === "string")
                          return course.instructor;
                        if (
                          course.instructor &&
                          typeof course.instructor === "object" &&
                          "fullName" in course.instructor
                        ) {
                          return (course.instructor as any).fullName;
                        }
                        return "Chưa có thông tin";
                      })()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </OptimizedCard>

        <OptimizedCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Người dùng mới</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/admin/users")}
              >
                Quản lý
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {users?.slice(0, 4).map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-xs font-medium">
                    {user.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground">{user.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </OptimizedCard>
      </div>
    </div>
  );
}
