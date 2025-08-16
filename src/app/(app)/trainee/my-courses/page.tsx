"use client";

import { useMemo, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  BookOpenCheck,
  PlayCircle,
  Clock,
  CheckCircle,
  XCircle,
  BookOpen,
  FileCheck,
  User,
  Award,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useEnrolledCourses, ENROLLED_COURSES_QUERY_KEY } from "@/hooks/use-courses";
import { PaginationControls } from "@/components/ui/PaginationControls";
import type { Course } from "@/lib/types/course.types";
import { useQueryClient } from "@tanstack/react-query";

interface DisplayCourse {
  id: string;
  title: string;
  description: string;
  progress: number;
  image: string;
  status: number;
  lessonCompletedCount: number;
  totalLessonCount: number;
  testCompletedCount: number;
  totalTestCount: number;
  dataAiHint?: string;
}

export default function MyCoursesPage() {
  const { user: currentUser, loadingAuth } = useAuth();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  // Get default tab from URL params
  const defaultTab = searchParams.get("tab") || "ongoing";
  
  const { enrolledCourses, enrolledPagination, isLoadingEnrolled } = useEnrolledCourses(
    !!currentUser,
    pageIndex + 1,
    pageSize
  );

  useEffect(() => {
    const handleFocus = () => {
      if (currentUser) {
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
        status: course.enrollmentStatus || 2,
        lessonCompletedCount: course.lessonCompletedCount || 0,
        totalLessonCount: course.totalLessonCount || 0,
        testCompletedCount: course.testCompletedCount || 0,
        totalTestCount: course.totalTestCount || 0,
        dataAiHint: course.category?.categoryName || "",
      })
    );
  }, [enrolledCourses]);

  // Separate courses by status
  const ongoingCourses = myDisplayCourses.filter(course => course.status === 2);
  const passedCourses = myDisplayCourses.filter(course => course.status === 3);
  const failedCourses = myDisplayCourses.filter(course => course.status === 4);

  const totalItems = enrolledPagination?.totalItems ?? myDisplayCourses.length;
  const totalPages = enrolledPagination?.totalPages ?? Math.max(1, Math.ceil(totalItems / pageSize));
  const start = totalItems === 0 ? 0 : pageIndex * pageSize + 1;
  const end = Math.min((pageIndex + 1) * pageSize, totalItems);
  const pageItems = myDisplayCourses; // server-side đã phân trang

  // Helper function to render course card - responsive layout fixed
  const renderCourseCard = (course: DisplayCourse) => (
    <Card key={course.id} className="border border-border bg-card hover:shadow-lg transition-shadow duration-200 h-full flex flex-col rounded-lg overflow-hidden">
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={course.image}
          alt={course.title}
          className="object-cover"
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          data-ai-hint={course.dataAiHint}
        />
        
        {/* Status badge */}
        <div className="absolute top-3 right-3">
          {course.status === 3 && (
            <Badge className="bg-green-600 text-white text-xs font-medium shadow-sm">
              {/* <Award className="h-3 w-3 mr-1" /> */}
              Hoàn thành
            </Badge>
          )}
          {course.status === 4 && (
            <Badge className="bg-red-600 text-white text-xs font-medium shadow-sm">
              {/* <XCircle className="h-3 w-3 mr-1" /> */}
              Chưa đậu
            </Badge>
          )}
          {course.status === 2 && (
            <Badge className="bg-primary text-primary-foreground text-xs font-medium shadow-sm">
              {/* <Clock className="h-3 w-3 mr-1" /> */}
              Đang học
            </Badge>
          )}
        </div>
      </div>
      
      <CardContent className="flex-1 p-4 flex flex-col">
        {/* Title and description section - takes available space */}
        <div className="flex-1 space-y-2 min-h-0">
          <h3 className="font-semibold text-base text-card-foreground line-clamp-2 leading-tight">
            {course.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {course.description}
          </p>
        </div>

        {/* Bottom sections - always stick to bottom */}
        <div className="space-y-3 mt-3 flex-shrink-0">
          {/* Course metrics */}
          <div className="flex items-center justify-between gap-4 py-2.5 px-3 bg-muted/50 rounded-md border border-border">
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4 text-primary flex-shrink-0" />
              <div className="text-center">
                <div className="font-medium text-foreground">{course.lessonCompletedCount}/{course.totalLessonCount}</div>
                <div className="text-xs text-muted-foreground">bài học</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FileCheck className="h-4 w-4 text-primary flex-shrink-0" />
              <div className="text-center">
                <div className="font-medium text-foreground">{course.testCompletedCount}/{course.totalTestCount}</div>
                <div className="text-xs text-muted-foreground">bài test</div>
              </div>
            </div>
          </div>

          {/* Progress for ongoing courses */}
          {course.status === 2 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-foreground font-medium">Tiến độ học tập</span>
                <span className="font-semibold text-primary">{Math.round(course.progress)}%</span>
              </div>
              <Progress value={course.progress} className="h-2" />
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 border-t border-border">
        {course.status === 3 ? (
          <div className="w-full flex gap-2">
            <Button className="flex-1 h-10 text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-md" asChild>
              <Link href={`/courses/${course.id}`}>
                <Award className="mr-2 h-4 w-4" />
                Xem lại khóa học
              </Link>
            </Button>
            <Button className="h-10 w-10 p-0 bg-background border border-border hover:bg-muted text-muted-foreground hover:text-foreground rounded-md" asChild>
              <Link href="/trainee/profile?tab=courses-certificates">
                <User className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <Button className="w-full h-10 text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-md" asChild>
            <Link href={`/courses/${course.id}`}>
              {course.status === 4 ? (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Học lại
                </>
              ) : (
                <>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  {course.progress > 0 ? "Tiếp tục học" : "Bắt đầu học"}
                </>
              )}
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );

  const renderEmptyState = (icon: React.ReactNode, title: string, description: string) => (
    <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-xl border border-border shadow-sm">
      <div className="mb-6 text-muted-foreground">{icon}</div>
      <h3 className="text-xl font-semibold text-card-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground max-w-md leading-relaxed">{description}</p>
    </div>
  );

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="space-y-6">
            {/* Header skeleton */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <div className="h-8 w-64 bg-muted rounded-lg animate-pulse"></div>
                <div className="h-4 w-96 bg-muted rounded-lg animate-pulse"></div>
              </div>
              <div className="h-11 w-80 bg-muted rounded-lg animate-pulse"></div>
            </div>
            
            {/* Content skeleton */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="border border-border bg-card rounded-lg overflow-hidden h-full flex flex-col">
                  <div className="h-48 w-full bg-muted animate-pulse"></div>
                  <CardContent className="flex-1 p-4 flex flex-col">
                    <div className="flex-1 space-y-3">
                      <div className="space-y-2">
                        <div className="h-5 w-3/4 bg-muted rounded animate-pulse"></div>
                        <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
                        <div className="h-4 w-2/3 bg-muted rounded animate-pulse"></div>
                      </div>
                      <div className="h-16 w-full bg-muted rounded-md animate-pulse"></div>
                      <div className="h-2 w-full bg-muted rounded-full animate-pulse"></div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 border-t border-border">
                    <div className="h-10 w-full bg-muted rounded-md animate-pulse"></div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoadingEnrolled && !enrolledCourses.length) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-foreground">
                  Khóa học của tôi
                </h1>
                <p className="text-base text-muted-foreground">
                  Theo dõi tiến độ và quản lý các khóa học bạn đã đăng ký
                </p>
              </div>
              <div className="h-11 w-80 bg-muted rounded-lg animate-pulse"></div>
            </div>
            
            {/* Content skeleton */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="border border-border bg-card rounded-lg overflow-hidden h-full flex flex-col">
                  <div className="h-48 w-full bg-muted animate-pulse"></div>
                  <CardContent className="flex-1 p-4 flex flex-col">
                    <div className="flex-1 space-y-3">
                      <div className="space-y-2">
                        <div className="h-5 w-3/4 bg-muted rounded animate-pulse"></div>
                        <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
                        <div className="h-4 w-2/3 bg-muted rounded animate-pulse"></div>
                      </div>
                      <div className="h-16 w-full bg-muted rounded-md animate-pulse"></div>
                      <div className="h-2 w-full bg-muted rounded-full animate-pulse"></div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 border-t border-border">
                    <div className="h-10 w-full bg-muted rounded-md animate-pulse"></div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {totalItems > 0 ? (
          <Tabs defaultValue={defaultTab} className="space-y-6">
            {/* Header with tabs */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-foreground">
                  Khóa học của tôi
                </h1>
                <p className="text-base text-muted-foreground">
                  Theo dõi tiến độ và quản lý các khóa học bạn đã đăng ký
                </p>
              </div>

              {/* Tabs - professional design */}
              <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3 h-auto bg-background/80 backdrop-blur-md border border-border p-1.5 rounded-xl shadow-lg">
                <TabsTrigger 
                  value="ongoing" 
                  className="inline-flex items-center justify-center gap-2 text-sm px-4 py-3 font-medium text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:bg-white rounded-lg transition-all duration-200 whitespace-nowrap min-w-0 flex-1"
                >
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Đang học</span>
                  <span className="sm:hidden">Học</span>
                  <span className="ml-1 font-semibold">({ongoingCourses.length})</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="passed" 
                  className="inline-flex items-center justify-center gap-2 text-sm px-4 py-3 font-medium text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:bg-white rounded-lg transition-all duration-200 whitespace-nowrap min-w-0 flex-1"
                >
                  <Award className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Đã đậu</span>
                  <span className="sm:hidden">Đậu</span>
                  <span className="ml-1 font-semibold">({passedCourses.length})</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="failed" 
                  className="inline-flex items-center justify-center gap-2 text-sm px-4 py-3 font-medium text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:bg-white rounded-lg transition-all duration-200 whitespace-nowrap min-w-0 flex-1"
                >
                  <XCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Chưa đậu</span>
                  <span className="sm:hidden">Rớt</span>
                  <span className="ml-1 font-semibold">({failedCourses.length})</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="ongoing" className="mt-6">
              {ongoingCourses.length > 0 ? (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {ongoingCourses.map(renderCourseCard)}
                </div>
              ) : (
                renderEmptyState(
                  <Clock className="h-16 w-16" />,
                  "Không có khóa học đang học",
                  "Bạn chưa có khóa học nào đang trong quá trình học. Hãy khám phá và đăng ký các khóa học mới."
                )
              )}
            </TabsContent>

            <TabsContent value="passed" className="mt-6">
              {passedCourses.length > 0 ? (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {passedCourses.map(renderCourseCard)}
                </div>
              ) : (
                renderEmptyState(
                  <Award className="h-16 w-16" />,
                  "Chưa có khóa học nào đậu",
                  "Hãy hoàn thành các khóa học đang học để nhận được chứng chỉ hoàn thành."
                )
              )}
            </TabsContent>

            <TabsContent value="failed" className="mt-6">
              {failedCourses.length > 0 ? (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {failedCourses.map(renderCourseCard)}
                </div>
              ) : (
                renderEmptyState(
                  <CheckCircle className="h-16 w-16" />,
                  "Không có khóa học cần học lại",
                  "Tuyệt vời! Bạn đã hoàn thành tất cả các khóa học đã đăng ký."
                )
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center bg-background/80 backdrop-blur-md rounded-lg border border-border shadow-sm">
            <GraduationCap className="h-16 w-16 sm:h-20 sm:w-20 text-muted-foreground mb-4 sm:mb-6" />
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3">
              Bạn chưa đăng ký khóa học nào
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-md px-4">
              Hãy khám phá các khóa học công khai và bắt đầu hành trình học tập của bạn!
            </p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 sm:h-12 px-6 sm:px-8 rounded-lg text-sm sm:text-base">
              <Link href="/courses">
                <GraduationCap className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Khám phá khóa học
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
