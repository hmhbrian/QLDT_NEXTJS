'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, Settings, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';

const stats = [
  { title: 'Tổng số người dùng', value: '150', icon: Users, color: 'text-blue-500', link: '/admin/users', linkText: 'Quản lý Người dùng' },
  { title: 'Khóa học đang hoạt động', value: '25', icon: BookOpen, color: 'text-green-500', link: '/courses', linkText: 'Xem Khóa học' },
  { title: 'Chờ duyệt', value: '5', icon: Settings, color: 'text-yellow-500', link: '#', linkText: 'Xem xét Phê duyệt' },
];

export function AdminDashboard() {
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
          <CardTitle className="font-headline">Hoạt động gần đây</CardTitle>
          <CardDescription>Tổng quan về các hoạt động và nhật ký hệ thống gần đây.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-md text-center p-4">
            <BarChart3 className="h-12 w-12 text-muted-foreground" />
            <p className="ml-0 md:ml-4 mt-2 md:mt-0 text-muted-foreground">Biểu đồ hoạt động sẽ được hiển thị ở đây.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
