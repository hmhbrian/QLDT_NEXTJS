
"use client";

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
  Settings,
  BarChart3,
  CheckSquare,
  BellRing,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import type { Course } from "@/lib/types/course.types";
import { useUsers } from "@/hooks/use-users";
import { useCourses } from "@/hooks/use-courses";
import { useMemo } from "react";

// Dữ liệu mẫu cho Nhật ký hoạt động
const mockActivities = [
  {
    id: 1,
    icon: UserPlus,
    text: "Người dùng 'trainee@becamex.com' đã được tạo.",
    time: "2 giờ trước",
    color: "text-blue-500",
  },
  {
    id: 2,
    icon: BookOpen,
    text: "Khóa học 'JavaScript Nâng cao' đã được cập nhật.",
    time: "5 giờ trước",
    color: "text-green-500",
  },
  {
    id: 3,
    icon: CheckSquare,
    text: "Học viên 'Nguyễn Văn An' đã hoàn thành khóa 'React Cơ bản'.",
    time: "1 ngày trước",
    color: "text-teal-500",
  },
  {
    id: 4,
    icon: Settings,
    text: "Cài đặt hệ thống 'Chế độ bảo trì' đã được tắt.",
    time: "2 ngày trước",
    color: "text-orange-500",
  },
];

export function AdminDashboard() {
  const { users, paginationInfo: userPagination } = useUsers();
  const { courses, paginationInfo: coursePagination } = useCourses();

  const { totalUsers, activeCoursesCount, pendingApprovals } = useMemo(() => {
    return {
      totalUsers: userPagination?.totalItems || 0,
      activeCoursesCount: (courses || []).filter(
        (c) =>
          (typeof c.status === "string" && c.status === "Đang mở") ||
          (typeof c.status === "object" && c.status.name === "Đang mở")
      ).length,
      pendingApprovals: 0, // Placeholder
    };
  }, [userPagination, courses]);

  const stats = [
    {
      title: "Tổng số người dùng",
      value: totalUsers.toString(),
      icon: Users,
      color: "text-blue-500",
      link: "/admin/users",
      linkText: "Quản lý Người dùng",
    },
    {
      title: "Khóa học đang hoạt động",
      value: activeCoursesCount.toString(),
      icon: BookOpen,
      color: "text-green-500",
      link: "/admin/courses",
      linkText: "Xem Khóa học",
    },
    {
      title: "Chờ duyệt (Tương lai)",
      value: pendingApprovals.toString(),
      icon: Settings,
      color: "text-yellow-500",
      link: "#",
      linkText: "Xem xét Phê duyệt",
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
          <CardTitle className="font-headline flex items-center">
            <BellRing className="mr-2 h-5 w-5 text-primary" />
            Nhật ký hoạt động gần đây
          </CardTitle>
          <CardDescription>
            Tổng quan về các hoạt động và sự kiện quan trọng trong hệ thống.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mockActivities.length > 0 ? (
            <ul className="space-y-4">
              {mockActivities.map((activity) => (
                <li
                  key={activity.id}
                  className="flex items-start gap-3 p-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors rounded-md"
                >
                  <activity.icon
                    className={`h-5 w-5 flex-shrink-0 mt-1 ${activity.color}`}
                  />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{activity.text}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-md text-center p-4">
              <BarChart3 className="h-12 w-12 text-muted-foreground" />
              <p className="ml-0 md:ml-4 mt-2 md:mt-0 text-muted-foreground">
                Chưa có hoạt động nào gần đây.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
