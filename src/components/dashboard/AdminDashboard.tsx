
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  Building,
  Users,
  Loader2,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import Link from "next/link";
import { Button } from "../ui/button";
import { useUsers } from "@/hooks/use-users";
import { useCourses } from "@/hooks/use-courses";
import { useDepartments } from "@/hooks/use-departments";
import { useMemo } from "react";
import { useAllTimeReport, useCourseStatusDistribution } from "@/hooks/use-reports";

export function AdminDashboard() {
  const { paginationInfo: userPagination } = useUsers();
  const { paginationInfo: coursePagination } = useCourses();
  const { departments } = useDepartments();
  const { data: allTimeReport } = useAllTimeReport(true);
  const {
    data: courseStatusDistribution,
    isLoading: isLoadingCourseStatus,
    error: courseStatusError,
  } = useCourseStatusDistribution();

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
      title: "Tổng số học viên",
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
          {/* Course Status Distribution Chart */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl shadow-orange-500/10">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-bold text-slate-900 dark:text-slate-100">
              <PieChartIcon className="mr-3 h-6 w-6 text-orange-500" />
              Phân bố Trạng thái Khóa học
              {isLoadingCourseStatus && (
                <Loader2 className="ml-3 h-5 w-5 animate-spin text-orange-500" />
              )}
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-300">
              Tỷ lệ khóa học theo trạng thái hiện tại
            </CardDescription>
          </CardHeader>
          <CardContent>
            {courseStatusDistribution && courseStatusDistribution.length > 0 ? (
              <>
                {courseStatusDistribution.some((item) => item.percent > 0) ? (
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={courseStatusDistribution.filter(
                            (item) => item.percent > 0
                          )}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="percent"
                          nameKey="statusName"
                          label={({ statusName, percent }) =>
                            `${statusName}: ${percent}%`
                          }
                          labelLine={false}
                        >
                          {courseStatusDistribution
                            .filter((item) => item.percent > 0)
                            .map((entry, index) => {
                              const colors = [
                                "#ef4444", // Red for "Đã kết thúc"
                                "#f97316", // Orange for "Sắp khai giảng"
                                "#22c55e", // Green for "Đang mở"
                                "#64748b", // Gray for "Lưu nháp"
                                "#9ca3af", // Light gray for "Hủy"
                              ];
                              return (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={colors[index % colors.length]}
                                />
                              );
                            })}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => [`${value}%`, "Tỷ lệ"]}
                          labelFormatter={(label) => `Trạng thái: ${label}`}
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          formatter={(value, entry) => (
                            <span
                              style={{
                                color: entry.color,
                                fontWeight: "medium",
                              }}
                            >
                              {value}
                            </span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-slate-500 dark:text-slate-400">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📊</div>
                      <p className="text-lg font-medium">
                        Chưa có khóa học nào
                      </p>
                      <p className="text-sm">
                        Tất cả trạng thái đều có 0 khóa học
                      </p>
                    </div>
                  </div>
                )}

                {/* Custom Legend hiển thị tất cả trạng thái */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  {courseStatusDistribution.map((entry, index) => {
                    const colors = [
                      "#ef4444", // Red for "Đã kết thúc"
                      "#f97316", // Orange for "Sắp khai giảng"
                      "#22c55e", // Green for "Đang mở"
                      "#64748b", // Gray for "Lưu nháp"
                      "#9ca3af", // Light gray for "Hủy"
                    ];
                    return (
                      <div
                        key={`legend-${index}`}
                        className="flex items-center gap-2"
                      >
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: colors[index % colors.length],
                          }}
                        />
                        <span className="text-slate-700 dark:text-slate-300">
                          {entry.statusName}: {entry.percent}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <PieChartIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  Chưa có dữ liệu
                </h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Không có dữ liệu trạng thái khóa học để hiển thị.
                </p>
              </div>
            )}
          </CardContent>
        </Card>{" "}
    </div>
  );
}
