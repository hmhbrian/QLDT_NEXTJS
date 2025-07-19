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
  Area,
  AreaChart,
} from "recharts";
import {
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  TrendingUp,
} from "lucide-react";

interface ProgressChartsProps {
  data: { name: string; trainees: number; status: string }[];
}

export function ProgressCharts({ data }: ProgressChartsProps) {
  console.log("📊 ProgressCharts received data:", data);

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

  // Dữ liệu xu hướng (mock data cho demo)
  const trendData = [
    { month: "T1", completed: 12, inProgress: 18, total: 30 },
    { month: "T2", completed: 15, inProgress: 20, total: 35 },
    { month: "T3", completed: 18, inProgress: 22, total: 40 },
    { month: "T4", completed: 22, inProgress: 25, total: 47 },
    { month: "T5", completed: 25, inProgress: 28, total: 53 },
    { month: "T6", completed: 28, inProgress: 30, total: 58 },
  ];

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
            Top {data.length} khóa học có nhiều học viên nhất
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
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

      <div className="grid gap-6 md:grid-cols-2">
        {/* Biểu đồ tròn - Trạng thái khóa học */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Phân bố trạng thái khóa học
            </CardTitle>
            <CardDescription>
              Tỷ lệ khóa học theo trạng thái hiện tại
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          COLORS[entry.name as keyof typeof COLORS] ||
                          COLORS["Không xác định"]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                    }}
                    formatter={(value, name) => [`${value} khóa học`, name]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Biểu đồ xu hướng */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Xu hướng hoàn thành khóa học
            </CardTitle>
            <CardDescription>
              Tiến độ hoàn thành theo thời gian (6 tháng gần nhất)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stackId="1"
                    stroke="#22c55e"
                    fill="#22c55e"
                    fillOpacity={0.6}
                    name="Đã hoàn thành"
                  />
                  <Area
                    type="monotone"
                    dataKey="inProgress"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                    name="Đang thực hiện"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
