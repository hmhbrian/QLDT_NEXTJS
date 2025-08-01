"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRatingDisplay } from "@/components/ui/StarRatingDisplay";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  BookText as BookTextIcon,
  FileText,
  Users,
  CheckSquare,
  Clock,
  Award,
  BarChartHorizontalBig,
  Activity,
  Loader2,
  AlertTriangle,
  TrendingUp,
  PieChart as PieChartIcon,
  RefreshCw,
  Calendar,
  Filter,
  ChevronDown,
  Building2,
  BarChart3,
} from "lucide-react";

import { useState, useMemo } from "react";
import {
  useCourseAndAvgFeedbackReport,
  useAvgFeedbackReport,
  useStudentsOfCourseReport,
  useMonthlyReport,
  useYearlyReport,
  useQuarterlyReport,
  useAllTimeReport,
  useTopDepartments,
  useCourseStatusDistribution,
} from "@/hooks/use-reports";
import {
  AvgFeedbackData,
  CourseAndAvgFeedback,
  StudentsOfCourse,
  ReportData,
} from "@/lib/services/modern/report.service";
import { extractErrorMessage } from "@/lib/core";
import { ApiDataCharts } from "@/components/reports/ApiDataCharts";
import dynamic from "next/dynamic";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const evaluationCriteriaLabels: Record<keyof AvgFeedbackData, string> = {
  q1_relevanceAvg: "Nội dung phù hợp công việc",
  q2_clarityAvg: "Kiến thức dễ hiểu",
  q3_structureAvg: "Cấu trúc logic",
  q4_durationAvg: "Thời lượng hợp lý",
  q5_materialAvg: "Tài liệu hiệu quả",
};

type CriteriaKey = keyof AvgFeedbackData;

const criteriaOrder: CriteriaKey[] = [
  "q1_relevanceAvg",
  "q2_clarityAvg",
  "q3_structureAvg",
  "q4_durationAvg",
  "q5_materialAvg",
];

const criteriaShortLabels: Record<CriteriaKey, string> = {
  q1_relevanceAvg: "Phù hợp",
  q2_clarityAvg: "Dễ hiểu",
  q3_structureAvg: "Logic",
  q4_durationAvg: "Thời lượng",
  q5_materialAvg: "Tài liệu",
};

type FilterType = "all" | "year" | "quarter" | "month";

// Dynamically import client-side components to avoid hydration errors
const ClientStarRatingDisplay = dynamic(
  () => import("@/components/ui/StarRatingDisplay"),
  { ssr: false }
);

