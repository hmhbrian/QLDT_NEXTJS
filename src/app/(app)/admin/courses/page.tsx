"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PlusCircle,
  MoreHorizontal,
  Search,
  Pencil,
  Trash2,
  Copy,
  Archive,
  AlertCircle,
  LayoutGrid,
  List,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { Course } from "@/lib/types/course.types";
import type { QueryParams } from "@/lib/core/types";
import NextImage from "next/image";
import {
  useCourses,
  useUpdateCourse,
  useDeleteCourse,
} from "@/hooks/use-courses";
import { useDepartments } from "@/hooks/use-departments";
import { usePositions } from "@/hooks/use-positions";
import { useCourseStatuses } from "@/hooks/use-statuses";
import { DataTable } from "@/components/ui/data-table";
import { extractErrorMessage } from "@/lib/core";
import { getStatusBadgeVariant } from "@/lib/helpers";
import { getColumns } from "./columns";
import { useDebounce } from "@/hooks/use-debounce";
import { useError } from "@/hooks/use-error";
import type { PaginationState } from "@tanstack/react-table";

interface CourseFilters {
  keyword: string;
  statusId: string;
  departmentId: string;
  levelId: string;
}

export default function CoursesPage() {
  const { user: currentUser } = useAuth();
  const { showError } = useError();
  const router = useRouter();

  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [filters, setFilters] = useState<CourseFilters>({
    keyword: "",
    statusId: "all",
    departmentId: "all",
    levelId: "all",
  });
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const debouncedFilters = useDebounce(filters, 500);

  const apiParams: QueryParams = useMemo(() => {
    const params: QueryParams = {
      Page: pagination.pageIndex + 1,
      Limit: pagination.pageSize,
    };
    if (debouncedFilters.keyword) {
      params.keyword = debouncedFilters.keyword;
    }
    if (debouncedFilters.statusId !== "all") {
      params.statusIds = debouncedFilters.statusId;
    }
    if (debouncedFilters.departmentId !== "all") {
      params.departmentIds = debouncedFilters.departmentId;
    }
    if (debouncedFilters.levelId !== "all") {
      params.positionIds = debouncedFilters.levelId;
    }
    return params;
  }, [debouncedFilters, pagination]);

  const {
    courses,
    paginationInfo,
    isLoading: isLoadingCourses,
    error: coursesError,
  } = useCourses(apiParams);

  const {
    courseStatuses,
    isLoading: isLoadingStatuses,
    error: statusesError,
  } = useCourseStatuses();

  const { departments: allDepartments, isLoading: isLoadingDepts } =
    useDepartments();
  const { positions, loading: isLoadingPositions } = usePositions();

  const isLoading =
    isLoadingCourses ||
    isLoadingStatuses ||
    isLoadingDepts ||
    isLoadingPositions;

  const pageCount = paginationInfo?.totalPages ?? 0;

  const updateCourseMutation = useUpdateCourse();
  const deleteCourseMutation = useDeleteCourse();

  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [archivingCourse, setArchivingCourse] = useState<Course | null>(null);

  const departmentOptions = useMemo(() => {
    if (!allDepartments) return [];
    return allDepartments
      .filter((d) => d.name && d.name !== "N/A")
      .map((d) => ({
        value: String(d.departmentId),
        label: d.name,
      }));
  }, [allDepartments]);

  const levelOptions = useMemo(() => {
    if (!positions) return [];
    return positions
      .filter((p) => p.positionName && p.positionName !== "N/A")
      .map((p) => ({
        value: String(p.positionId),
        label: p.positionName,
      }));
  }, [positions]);

  const canManageCourses =
    currentUser?.role === "ADMIN" || currentUser?.role === "HR";

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [filters, viewMode, pagination.pageSize]);

  const handleOpenAddDialog = () => {
    router.push("/admin/courses/edit/new");
  };

  const handleEditCourse = (courseId: string) => {
    router.push(`/admin/courses/edit/${courseId}`);
  };

  const handleViewDetails = (courseId: string) => {
    router.push(`/courses/${courseId}`);
  };

  const handleDuplicateCourse = (course: Course) => {
    if (!canManageCourses) {
      showError("COURSE003");
      return;
    }
    router.push(`/admin/courses/edit/new?duplicateFrom=${course.id}`);
  };

  const handleArchiveCourse = async () => {
    if (!canManageCourses || !currentUser || !archivingCourse) return;

    const cancelledStatus = courseStatuses.find((s) => s.name === "Hủy");
    if (!cancelledStatus) {
      showError({
        success: false,
        message:
          "Không tìm thấy trạng thái 'Hủy'. Vui lòng kiểm tra lại hệ thống.",
      });
      return;
    }

    updateCourseMutation.mutate(
      {
        courseId: archivingCourse.id,
        payload: {
          StatusId: cancelledStatus.id,
        },
      },
      {
        onSuccess: () => setArchivingCourse(null),
      }
    );
  };

  const handleDeleteCourse = async () => {
    if (!canManageCourses || !deletingCourse) return;
    deleteCourseMutation.mutate([deletingCourse.id], {
      onSuccess: () => setDeletingCourse(null),
    });
  };

  const columns = useMemo(
    () =>
      getColumns(
        handleViewDetails,
        handleEditCourse,
        handleDuplicateCourse,
        setArchivingCourse,
        setDeletingCourse,
        canManageCourses,
        allDepartments || [],
        positions || []
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canManageCourses, allDepartments, positions]
  );

  if (statusesError) {
    return (
      <div className="flex h-60 w-full items-center justify-center text-destructive">
        <AlertCircle className="h-10 w-10 mr-3" />
        <div>
          <p className="font-bold">Lỗi tải trạng thái khóa học</p>
          <p className="text-sm">{extractErrorMessage(statusesError)}</p>
        </div>
      </div>
    );
  }

  const handleFilterChange = (
    filterName: keyof CourseFilters,
    value: string
  ) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  const canDeleteCourse = (course: Course | null): boolean => {
    if (!course) return false;
    const registrationStarted =
      course.registrationStartDate &&
      new Date(course.registrationStartDate) <= new Date();
    return course.status !== "Đang mở" && !registrationStarted;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-headline">
                Quản lý Khóa học
              </CardTitle>
              <CardDescription>
                Tạo, chỉnh sửa và quản lý tất cả khóa học nội bộ.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("table")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "card" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("card")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              {canManageCourses && (
                <Button onClick={handleOpenAddDialog} className="ml-2">
                  <PlusCircle className="mr-2 h-4 w-4" /> Thêm khóa học
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input
                  placeholder="Tìm kiếm khóa học..."
                  value={filters.keyword}
                  onChange={(e) =>
                    handleFilterChange("keyword", e.target.value)
                  }
                  className="pl-9"
                />
              </div>
              <Select
                value={filters.statusId}
                onValueChange={(v) => handleFilterChange("statusId", v)}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  {courseStatuses.map((o) => (
                    <SelectItem key={o.id} value={String(o.id)}>
                      {o.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.departmentId}
                onValueChange={(v) => handleFilterChange("departmentId", v)}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Phòng ban" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả phòng ban</SelectItem>
                  {departmentOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.levelId}
                onValueChange={(v) => handleFilterChange("levelId", v)}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Cấp độ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả cấp độ</SelectItem>
                  {levelOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading && courses.length === 0 ? (
            <div className="flex h-60 w-full items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="ml-3 text-muted-foreground">
                Đang tải danh sách khóa học...
              </p>
            </div>
          ) : viewMode === "table" ? (
            <DataTable
              columns={columns}
              data={courses}
              isLoading={isLoading}
              pageCount={pageCount}
              pagination={pagination}
              onPaginationChange={setPagination}
            />
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {courses.map((course) => (
                  <Card
                    key={course.id}
                    className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col"
                  >
                    <div
                      className="relative h-40 w-full cursor-pointer"
                      onClick={() => handleViewDetails(course.id)}
                      data-ai-id="card-image-container"
                    >
                      <NextImage
                        src={course.image}
                        alt={course.title}
                        fill
                        data-ai-hint="course image"
                        className="object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        {canManageCourses && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="bg-white/30 hover:bg-white/50 text-black"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEditCourse(course.id)}
                              >
                                <Pencil className="mr-2 h-4 w-4" /> Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDuplicateCourse(course)}
                              >
                                <Copy className="mr-2 h-4 w-4" /> Nhân bản
                              </DropdownMenuItem>
                              {course.status !== "Hủy" && (
                                <DropdownMenuItem
                                  onClick={() => setArchivingCourse(course)}
                                >
                                  <Archive className="mr-2 h-4 w-4" /> Lưu trữ
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => setDeletingCourse(course)}
                                className="text-destructive focus:text-destructive"
                                disabled={!canDeleteCourse(course)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle
                        className="font-headline text-lg truncate cursor-pointer hover:underline"
                        onClick={() => handleViewDetails(course.id)}
                        title={course.title}
                      >
                        {course.title}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {course.courseCode}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow text-sm space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={getStatusBadgeVariant(
                            typeof course.status === "object" &&
                              course.status &&
                              "name" in course.status
                              ? course.status.name
                              : typeof course.status === "string"
                              ? course.status
                              : "N/A"
                          )}
                          className="whitespace-nowrap"
                        >
                          {typeof course.status === "object" &&
                          course.status &&
                          "name" in course.status
                            ? course.status.name
                            : typeof course.status === "string"
                            ? course.status
                            : "N/A"}
                        </Badge>
                        <Badge
                          variant={course.isPublic ? "default" : "outline"}
                          className="whitespace-nowrap"
                        >
                          {course.isPublic ? "Công khai" : "Nội bộ"}
                        </Badge>
                      </div>
                      <p
                        className="text-muted-foreground line-clamp-2"
                        title={course.description}
                      >
                        {course.description}
                      </p>
                      <p className="whitespace-nowrap">
                        <span className="font-medium">Giảng viên:</span>{" "}
                        {course.instructor}
                      </p>
                      <div className="truncate">
                        <span className="font-medium">Phòng ban:</span>{" "}
                        {course.department
                          ?.map(
                            (id) =>
                              departmentOptions.find((opt) => opt.value === id)
                                ?.label
                          )
                          .join(", ") || "N/A"}
                      </div>
                      <div className="truncate">
                        <span className="font-medium">Cấp độ:</span>{" "}
                        {course.level
                          ?.map(
                            (id) =>
                              levelOptions.find((opt) => opt.value === id)
                                ?.label
                          )
                          .join(", ") || "N/A"}
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-3">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleEditCourse(course.id)}
                      >
                        Xem & Chỉnh sửa chi tiết
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {courses.length === 0 ? (
                <div className="text-center text-muted-foreground mt-6">
                  Không tìm thấy khóa học nào.
                </div>
              ) : (
                pageCount > 1 && (
                  <div className="flex items-center justify-between pt-6">
                    <div className="flex-1 text-sm text-muted-foreground">
                      Hiển thị {courses.length} trên{" "}
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
                            {[10, 20, 30, 40, 50].map((pageSize) => (
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
                          <span className="sr-only">Go to previous page</span>
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
                          <span className="sr-only">Go to next page</span>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!archivingCourse}
        onOpenChange={() => setArchivingCourse(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận lưu trữ</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn lưu trữ khóa học &quot;
              {archivingCourse?.title}&quot;? Hành động này sẽ chuyển trạng thái
              khóa học thành 'Hủy'.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setArchivingCourse(null)}
              disabled={updateCourseMutation.isPending}
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={handleArchiveCourse}
              disabled={updateCourseMutation.isPending}
            >
              {updateCourseMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deletingCourse}
        onOpenChange={() => setDeletingCourse(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              <span>
                Bạn có chắc chắn muốn xóa vĩnh viễn khóa học &quot;
                {deletingCourse?.title}
                &quot;? Hành động này không thể hoàn tác.
              </span>
              {!canDeleteCourse(deletingCourse) && (
                <div className="mt-2 flex items-center text-destructive">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Không thể xóa khóa học đã xuất bản hoặc đã bắt đầu đăng ký.
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setDeletingCourse(null)}
              disabled={deleteCourseMutation.isPending}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCourse}
              disabled={
                !canDeleteCourse(deletingCourse) ||
                deleteCourseMutation.isPending
              }
            >
              {deleteCourseMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Xác nhận xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
