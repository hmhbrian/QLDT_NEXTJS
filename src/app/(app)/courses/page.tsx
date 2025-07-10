
"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
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
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import type { Course } from "@/lib/types/course.types";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import { isRegistrationOpen } from "@/lib/helpers";
import { useCourses, useUpdateCourse } from "@/hooks/use-courses";
import { useError } from "@/hooks/use-error";
import { useDebounce } from "@/hooks/use-debounce";
import type { PaginationState } from "@tanstack/react-table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


export default function CoursesPage() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const { showError } = useError();

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 8,
  });

  const {
    courses,
    paginationInfo,
    isLoading: isFetchingCourses,
    error: coursesError,
    reloadCourses: fetchCourses,
  } = useCourses({
    keyword: debouncedSearchTerm,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    isPublic: true,
  });
  
  const pageCount = paginationInfo?.totalPages ?? 0;

  const updateCourseMutation = useUpdateCourse();

  const handleEnroll = useCallback(
    (courseId: string) => {
      if (!currentUser) {
        showError("AUTH002");
        router.push("/login");
        return;
      }
      const courseToEnroll = courses.find((c) => c.id === courseId);
      if (!courseToEnroll) return;

      const updatedEnrolledTrainees = [
        ...(courseToEnroll.enrolledTrainees || []),
        currentUser.id,
      ];

      updateCourseMutation.mutate(
        {
          courseId,
          payload: { TraineeIds: updatedEnrolledTrainees },
        },
        {
          onSuccess: (response) => {
            router.push(`/courses/${courseId}`);
          },
        }
      );
    },
    [currentUser, courses, router, showError, updateCourseMutation]
  );

  const columns = useMemo(
    () =>
      getColumns(currentUser?.id, handleEnroll, (id) =>
        router.push(`/courses/${id}`)
      ),
    [currentUser?.id, router, handleEnroll]
  );

  if (isFetchingCourses && courses.length === 0) {
    return (
      <div className="flex h-60 w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">
          Đang tải danh sách khóa học...
        </p>
      </div>
    );
  }

  if (coursesError) {
    return (
      <div className="flex flex-col items-center justify-center h-60 w-full text-red-500">
        <XCircle className="h-10 w-10 mb-3" />
        <p className="text-lg font-semibold">Lỗi tải khóa học:</p>
        <p className="text-sm text-muted-foreground">{coursesError.message}</p>
        <Button onClick={() => fetchCourses()} className="mt-4">
          Thử lại
        </Button>
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

      {viewMode === "card" ? (
        <>
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col"
            >
              <div
                className="relative h-48 w-full cursor-pointer"
                onClick={() => router.push(`/courses/${course.id}`)}
              >
                {course.image.endsWith(".pdf") ? (
                  <div className="h-full w-full flex items-center justify-center bg-gray-100">
                    <BookOpen className="h-12 w-12 text-gray-400" />
                    <span className="ml-2 text-gray-600">PDF Document</span>
                  </div>
                ) : (
                  <NextImage
                    src={course.image}
                    alt={course.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
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
                  Thời lượng: {course.duration.sessions} buổi (
                  {course.duration.hoursPerSession}h/buổi)
                </p>
                {course.enrollmentType === "optional" &&
                  course.registrationDeadline && (
                    <div className="text-xs text-muted-foreground mt-1 flex items-center">
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
                    </div>
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
        {courses.length === 0 && !isFetchingCourses ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-xl font-semibold">
              Không tìm thấy khóa học nào
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Vui lòng thử lại với từ khóa khác.
            </p>
          </div>
        ) : (
          pageCount > 1 && (
            <div className="flex items-center justify-between pt-6">
              <div className="flex-1 text-sm text-muted-foreground">
                Hiển thị {courses.length} trên {paginationInfo?.totalItems ?? 0}{" "}
                khóa học.
              </div>
              <div className="flex items-center space-x-6 lg:space-x-8">
                 <div className="flex items-center space-x-2">
                   <p className="text-sm font-medium">Số mục mỗi trang</p>
                   <Select
                     value={`${pagination.pageSize}`}
                     onValueChange={(value) => {
                       setPagination(p => ({...p, pageSize: Number(value), pageIndex: 0 }));
                     }}
                   >
                     <SelectTrigger className="h-8 w-[70px]">
                       <SelectValue placeholder={pagination.pageSize} />
                     </SelectTrigger>
                     <SelectContent side="top">
                       {[8, 12, 16, 20].map((pageSize) => (
                         <SelectItem key={pageSize} value={`${pageSize}`}>
                           {pageSize}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>
                 <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                   Trang {pagination.pageIndex + 1} của {pageCount}
                 </div>
                 <div className="flex items-center space-x-2">
                   <Button
                     variant="outline"
                     className="h-8 w-8 p-0"
                     onClick={() => setPagination(p => ({...p, pageIndex: p.pageIndex - 1}))}
                     disabled={pagination.pageIndex === 0}
                   >
                     <span className="sr-only">Trang trước</span>
                     <ChevronLeft className="h-4 w-4" />
                   </Button>
                   <Button
                     variant="outline"
                     className="h-8 w-8 p-0"
                     onClick={() => setPagination(p => ({...p, pageIndex: p.pageIndex + 1}))}
                     disabled={pagination.pageIndex + 1 >= pageCount}
                   >
                     <span className="sr-only">Trang sau</span>
                     <ChevronRight className="h-4 w-4" />
                   </Button>
                 </div>
              </div>
            </div>
          )
        )}
        </>
      ) : (
        <DataTable 
          columns={columns} 
          data={courses}
          isLoading={isFetchingCourses}
          pageCount={pageCount}
          pagination={pagination}
          onPaginationChange={setPagination}
        />
      )}
    </div>
  );
}
