"use client";

import { useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  GraduationCap,
  BookOpenCheck,
  PlayCircle,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import {
  useEnrolledCourses,
  ENROLLED_COURSES_QUERY_KEY,
} from "@/hooks/use-courses";
import type { Course } from "@/lib/types/course.types";
import { useQueryClient } from "@tanstack/react-query";

interface DisplayCourse {
  id: string;
  title: string;
  description: string;
  progress: number;
  image: string;
  dataAiHint?: string;
}

export default function MyCoursesPage() {
  const { user: currentUser, loadingAuth } = useAuth();
  const queryClient = useQueryClient();
  const { enrolledCourses, isLoadingEnrolled } = useEnrolledCourses(
    !!currentUser
  );

  useEffect(() => {
    const handleFocus = () => {
      if (currentUser) {
        console.log("Tab focused, refetching enrolled courses...");
        queryClient.invalidateQueries({
          queryKey: [ENROLLED_COURSES_QUERY_KEY, currentUser.id],
        });
      }
    };
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [queryClient, currentUser]);

  const myDisplayCourses = useMemo(() => {
    return enrolledCourses.map(
      (course: Course): DisplayCourse => ({
        id: course.id,
        title: course.title,
        description: course.description,
        progress: course.progressPercentage || 0,
        image: course.image,
        dataAiHint: course.category?.categoryName || "",
      })
    );
  }, [enrolledCourses]);

  if (loadingAuth) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-video w-full bg-gray-200 animate-pulse"></div>
              <CardHeader>
                <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-2 w-full bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
              <CardFooter>
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isLoadingEnrolled && !enrolledCourses.length) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-headline font-semibold">
          Khóa học của tôi
        </h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-video w-full bg-gray-200 animate-pulse"></div>
              <CardHeader>
                <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-2 w-full bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
              <CardFooter>
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-headline font-semibold">
          Khóa học của tôi
        </h1>
      </div>

      {myDisplayCourses.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {myDisplayCourses.map((course, index) => (
            <Card
              key={course.id}
              className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group"
            >
              <CardHeader className="flex-none p-0">
                <div className="relative aspect-video w-full overflow-hidden">
                  <Image
                    src={course.image}
                    alt={course.title}
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    data-ai-hint={course.dataAiHint}
                    priority={index === 0} // Add priority to the first image
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow p-4 md:p-6">
                <CardTitle className="line-clamp-2 font-headline text-lg md:text-xl">
                  {course.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 mt-1.5 text-sm">
                  {course.description}
                </CardDescription>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className="font-medium">Tiến độ</span>
                    <span className="font-semibold text-primary">
                      {Math.round(course.progress)}%
                    </span>
                  </div>
                  <Progress
                    value={course.progress}
                    className="h-2"
                    aria-label={`Tiến độ ${course.progress}%`}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex-none p-4 md:p-6 pt-0 border-t">
                {course.progress >= 100 ? (
                  <Button className="w-full" variant="outline" asChild>
                    <Link href={`/courses/${course.id}`}>
                      <BookOpenCheck className="mr-2 h-4 w-4" />
                      Xem lại
                    </Link>
                  </Button>
                ) : (
                  <Button className="w-full" asChild>
                    <Link href={`/courses/${course.id}`}>
                      <PlayCircle className="mr-2 h-4 w-4" />
                      {course.progress > 0 ? "Tiếp tục học" : "Bắt đầu học"}
                    </Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/30 bg-muted/20 py-16 text-center">
          <GraduationCap className="mx-auto h-16 w-16 text-muted-foreground/70 mb-4" />
          <h3 className="text-xl font-semibold text-foreground">
            Bạn chưa đăng ký khóa học nào
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Hãy khám phá các khóa học công khai và bắt đầu hành trình học tập
            của bạn!
          </p>
          <Button asChild className="mt-6">
            <Link href="/courses">Khám phá khóa học</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
