'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck, ClipboardList, LineChart, CalendarCheck2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';

const stats = [
  { title: 'Học viên đang hoạt động', value: '120', icon: UserCheck, color: 'text-green-500', link: '/hr/trainees', linkText: 'Quản lý Học viên' },
  { title: 'Chương trình đang diễn ra', value: '8', icon: ClipboardList, color: 'text-purple-500', link: '/training-plans', linkText: 'Xem Chương trình' },
  { title: 'Tỷ lệ Hoàn thành', value: '75%', icon: LineChart, color: 'text-pink-500', link: '/hr/progress', linkText: 'Theo dõi Tiến độ' },
];

export function HrDashboard() {
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
              <div className="text-2xl md:text-3xl font-bold">{stat.value}</div>
               <Link href={stat.link} passHref>
                <Button variant="link" className="px-0 text-sm text-muted-foreground hover:text-primary">
                  {stat.linkText}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Buổi học sắp tới</CardTitle>
          <CardDescription>Lịch các buổi học cho tuần tới.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-md text-center p-4">
            <CalendarCheck2 className="h-12 w-12 text-muted-foreground" />
            <p className="ml-0 md:ml-4 mt-2 md:mt-0 text-muted-foreground">Lịch các buổi học sắp tới sẽ được hiển thị ở đây.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
