"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
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
  BookOpen,
  XCircle,
  Eye,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import type { Course } from "@/lib/types/course.types";
import { DataTable } from "@/components/ui/data-table";
import { getUserCourseColumns } from "@/components/courses/columns";
import { isRegistrationOpen } from "@/lib/helpers";
import {
  useCourses,
  useEnrollCourse,
  useCancelEnrollCourse,
  useEnrolledCourses,
} from "@/hooks/use-courses";
import { useError } from "@/hooks/use-error";
import { useDebounce } from "@/hooks/use-debounce";
import type { PaginationState } from "@tanstack/react-table";
import { LoadingButton } from "@/components/ui/loading";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PaginationControls } from "@/components/ui/PaginationControls";

export default function CoursesPage() {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const { showError } = useError();

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [showExpired, setShowExpired] = useState(true);

  // Reset pagination to page 1 when search term changes
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [debouncedSearchTerm]);

  const {
    courses: publicCourses,
    paginationInfo,
    isLoading: isFetchingCourses,
    isFetching,
    isRefetching,
    error: coursesError,
  } = useCourses({
    keyword: debouncedSearchTerm,
    Page: pagination.pageIndex + 1,
    Limit: pagination.pageSize,
    publicOnly: true,
  });

  // These hooks are only needed for the admin view columns, not the user view.
  // They were causing 403 errors for non-admin users.
  // We will pass empty arrays to the columns and let the rendering logic handle it.
  // const { departments, isLoading: isLoadingDepts } = useDepartments();
  // const { EmployeeLevel, loading: isLoadingEmployeeLevel } = useEmployeeLevel();
  const departments = [];
  const EmployeeLevel = [];

  const { enrolledCourses, isLoadingEnrolled } = useEnrolledCourses(
    !!currentUser && currentUser.role === "HOCVIEN"
  );

  const pageCount = paginationInfo?.totalPages ?? 0;

  // Compute loading states
  const isLoading = isFetchingCourses || isLoadingEnrolled;
  const isInitialLoading = isLoading && !publicCourses.length;

  const enrollMutation = useEnrollCourse();
  const cancelEnrollMutation = useCancelEnrollCourse();

  const filteredCourses = useMemo(() => {
    // Admin/HR hoặc chưa đăng nhập: giữ nguyên danh sách công khai
    if (!currentUser || currentUser.role !== "HOCVIEN") {
      return publicCourses;
    }
    // Học viên: hiển thị tất cả khóa học công khai
    // Không lọc theo trạng thái đăng ký để học viên thấy được tất cả khóa học
    return publicCourses.filter((course) => {
      const isOptional =
        course.enrollmentType === "optional" ||
        course.enrollmentType === "mandatory";
      return isOptional; // Hiển thị tất cả khóa học công khai
    });
  }, [publicCourses, currentUser]);

  const isCourseAccessible = useCallback(
    (course: Course): boolean => {
      if (!currentUser) return false;
      if (currentUser.role === "ADMIN" || currentUser.role === "HR") {
        return true;
      }
      if (course.isPrivate) {
        return true;
      }
      // This check might need revision if `course.department` is just an array of IDs
      if (
        currentUser.department &&
        course.department?.includes(String(currentUser.department.departmentId))
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

  const handleCancelEnroll = useCallback(
    (courseId: string) => {
      if (!currentUser) {
        showError("AUTH002");
        router.push("/login");
        return;
      }
      cancelEnrollMutation.mutate(courseId);
    },
    [currentUser, router, showError, cancelEnrollMutation]
  );

  const columns = useMemo(
    () =>
      getUserCourseColumns(
        (id) => router.push(`/courses/${id}`),
        {
          currentUserId: currentUser?.id,
          handleEnroll,
          isEnrolling: (id) =>
            enrollMutation.isPending && enrollMutation.variables === id,
          isCourseAccessible,
          enrolledCourses,
          currentUserRole: currentUser?.role,
          handleCancelEnroll,
          isCancellingEnroll: (id) =>
            cancelEnrollMutation.isPending &&
            cancelEnrollMutation.variables === id,
        },
        departments,
        EmployeeLevel
      ),
    [
      currentUser?.id,
      currentUser?.role,
      router,
      handleEnroll,
      enrollMutation.isPending,
      enrollMutation.variables,
      isCourseAccessible,
      enrolledCourses,
      departments,
      EmployeeLevel,
      handleCancelEnroll,
      cancelEnrollMutation.isPending,
      cancelEnrollMutation.variables,
    ]
  );

  if (isInitialLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="h-10 w-full sm:w-80 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-video w-full bg-gray-200 animate-pulse"></div>
              <CardHeader>
                <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
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

  if (coursesError) {
    return (
      <div className="flex flex-col items-center justify-center h-60 w-full text-red-500">
        <XCircle className="h-10 w-10 mb-3" />
        <p className="text-lg font-semibold">Lỗi tải khóa học:</p>
        <p className="text-sm text-muted-foreground">{coursesError.message}</p>
        <Button onClick={() => router.refresh()} className="mt-4">
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 container mx-auto px-2 sm:px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-headline font-semibold">
          Khóa học Công khai
        </h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto items-center">
          <div className="relative flex-grow md:flex-grow-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
            <Input
              placeholder="Tìm kiếm khóa học..."
              className="pl-10 w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {(isFetching || isRefetching) && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
          {/* {currentUser?.role === "HOCVIEN" && (
            <div className="flex items-center gap-2 px-2">
              <Switch id="toggle-expired" checked={showExpired} onCheckedChange={setShowExpired} />
              <label htmlFor="toggle-expired" className="text-sm text-muted-foreground select-none">
                Hiển thị khóa hết hạn
              </label>
            </div>
          )} */}
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
          {/* {(isFetching || isRefetching) && !isFetchingCourses && (
            <div className="flex items-center justify-center py-2 text-sm text-muted-foreground">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
              Đang tải...
            </div>
          )} */}
          {isFetchingCourses && filteredCourses.length === 0 ? (
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: pagination.pageSize }).map((_, index) => (
                <Card
                  key={index}
                  className="overflow-hidden shadow-lg animate-pulse"
                >
                  <div className="h-48 w-full bg-gray-200"></div>
                  <CardHeader className="pt-4 pb-2">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded"></div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </CardContent>
                  <CardFooter className="border-t mt-auto p-3">
                    <div className="h-8 bg-gray-200 rounded w-full"></div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredCourses.map((course) => {
                const enrolledCourseIds = new Set(
                  enrolledCourses.map((c) => c.id)
                );
                const isEnrolled = enrolledCourseIds.has(course.id);
                const registrationOpen = isRegistrationOpen(
                  course.registrationDeadline
                );
                const canEnroll =
                  currentUser?.role === "HOCVIEN" &&
                  !isEnrolled &&
                  course.enrollmentType === "optional" &&
                  registrationOpen;
                const accessible = isCourseAccessible(course);

                return (
                  <Card
                    key={course.id}
                    className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col group cursor-pointer"
                    onClick={() => router.push(`/courses/${course.id}`)}
                  >
                    <div className="relative h-48 w-full overflow-hidden">
                      {course.image.endsWith(".pdf") ? (
                        <div className="h-full w-full flex items-center justify-center bg-gray-100">
                          <BookOpen className="h-12 w-12 text-gray-400" />
                          <span className="ml-2 text-gray-600">
                            PDF Document
                          </span>
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
                          {course.category?.categoryName || "Không có"}
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
                        <div>
                          Thời lượng: {course.duration.sessions} buổi (
                          {course.duration.hoursPerSession}h/buổi)
                        </div>
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEnroll(course.id);
                          }}
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
                        <div className="w-full space-y-2">
                          <Button
                            variant="default"
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/courses/${course.id}`);
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" /> Vào học
                          </Button>
                          {registrationOpen && (
                            <LoadingButton
                              variant="outline"
                              className="w-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelEnroll(course.id);
                              }}
                              isLoading={
                                cancelEnrollMutation.isPending &&
                                cancelEnrollMutation.variables === course.id
                              }
                              disabled={cancelEnrollMutation.isPending}
                            >
                              {cancelEnrollMutation.isPending &&
                              cancelEnrollMutation.variables === course.id
                                ? "Đang hủy..."
                                : "Hủy đăng ký"}
                            </LoadingButton>
                          )}
                        </div>
                      ) : currentUser?.role === "HOCVIEN" &&
                        course.enrollmentType === "optional" &&
                        !registrationOpen ? (
                        <Button
                          variant="outline"
                          className="w-full"
                          disabled
                          onClick={(e) => e.stopPropagation()}
                        >
                          Hết hạn đăng ký
                        </Button>
                      ) : (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (accessible) {
                                    router.push(`/courses/${course.id}`);
                                  }
                                }}
                                disabled={!accessible}
                              >
                                Xem chi tiết
                              </Button>
                            </TooltipTrigger>
                            {!accessible && (
                              <TooltipContent>
                                <p>
                                  Khóa học này là nội bộ. Bạn không có quyền
                                  truy cập.
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
          )}
          {filteredCourses.length === 0 && !isFetchingCourses && (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-xl font-semibold">
                {debouncedSearchTerm
                  ? "Không tìm thấy khóa học nào"
                  : currentUser?.role === "HOCVIEN"
                  ? "Không có khóa học mới để đăng ký"
                  : "Chưa có khóa học công khai"}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {debouncedSearchTerm
                  ? "Vui lòng thử lại với từ khóa khác."
                  : currentUser?.role === "HOCVIEN"
                  ? "Bạn đã đăng ký tất cả khóa học có sẵn hoặc chưa có khóa học mới."
                  : "Hiện tại chưa có khóa học công khai nào được phát hành."}
              </p>
            </div>
          )}
          <PaginationControls
            page={pagination.pageIndex + 1}
            pageSize={pagination.pageSize}
            totalPages={pageCount || 1}
            totalItems={paginationInfo?.totalItems ?? filteredCourses.length}
            onPageChange={(p) =>
              setPagination((prev) => ({ ...prev, pageIndex: p - 1 }))
            }
            onPageSizeChange={(s) =>
              setPagination((prev) => ({ ...prev, pageSize: s, pageIndex: 0 }))
            }
          />
        </>
      ) : (
        <>
          {(isFetching || isRefetching) && !isFetchingCourses && (
            <div className="flex items-center justify-center py-2 text-sm text-muted-foreground">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
              Đang cập nhật dữ liệu...
            </div>
          )}
          <DataTable
            columns={columns}
            data={filteredCourses}
            isLoading={isFetchingCourses}
            pageCount={pageCount}
            pagination={pagination}
            onPaginationChange={setPagination}
          />
        </>
      )}
    </div>
  );
}
