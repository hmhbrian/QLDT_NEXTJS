"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Users,
  Star,
  Play,
  Award,
  Calendar,
  BookMarked,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCourses } from "@/hooks/use-courses";
import { useDepartments } from "@/hooks/use-departments";
import { useEmployeeLevel } from "@/hooks/use-employeeLevel";
import { useCourseStatuses } from "@/hooks/use-statuses";
import { useDebounce } from "@/hooks/use-debounce";
import { DataTable } from "@/components/ui/data-table";
import { PaginationControls } from "@/components/ui/PaginationControls";
import NextImage from "next/image";
import type { Course } from "@/lib/types/course.types";
import type { QueryParams } from "@/lib/core/types";
import type { PaginationState } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";

// Optimized components
import {
  PageHeader,
  FilterToolbar,
  GridLayout,
  LoadingState,
  StatsCard,
} from "@/components/layout/optimized-layouts";
import {
  OptimizedCard,
  StatusBadge,
  EmptyState,
} from "@/components/ui/optimized";

interface CourseFilters {
  keyword: string;
  statusId: string;
  levelId: string;
  categoryId: string;
  sortBy: string;
}

const sortOptions = [
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "popular", label: "Phổ biến" },
  { value: "rating", label: "Đánh giá cao" },
  { value: "alphabetical", label: "A-Z" },
];

const levelColors = {
  "Cơ bản": "bg-green-100 text-green-800",
  "Trung cấp": "bg-blue-100 text-blue-800",
  "Nâng cao": "bg-purple-100 text-purple-800",
  "Chuyên gia": "bg-red-100 text-red-800",
};

