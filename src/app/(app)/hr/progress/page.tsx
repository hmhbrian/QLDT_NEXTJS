'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart as LineChartIcon, Users, BookOpen, Filter, Download } from "lucide-react"; // Renamed to avoid conflict
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const mockProgressData = [
  { name: 'Thg 1', completed: 65, enrolled: 100 },
  { name: 'Thg 2', completed: 70, enrolled: 110 },
  { name: 'Thg 3', completed: 80, enrolled: 120 },
  { name: 'Thg 4', completed: 75, enrolled: 115 },
  { name: 'Thg 5', completed: 85, enrolled: 130 },
  { name: 'Thg 6', completed: 90, enrolled: 140 },
];

const mockCourseCompletion = [
    { name: 'JS Nâng cao', completion: 85 },
    { name: 'QLDA Cơ bản', completion: 70 },
    { name: 'Thiết kế UI/UX', completion: 92 },
    { name: 'Marketing Số', completion: 60 },
];

export default function ProgressPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-headline font-semibold">Tiến độ Học tập</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Select>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Lọc theo Khóa học" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả Khóa học</SelectItem>
              <SelectItem value="js">JS Nâng cao</SelectItem>
              <SelectItem value="pm">QLDA Cơ bản</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="w-full sm:w-auto">
            <Filter className="mr-2 h-4 w-4" /> Áp dụng Bộ lọc
          </Button>
          <Button className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" /> Xuất Báo cáo
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ Hoàn thành Tổng thể</CardTitle>
            <LineChartIcon className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">+5% so với tháng trước</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Học viên đang học</CardTitle>
            <Users className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">112</div>
            <p className="text-xs text-muted-foreground">Đang theo học các khóa học</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Khóa học đang diễn ra</CardTitle>
            <BookOpen className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">Tổng số khóa học đang hoạt động</p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-lg md:text-xl">Ghi danh vs Hoàn thành hàng tháng</CardTitle>
          <CardDescription>Theo dõi xu hướng ghi danh và hoàn thành khóa học theo thời gian.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] md:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockProgressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)'}}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend />
              <Bar dataKey="enrolled" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Ghi danh" />
              <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Hoàn thành" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-lg md:text-xl">Tỷ lệ Hoàn thành Khóa học</CardTitle>
          <CardDescription>Phần trăm học viên đã ghi danh hoàn thành các khóa học cụ thể.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] md:h-[350px]">
           <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockCourseCompletion} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} unit="%"/>
              <YAxis dataKey="name" type="category" width={100} dx={-5} style={{ fontSize: '0.8rem' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)'}}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => `${value}%`}
              />
              <Legend />
              <Bar dataKey="completion" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} name="Hoàn thành %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
