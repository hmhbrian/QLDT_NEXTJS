"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Users,
} from "lucide-react";
import {
  AvgFeedbackData,
  CourseAndAvgFeedback,
  StudentsOfCourse,
} from "@/lib/services/modern/report.service";

interface ApiDataChartsProps {
  studentsData?: StudentsOfCourse[];
  courseFeedback?: CourseAndAvgFeedback[];
  overallFeedback?: AvgFeedbackData;
}

const COLORS = {
  primary: "#3b82f6",
  secondary: "#22c55e",
  tertiary: "#f59e0b",
  quaternary: "#ef4444",
  muted: "#6b7280",
};

export function ApiDataCharts({
  studentsData,
  courseFeedback,
  overallFeedback,
}: ApiDataChartsProps) {
  if (!studentsData && !courseFeedback && !overallFeedback) {
    return (
      <div className="h-[400px] flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <BarChartIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Không có dữ liệu để hiển thị biểu đồ</p>
        </div>
      </div>
    );
  }

  // Chuẩn bị dữ liệu cho biểu đồ học viên theo khóa học
  const studentChartData =
    studentsData
      ?.filter((course) => course.totalStudent > 0)
      ?.sort((a, b) => b.totalStudent - a.totalStudent)
      ?.map((course) => ({
        name:
          course.courseName.length > 20
            ? course.courseName.substring(0, 20) + "..."
            : course.courseName,
        fullName: course.courseName,
        students: course.totalStudent,
      }))
      ?.slice(0, 8) || []; // Top 8 courses

  // Chuẩn bị dữ liệu cho biểu đồ đánh giá trung bình
  const feedbackChartData =
    courseFeedback
      ?.map((course) => ({
        name:
          course.courseName.length > 15
            ? course.courseName.substring(0, 15) + "..."
            : course.courseName,
        fullName: course.courseName,
        avgRating:
          ((course.avgFeedback.q1_relevanceAvg || 0) +
            (course.avgFeedback.q2_clarityAvg || 0) +
            (course.avgFeedback.q3_structureAvg || 0) +
            (course.avgFeedback.q4_durationAvg || 0) +
            (course.avgFeedback.q5_materialAvg || 0)) /
          5,
        q1: course.avgFeedback.q1_relevanceAvg || 0,
        q2: course.avgFeedback.q2_clarityAvg || 0,
        q3: course.avgFeedback.q3_structureAvg || 0,
        q4: course.avgFeedback.q4_durationAvg || 0,
        q5: course.avgFeedback.q5_materialAvg || 0,
      }))
      ?.slice(0, 6) || []; // Top 6 courses

  // Dữ liệu tổng quan cho biểu đồ tròn
  const overallData = overallFeedback
    ? [
        {
          name: "Phù hợp công việc",
          value: overallFeedback.q1_relevanceAvg,
          percentage: Math.round((overallFeedback.q1_relevanceAvg / 5) * 100),
        },
        {
          name: "Dễ hiểu",
          value: overallFeedback.q2_clarityAvg,
          percentage: Math.round((overallFeedback.q2_clarityAvg / 5) * 100),
        },
        {
          name: "Cấu trúc logic",
          value: overallFeedback.q3_structureAvg,
          percentage: Math.round((overallFeedback.q3_structureAvg / 5) * 100),
        },
        {
          name: "Thời lượng",
          value: overallFeedback.q4_durationAvg,
          percentage: Math.round((overallFeedback.q4_durationAvg / 5) * 100),
        },
        {
          name: "Tài liệu",
          value: overallFeedback.q5_materialAvg,
          percentage: Math.round((overallFeedback.q5_materialAvg / 5) * 100),
        },
      ]
    : [];

  const pieColors = [
    COLORS.primary,
    COLORS.secondary,
    COLORS.tertiary,
    COLORS.quaternary,
    COLORS.muted,
  ];

  return (
    <div className="space-y-6">
      {/* Biểu đồ cột - Số học viên theo khóa học */}
      {studentChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Phân bố Học viên theo Khóa học
            </CardTitle>
            <CardDescription>
              Top {studentChartData.length} khóa học có nhiều học viên tham gia
              nhất
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={studentChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [
                      `${value} học viên`,
                      "Số học viên",
                    ]}
                    labelFormatter={(label) => {
                      const item = studentChartData.find(
                        (d) => d.name === label
                      );
                      return item?.fullName || label;
                    }}
                  />
                  <Bar
                    dataKey="students"
                    fill={COLORS.primary}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Biểu đồ cột - Đánh giá trung bình theo khóa học */}
        {feedbackChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChartIcon className="h-5 w-5" />
                Điểm Đánh giá TB theo Khóa học
              </CardTitle>
              <CardDescription>
                Điểm đánh giá trung bình từ học viên
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={feedbackChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={11}
                      interval={0}
                    />
                    <YAxis domain={[0, 5]} />
                    <Tooltip
                      formatter={(value: any) => [
                        `${Number(value).toFixed(1)}/5`,
                        "Điểm TB",
                      ]}
                      labelFormatter={(label) => {
                        const item = feedbackChartData.find(
                          (d) => d.name === label
                        );
                        return item?.fullName || label;
                      }}
                    />
                    <Bar
                      dataKey="avgRating"
                      fill={COLORS.secondary}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Biểu đồ tròn - Phân bố điểm đánh giá tổng quát */}
        {overallData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                Phân bố Điểm Đánh giá Tổng quát
              </CardTitle>
              <CardDescription>
                Tỷ lệ phần trăm điểm đánh giá theo từng tiêu chí
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={overallData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="percentage"
                      label={({ name, percentage }) =>
                        `${name}: ${percentage}%`
                      }
                      labelLine={false}
                    >
                      {overallData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={pieColors[index % pieColors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name) => [
                        `${value}%`,
                        `Tỷ lệ đạt được`,
                      ]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Biểu đồ xu hướng - Mock data cho demo */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Xu hướng Hoạt động Đào tạo
          </CardTitle>
          <CardDescription>
            Xu hướng số lượng khóa học và học viên theo thời gian (dữ liệu mẫu)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={[
                  { month: "T1", courses: 5, students: 120 },
                  { month: "T2", courses: 7, students: 180 },
                  { month: "T3", courses: 6, students: 150 },
                  { month: "T4", courses: 9, students: 220 },
                  { month: "T5", courses: 8, students: 200 },
                  { month: "T6", courses: 10, students: 260 },
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="courses"
                  stackId="1"
                  stroke={COLORS.primary}
                  fill={COLORS.primary}
                  fillOpacity={0.6}
                  name="Số khóa học"
                />
                <Area
                  type="monotone"
                  dataKey="students"
                  stackId="2"
                  stroke={COLORS.secondary}
                  fill={COLORS.secondary}
                  fillOpacity={0.6}
                  name="Số học viên"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}