export default function TrainingOverviewReportPage() {
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedQuarter, setSelectedQuarter] = useState<number>(
    Math.ceil((new Date().getMonth() + 1) / 3)
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const {
    data: overallFeedback,
    isLoading: isLoadingOverallFeedback,
    error: overallFeedbackError,
  } = useAvgFeedbackReport();

  const {
    data: courseFeedback,
    isLoading: isLoadingCourseFeedback,
    error: courseFeedbackError,
  } = useCourseAndAvgFeedbackReport();

  const {
    data: studentsData,
    isLoading: isLoadingStudents,
    error: studentsError,
  } = useStudentsOfCourseReport();

  // ALL REPORT HOOKS MUST BE CALLED BEFORE EARLY RETURN - Rules of Hooks
  const {
    data: monthlyReport,
    isLoading: isLoadingMonthlyReport,
    error: monthlyReportError,
  } = useMonthlyReport(selectedMonth, selectedYear, filterType === "month");

  const {
    data: yearlyReport,
    isLoading: isLoadingYearlyReport,
    error: yearlyReportError,
  } = useYearlyReport(selectedYear, filterType === "year");

  const {
    data: quarterlyReport,
    isLoading: isLoadingQuarterlyReport,
    error: quarterlyReportError,
  } = useQuarterlyReport(
    selectedQuarter,
    selectedYear,
    filterType === "quarter"
  );

  const {
    data: allTimeReport,
    isLoading: isLoadingAllTimeReport,
    error: allTimeReportError,
  } = useAllTimeReport(filterType === "all");

  const {
    data: topDepartments,
    isLoading: isLoadingTopDepartments,
    error: topDepartmentsError,
  } = useTopDepartments();

  const {
    data: courseStatusDistribution,
    isLoading: isLoadingCourseStatus,
    error: courseStatusError,
  } = useCourseStatusDistribution();

  const isLoadingAny = useMemo(() => {
    return (
      isLoadingOverallFeedback ||
      isLoadingCourseFeedback ||
      isLoadingStudents ||
      isLoadingTopDepartments ||
      isLoadingCourseStatus ||
      (filterType === "month" && isLoadingMonthlyReport) ||
      (filterType === "year" && isLoadingYearlyReport) ||
      (filterType === "quarter" && isLoadingQuarterlyReport) ||
      (filterType === "all" && isLoadingAllTimeReport)
    );
  }, [
    isLoadingOverallFeedback,
    isLoadingCourseFeedback,
    isLoadingStudents,
    isLoadingTopDepartments,
    isLoadingCourseStatus,
    filterType,
    isLoadingMonthlyReport,
    isLoadingYearlyReport,
    isLoadingQuarterlyReport,
    isLoadingAllTimeReport,
  ]);

  const anyError = useMemo(() => {
    return (
      overallFeedbackError ||
      courseFeedbackError ||
      studentsError ||
      topDepartmentsError ||
      courseStatusError ||
      (filterType === "month" && monthlyReportError) ||
      (filterType === "year" && yearlyReportError) ||
      (filterType === "quarter" && quarterlyReportError) ||
      (filterType === "all" && allTimeReportError)
    );
  }, [
    overallFeedbackError,
    courseFeedbackError,
    studentsError,
    topDepartmentsError,
    courseStatusError,
    filterType,
    monthlyReportError,
    yearlyReportError,
    quarterlyReportError,
    allTimeReportError,
  ]);

  const metrics = useMemo(() => {
    // Lấy dữ liệu report dựa vào filterType
    let currentReport: ReportData | undefined;
    switch (filterType) {
      case "month":
        currentReport = monthlyReport;
        break;
      case "year":
        currentReport = yearlyReport;
        break;
      case "quarter":
        currentReport = quarterlyReport;
        break;
      case "all":
        currentReport = allTimeReport;
        break;
      default:
        currentReport = undefined;
    }

    const totalCourses =
      filterType === "all" && !currentReport
        ? courseFeedback?.length || 0
        : currentReport?.numberOfCourses || 0;

    const totalStudents =
      filterType === "all" && !currentReport
        ? studentsData?.reduce((sum, course) => sum + course.totalStudent, 0) ||
          0
        : currentReport?.numberOfStudents || 0;

    const completionRate =
      filterType === "all" && !currentReport
        ? "Đang phát triển..."
        : `${Math.min(
            Math.round(currentReport?.averangeCompletedPercentage || 0),
            100
          )}%`;

    const avgTrainingHours =
      filterType === "all" && !currentReport
        ? "Đang phát triển..."
        : `${(currentReport?.averangeTime || 0).toFixed(1)} giờ`;

    const positiveEvalRate =
      filterType === "all" && !currentReport
        ? overallFeedback
          ? `${Math.min(
              Math.round(
                ((overallFeedback.q1_relevanceAvg +
                  overallFeedback.q2_clarityAvg +
                  overallFeedback.q3_structureAvg +
                  overallFeedback.q4_durationAvg +
                  overallFeedback.q5_materialAvg) /
                  5 /
                  5) *
                  100
              ),
              100
            )}%`
          : "0%"
        : `${Math.min(
            Math.round(currentReport?.averagePositiveFeedback || 0),
            100
          )}%`;

    return [
      {
        id: "coursesOrganized",
        title: "Khóa học Đã Tổ chức",
        value: totalCourses.toString(),
        icon: FileText,
        unit: "khóa học",
      },
      {
        id: "totalParticipants",
        title: "Tổng Học viên",
        value: totalStudents.toString(),
        icon: Users,
        unit: "học viên",
      },
      {
        id: "completionRate",
        title: "Tỷ lệ Hoàn thành",
        value: completionRate,
        icon: CheckSquare,
        unit: "",
      },
      {
        id: "avgTrainingHours",
        title: "Thời lượng TB",
        value: avgTrainingHours,
        icon: Clock,
        unit: "",
      },
      {
        id: "positiveEvalRate",
        title: "Chỉ số Hài lòng",
        value: positiveEvalRate,
        icon: Award,
        unit: filterType === "all" && !currentReport ? "(tổng hợp)" : "",
      },
    ];
  }, [
    filterType,
    courseFeedback,
    studentsData,
    monthlyReport,
    yearlyReport,
    quarterlyReport,
    allTimeReport,
    overallFeedback,
  ]);

  // Instant navigation - show loading skeleton while any core data is loading
  if (
    isLoadingOverallFeedback ||
    isLoadingCourseFeedback ||
    isLoadingStudents
  ) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 animate-pulse rounded w-64"></div>
          <div className="h-10 bg-gray-200 animate-pulse rounded w-32"></div>
        </div>
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

  const hasActiveFilter = filterType !== "all";

  const resetFilters = () => {
    setFilterType("all");
    setSelectedMonth(new Date().getMonth() + 1);
    setSelectedYear(new Date().getFullYear());
    setSelectedQuarter(Math.ceil((new Date().getMonth() + 1) / 3));
    setIsFilterOpen(false);
  };

  const handleFilterChange = (newFilterType: FilterType) => {
    setFilterType(newFilterType);
    if (newFilterType === "all") {
      setIsFilterOpen(false);
    }
  };

  const applyFilters = () => {
    setIsFilterOpen(false);
  };

  if (anyError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/50 to-red-50/30 dark:from-slate-950 dark:via-orange-950/20 dark:to-red-950/10">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center h-60 w-full">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 rounded-full mb-6 shadow-lg shadow-red-500/20">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Không thể tải dữ liệu báo cáo
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-6">
              Hệ thống đang gặp sự cố tạm thời. Vui lòng thử lại sau ít phút
              hoặc liên hệ bộ phận hỗ trợ nếu vấn đề vẫn tiếp tục.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => window.location.reload()}
                className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Tải lại trang
              </Button>
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="border-slate-300 hover:bg-slate-50"
              >
                Quay lại
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen from-orange-50 via-amber-50/50 to-red-50/30 dark:from-slate-950 dark:via-orange-950/20 dark:to-red-950/10">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="relative">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-xl shadow-orange-500/25">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-orange-700 to-red-800 dark:from-slate-100 dark:via-orange-200 dark:to-red-200 bg-clip-text text-transparent leading-tight">
                      Báo cáo Hiệu quả Đào tạo Doanh nghiệp
                    </h1>
                  </div>
                  <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl">
                    {getFilterDisplayLabel()} • Phân tích tổng thể về chất
                    lượng, hiệu quả và tác động của chương trình đào tạo
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-lg hover:shadow-xl transition-all duration-200 min-w-[200px] justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-orange-500" />
                      <span className="font-medium">
                        {getFilterDisplayLabel()}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-80 p-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-2xl"
                  align="end"
                >
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Filter className="w-4 h-4 text-orange-500" />
                        Lọc theo thời gian
                      </h4>
                      <RadioGroup
                        value={filterType}
                        onValueChange={handleFilterChange}
                        className="space-y-3"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="all" id="all" />
                          <Label
                            htmlFor="all"
                            className="text-sm font-medium cursor-pointer"
                          >
                            Toàn bộ thời gian
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="year" id="year" />
                          <Label
                            htmlFor="year"
                            className="text-sm font-medium cursor-pointer"
                          >
                            Theo năm
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="quarter" id="quarter" />
                          <Label
                            htmlFor="quarter"
                            className="text-sm font-medium cursor-pointer"
                          >
                            Theo quý
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="month" id="month" />
                          <Label
                            htmlFor="month"
                            className="text-sm font-medium cursor-pointer"
                          >
                            Theo tháng
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {filterType !== "all" && (
                      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Năm
                          </Label>
                          <Select
                            value={selectedYear.toString()}
                            onValueChange={(value) =>
                              setSelectedYear(parseInt(value))
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 5 }, (_, i) => {
                                const year = new Date().getFullYear() - i;
                                return (
                                  <SelectItem
                                    key={year}
                                    value={year.toString()}
                                  >
                                    {year}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>

                        {filterType === "quarter" && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Quý
                            </Label>
                            <Select
                              value={selectedQuarter.toString()}
                              onValueChange={(value) =>
                                setSelectedQuarter(parseInt(value))
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[
                                  { value: 1, label: "Quý 1 (T1-T3)" },
                                  { value: 2, label: "Quý 2 (T4-T6)" },
                                  { value: 3, label: "Quý 3 (T7-T9)" },
                                  { value: 4, label: "Quý 4 (T10-T12)" },
                                ].map((quarter) => (
                                  <SelectItem
                                    key={quarter.value}
                                    value={quarter.value.toString()}
                                  >
                                    {quarter.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {filterType === "month" && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Tháng
                            </Label>
                            <Select
                              value={selectedMonth.toString()}
                              onValueChange={(value) =>
                                setSelectedMonth(parseInt(value))
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 12 }, (_, i) => (
                                  <SelectItem
                                    key={i + 1}
                                    value={(i + 1).toString()}
                                  >
                                    Tháng {i + 1}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <Button
                          onClick={applyFilters}
                          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg"
                        >
                          Áp dụng bộ lọc
                        </Button>
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              {hasActiveFilter && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="flex items-center gap-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-200 dark:hover:border-red-800 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 shadow-lg"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="hidden sm:inline">Đặt lại</span>
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {metrics.map((metric, index) => (
            <Card
              key={metric.id}
              className="group relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3 relative z-10">
                <div className="flex-1">
                  <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2 leading-tight">
                    {metric.title}
                  </CardTitle>
                  <div className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                    {metric.value}
                  </div>
                  {metric.unit && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {metric.unit}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 ml-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300 shadow-orange-500/25">
                    <metric.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardHeader>
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
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-xl font-bold text-slate-900 dark:text-slate-100">
              <BarChartHorizontalBig className="mr-3 h-6 w-6 text-orange-500" />
              Chỉ số Đánh giá Chất lượng
              {isLoadingOverallFeedback && (
                <Loader2 className="ml-3 h-5 w-5 animate-spin text-orange-500" />
              )}
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-300">
              Điểm số trung bình theo từng tiêu chí đánh giá chất lượng đào tạo
              {hasActiveFilter && ` • ${getFilterDisplayLabel()}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {overallFeedback ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {criteriaOrder.map((key) => (
                  <Card
                    key={String(key)}
                    className="bg-gradient-to-br from-slate-50/50 to-slate-100/50 dark:from-slate-700/50 dark:to-slate-800/50 p-4 border-0 shadow-md hover:shadow-lg transition-shadow duration-200"
                  >
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {evaluationCriteriaLabels[key]}
                    </p>
                    <div className="flex items-center gap-3">
                      <ClientStarRatingDisplay
                        rating={overallFeedback[key] || 0}
                        size={5}
                      />
                      <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                        ({(overallFeedback[key] || 0).toFixed(1)}/5)
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400 text-lg">
                  {hasActiveFilter
                    ? `Chưa có dữ liệu đánh giá cho ${getFilterDisplayLabel().toLowerCase()}`
                    : "Chưa có dữ liệu đánh giá để hiển thị"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl shadow-orange-500/10">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-bold text-slate-900 dark:text-slate-100">
              <BookTextIcon className="mr-3 h-6 w-6 text-orange-500" />
              Chi tiết Đánh giá Theo Khóa học
              {isLoadingCourseFeedback && (
                <Loader2 className="ml-3 h-5 w-5 animate-spin text-orange-500" />
              )}
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-300">
              Điểm trung bình cho từng tiêu chí của mỗi khóa học
              {hasActiveFilter && ` • ${getFilterDisplayLabel()}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {courseFeedback && courseFeedback.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-orange-200/50 dark:border-orange-700/30">
                      <TableHead className="min-w-[200px] font-semibold text-slate-700 dark:text-slate-300">
                        Tên Khóa học
                      </TableHead>
                      {criteriaOrder.map((key) => (
                        <TableHead
                          key={String(key)}
                          className="min-w-[140px] text-center whitespace-nowrap font-semibold text-slate-700 dark:text-slate-300"
                        >
                          {criteriaShortLabels[key]}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courseFeedback.map((item: CourseAndAvgFeedback, index) => (
                      <TableRow
                        key={item.courseName}
                        className="border-orange-200/30 dark:border-orange-700/20 hover:bg-orange-50/30 dark:hover:bg-orange-900/10 transition-colors duration-150"
                      >
                        <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                          {item.courseName}
                        </TableCell>
                        {criteriaOrder.map((key) => (
                          <TableCell key={String(key)} className="text-center">
                            <div className="flex flex-col items-center space-y-1">
                              <ClientStarRatingDisplay
                                rating={item.avgFeedback[key] || 0}
                                size={4}
                              />
                              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                ({(item.avgFeedback[key] || 0).toFixed(1)}/5)
                              </span>
                            </div>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <BookTextIcon className="h-12 w-12 text-orange-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400 text-lg">
                  {hasActiveFilter
                    ? `Không có dữ liệu khóa học cho ${getFilterDisplayLabel().toLowerCase()}`
                    : "Không có dữ liệu khóa học để hiển thị"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl shadow-orange-500/10">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-bold text-slate-900 dark:text-slate-100">
              <Activity className="mr-3 h-6 w-6 text-orange-500" />
              Hiệu quả Đào tạo Theo Phòng ban
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-300">
              Thống kê tham gia và hiệu quả đào tạo của các phòng ban hàng đầu
              {hasActiveFilter && ` • ${getFilterDisplayLabel()}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingTopDepartments ? (
              <div className="flex h-40 w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : topDepartmentsError ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 rounded-full mb-4 shadow-lg shadow-red-500/20">
                  <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Không thể tải dữ liệu phòng ban
                </h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
                  Hệ thống đang gặp sự cố tạm thời. Vui lòng thử lại sau.
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  size="sm"
                  className="text-orange-600 border-orange-300 hover:bg-orange-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Thử lại
                </Button>
              </div>
            ) : topDepartments && topDepartments.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold">Phòng ban</TableHead>
                      <TableHead className="text-center font-semibold">
                        Số người tham gia
                      </TableHead>
                      <TableHead className="text-center font-semibold">
                        Tổng số người
                      </TableHead>
                      <TableHead className="text-center font-semibold">
                        Tỷ lệ tham gia
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topDepartments.map((dept, index) => (
                      <TableRow key={dept.departmentName || index}>
                        <TableCell className="font-medium">
                          {dept.departmentName}
                        </TableCell>
                        <TableCell className="text-center">
                          {dept.numberOfUsersParticipated}
                        </TableCell>
                        <TableCell className="text-center">
                          {dept.totalUsers}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="text-sm font-medium">
                              {(dept.participationRate * 100).toFixed(1)}%
                            </div>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${dept.participationRate * 100}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-full mb-4 shadow-lg shadow-orange-500/20">
                  <Building2 className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Chưa có dữ liệu
                </h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Không có dữ liệu thống kê phòng ban để hiển thị.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        {/* Additional Charts */}
        <ApiDataCharts
          // studentsData={studentsData}
          courseFeedback={courseFeedback}
          overallFeedback={overallFeedback}
        />
      </div>
    </div>
  );
}