export default function StudentCourseCatalog() {
  const { user: currentUser } = useAuth();
  const router = useRouter();

  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");
  const [filters, setFilters] = useState<CourseFilters>({
    keyword: "",
    statusId: "all",
    levelId: "all",
    categoryId: "all",
    sortBy: "newest",
  });
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 12,
  });

  const debouncedFilters = useDebounce(filters, 300);

  // Reset pagination to page 1 when any filter changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, [debouncedFilters]);

  const apiParams: QueryParams = useMemo(() => {
    const params: QueryParams = {
      Page: pagination.pageIndex + 1,
      Limit: pagination.pageSize,
      // Only show public or courses user has access to
      isPrivate: true,
    };
    if (debouncedFilters.keyword) {
      params.keyword = debouncedFilters.keyword;
    }
    if (debouncedFilters.statusId !== "all") {
      params.statusIds = debouncedFilters.statusId;
    }
    if (debouncedFilters.levelId !== "all") {
      params.eLevelIds = debouncedFilters.levelId;
    }
    return params;
  }, [debouncedFilters, pagination]);

  const {
    courses,
    paginationInfo,
    isLoading: isLoadingCourses,
  } = useCourses(apiParams);
  const { courseStatuses, isLoading: isLoadingStatuses } = useCourseStatuses();
  const { departments: allDepartments, isLoading: isLoadingDepts } =
    useDepartments();
  const { EmployeeLevel, loading: isLoadingEmployeeLevel } = useEmployeeLevel();

  const isLoading =
    isLoadingCourses ||
    isLoadingStatuses ||
    isLoadingDepts ||
    isLoadingEmployeeLevel;

  const levelOptions = useMemo(() => {
    if (!Array.isArray(EmployeeLevel)) return [];
    return EmployeeLevel.filter(
      (p) => p.eLevelName && p.eLevelName !== "Không có"
    ).map((p) => ({
      value: String(p.eLevelId),
      label: p.eLevelName,
    }));
  }, [EmployeeLevel]);

  const handleFilterChange = (
    filterName: keyof CourseFilters,
    value: string
  ) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const handleEnrollCourse = (courseId: string) => {
    // In real app, this would make an API call to enroll
    router.push(`/courses/${courseId}`);
  };

  const handleViewCourse = (courseId: string) => {
    router.push(`/courses/${courseId}`);
  };

  // Mock enrollment status (in real app, this would come from API)
  const getEnrollmentStatus = (courseId: string) => {
    const statuses = ["not_enrolled", "enrolled", "completed"];
    return statuses[Math.floor(Math.random() * statuses.length)];
  };

  // Mock course rating (in real app, this would come from API)
  const getCourseRating = (courseId: string) => {
    return Math.round((Math.random() * 2 + 3) * 10) / 10; // Random rating between 3.0-5.0
  };

  // Mock student count (in real app, this would come from API)
  const getStudentCount = (courseId: string) => {
    return Math.floor(Math.random() * 500) + 50; // Random count between 50-550
  };

  // Calculate stats
  const stats = useMemo(() => {
    const totalCourses = paginationInfo?.totalItems || 0;
    const activeCourses = courses.filter((c) => c.status === "Đang mở").length;
    const enrolledCourses = courses.filter(
      (c) => getEnrollmentStatus(c.id) === "enrolled"
    ).length;
    const completedCourses = courses.filter(
      (c) => getEnrollmentStatus(c.id) === "completed"
    ).length;

    return {
      total: totalCourses,
      active: activeCourses,
      enrolled: enrolledCourses,
      completed: completedCourses,
    };
  }, [courses, paginationInfo]);

  if (isLoading && courses.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <PageHeader
          title="Khóa học"
          description="Khám phá và đăng ký các khóa học đào tạo"
        />
        <LoadingState type={viewMode} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
      <PageHeader
        title="Danh mục Khóa học"
        description="Khám phá và đăng ký các khóa học đào tạo phù hợp với bạn"
      />

      {/* Stats Cards - responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatsCard
          title="Tổng số khóa học"
          value={stats.total}
          icon={<BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />}
        />
        <StatsCard
          title="Khóa học đang mở"
          value={stats.active}
          icon={<Play className="h-4 w-4 sm:h-5 sm:w-5" />}
        />
        <StatsCard
          title="Đã đăng ký"
          value={stats.enrolled}
          icon={<BookMarked className="h-4 w-4 sm:h-5 sm:w-5" />}
        />
        <StatsCard
          title="Đã hoàn thành"
          value={stats.completed}
          icon={<CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />}
        />
      </div>

      <FilterToolbar
        searchValue={filters.keyword}
        onSearchChange={(value) => handleFilterChange("keyword", value)}
        searchPlaceholder="Tìm kiếm khóa học..."
        viewMode={viewMode}
        onViewModeChange={(mode) =>
          setViewMode(mode === "list" ? "table" : mode)
        }
        filters={
          <div className="flex flex-col sm:flex-row gap-2">
            <Select
              value={filters.statusId}
              onValueChange={(value) => handleFilterChange("statusId", value)}
            >
              <SelectTrigger className="w-full sm:w-[180px] h-8 sm:h-10">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {courseStatuses.map((status) => (
                  <SelectItem key={status.id} value={String(status.id)}>
                    {status.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.levelId}
              onValueChange={(value) => handleFilterChange("levelId", value)}
            >
              <SelectTrigger className="w-full sm:w-[160px] h-8 sm:h-10">
                <SelectValue placeholder="Cấp độ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả cấp độ</SelectItem>
                {levelOptions.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.sortBy}
              onValueChange={(value) => handleFilterChange("sortBy", value)}
            >
              <SelectTrigger className="w-full sm:w-[140px] h-8 sm:h-10">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      {courses.length === 0 ? (
        <EmptyState
          title="Không tìm thấy khóa học nào"
          description="Thử thay đổi bộ lọc để tìm thấy khóa học phù hợp"
          icon={<BookOpen className="h-12 w-12 text-muted-foreground" />}
        />
      ) : viewMode === "grid" ? (
        <GridLayout>
          {courses.map((course) => {
            const enrollmentStatus = getEnrollmentStatus(course.id);
            const rating = getCourseRating(course.id);
            const studentCount = getStudentCount(course.id);

            return (
              <OptimizedCard key={course.id} hover className="group">
                <div className="relative h-40 sm:h-48 w-full overflow-hidden rounded-t-lg">
                  <NextImage
                    src={course.image}
                    alt={course.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  />
                  <div className="absolute top-2 left-2">
                    <StatusBadge
                      status={
                        typeof course.status === "object" &&
                        course.status &&
                        "name" in course.status
                          ? course.status.name
                          : typeof course.status === "string"
                          ? course.status
                          : "Không có"
                      }
                    />
                  </div>
                  <div className="absolute top-2 right-2">
                    {enrollmentStatus === "enrolled" && (
                      <Badge className="bg-blue-500 text-white text-xs px-2 py-1">
                        Đã đăng ký
                      </Badge>
                    )}
                    {enrollmentStatus === "completed" && (
                      <Badge className="bg-green-500 text-white text-xs px-2 py-1">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        <span className="hidden sm:inline">Hoàn thành</span>
                        <span className="sm:hidden">Xong</span>
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div>
                    <h3
                      className="font-semibold text-base sm:text-lg mb-1 cursor-pointer hover:text-primary transition-colors line-clamp-2"
                      onClick={() => handleViewCourse(course.id)}
                    >
                      {course.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {course.courseCode}
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                    {course.description}
                  </p>

                  <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                      <span>{rating}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">{studentCount} học viên</span>
                      <span className="sm:hidden">{studentCount} HV</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="text-xs">
                        {course.registrationStartDate
                          ? new Date(
                              course.registrationStartDate
                            ).toLocaleDateString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                            })
                          : "TBD"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    <Badge variant="outline" className="text-xs px-2 py-1">
                      {course.isPrivate ? "Nội bộ" : "Công khai"}
                    </Badge>
                    <Badge variant="secondary" className="text-xs px-2 py-1">
                      Trung cấp
                    </Badge>
                  </div>

                  <div className="pt-2 border-t">
                    {enrollmentStatus === "not_enrolled" ? (
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 h-8 sm:h-10 text-xs sm:text-sm"
                          onClick={() => handleEnrollCourse(course.id)}
                          disabled={course.status !== "Đang mở"}
                        >
                          <BookMarked className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">Đăng ký</span>
                          <span className="sm:hidden">Đăng ký</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 sm:h-10 sm:w-10"
                          onClick={() => handleViewCourse(course.id)}
                        >
                          <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    ) : enrollmentStatus === "enrolled" ? (
                      <Button
                        className="w-full h-8 sm:h-10 text-xs sm:text-sm"
                        onClick={() => handleViewCourse(course.id)}
                      >
                        <Play className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Tiếp tục học</span>
                        <span className="sm:hidden">Tiếp tục</span>
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 h-8 sm:h-10 text-xs sm:text-sm"
                          onClick={() => handleViewCourse(course.id)}
                        >
                          <CheckCircle className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">Xem lại</span>
                          <span className="sm:hidden">Xem</span>
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                          <Award className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </OptimizedCard>
            );
          })}
        </GridLayout>
      ) : (
        // Table (list) view - responsive
        <div className="overflow-x-auto">
          <DataTable
            columns={useMemo<ColumnDef<Course>[]>(
              () => [
                {
                  accessorKey: "title",
                  header: "Tên khóa học",
                  cell: ({ row }) => (
                    <div
                      className="font-medium cursor-pointer hover:underline text-sm sm:text-base line-clamp-2"
                      onClick={() => handleViewCourse(row.original.id)}
                    >
                      {row.original.title}
                    </div>
                  ),
                },
                { 
                  accessorKey: "courseCode", 
                  header: "Mã",
                  cell: ({ row }) => (
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      {row.original.courseCode}
                    </div>
                  ),
                },
                {
                  accessorKey: "status",
                  header: "Trạng thái",
                  cell: ({ row }) => {
                    const s = row.original.status;
                    const name =
                      typeof s === "object" && s && "name" in s
                        ? (s as any).name
                        : typeof s === "string"
                        ? s
                        : "Không có";
                    return <Badge className="text-xs">{name}</Badge>;
                  },
                },
                {
                  accessorKey: "isPublic",
                  header: "Loại",
                  cell: ({ row }) => (
                    <Badge variant={row.original.isPrivate ? "outline" : "default"} className="text-xs">
                      {row.original.isPrivate ? "Nội bộ" : "Công khai" }
                    </Badge>
                  ),
                },
                {
                  id: "actions",
                  header: "Hành động",
                  cell: ({ row }) => (
                    <Button size="sm" className="h-8 text-xs" onClick={() => handleViewCourse(row.original.id)}>
                      <span className="hidden sm:inline">Xem chi tiết</span>
                      <span className="sm:hidden">Xem</span>
                    </Button>
                  ),
                },
              ],
              []
            )}
            data={courses}
            isLoading={isLoading}
            pageCount={paginationInfo?.totalPages ?? 0}
            pagination={pagination}
            onPaginationChange={setPagination}
          />
        </div>
      )}

      {/* Pagination for grid mode - responsive */}
      {viewMode === "grid" && (
        <div className="flex justify-center">
          <PaginationControls
            page={pagination.pageIndex + 1}
            pageSize={pagination.pageSize}
            totalPages={paginationInfo?.totalPages ?? 1}
            totalItems={paginationInfo?.totalItems ?? courses.length}
            onPageChange={(p) => setPagination((prev) => ({ ...prev, pageIndex: p - 1 }))}
            onPageSizeChange={(s) => setPagination((prev) => ({ ...prev, pageSize: s, pageIndex: 0 }))}
          />
        </div>
      )}
    </div>
  );
}
