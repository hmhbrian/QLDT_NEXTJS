'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, BookOpenCheck, PlayCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const mockMyCourses = [
  { id: '1', title: 'JavaScript Nâng cao', description: 'Nắm vững các tính năng JS hiện đại.', progress: 75, image: 'https://placehold.co/600x400.png', dataAiHint: 'laptop code', nextLesson: 'Tìm hiểu sâu về Async/Await' },
  { id: '2', title: 'Nguyên tắc Thiết kế UI/UX', description: 'Học cách tạo giao diện trực quan.', progress: 40, image: 'https://placehold.co/600x400.png', dataAiHint: 'mobile design', nextLesson: 'Tạo Persona Người dùng' },
  { id: '3', title: 'Chiến lược Tiếp thị Kỹ thuật số', description: 'Phát triển chiến lược trực tuyến hiệu quả.', progress: 100, image: 'https://placehold.co/600x400.png', dataAiHint: 'social media analytics', nextLesson: 'Khóa học đã hoàn thành' },
];

export default function MyCoursesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-headline font-semibold">Khóa học của tôi</h1>
      <p className="text-muted-foreground">
        Tiếp tục hành trình học tập của bạn. Đây là các khóa học bạn hiện đang đăng ký.
      </p>
      
      {mockMyCourses.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockMyCourses.map(course => (
            <Card key={course.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <div className="relative h-40 w-full">
                <Image 
                  src={course.image} 
                  alt={course.title} 
                  layout="fill" 
                  objectFit="cover" 
                  data-ai-hint={course.dataAiHint}
                />
              </div>
              <CardHeader>
                <CardTitle className="font-headline text-xl">{course.title}</CardTitle>
                <CardDescription className="line-clamp-2">{course.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-3">
                <div>
                  <div className="flex justify-between text-sm text-muted-foreground mb-1">
                    <span>Tiến độ</span>
                    <span>{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} aria-label={`Tiến độ ${course.title} ${course.progress}%`} />
                </div>
                {course.progress < 100 && (
                  <p className="text-xs text-muted-foreground">
                    Bài tiếp theo: <span className="font-medium text-foreground">{course.nextLesson}</span>
                  </p>
                )}
                 {course.progress === 100 && (
                  <p className="text-xs font-medium text-green-600 flex items-center">
                    <BookOpenCheck className="mr-1 h-4 w-4" /> {course.nextLesson}!
                  </p>
                )}
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={course.progress === 100 ? "outline" : "default"}>
                  {course.progress === 100 ? (
                     <>Xem lại Khóa học</>
                  ) : (
                    <><PlayCircle className="mr-2 h-5 w-5" /> Tiếp tục Học</>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12 shadow-md">
          <CardContent className="flex flex-col items-center">
            <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold">Chưa đăng ký Khóa học nào</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Khám phá các khóa học có sẵn và bắt đầu hành trình học tập của bạn ngay hôm nay!
            </p>
            <Button className="mt-6" asChild>
              <Link href="/courses">Duyệt Khóa học</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
