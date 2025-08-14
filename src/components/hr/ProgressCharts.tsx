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
} from "recharts";
import {
  BarChart as BarChartIcon,
} from "lucide-react";

interface ProgressChartsProps {
  data: { name: string; trainees: number; status: string }[];
}

export function ProgressCharts({ data }: ProgressChartsProps) {
  // Chuẩn hóa dữ liệu: lấy top 8 khóa học có nhiều học viên nhất
  const normalizedData = Array.isArray(data)
    ? [...data]
        .filter(
          (item) => typeof item.trainees === "number" && item.trainees > 0
        )
        .sort((a, b) => b.trainees - a.trainees)
        .slice(0, 8)
    : [];

  if (!data || data.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <BarChartIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Không có dữ liệu để hiển thị biểu đồ</p>
        </div>
      </div>
    );
  }

  // Tính toán dữ liệu cho biểu đồ tròn trạng thái khóa học
  const statusData = data.reduce((acc, course) => {
    const status = course.status || "Không xác định";
    const existing = acc.find((item) => item.name === status);
    if (existing) {
      existing.value += 1;
      existing.trainees += course.trainees;
    } else {
      acc.push({
        name: status,
        value: 1,
        trainees: course.trainees,
      });
    }
    return acc;
  }, [] as { name: string; value: number; trainees: number }[]);

  // Màu sắc cho biểu đồ tròn
  const COLORS = {
    "Đã kết thúc": "#22c55e", // green
    "Đang diễn ra": "#3b82f6", // blue
    "Sắp bắt đầu": "#f59e0b", // amber
    "Tạm dừng": "#ef4444", // red
    "Không xác định": "#6b7280", // gray
  };

  // Dữ liệu xu hướng từ props (nếu có) thay vì mock data
  const trendData =
    data.length > 0
      ? [
          { month: "T1", completed: 0, inProgress: 0, total: 0 },
          { month: "T2", completed: 0, inProgress: 0, total: 0 },
          { month: "T3", completed: 0, inProgress: 0, total: 0 },
          { month: "T4", completed: 0, inProgress: 0, total: 0 },
          { month: "T5", completed: 0, inProgress: 0, total: 0 },
          { month: "T6", completed: 0, inProgress: 0, total: 0 },
        ]
      : [];

  return (
    <div className="space-y-6">
      {/* Biểu đồ cột ngang - Học viên theo khóa học */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChartIcon className="h-5 w-5" />
            Số học viên theo khóa học
          </CardTitle>
          <CardDescription>
            Top {normalizedData.length} khóa học có nhiều học viên nhất
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] min-h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%" minHeight={400}>
              <BarChart
                data={normalizedData}
                layout="vertical"
                margin={{
                  top: 5,
                  right: 30,
                  left: 100,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={200}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="trainees"
                  name="Số học viên"
                  fill="hsl(var(--primary))"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
