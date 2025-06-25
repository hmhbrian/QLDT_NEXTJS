
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  CalendarClock,
  LayoutGrid,
  List,
  Loader2,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useCookie } from "@/hooks/use-cookie";
import { mockPublicCourses } from "@/lib/mock";
import { categoryOptions } from "@/lib/constants";
import { useCourseStore } from "@/stores/course-store";
import type { PublicCourse } from "@/lib/types";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import { isRegistrationOpen } from "@/lib/helpers";

const PUBLIC_COURSES_COOKIE_KEY = "becamex-public-courses-data";

export default function CoursesPage() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const { courses: allCoursesFromStore } = useCourseStore();
  const [publicCoursesFromCookie, setPublicCoursesInCookie] = useCookie<
    PublicCourse[]
  >(PUBLIC_COURSES_COOKIE_KEY, mockPublicCourses);

  const [courses, setCourses] = useState<PublicCourse[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const publicCourses = mockPublicCourses.length > 0 ? mockPublicCourses : [];

    if (allCoursesFromStore.length > 0) {
      const publicCoursesFromAll = allCoursesFromStore
        .filter((course) => course.isPublic && course.status === "published")
        .map((course) => ({
          id: course.id,
          title: course.title,
          description: course.description,
          category:
            (categoryOptions.find((c) => c.value === course.category)
              ?.label as PublicCourse["category"]) || "Lập trình",
          instructor: course.instructor,
          duration: `${course.duration.sessions} buổi (${course.duration.hoursPerSession}h/buổi)`,
          image: course.image,
          dataAiHint: course.category,
          enrollmentType: course.enrollmentType,
          registrationDeadline: course.registrationDeadline,
          isPublic: course.isPublic,
          enrolledTrainees: course.enrolledTrainees,
        }));
      if (publicCoursesFromAll.length > 0) {
        setCourses(publicCoursesFromAll);
        const currentCookieValue = JSON.stringify(publicCoursesFromCookie);
        const newValue = JSON.stringify(publicCoursesFromAll);
        if (currentCookieValue !== newValue) {
          setPublicCoursesInCookie(publicCoursesFromAll);
        }
      } else {
        setCourses(publicCourses);
      }
    } else {
      setCourses(publicCourses);
    }
    setIsLoading(false);
  }, [allCoursesFromStore, publicCoursesFromCookie, setPublicCoursesInCookie]);

  const filteredCourses = useMemo(
    () =>
      courses.filter(
        (course) =>
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (course.category &&
            course.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
          course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [courses, searchTerm]
  );

  const handleEnroll = useCallback(
    (courseId: string) => {
      if (!currentUser) {
        toast({
          title: "Chưa đăng nhập",
          description: "Vui lòng đăng nhập để đăng ký khóa học.",
          variant: "destructive",
        });
        router.push("/login");
        return;
      }
      const courseToEnroll = courses.find((c) => c.id === courseId);
      if (!courseToEnroll) return;
      const courseInStore = allCoursesFromStore.find((c) => c.id === courseId);
      if (!courseInStore) return;
      if (courseInStore.enrolledTrainees?.includes(currentUser.id)) {
        toast({
          title: "Đã đăng ký",
          description: `Bạn đã đăng ký khóa học "${courseToEnroll.title}" trước đó.`,
          variant: "default",
        });
        router.push(`/courses/${courseId}`);
        return;
      }
      const updatedEnrolledTrainees = [
        ...(courseInStore.enrolledTrainees || []),
        currentUser.id,
      ];
      useCourseStore.getState().updateCourse(courseId, {
        enrolledTrainees: updatedEnrolledTrainees,
      });
      toast({
        title: "Đăng ký thành công",
        description: `Bạn đã đăng ký khóa học "${courseToEnroll.title}" thành công.`,
        duration: 3000,
        variant: "success",
      });
      router.push(`/courses/${courseId}`);
    },
    [currentUser, allCoursesFromStore, courses, router, toast]
  );

  const columns = useMemo(
    () =>
      getColumns(currentUser?.id, handleEnroll, (id) =>
        router.push(`/courses/${id}`)
      ),
    [currentUser?.id, router, handleEnroll]
  );

  if (isLoading) {
    return (
      <div className="flex h-60 w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">
          Đang tải danh sách khóa học...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-headline font-semibold">
          Khóa học Công khai
        </h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
            <Input
              placeholder="Tìm kiếm khóa học..."
              className="pl-10 w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("table")}
            aria-label="Table view"
          >
            <List className="h-5 w-5" />
          </Button>
          <Button
            variant={viewMode === "card" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("card")}
            aria-label="Card view"
          >
            <LayoutGrid className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {filteredCourses.length > 0 ? (
        viewMode === "card" ? (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCourses.map((course) => (
              <Card
                key={course.id}
                className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col"
              >
                <div className="relative h-48 w-full">
                  {course.image.endsWith(".pdf") ? (
                    <div className="h-full w-full flex items-center justify-center bg-gray-100">
                      <BookOpen className="h-12 w-12 text-gray-400" />
                      <span className="ml-2 text-gray-600">PDF Document</span>
                    </div>
                  ) : (
                    <NextImage
                      src={course.image}
                      alt={course.title}
                      layout="fill"
                      objectFit="cover"
                      data-ai-hint={course.dataAiHint || "course image"}
                    />
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="font-headline text-xl">
                    {course.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {course.category}
                    </Badge>
                    <Badge
                      variant={
                        course.enrollmentType === "mandatory"
                          ? "default"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {course.enrollmentType === "mandatory"
                        ? "Bắt buộc"
                        : "Tùy chọn"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-3">
                    {course.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Giảng viên: {course.instructor}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Thời lượng: {course.duration}
                  </p>
                  {course.enrollmentType === "optional" &&
                    course.registrationDeadline && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center">
                        <CalendarClock className="mr-1.5 h-3 w-3" />
                        Hạn đăng ký:{" "}
                        {new Date(
                          course.registrationDeadline
                        ).toLocaleDateString("vi-VN")}
                        {!isRegistrationOpen(course.registrationDeadline) && (
                          <Badge variant="destructive" className="ml-2 text-xs">
                            Hết hạn
                          </Badge>
                        )}
                      </p>
                    )}
                </CardContent>
                <CardFooter className="border-t mt-auto pt-4 flex flex-col sm:flex-row gap-2">
                  {currentUser?.role === "HOCVIEN" &&
                  course.enrollmentType === "optional" &&
                  !course.enrolledTrainees?.includes(currentUser?.id || "") ? (
                    isRegistrationOpen(course.registrationDeadline) ? (
                      <Button
                        className="w-full"
                        onClick={() => handleEnroll(course.id)}
                      >
                        Đăng ký
                      </Button>
                    ) : (
                      <Button variant="outline" disabled className="w-full">
                        Hết hạn đăng ký
                      </Button>
                    )
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push(`/courses/${course.id}`)}
                    >
                      Xem chi tiết
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <DataTable columns={columns} data={filteredCourses} />
        )
      ) : (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-xl font-semibold">
            Không có khóa học công khai nào
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Vui lòng kiểm tra lại sau.
          </p>
        </div>
      )}
    </div>
  );
}
