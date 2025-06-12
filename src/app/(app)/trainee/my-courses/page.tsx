'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, BookOpenCheck, PlayCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from '@/hooks/useAuth';
import { useCookie } from '@/hooks/use-cookie';
import { useCourseStore } from '@/stores/course-store';
import { mockMyCourses } from '@/lib/mock';

const MY_COURSES_COOKIE_KEY = 'becamex-my-courses-data';

interface DisplayCourse {
  id: string;
  title: string;
  description: string;
  progress: number;
  image: string;
  dataAiHint?: string;
  nextLesson?: string;
}

export default function MyCoursesPage() {
  const { user: currentUser, loadingAuth } = useAuth();
  // Get courses from the course store
  const { courses: allCoursesFromStore } = useCourseStore();
  
  // Get my courses progress data from cookie
  const [myCoursesFromCookie, setMyCoursesInCookie] = useCookie<DisplayCourse[]>(MY_COURSES_COOKIE_KEY, mockMyCourses);
  
  const [myDisplayCourses, setMyDisplayCourses] = useState<DisplayCourse[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  useEffect(() => {
    if (!loadingAuth) {
      setIsLoadingCourses(true);
      
      // Find enrolled courses from store for the current user
      const enrolledCourses = currentUser ? allCoursesFromStore.filter(
        course => course.enrolledTrainees?.includes(currentUser.id)
      ) : [];
      
      // Create a Map to store courses based on ID
      const courseMap = new Map<string, DisplayCourse>();
      
      // Prioritize existing courses from cookie
      if (myCoursesFromCookie.length > 0) {
        myCoursesFromCookie.forEach(course => {
          courseMap.set(course.id, course);
        });
      }
      
      // Add enrolled courses from store
      enrolledCourses.forEach(course => {
        // If course already exists in map, just update the basic information
        const existingProgress = courseMap.has(course.id) ? courseMap.get(course.id)!.progress : 0;
        
        courseMap.set(course.id, {
          id: course.id,
          title: course.title,
          description: course.description,
          progress: existingProgress,
          image: course.image,
          dataAiHint: course.category,
          nextLesson: course.lessons && course.lessons.length > 0 ? course.lessons[0].title : undefined
        });
      });
      
      // Add mock courses if no courses exist and mockMyCourses has data
      if (courseMap.size === 0 && mockMyCourses.length > 0) {
        mockMyCourses.forEach(course => {
          courseMap.set(course.id, course);
        });
      }
      
      // Convert Map to array
      const combinedCourses = Array.from(courseMap.values());
      
      // Update state
      setMyDisplayCourses(combinedCourses);
      
      // Save to cookie only if there are changes
      const currentCookieJSON = JSON.stringify(myCoursesFromCookie);
      const newCoursesJSON = JSON.stringify(combinedCourses);
      
      if (currentCookieJSON !== newCoursesJSON && combinedCourses.length > 0) {
        setMyCoursesInCookie(combinedCourses);
      }
      
      setIsLoadingCourses(false);
    }
  }, [loadingAuth, allCoursesFromStore, myCoursesFromCookie, currentUser, setMyCoursesInCookie]);

  if (loadingAuth || isLoadingCourses) {
    return (
      <div className="flex h-60 w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Đang tải danh sách khóa học của bạn...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-headline font-semibold">Khóa học của tôi</h1>
      </div>

      {myDisplayCourses.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {myDisplayCourses.map((course) => (
            <Card key={course.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="flex-none p-0">
                <div className="relative aspect-video w-full overflow-hidden">
                  <Image
                    src={course.image}
                    alt={course.title}
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    data-ai-hint={course.dataAiHint}
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-grow p-4 md:p-6">
                <CardTitle className="line-clamp-1 font-headline text-lg md:text-xl">{course.title}</CardTitle>
                <CardDescription className="line-clamp-2 mt-1.5 text-sm">{course.description}</CardDescription>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className="font-medium">Tiến độ</span>
                    <span className="font-semibold text-primary">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" aria-label={`Tiến độ ${course.progress}%`} />
                  {course.nextLesson && (
                    <p className="text-xs text-muted-foreground mt-2">
                      <span className="font-medium">Bài tiếp theo:</span> {course.nextLesson}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex-none p-4 md:p-6 pt-0 border-t">
                <div className="flex w-full items-center gap-2 md:gap-4">
                  {course.progress === 100 ? (
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
                        {course.progress > 0 ? 'Tiếp tục học' : 'Bắt đầu học'}
                      </Link>
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/30 bg-muted/20 py-16 text-center">
          <GraduationCap className="mx-auto h-16 w-16 text-muted-foreground/70 mb-4" />
          <h3 className="text-xl font-semibold text-foreground">Bạn chưa đăng ký khóa học nào</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Hãy khám phá các khóa học công khai và bắt đầu hành trình học tập của bạn!
          </p>
          <Button asChild className="mt-6">
            <Link href="/courses">Khám phá khóa học</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

