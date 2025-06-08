'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, GraduationCap, Users, BookOpen } from 'lucide-react';
import { CourseViewer } from '@/components/courses/CourseViewer';
import type { Course } from '@/lib/types';
import { mockCourseDetail } from '@/lib/mock';

export default function CourseDetailPage() {
  const params = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        // Sẽ thay thế bằng API thực tế sau này
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCourse(mockCourseDetail);
      } catch (error) {
        console.error('Lỗi khi tải thông tin khóa học:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchCourse();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-[200px]" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[150px]" />
            <Skeleton className="h-4 w-[300px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-xl font-semibold">Không tìm thấy khóa học</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Khóa học này không tồn tại hoặc đã bị xóa.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-headline font-semibold">{course.title}</h1>
          <p className="text-muted-foreground">{course.description}</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {course.category}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <GraduationCap className="h-4 w-4 text-muted-foreground mr-2" />
            <CardTitle className="text-sm font-medium">Giảng viên</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{course.instructor}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Clock className="h-4 w-4 text-muted-foreground mr-2" />
            <CardTitle className="text-sm font-medium">Thời lượng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{course.duration}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Users className="h-4 w-4 text-muted-foreground mr-2" />
            <CardTitle className="text-sm font-medium">Số lượng học viên</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{course.maxParticipants}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <BookOpen className="h-4 w-4 text-muted-foreground mr-2" />
            <CardTitle className="text-sm font-medium">Trạng thái</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{course.status}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="content" className="space-y-4">
        <TabsList>
          <TabsTrigger value="content">Nội dung</TabsTrigger>
          <TabsTrigger value="requirements">Yêu cầu</TabsTrigger>
          <TabsTrigger value="syllabus">Chương trình học</TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <CourseViewer course={course} />
        </TabsContent>

        <TabsContent value="requirements">
          <Card>
            <CardHeader>
              <CardTitle>Yêu cầu tiên quyết</CardTitle>
              <CardDescription>
                Những kiến thức và kỹ năng cần có trước khi tham gia khóa học
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2">
                {course.prerequisites?.map((req, index) => (
                  <li key={index} className="text-muted-foreground">{req}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="syllabus">
          <Card>
            <CardHeader>
              <CardTitle>Chương trình học</CardTitle>
              <CardDescription>
                Nội dung chi tiết của khóa học theo từng tuần
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {course.syllabus?.map((week, index) => (
                  <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                    <h3 className="font-semibold mb-2">{week.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{week.content}</p>
                    <p className="text-sm text-muted-foreground">
                      Thời lượng: {week.duration}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 