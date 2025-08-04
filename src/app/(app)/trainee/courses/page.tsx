"use client";

import { useState, useMemo } from "react";
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
  Clock,
  Users,
  Star,
  Play,
  Award,
  Calendar,
  Filter,
  TrendingUp,
  Heart,
  BookMarked,
  CheckCircle,
  User,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCourses } from "@/hooks/use-courses";
import { useDepartments } from "@/hooks/use-departments";
import { usePositions } from "@/hooks/use-positions";
import { useCourseStatuses } from "@/hooks/use-statuses";
import { useDebounce } from "@/hooks/use-debounce";
import { DataTable } from "@/components/ui/data-table";
import NextImage from "next/image";
import type { Course } from "@/lib/types/course.types";
import type { QueryParams } from "@/lib/core/types";
import type { PaginationState } from "@tanstack/react-table";

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
  ActionButtons,
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

  const apiParams: QueryParams = useMemo(() => {
    const params: QueryParams = {
      Page: pagination.pageIndex + 1,
      Limit: pagination.pageSize,
      // Only show public or courses user has access to
      isPublic: true,
    };
    if (debouncedFilters.keyword) {
      params.keyword = debouncedFilters.keyword;
    }
    if (debouncedFilters.statusId !== "all") {
      params.statusIds = debouncedFilters.statusId;
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
  } = useCourses(apiParams);
  const { courseStatuses, isLoading: isLoadingStatuses } = useCourseStatuses();
  const { departments: allDepartments, isLoading: isLoadingDepts } =
    useDepartments();
  const { positions, loading: isLoadingPositions } = usePositions();

  const isLoading =
    isLoadingCourses ||
    isLoadingStatuses ||
    isLoadingDepts ||
    isLoadingPositions;

  const levelOptions = useMemo(() => {
    if (!Array.isArray(positions)) return [];
    return positions
      .filter((p) => p.positionName && p.positionName !== "N/A")
      .map((p) => ({
        value: String(p.positionId),
        label: p.positionName,
      }));
  }, [positions]);

  const handleFilterChange = (
    filterName: keyof CourseFilters,
    value: string
  ) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const handleEnrollCourse = (courseId: string) => {
    // In real app, this would make an API call to enroll
    console.log("Enrolling in course:", courseId);
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
      <div className="container mx-auto p-6 space-y-6">
        <PageHeader
          title="Khóa học"
          description="Khám phá và đăng ký các khóa học đào tạo"
        />
        <LoadingState type={viewMode} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="Danh mục Khóa học"
        description="Khám phá và đăng ký các khóa học đào tạo phù hợp với bạn"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Tổng số khóa học"
          value={stats.total}
          icon={<BookOpen className="h-5 w-5" />}
        />
        <StatsCard
          title="Khóa học đang mở"
          value={stats.active}
          icon={<Play className="h-5 w-5" />}
        />
        <StatsCard
          title="Đã đăng ký"
          value={stats.enrolled}
          icon={<BookMarked className="h-5 w-5" />}
        />
        <StatsCard
          title="Đã hoàn thành"
          value={stats.completed}
          icon={<CheckCircle className="h-5 w-5" />}
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
          <div className="flex gap-2">
            <Select
              value={filters.statusId}
              onValueChange={(v) => handleFilterChange("statusId", v)}
            >
              <SelectTrigger className="w-[160px]">
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
              onValueChange={(v) => handleFilterChange("levelId", v)}
            >
              <SelectTrigger className="w-[140px]">
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
              onValueChange={(v) => handleFilterChange("sortBy", v)}
            >
              <SelectTrigger className="w-[140px]">
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
      ) : (
        <GridLayout>
          {courses.map((course) => {
            const enrollmentStatus = getEnrollmentStatus(course.id);
            const rating = getCourseRating(course.id);
            const studentCount = getStudentCount(course.id);

            return (
              <OptimizedCard key={course.id} hover className="group">
                <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                  <NextImage
                    src={course.image}
                    alt={course.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
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
                          : "N/A"
                      }
                    />
                  </div>
                  <div className="absolute top-2 right-2">
                    {enrollmentStatus === "enrolled" && (
                      <Badge className="bg-blue-500 text-white">
                        Đã đăng ký
                      </Badge>
                    )}
                    {enrollmentStatus === "completed" && (
                      <Badge className="bg-green-500 text-white">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Hoàn thành
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <h3
                      className="font-semibold text-lg mb-1 cursor-pointer hover:text-primary transition-colors line-clamp-2"
                      onClick={() => handleViewCourse(course.id)}
                    >
                      {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {course.courseCode}
                    </p>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {course.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>
                        {(() => {
                          if (typeof course.instructor === "string")
                            return course.instructor;
                          if (
                            course.instructor &&
                            typeof course.instructor === "object" &&
                            "fullName" in course.instructor
                          ) {
                            return (course.instructor as any).fullName;
                          }
                          return "Chưa có thông tin";
                        })()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{studentCount} học viên</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {course.registrationStartDate
                          ? new Date(
                              course.registrationStartDate
                            ).toLocaleDateString("vi-VN")
                          : "Chưa xác định"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      {course.isPublic ? "Công khai" : "Nội bộ"}
                    </Badge>
                    {/* Mock level badge */}
                    <Badge variant="secondary">Trung cấp</Badge>
                  </div>

                  <div className="pt-2 border-t">
                    {enrollmentStatus === "not_enrolled" ? (
                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          onClick={() => handleEnrollCourse(course.id)}
                          disabled={course.status !== "Đang mở"}
                        >
                          <BookMarked className="mr-2 h-4 w-4" />
                          Đăng ký
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleViewCourse(course.id)}
                        >
                          <BookOpen className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : enrollmentStatus === "enrolled" ? (
                      <Button
                        className="w-full"
                        onClick={() => handleViewCourse(course.id)}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Tiếp tục học
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          onClick={() => handleViewCourse(course.id)}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Xem lại
                        </Button>
                        <Button variant="outline" size="icon">
                          <Award className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </OptimizedCard>
            );
          })}
        </GridLayout>
      )}

      {/* Pagination would be handled by the DataTable component when in table view */}
      {viewMode === "table" && (
        <div className="mt-6">
          <p className="text-sm text-muted-foreground text-center">
            Chế độ bảng sẽ được triển khai với DataTable component
          </p>
        </div>
      )}
    </div>
  );
}
