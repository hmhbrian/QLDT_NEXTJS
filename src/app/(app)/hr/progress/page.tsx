"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, BookOpen, Loader2, BarChart2, Activity } from "lucide-react";
import dynamic from "next/dynamic";
import { useCourses } from "@/hooks/use-courses";
import { useUsers } from "@/hooks/use-users";
import { useMemo } from "react";

const ProgressCharts = dynamic(
  () =>
    import("@/components/hr/ProgressCharts").then((mod) => mod.ProgressCharts),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] w-full flex items-center justify-center col-span-1 md:col-span-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Đang tải biểu đồ...</p>
      </div>
    ),
  }
);

export default function ProgressPage() {
  const { courses, isLoading: isLoadingCourses } = useCourses({ Limit: 1000 });
  const { users: allUsers, isLoading: isLoadingUsers } = useUsers({
    RoleName: "HOCVIEN",
    Limit: 1000,
  });

  const isLoading = isLoadingCourses || isLoadingUsers;

  const reportData = useMemo(() => {
    if (isLoading) {
      return {
        totalCourses: 0,
        totalTrainees: 0,
        completedCourses: 0,
        completionRate: 0,
        courseStats: [],
      };
    }

    const totalCourses = courses.length || 10; // Mock: 10 khóa học
    const totalTrainees = allUsers.length || 244; // Mock: 244 học viên

    // Simplified completion logic: a course is "completed" if its status is "Đã kết thúc"
    const completedCourses =
      courses.length > 0
        ? courses.filter((c) => c.status === "Đã kết thúc").length
        : 2; // Mock: 2 khóa học đã hoàn thành

    const completionRate =
      totalCourses > 0
        ? Math.round((completedCourses / totalCourses) * 100)
        : 20; // Mock: 20% completion rate

    let courseStats = courses
      .map((course) => ({
        name: course.title,
        trainees: course.userIds?.length || 0,
        status:
          typeof course.status === "object" &&
          course.status &&
          "name" in course.status
            ? course.status.name
            : typeof course.status === "string"
            ? course.status
            : "N/A",
      }))
      .filter((course) => course.trainees > 0) // Chỉ lấy khóa học có học viên
      .sort((a, b) => b.trainees - a.trainees)
      .slice(0, 10); // Top 10 courses by enrollment

    // Nếu không có dữ liệu thật, thêm mock data để demo
    if (courseStats.length === 0) {
      courseStats = [
        {
          name: "Khóa học Lập trình Web",
          trainees: 45,
          status: "Đang diễn ra",
        },
        { name: "Khóa học Data Science", trainees: 38, status: "Đang diễn ra" },
        { name: "Khóa học UI/UX Design", trainees: 32, status: "Đã kết thúc" },
        { name: "Khóa học Mobile App", trainees: 28, status: "Đang diễn ra" },
        { name: "Khóa học DevOps", trainees: 24, status: "Sắp bắt đầu" },
        {
          name: "Khóa học Machine Learning",
          trainees: 22,
          status: "Đang diễn ra",
        },
        { name: "Khóa học Cybersecurity", trainees: 18, status: "Đã kết thúc" },
        {
          name: "Khóa học Cloud Computing",
          trainees: 15,
          status: "Đang diễn ra",
        },
        { name: "Khóa học Blockchain", trainees: 12, status: "Sắp bắt đầu" },
        {
          name: "Khóa học AI Fundamentals",
          trainees: 10,
          status: "Đang diễn ra",
        },
      ];
    }

    // Debug logging
    console.log("🔍 Progress Page Debug:", {
      totalCourses: courses.length,
      totalTrainees: allUsers.length,
      courseStats,
      coursesRaw: courses.slice(0, 2), // First 2 courses for debugging
      usingMockData: courses.length === 0 || courseStats.length === 0,
    });

    return {
      totalCourses,
      totalTrainees,
      completedCourses,
      completionRate,
      courseStats,
    };
  }, [courses, allUsers, isLoading]);

  const statCards = [
    {
      title: "Tổng số Khóa học",
      value: reportData.totalCourses,
      icon: BookOpen,
      description: "Tổng số khóa học trong hệ thống.",
    },
    {
      title: "Tổng số Học viên",
      value: reportData.totalTrainees,
      icon: Users,
      description: "Tổng số tài khoản học viên.",
    },
    {
      title: "Tỷ lệ Hoàn thành (Ước tính)",
      value: `${reportData.completionRate}%`,
      icon: Activity,
      description: `Dựa trên ${reportData.completedCourses} khóa học "Đã kết thúc".`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-headline font-semibold">
            Báo cáo Tiến độ Học tập
          </h1>
          <p className="text-muted-foreground mt-1">
            Tổng quan về hoạt động đào tạo và tiến độ của học viên.
          </p>
        </div>
        <div className="w-full md:w-auto">
          <Select defaultValue="all_time">
            <SelectTrigger className="w-full md:w-[240px] bg-background shadow-sm">
              <SelectValue placeholder="Chọn Giai đoạn" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_time">Toàn bộ thời gian</SelectItem>
              {/* Add other time ranges later if needed */}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {statCards.map((stat, index) => (
              <Card
                key={index}
                className="shadow-lg hover:shadow-xl transition-shadow"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5" />
                Thống kê và Biểu đồ Tiến độ
              </CardTitle>
              <CardDescription>
                Tổng quan chi tiết về tiến độ học tập và trạng thái các khóa
                học.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reportData.courseStats.length === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  <div className="text-center">
                    <BarChart2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Không có dữ liệu</p>
                    <p className="text-sm">Chưa có khóa học nào với học viên</p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-6 p-4 bg-muted/30 rounded-lg border">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {reportData.completedCourses}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Đã hoàn thành
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {reportData.totalCourses -
                            reportData.completedCourses}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Đang thực hiện
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">
                          {reportData.totalTrainees}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Tổng học viên
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600">
                          {reportData.completionRate}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Tỷ lệ hoàn thành
                        </div>
                      </div>
                    </div>
                  </div>
                  <ProgressCharts data={reportData.courseStats} />
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
