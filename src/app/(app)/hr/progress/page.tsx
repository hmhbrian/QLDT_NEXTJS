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
  Loader2,
  BarChart2,
  Activity,
  AlertTriangle,
} from "lucide-react";
import { FilterType } from "@/components/common/ReportFilter";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { useCourses } from "@/hooks/use-courses";
import { useUsers } from "@/hooks/use-users";
import {
  useStudentsOfCourseReport,
  useCourseAndAvgFeedbackReport,
  useAvgFeedbackReport,
  useDataReport,
} from "@/hooks/use-reports";
import { extractErrorMessage } from "@/lib/core";

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
  // Filter states
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1
  );
  const [selectedQuarter, setSelectedQuarter] = useState<number>(
    Math.ceil((new Date().getMonth() + 1) / 3)
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  const { courses, isLoading: isLoadingCourses } = useCourses({ Limit: 50 });
  const { users: allUsers, isLoading: isLoadingUsers } = useUsers({
    // RoleName: "HOCVIEN",
    Limit: 50,
  });

  // Sử dụng API data-report để lấy dữ liệu thống kê chính với filter
  const {
    data: dataReport,
    isLoading: isLoadingDataReport,
    error: dataReportError,
  } = useDataReport({
    month: filterType === "month" ? selectedMonth : undefined,
    quarter: filterType === "quarter" ? selectedQuarter : undefined,
    year:
      filterType === "year" || filterType === "all" ? selectedYear : undefined,
    enabled: true, // Always enabled to get data
  });

  // Sử dụng API reports để lấy dữ liệu chi tiết khác
  const {
    data: studentsData,
    isLoading: isLoadingStudents,
    error: studentsError,
  } = useStudentsOfCourseReport();

  const {
    data: courseFeedback,
    isLoading: isLoadingCourseFeedback,
    error: courseFeedbackError,
  } = useCourseAndAvgFeedbackReport();

  const {
    data: overallFeedback,
    isLoading: isLoadingOverallFeedback,
    error: overallFeedbackError,
  } = useAvgFeedbackReport();

  // ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS - Rules of Hooks
  const reportData = useMemo(() => {
    const loadingState =
      isLoadingCourses ||
      isLoadingUsers ||
      isLoadingDataReport ||
      isLoadingStudents ||
      isLoadingCourseFeedback ||
      isLoadingOverallFeedback;

    if (loadingState) {
      return {
        totalCourses: 0,
        totalTrainees: 0,
        completedCourses: 0,
        completionRate: 0,
        courseStats: [],
        overallRating: 0,
        averageTime: 0,
        positiveFeedback: 0,
      };
    }

    // Sử dụng dữ liệu từ API data-report trước tiên
    if (dataReport) {
      const totalCourses = dataReport.numberOfCourses || 0;
      const totalTrainees = dataReport.numberOfStudents || 0;
      const completionRate = Math.round(
        dataReport.averangeCompletedPercentage || 0
      );
      const averageTime = dataReport.averangeTime || 0;
      const positiveFeedback = Math.round(
        dataReport.averagePositiveFeedback || 0
      );

      // Tính toán khóa học hoàn thành dựa vào tỷ lệ hoàn thành
      const completedCourses = Math.round(
        (totalCourses * completionRate) / 100
      );

      // Tạo courseStats từ dữ liệu API khác nếu có
      let courseStats = [];
      if (studentsData && studentsData.length > 0) {
        courseStats = studentsData
          .map((courseData) => {
            const courseInfo =
              courses.find((c) => c.title === courseData.courseName) || null;
            const status = courseInfo
              ? typeof courseInfo.status === "object" &&
                courseInfo.status &&
                "name" in courseInfo.status
                ? courseInfo.status.name
                : typeof courseInfo.status === "string"
                ? courseInfo.status
                : "Đang diễn ra"
              : "Đang diễn ra";

            return {
              name: courseData.courseName,
              trainees: courseData.totalStudent,
              status: status,
            };
          })
          .filter((course) => course.trainees > 0)
          .sort((a, b) => b.trainees - a.trainees)
          .slice(0, 10);
      }

      return {
        totalCourses,
        totalTrainees,
        completedCourses,
        completionRate,
        courseStats,
        overallRating: positiveFeedback / 20, // Convert to 5-star scale
        averageTime,
        positiveFeedback,
      };
    }

    // Fallback nếu không có dữ liệu từ data-report API - chỉ dùng dữ liệu từ API khác
    const totalCourses = courseFeedback?.length || courses.length || 0;
    const totalTrainees =
      studentsData?.reduce((sum, course) => sum + course.totalStudent, 0) ||
      allUsers.filter((user) => user.role === "HOCVIEN").length ||
      0;

    const completedCourses =
      courses.length > 0
        ? courses.filter((c) => c.status === "Đã kết thúc").length
        : 0;

    const completionRate =
      totalCourses > 0
        ? Math.round((completedCourses / totalCourses) * 100)
        : 0;

    // Tạo courseStats từ dữ liệu API
    let courseStats = [];
    if (studentsData && studentsData.length > 0) {
      courseStats = studentsData
        .map((courseData) => {
          // Tìm thông tin khóa học từ courses API
          const courseInfo =
            courses.find((c) => c.title === courseData.courseName) || null;
          const status = courseInfo
            ? typeof courseInfo.status === "object" &&
              courseInfo.status &&
              "name" in courseInfo.status
              ? courseInfo.status.name
              : typeof courseInfo.status === "string"
              ? courseInfo.status
              : "Đang diễn ra"
            : "Đang diễn ra";

          return {
            name: courseData.courseName,
            trainees: courseData.totalStudent,
            status: status,
          };
        })
        .filter((course) => course.trainees > 0)
        .sort((a, b) => b.trainees - a.trainees)
        .slice(0, 10);
    }

    // Tính điểm đánh giá tổng thể từ API
    const overallRating = overallFeedback
      ? (overallFeedback.q1_relevanceAvg +
          overallFeedback.q2_clarityAvg +
          overallFeedback.q3_structureAvg +
          overallFeedback.q4_durationAvg +
          overallFeedback.q5_materialAvg) /
        5
      : 0;

    return {
      totalCourses,
      totalTrainees,
      completedCourses,
      completionRate,
      courseStats,
      overallRating,
      averageTime: 0,
      positiveFeedback: Math.round(overallRating * 20), // Convert to percentage
    };
  }, [
    dataReport,
    courses,
    allUsers,
    studentsData,
    courseFeedback,
    overallFeedback,
    isLoadingCourses,
    isLoadingUsers,
    isLoadingDataReport,
    isLoadingStudents,
    isLoadingCourseFeedback,
    isLoadingOverallFeedback,
  ]);

  // Instant navigation - show loading skeleton while core data is loading
  if (
    isLoadingCourses ||
    isLoadingUsers ||
    isLoadingDataReport ||
    isLoadingStudents ||
    isLoadingCourseFeedback ||
    isLoadingOverallFeedback
  ) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 animate-pulse rounded w-48"></div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-gray-200 animate-pulse rounded"
            ></div>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-96 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-96 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </div>
    );
  }

  const isLoading = false; // Already handled above
  const anyError =
    dataReportError ||
    studentsError ||
    courseFeedbackError ||
    overallFeedbackError;

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
      title: "Tỷ lệ Hoàn thành",
      value: `${reportData.completionRate}%`,
      icon: Activity,
      description: `Dựa trên ${reportData.completedCourses} khóa học hoàn thành.`,
    },
    {
      title: "Thời gian TB",
      value: dataReport
        ? `${dataReport.averangeTime.toFixed(1)}h`
        : `${reportData.overallRating.toFixed(1)}/5`,
      icon: BarChart2,
      description: dataReport
        ? "Thời gian học trung bình."
        : "Điểm đánh giá trung bình.",
    },
    ...(dataReport
      ? [
          {
            title: "Đánh giá Tích cực",
            value: `${dataReport.averagePositiveFeedback.toFixed(1)}%`,
            icon: AlertTriangle,
            description: "Tỷ lệ phản hồi tích cực.",
          },
        ]
      : []),
  ];

  // Filter handlers
  const handleFilterChange = (newFilterType: FilterType) => {
    setFilterType(newFilterType);
  };

  const applyFilters = () => {
    // Filters are applied automatically through the useDataReport hook
    console.log("Filters applied:", {
      filterType,
      selectedYear,
      selectedQuarter,
      selectedMonth,
    });
  };

  const resetFilters = () => {
    setFilterType("all");
    setSelectedYear(new Date().getFullYear());
    setSelectedQuarter(Math.ceil((new Date().getMonth() + 1) / 3));
    setSelectedMonth(new Date().getMonth() + 1);
  };

  const hasActiveFilter = filterType !== "all";

  const getFilterDisplayLabel = () => {
    switch (filterType) {
      case "month":
        return `Tháng ${selectedMonth}/${selectedYear}`;
      case "quarter":
        return `Quý ${selectedQuarter}/${selectedYear}`;
      case "year":
        return `Năm ${selectedYear}`;
      default:
        return "Toàn bộ thời gian";
    }
  };

  // Loading state
  if (isLoading && !anyError) {
    return (
      <div className="flex h-60 w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">
          Đang tải dữ liệu báo cáo tiến độ...
        </p>
      </div>
    );
  }

  // Error state
  if (anyError) {
    return (
      <div className="flex flex-col items-center justify-center h-60 w-full text-destructive">
        <AlertTriangle className="h-10 w-10 mb-3" />
        <p className="text-lg font-semibold">Lỗi tải dữ liệu báo cáo</p>
        <p className="text-sm text-muted-foreground">
          {extractErrorMessage(anyError)}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-headline font-semibold">
            Báo cáo Tiến độ Học tập
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tổng quan về hoạt động đào tạo và tiến độ của học viên
            {/* {getFilterDisplayLabel()} */}
          </p>
        </div>
        {/* <div className="w-full md:w-auto">
          <ReportFilter
            filterType={filterType}
            selectedYear={selectedYear}
            selectedQuarter={selectedQuarter}
            selectedMonth={selectedMonth}
            onFilterChange={handleFilterChange}
            onYearChange={setSelectedYear}
            onQuarterChange={setSelectedQuarter}
            onMonthChange={setSelectedMonth}
            onApplyFilters={applyFilters}
            onResetFilters={resetFilters}
            hasActiveFilter={hasActiveFilter}
          />
        </div> */}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8 sm:py-10">
          <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat, index) => (
              <Card
                key={index}
                className="border border-border bg-card hover:shadow-md transition-shadow"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground line-clamp-2">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-0">
                  <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-foreground">{stat.value}</div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border border-border bg-card">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <BarChart2 className="h-4 w-4 sm:h-5 sm:w-5" />
                Biểu đồ Tiến độ
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Tổng quan chi tiết về tiến độ học tập và trạng thái các khóa học
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {reportData.courseStats.length === 0 ? (
                <div className="flex items-center justify-center h-48 sm:h-[300px] text-muted-foreground">
                  <div className="text-center">
                    <BarChart2 className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-4 opacity-50" />
                    <p className="text-base sm:text-lg font-medium">Không có dữ liệu</p>
                    <p className="text-xs sm:text-sm">Chưa có khóa học nào với học viên</p>
                  </div>
                </div>
              ) : (
                <div>
                  {/* <div className="mb-6 p-4 bg-muted/30 rounded-lg border">
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
                          {Math.max(
                            0,
                            reportData.totalCourses -
                              reportData.completedCourses
                          )}
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
                  </div> */}
                  <div className="w-full overflow-x-auto">
                    <ProgressCharts data={reportData.courseStats} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
