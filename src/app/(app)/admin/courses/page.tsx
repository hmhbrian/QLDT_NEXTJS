"use client";

import { useState, useEffect, useMemo } from "react";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  PlusCircle,
  MoreHorizontal,
  Search,
  Pencil,
  Trash2,
  Copy,
  AlertCircle,
  LayoutGrid,
  List,
  Loader2,
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
import { useEmployeeLevel } from "@/hooks/use-employeeLevel";
import { useCourseStatuses } from "@/hooks/use-statuses";
import { useCourseCategories } from "@/hooks/use-course-categories";
import { DataTable } from "@/components/ui/data-table";
import { extractErrorMessage } from "@/lib/core";
import { getStatusBadgeVariant } from "@/lib/helpers";
import { getAdminCourseColumns } from "@/components/courses/columns";
import { useDebounce } from "@/hooks/use-debounce";
import { useError } from "@/hooks/use-error";
import type { PaginationState } from "@tanstack/react-table";
import { PageLoader } from "@/components/common/PageLoader";
import { PaginationControls } from "@/components/ui/PaginationControls";

interface CourseFilters {
  keyword: string;
  statusId: string;
  departmentId: string;
  levelId: string;
  categoryId: string;
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
    categoryId: "all",
  });
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const debouncedFilters = useDebounce(filters, 500);

  // Reset pagination to page 1 when any filter changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, [debouncedFilters]);

  const apiParams: QueryParams = useMemo(() => {
    const params: QueryParams = {
      Page: pagination.pageIndex + 1,
      Limit: pagination.pageSize,
      // Admin should see all courses, not just public ones
      publicOnly: false,
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
      params.eLevelIds = debouncedFilters.levelId;
    }
    if (debouncedFilters.categoryId !== "all") {
      params.categoryIds = debouncedFilters.categoryId;
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
  const { EmployeeLevel, loading: isLoadingEmployeeLevel } = useEmployeeLevel();
  const { categories, isLoading: isLoadingCategories } = useCourseCategories();

  const updateCourseMutation = useUpdateCourse();
  const deleteCourseMutation = useDeleteCourse();

  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);

  const departmentOptions = useMemo(() => {
    if (!allDepartments) return [];
    return allDepartments
      .filter((d) => d.name && d.name !== "Không có")
      .map((d) => ({
        value: String(d.departmentId),
        label: d.name,
      }));
  }, [allDepartments]);

  const levelOptions = useMemo(() => {
    if (!EmployeeLevel) return [];
    return EmployeeLevel.filter(
      (p) => p.eLevelName && p.eLevelName !== "Không có"
    ).map((p) => ({
      value: String(p.eLevelId),
      label: p.eLevelName,
    }));
  }, [EmployeeLevel]);

  const categoryOptions = useMemo(() => {
    if (!categories) return [];
    return categories.map((c) => ({
      value: String(c.id),
      label: c.categoryName,
    }));
  }, [categories]);

  const canManageCourses =
    currentUser?.role === "ADMIN" || currentUser?.role === "HR";

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [filters, viewMode, pagination.pageSize]);

  const isLoading =
    isLoadingCourses ||
    isLoadingStatuses ||
    isLoadingDepts ||
    isLoadingEmployeeLevel ||
    isLoadingCategories;

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


  const handleDeleteCourse = async () => {
    if (!canManageCourses || !deletingCourse) return;
    deleteCourseMutation.mutate(deletingCourse.id, {
      onSuccess: () => setDeletingCourse(null),
    });
  };

  const canDeleteCourse = (course: Course | null): boolean => {
    if (!course) return false;
    const registrationStarted =
      course.registrationStartDate &&
      new Date(course.registrationStartDate) <= new Date();
    return course.status !== "Đang mở" && !registrationStarted;
  };

  const handleFilterChange = (
    filterName: keyof CourseFilters,
    value: string
  ) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  const columns = useMemo(
    () =>
      getAdminCourseColumns(
        handleViewDetails,
        handleEditCourse,
        handleDuplicateCourse,
        () => {},
        setDeletingCourse,
        canManageCourses,
        allDepartments || [],
        EmployeeLevel || []
      ),
    [canManageCourses, allDepartments, EmployeeLevel]
  );

  const pageCount = paginationInfo?.totalPages ?? 0;

  const isInitialLoading =
    isLoading && !courses.length && !courseStatuses.length;

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

  if (isInitialLoading) {
    return <PageLoader />;
  }

  return (
    <>
        <Card className="border border-border bg-card">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl font-semibold text-foreground">
                Quản lý Khóa học
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Tạo mới, chỉnh sửa và quản lý tất cả khóa học
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full lg:w-auto">
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("table")}
                className={
                  viewMode === "table"
                    ? "h-9 w-9 sm:h-10 sm:w-10 hover:bg-primary/90"
                    : "h-9 w-9 sm:h-10 sm:w-10 text-primary hover:bg-primary/10"
                }
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "card" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("card")}
                className={
                  viewMode === "card"
                    ? "h-9 w-9 sm:h-10 sm:w-10 hover:bg-primary/90"
                    : "h-9 w-9 sm:h-10 sm:w-10 text-primary hover:bg-primary/10"
                }
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
               {canManageCourses && (
                <Button
                  onClick={handleOpenAddDialog}
                  className="w-full sm:w-auto h-9 sm:h-10 text-sm"
                >
                  <PlusCircle className="mr-1 sm:mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Thêm khóa học</span>
                  <span className="sm:hidden">Thêm</span>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
            <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground z-10" />
                <Input
                  placeholder="Tìm kiếm khóa học theo tên, mã khóa học..."
                  value={filters.keyword}
                  onChange={(e) =>
                    handleFilterChange("keyword", e.target.value)
                  }
                  className="pl-9 sm:pl-12 h-9 sm:h-10 text-sm"
                />
              </div>
              <Select
                value={filters.statusId}
                onValueChange={(v) => handleFilterChange("statusId", v)}
              >
                <SelectTrigger className="w-full lg:w-[180px] h-9 sm:h-10">
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
                <SelectTrigger className="w-full lg:w-[180px] h-9 sm:h-10">
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
                <SelectTrigger className="w-full lg:w-[180px] h-9 sm:h-10">
                  <SelectValue placeholder="Cấp độ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả cấp bậc</SelectItem>
                  {levelOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* <Select
                value={filters.categoryId}
                onValueChange={(v) => handleFilterChange("categoryId", v)}
              >
                <SelectTrigger className="w-full sm:w-[180px] focus:border-orange-400 focus:ring-orange-400">
                  <SelectValue placeholder="Danh mục" />
                </SelectTrigger>
                <SelectContent className="border-orange-100">
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  {categoryOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select> */}
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
            <div className="overflow-x-auto">
              <DataTable
                columns={columns}
                data={courses}
                isLoading={isLoading}
                pageCount={pageCount}
                pagination={pagination}
                onPaginationChange={setPagination}
              />
            </div>
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
                                className="bg-white/30 dark:bg-black/30 hover:bg-white/40 dark:hover:bg-black/40 text-black dark:text-white"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditCourse(course.id);
                                }}
                              >
                                <Pencil className="mr-2 h-4 w-4" /> Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDuplicateCourse(course);
                                }}
                              >
                                <Copy className="mr-2 h-4 w-4" /> Nhân bản
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingCourse(course);
                                }}
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
                              : "Không có"
                          )}
                          className="whitespace-nowrap"
                        >
                          {typeof course.status === "object" &&
                          course.status &&
                          "name" in course.status
                            ? course.status.name
                            : typeof course.status === "string"
                            ? course.status
                            : "Không có"}
                        </Badge>
                        <Badge
                          variant={course.isPrivate ? "outline" : "default"}
                          className="whitespace-nowrap"
                        >
                          {course.isPrivate ? "Nội bộ" : "Công khai" }
                        </Badge>
                      </div>
                      <p
                        className="text-muted-foreground line-clamp-2"
                        title={course.description}
                      >
                        {course.description}
                      </p>
                      <p className="whitespace-nowrap">
                        {/* Giảng viên: bỏ hiển thị */}
                      </p>
                      <div className="truncate">
                        <span className="font-medium">Phòng ban:</span>{" "}
                        {(() => {
                          const departments = course.departments || [];
                          if (departments.length === 0) return "Không có";

                          const departmentNames = departments.map(
                            (dept) => dept.departmentName
                          );
                          const displayText =
                            departmentNames.length > 1
                              ? `${departmentNames[0]} +${
                                  departmentNames.length - 1
                                }`
                              : departmentNames.join(", ");

                          if (departmentNames.length > 1) {
                            return (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="cursor-help underline decoration-dotted">
                                      {displayText}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="max-w-xs">
                                      {departmentNames.map((name, idx) => (
                                        <div key={idx}>• {name}</div>
                                      ))}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            );
                          }

                          return <span>{displayText}</span>;
                        })()}
                      </div>
                      <div className="truncate">
                        <span className="font-medium">Cấp độ:</span>{" "}
                        {(() => {
                          const levels = course.eLevels || [];
                          if (levels.length === 0) return "Không có";

                          const levelNames = levels.map(
                            (level) => level.eLevelName
                          );
                          const displayText =
                            levelNames.length > 1
                              ? `${levelNames[0]} +${levelNames.length - 1}`
                              : levelNames.join(", ");

                          if (levelNames.length > 1) {
                            return (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="cursor-help underline decoration-dotted">
                                      {displayText}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="max-w-xs">
                                      {levelNames.map((name, idx) => (
                                        <div key={idx}>• {name}</div>
                                      ))}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            );
                          }

                          return <span>{displayText}</span>;
                        })()}
                      </div>
                      <div className="truncate">
                        <span className="font-medium">Danh mục:</span>{" "}
                        {course.category?.categoryName || "Không có"}
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
                pageCount > 0 && (
                  <PaginationControls
                    page={pagination.pageIndex + 1}
                    pageSize={pagination.pageSize}
                    totalPages={pageCount}
                    totalItems={paginationInfo?.totalItems ?? courses.length}
                    onPageChange={(p) =>
                      setPagination((prev) => ({ ...prev, pageIndex: p - 1 }))
                    }
                    onPageSizeChange={(s) =>
                      setPagination((prev) => ({ ...prev, pageSize: s, pageIndex: 0 }))
                    }
                  />
                )
              )}
            </>
          )}
        </CardContent>
      </Card>

    

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
