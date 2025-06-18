"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart as LineChartIcon,
  Users,
  BookOpen,
  Download,
} from "lucide-react";
import dynamic from "next/dynamic";

const ProgressCharts = dynamic(
  () =>
    import("@/components/hr/ProgressCharts").then((mod) => mod.ProgressCharts),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] w-full flex items-center justify-center">
        <p>Đang tải biểu đồ...</p>
      </div>
    ),
  }
);

export default function ProgressPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tiến độ Học tập</h2>
          <p className="text-muted-foreground">
            Theo dõi tiến độ học tập của nhân viên
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Chọn phòng ban" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả phòng ban</SelectItem>
              <SelectItem value="it">Công nghệ thông tin</SelectItem>
              <SelectItem value="hr">Nhân sự</SelectItem>
              <SelectItem value="sales">Kinh doanh</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Học viên Đang học
            </CardTitle>
            <CardDescription>
              Tổng số học viên đang tham gia khóa học
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">140</div>
            <p className="text-xs text-muted-foreground">
              +12% so với tháng trước
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Khóa học Hoàn thành
            </CardTitle>
            <CardDescription>
              Số khóa học đã hoàn thành trong tháng
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">90</div>
            <p className="text-xs text-muted-foreground">
              +5% so với tháng trước
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChartIcon className="h-5 w-5" />
              Tỷ lệ Hoàn thành
            </CardTitle>
            <CardDescription>
              Tỷ lệ hoàn thành khóa học trung bình
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">
              +3% so với tháng trước
            </p>
          </CardContent>
        </Card>
      </div>

      <ProgressCharts />
    </div>
  );
}
