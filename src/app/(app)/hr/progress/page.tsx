'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart as LineChartIcon, Users, BookOpen, Filter, Download } from "lucide-react"; // Renamed to avoid conflict
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { mockProgressData, mockCourseCompletion } from '@/lib/mock';

export default function ProgressPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tiến độ Học tập</h2>
          <p className="text-muted-foreground">Theo dõi tiến độ học tập của nhân viên</p>
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
            <CardDescription>Tổng số học viên đang tham gia khóa học</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">140</div>
            <p className="text-xs text-muted-foreground">+12% so với tháng trước</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Khóa học Hoàn thành
            </CardTitle>
            <CardDescription>Số khóa học đã hoàn thành trong tháng</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">90</div>
            <p className="text-xs text-muted-foreground">+5% so với tháng trước</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChartIcon className="h-5 w-5" />
              Tỷ lệ Hoàn thành
            </CardTitle>
            <CardDescription>Tỷ lệ hoàn thành khóa học trung bình</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">+3% so với tháng trước</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tiến độ Theo Tháng</CardTitle>
            <CardDescription>Số lượng học viên đăng ký và hoàn thành khóa học</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockProgressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="enrolled" name="Đăng ký" fill="#93c5fd" />
                  <Bar dataKey="completed" name="Hoàn thành" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tỷ lệ Hoàn thành Theo Khóa học</CardTitle>
            <CardDescription>Phần trăm học viên hoàn thành từng khóa học</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockCourseCompletion} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="completion" name="Tỷ lệ hoàn thành" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
