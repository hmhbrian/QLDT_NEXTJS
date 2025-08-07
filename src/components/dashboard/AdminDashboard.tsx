
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
  UserCheck,
  Building
} from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { useUsers } from "@/hooks/use-users";
import { useCourses } from "@/hooks/use-courses";
import { useDepartments } from "@/hooks/use-departments";
import { useMemo } from "react";
import { useAllTimeReport } from "@/hooks/use-reports";

export function AdminDashboard() {
  const { paginationInfo: userPagination } = useUsers();
  const { paginationInfo: coursePagination } = useCourses();
  const { departments } = useDepartments();
  const { data: allTimeReport } = useAllTimeReport(true);


  const { totalUsers, totalCourses, totalDepartments, activeCoursesCount } = useMemo(() => {
    return {
      totalUsers: allTimeReport?.numberOfStudents || userPagination?.totalItems || 0,
      totalCourses: allTimeReport?.numberOfCourses || coursePagination?.totalItems || 0,
      totalDepartments: departments.length,
      activeCoursesCount: 0, // This needs a proper calculation from course data
    };
  }, [allTimeReport, userPagination, coursePagination, departments]);


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
      title: "Tổng số khóa học",
      value: totalCourses.toString(),
      icon: BookOpen,
      color: "text-green-500",
      link: "/admin/courses",
      linkText: "Xem Khóa học",
    },
    {
      title: "Tổng số phòng ban",
      value: totalDepartments.toString(),
      icon: Building,
      color: "text-yellow-500",
      link: "/admin/departments",
      linkText: "Quản lý Phòng ban",
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
    </div>
  );
}
