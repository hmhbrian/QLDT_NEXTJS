"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, BookMarked, Percent, CalendarDays } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { Progress } from "@/components/ui/progress";
import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCourses, useUpcomingCourses } from "@/hooks/use-courses";
import { useStudentDashboard } from "@/hooks/use-student-dashboard";
import type { Course } from "@/lib/types/course.types";

export function TraineeDashboard() {
  const { user: currentUser } = useAuth();
  const { courses: allCourses } = useCourses();
  const { data: upcomingClassesData, isLoading: isLoadingUpcomingClasses } =
    useUpcomingCourses();
  const { 
    data: dashboardData, 
    isLoading: isLoadingDashboard, 
    error: dashboardError 
  } = useStudentDashboard();

  const {
    enrolledCoursesCount,
    completedCoursesCount,
    overallProgress,
    upcomingClasses,
  } = useMemo(() => {
    // Use API data if available, otherwise fallback to old logic
    if (dashboardData) {
      const upcoming = upcomingClassesData || [];

      return {
        enrolledCoursesCount: dashboardData.numberRegisteredCourse,
        completedCoursesCount: dashboardData.numberCompletedCourse,
        overallProgress: Math.round(dashboardData.averangeCompletedPercentage * 100),
        upcomingClasses: upcoming,
      };
    }

    // Fallback logic when API data is not available
    if (!currentUser || !allCourses) {
      return {
        enrolledCoursesCount: 0,
        completedCoursesCount: 0,
        overallProgress: 0,
        upcomingClasses: [],
      };
    }

    const enrolled = allCourses.filter((course) =>
      course.userIds?.includes(currentUser.id)
    );

    const completed = 0; // Placeholder
    const progress =
      enrolled.length > 0 ? Math.round((completed / enrolled.length) * 100) : 0;

    const upcoming = upcomingClassesData || [];

    return {
      enrolledCoursesCount: enrolled.length,
      completedCoursesCount: completed,
      overallProgress: progress,
      upcomingClasses: upcoming,
    };
  }, [currentUser, allCourses, upcomingClassesData, dashboardData]);

  const stats = [
    {
      title: "Khóa học đã đăng ký",
      value: enrolledCoursesCount.toString(),
      icon: GraduationCap,
      color: "text-blue-500",
      link: "/trainee/my-courses",
      linkText: "Xem tất cả",
    },
    {
      title: "Khóa học đã hoàn thành",
      value: `${completedCoursesCount}/${enrolledCoursesCount}`,
      icon: BookMarked,
      color: "text-green-500",
      link: "/trainee/my-courses?tab=passed",
      linkText: "Xem đã hoàn thành",
    },
    {
      title: "Tiến độ tổng thể",
      value: overallProgress,
      icon: Percent,
      color: "text-orange-500",
      link: "/trainee/my-courses?tab=ongoing",
      linkText: "Xem tiến độ",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoadingDashboard ? (
          // Show skeleton loading for dashboard cards
          [...Array(3)].map((_, i) => (
            <Card key={i} className="border border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-5 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))
        ) : (
          stats.map((stat) => (
            <Card
              key={stat.title}
              className="border border-border bg-card hover:shadow-md transition-shadow duration-200"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
            <CardContent>
              {stat.title === "Tiến độ tổng thể" ? (
                <>
                  <div className="text-2xl font-bold text-foreground mb-2">
                    {stat.value}%
                  </div>
                  <Progress
                    value={typeof stat.value === "number" ? stat.value : 0}
                    className="h-2"
                    aria-label={`Tiến độ ${stat.value}%`}
                  />
                </>
              ) : (
                <div className="text-2xl font-bold text-foreground">
                  {stat.value}
                </div>
              )}
              <Link href={stat.link} passHref>
                <Button
                  variant="link"
                  className="px-0 text-sm text-muted-foreground hover:text-primary mt-1"
                >
                  {stat.linkText}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))
        )}
      </div>
      
      {/* Show error state for dashboard data */}
      {dashboardError && (
        <div className="text-center text-red-600 bg-red-50 dark:bg-red-950/10 p-4 rounded-lg border border-red-200 dark:border-red-800">
          Có lỗi khi tải dữ liệu dashboard: {dashboardError}
        </div>
      )}

      <Card className="border border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center text-foreground">
            <CalendarDays className="mr-2 h-5 w-5 text-blue-500" />
            Lớp học sắp tới / Đang diễn ra
          </CardTitle>
          <CardDescription>
            Các lớp học đã được lên lịch của bạn trong thời gian tới
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingUpcomingClasses ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Đang tải lớp học...</div>
            </div>
          ) : upcomingClasses.length > 0 ? (
            <div className="space-y-3">
              {upcomingClasses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <Link href={`/courses/${course.id}`} passHref>
                      <h4 className="font-semibold text-foreground hover:text-blue-600 transition-colors cursor-pointer truncate">
                        {course.title}
                      </h4>
                    </Link>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      {course.startDate && (
                        <span>
                          📅 {new Date(course.startDate).toLocaleDateString("vi-VN")}
                        </span>
                      )}
                      {course.endDate && (
                        <span>
                          🏁 {new Date(course.endDate).toLocaleDateString("vi-VN")}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="ml-4 flex-shrink-0"
                  >
                    <Link href={`/courses/${course.id}`}>Xem chi tiết</Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-3 bg-muted rounded-full mb-4">
                <CalendarDays className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-foreground mb-1">
                Không có lớp học nào sắp diễn ra
              </h3>
              <p className="text-sm text-muted-foreground">
                Các lớp học mới sẽ được thông báo tại đây
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
