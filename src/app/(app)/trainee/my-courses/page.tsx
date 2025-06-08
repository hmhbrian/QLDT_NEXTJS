'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, BookOpenCheck, PlayCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { mockMyCourses } from '@/lib/mock';

export default function MyCoursesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Khóa học của tôi</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockMyCourses.map((course) => (
          <Card key={course.id} className="flex flex-col">
            <CardHeader className="flex-none p-0">
              <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
                <Image
                  src={course.image}
                  alt={course.title}
                  className="object-cover"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={false}
                  data-ai-hint={course.dataAiHint}
                />
              </div>
            </CardHeader>
            <CardContent className="flex-grow p-6">
              <CardTitle className="line-clamp-1">{course.title}</CardTitle>
              <CardDescription className="line-clamp-2 mt-2.5">{course.description}</CardDescription>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Tiến độ</span>
                  <span>{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="h-2" />
              </div>
            </CardContent>
            <CardFooter className="flex-none p-6 pt-0">
              <div className="flex w-full items-center gap-4">
                {course.progress === 100 ? (
                  <Button className="w-full" variant="outline">
                    <BookOpenCheck className="mr-2 h-4 w-4" />
                    Đã hoàn thành
                  </Button>
                ) : (
                  <Button className="w-full" asChild>
                    <Link href={`/courses/${course.id}`}>
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Tiếp tục học
                    </Link>
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
