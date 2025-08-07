
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
    // Filter users to count only active trainees
    const activeTrainees =
      users?.filter(
        (u) =>
          u.role === "HOCVIEN" && u.userStatus?.name === "Đang làm việc"
      ).length || 0;

    const ongoingCourses =
      courses?.filter((c) => {
        const statusName =
          typeof c.status === "object" ? c.status.name : c.status;
        return statusName === "Đang mở";
      }).length || 0;

    const completionRate = allTimeReport?.averangeCompletedPercentage || 0;

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
              <div className="text-2xl md:text-3xl font-bold">{stat.value}</div>
              <Link href={stat.link} passHref>
                <Button
                  variant="link"
                  className="px-0 text-sm text-muted-foreground hover:text-primary"
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
          <CardTitle className="font-headline">Buổi học sắp tới</CardTitle>
          <CardDescription>Lịch các buổi học cho tuần tới.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-md text-center p-4">
            <CalendarCheck2 className="h-12 w-12 text-muted-foreground" />
            <p className="ml-0 md:ml-4 mt-2 md:mt-0 text-muted-foreground">
              Lịch các buổi học sắp tới sẽ được hiển thị ở đây.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
