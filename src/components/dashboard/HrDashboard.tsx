"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  UserCheck,
  ClipboardList,
  LineChart,
  CalendarCheck2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { useUsers } from "@/hooks/use-users";
import { useCourses } from "@/hooks/use-courses";
import { useAllTimeReport } from "@/hooks/use-reports";
import { useMemo } from "react";

export function HrDashboard() {
  // Fetch real data instead of using mocks
  const { users } = useUsers();
  const { courses } = useCourses({ publicOnly: false }); // Fetch all courses HR can see
  const { data: allTimeReport } = useAllTimeReport(true);

  const stats = useMemo(() => {
    const completionRate = allTimeReport?.averangeCompletedPercentage || 0;
    const activeTrainees = allTimeReport?.numberOfStudents || 0;
    const ongoingCourses = allTimeReport?.numberOfCourses || 0;

    return [
      {
        title: "Học viên đang hoạt động",
        value: activeTrainees.toString(),
        icon: UserCheck,
        color: "text-green-500",
        link: "/hr/trainees",
        linkText: "Quản lý Học viên",
      },
      {
        title: "Khóa học đang diễn ra",
        value: ongoingCourses.toString(),
        icon: ClipboardList,
        color: "text-purple-500",
        link: "/admin/courses",
        linkText: "Xem Khóa học",
      },
      {
        title: "Tỷ lệ Hoàn thành TB",
        value: `${completionRate.toFixed(1)}%`,
        icon: LineChart,
        color: "text-pink-500",
        link: "/hr/progress",
        linkText: "Theo dõi Tiến độ",
      },
    ];
  }, [users, courses, allTimeReport]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="border border-border bg-card hover:shadow-md transition-shadow duration-200"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
                {stat.value}
              </div>
              <Link href={stat.link} passHref>
                <Button
                  variant="link"
                  className="px-0 text-xs sm:text-sm text-muted-foreground hover:text-primary mt-1"
                >
                  {stat.linkText}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg font-semibold text-foreground">
            Buổi học sắp tới
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Lịch các buổi học cho tuần tới
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-32 sm:h-40 border-2 border-dashed border-border rounded-md text-center p-4">
            <div className="p-2 sm:p-3 bg-muted rounded-full mb-2 sm:mb-3">
              <CalendarCheck2 className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Lịch các buổi học sắp tới sẽ được hiển thị ở đây
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
