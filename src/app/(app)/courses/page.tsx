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
  Eye,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import type { Course } from "@/lib/types/course.types";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import { isRegistrationOpen } from "@/lib/helpers";
import { useCourses, useEnrollCourse } from "@/hooks/use-courses";
import { useError } from "@/hooks/use-error";
import { useDebounce } from "@/hooks/use-debounce";
import type { PaginationState } from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingButton } from "@/components/ui/loading";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function CoursesPage() {
  const { user: currentUser } = useAuth();
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
    courses: publicCourses,
    paginationInfo,
    isLoading: isFetchingCourses,
    error: coursesError,
    reloadCourses: fetchCourses,
  } = useCourses({
    keyword: debouncedSearchTerm,
    Page: pagination.pageIndex + 1,
    Limit: pagination.pageSize,
    publicOnly: true,
  });

  const pageCount = paginationInfo?.totalPages ?? 0;

  const enrollMutation = useEnrollCourse();

  const isCourseAccessible = useCallback(
    (course: Course): boolean => {
      if (!currentUser) return false;
      // Admins and HR can see everything
      if (currentUser.role === "ADMIN" || currentUser.role === "HR") {
        return true;
      }
      // All users can see public courses
      if (course.isPublic) {
        return true;
      }
      // Trainees can see internal courses for their department
      if (
        currentUser.department &&
        course.department?.includes(currentUser.department.departmentId)
      ) {
        return true;
      }
      return false;
    },
    [currentUser]
  );

  const handleEnroll = useCallback(
    (courseId: string) => {
      if (!currentUser) {
        showError("AUTH002");
        router.push("/login");
        return;
      }
      enrollMutation.mutate(courseId);
    },
    [currentUser, router, showError, enrollMutation]
  );

  const columns = useMemo(
    () =>
      getColumns(
        currentUser?.id,
        handleEnroll,
        (id) => router.push(`/courses/${id}`),
        (id) => enrollMutation.isPending && enrollMutation.variables === id,
        isCourseAccessible
      ),
    [
      currentUser?.id,
      router,
      handleEnroll,
      enrollMutation.isPending,
      enrollMutation.variables,
      isCourseAccessible,
    ]
  );

  if (isFetchingCourses && publicCourses.length === 0) {
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
            {publicCourses.map((course) => {
              const isEnrolled = course.userIds?.includes(
                currentUser?.id || ""
              );
              const canEnroll =
                currentUser?.role === "HOCVIEN" &&
                !isEnrolled &&
                course.enrollmentType === "optional" &&
                isRegistrationOpen(course.registrationDeadline);
              const accessible = isCourseAccessible(course);

              return (
                <Card
                  key={course.id}
                  className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col group"
                >
                  <div
                    className="relative h-48 w-full cursor-pointer overflow-hidden"
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
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        data-ai-hint="course thumbnail"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </div>
                  <CardHeader className="pt-4 pb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {course.category?.name || "Chưa phân loại"}
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
                    <CardTitle className="font-headline text-lg line-clamp-2 leading-snug">
                      {course.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow text-sm">
                    <p className="text-muted-foreground mb-3 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>
                        Giảng viên:{" "}
                        <span className="font-medium text-foreground">
                          {course.instructor}
                        </span>
                      </p>
                      <p>
                        Thời lượng: {course.duration.sessions} buổi (
                        {course.duration.hoursPerSession}h/buổi)
                      </p>
                      {course.enrollmentType === "optional" &&
                        course.registrationDeadline && (
                          <div className="flex items-center">
                            <CalendarClock className="mr-1.5 h-3 w-3" />
                            Hạn ĐK:{" "}
                            <span className="font-medium text-foreground ml-1">
                              {new Date(
                                course.registrationDeadline
                              ).toLocaleDateString("vi-VN")}
                            </span>
                            {!isRegistrationOpen(
                              course.registrationDeadline
                            ) && (
                              <Badge
                                variant="destructive"
                                className="ml-2 text-xs"
                              >
                                Hết hạn
                              </Badge>
                            )}
                          </div>
                        )}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t mt-auto p-3">
                    {canEnroll ? (
                      <LoadingButton
                        className="w-full"
                        onClick={() => handleEnroll(course.id)}
                        isLoading={
                          enrollMutation.isPending &&
                          enrollMutation.variables === course.id
                        }
                        disabled={enrollMutation.isPending}
                      >
                        {enrollMutation.isPending &&
                        enrollMutation.variables === course.id
                          ? "Đang đăng ký..."
                          : "Đăng ký"}
                      </LoadingButton>
                    ) : isEnrolled ? (
                      <Button
                        variant="default"
                        className="w-full"
                        onClick={() => router.push(`/courses/${course.id}`)}
                      >
                        <Eye className="mr-2 h-4 w-4" /> Vào học
                      </Button>
                    ) : (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() =>
                                accessible &&
                                router.push(`/courses/${course.id}`)
                              }
                              disabled={!accessible}
                            >
                              Xem chi tiết
                            </Button>
                          </TooltipTrigger>
                          {!accessible && (
                            <TooltipContent>
                              <p>
                                Khóa học này là nội bộ. Bạn không có quyền truy
                                cập.
                              </p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
          {publicCourses.length === 0 && !isFetchingCourses ? (
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
                  Hiển thị {publicCourses.length} trên{" "}
                  {paginationInfo?.totalItems ?? 0} khóa học.
                </div>
                <div className="flex items-center space-x-6 lg:space-x-8">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">Số mục mỗi trang</p>
                    <Select
                      value={`${pagination.pageSize}`}
                      onValueChange={(value) => {
                        setPagination((p) => ({
                          ...p,
                          pageSize: Number(value),
                          pageIndex: 0,
                        }));
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
                      onClick={() =>
                        setPagination((p) => ({
                          ...p,
                          pageIndex: p.pageIndex - 1,
                        }))
                      }
                      disabled={pagination.pageIndex === 0}
                    >
                      <span className="sr-only">Trang trước</span>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() =>
                        setPagination((p) => ({
                          ...p,
                          pageIndex: p.pageIndex + 1,
                        }))
                      }
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
          data={publicCourses}
          isLoading={isFetchingCourses}
          pageCount={pageCount}
          pagination={pagination}
          onPaginationChange={setPagination}
        />
      )}
    </div>
  );
}
