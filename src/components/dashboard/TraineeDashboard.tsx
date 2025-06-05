'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, BookMarked, Percent, CalendarClock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Progress } from '@/components/ui/progress';

const stats = [
  { title: 'Khóa học đã đăng ký', value: '3', icon: GraduationCap, color: 'text-teal-500', link: '/trainee/my-courses', linkText: 'Khóa học của tôi' },
  { title: 'Module đã hoàn thành', value: '12/20', icon: BookMarked, color: 'text-cyan-500', link: '/trainee/my-courses', linkText: 'Xem Module' },
  { title: 'Tiến độ tổng thể', value: 60, icon: Percent, color: 'text-sky-500', link: '/trainee/my-courses', linkText: 'Xem Chi tiết' },
];

export function TraineeDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              {stat.title === 'Tiến độ tổng thể' ? (
                <>
                  <div className="text-2xl md:text-3xl font-bold mb-2">{stat.value}%</div>
                  <Progress value={stat.value} className="h-2" aria-label={`Tiến độ ${stat.value}%`} />
                </>
              ) : (
                <div className="text-2xl md:text-3xl font-bold">{stat.value}</div>
              )}
               <Link href={stat.link} passHref>
                <Button variant="link" className="px-0 text-sm text-muted-foreground hover:text-primary mt-1">
                  {stat.linkText}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Lớp học sắp tới</CardTitle>
          <CardDescription>Các lớp học đã được lên lịch của bạn trong tuần này.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-md text-center p-4">
            <CalendarClock className="h-12 w-12 text-muted-foreground" />
            <p className="ml-0 md:ml-4 mt-2 md:mt-0 text-muted-foreground">Lịch học của bạn sẽ xuất hiện ở đây.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
