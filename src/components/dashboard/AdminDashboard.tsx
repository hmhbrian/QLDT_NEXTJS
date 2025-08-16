
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
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">{stat.value}</div>
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
          {/* Course Status Distribution Chart */}
          <Card className="border border-border bg-card">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center text-base sm:text-lg lg:text-xl font-semibold text-foreground">
              <PieChartIcon className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <span className="line-clamp-1">Phân bố Trạng thái Khóa học</span>
              {isLoadingCourseStatus && (
                <Loader2 className="ml-2 sm:ml-3 h-4 w-4 sm:h-5 sm:w-5 animate-spin text-primary" />
              )}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Tỷ lệ khóa học theo trạng thái hiện tại
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {courseStatusDistribution && courseStatusDistribution.length > 0 ? (
              <>
                {courseStatusDistribution.some((item) => item.percent > 0) ? (
                  <div className="h-64 sm:h-80 lg:h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={courseStatusDistribution.filter(
                            (item) => item.percent > 0
                          )}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={80}
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
                  <div className="h-48 sm:h-64 lg:h-[300px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <div className="text-4xl sm:text-6xl mb-2 sm:mb-4">📊</div>
                      <p className="text-base sm:text-lg font-medium">
                        Chưa có khóa học nào
                      </p>
                      <p className="text-xs sm:text-sm">
                        Tất cả trạng thái đều có 0 khóa học
                      </p>
                    </div>
                  </div>
                )}

                {/* Custom Legend hiển thị tất cả trạng thái */}
                <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
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
                          className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: colors[index % colors.length],
                          }}
                        />
                        <span className="text-muted-foreground line-clamp-1">
                          {entry.statusName}: {entry.percent}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <PieChartIcon className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-2 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-muted-foreground mb-1 sm:mb-2">
                  Chưa có dữ liệu
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                  Không có dữ liệu trạng thái khóa học để hiển thị
                </p>
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
}
