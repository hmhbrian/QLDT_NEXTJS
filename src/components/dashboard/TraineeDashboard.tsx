"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GraduationCap, BookMarked, Percent, CalendarDays } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { Progress } from "@/components/ui/progress";
import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCourses, useUpcomingCourses } from "@/hooks/use-courses";
import type { Course } from "@/lib/types/course.types";

export function TraineeDashboard() {
  const { user: currentUser } = useAuth();
  const { courses: allCourses } = useCourses();
  const { data: upcomingClassesData, isLoading: isLoadingUpcomingClasses } =
    useUpcomingCourses();

  const {
    enrolledCoursesCount,
    completedCoursesCount,
    overallProgress,
    upcomingClasses,
  } = useMemo(() => {
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

    // This part needs real data to be meaningful.
    // For now, we'll keep it simple.
    const completed = 0; // Placeholder
    const progress =
      enrolled.length > 0 ? Math.round((completed / enrolled.length) * 100) : 0;

    // Use data from the new hook
    const upcoming = upcomingClassesData || [];

    return {
      enrolledCoursesCount: enrolled.length,
      completedCoursesCount: completed,
      overallProgress: progress,
      upcomingClasses: upcoming,
    };
  }, [currentUser, allCourses, upcomingClassesData]);

  const stats = [
    {
      title: "Khóa học đã đăng ký",
      value: enrolledCoursesCount.toString(),
      icon: GraduationCap,
      color: "text-teal-500",
      link: "/trainee/my-courses",
      linkText: "Khóa học của tôi",
    },
    {
      title: "Khóa học đã hoàn thành",
      value: `${completedCoursesCount}/${enrolledCoursesCount}`,
      icon: BookMarked,
      color: "text-cyan-500",
      link: "/trainee/my-courses",
      linkText: "Xem Chi tiết",
    },
    {
      title: "Tiến độ tổng thể",
      value: overallProgress,
      icon: Percent,
      color: "text-sky-500",
      link: "/trainee/my-courses",
      linkText: "Xem Chi tiết",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              {stat.title === "Tiến độ tổng thể" ? (
                <>
                  <div className="text-2xl md:text-3xl font-bold mb-2">
                    {stat.value}%
                  </div>
                  <Progress
                    value={typeof stat.value === "number" ? stat.value : 0}
                    className="h-2"
                    aria-label={`Tiến độ ${stat.value}%`}
                  />
                </>
              ) : (
                <div className="text-2xl md:text-3xl font-bold">
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
        ))}
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline flex items-center">
            <CalendarDays className="mr-2 h-5 w-5 text-primary" />
            Lớp học sắp tới / Đang diễn ra
          </CardTitle>
          <CardDescription>
            Các lớp học đã được lên lịch của bạn trong thời gian tới.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingUpcomingClasses ? (
            <p className="text-muted-foreground text-center">
              Đang tải lớp học sắp tới...
            </p>
          ) : upcomingClasses.length > 0 ? (
            <ul className="space-y-4">
              {upcomingClasses.map((course) => (
                <li
                  key={course.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <Link href={`/courses/${course.id}`} passHref>
                      <h4 className="font-semibold text-foreground hover:text-primary hover:underline cursor-pointer">
                        {course.title}
                      </h4>
                    </Link>
                    {/* Assuming instructor is not directly on Course, or needs to be fetched/mapped differently */}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Giảng viên: Không có
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground text-left sm:text-right w-full sm:w-auto">
                    {course.startDate ? (
                      <>
                        <p>
                          Bắt đầu:{" "}
                          {new Date(course.startDate).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                        {course.endDate && (
                          <p className="text-xs">
                            Kết thúc:{" "}
                            {new Date(course.endDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </p>
                        )}
                      </>
                    ) : (
                      <p>Lịch học sẽ sớm được cập nhật.</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="w-full mt-2 sm:w-auto sm:mt-0"
                  >
                    <Link href={`/courses/${course.id}`}>Xem chi tiết</Link>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-md text-center p-4">
              <CalendarDays className="h-12 w-12 text-muted-foreground" />
              <p className="ml-0 md:ml-4 mt-2 md:mt-0 text-muted-foreground">
                Hiện tại không có lớp học nào sắp diễn ra.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
