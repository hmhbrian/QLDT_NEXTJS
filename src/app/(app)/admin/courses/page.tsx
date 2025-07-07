
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
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
import { useToast } from "@/components/ui/use-toast";
import type { Course, CourseSearchParams } from "@/lib/types/course.types";
import type { Status } from "@/lib/types/status.types";
import type { DepartmentInfo } from "@/lib/types/department.types";
import type { Position, User } from "@/lib/types/user.types";
import NextImage from "next/image";
import {
  useCreateCourse,
  useUpdateCourse,
  useDeleteCourses,
  useCourses,
} from "@/hooks/use-courses";
import { useDepartments } from "@/hooks/use-departments";
import { usePositions } from "@/hooks/use-positions";
import { useUsers } from "@/hooks/use-users";
import { useCourseStatuses } from "@/hooks/use-statuses";
import { DataTable } from "@/components/ui/data-table";
import { extractErrorMessage } from "@/lib/core";
import { getStatusBadgeVariant } from "@/lib/helpers";
import {
  mapCourseUiToCreatePayload,
} from "@/lib/mappers/course.mapper";
import { getColumns } from "./columns";
import { useDebounce } from "@/hooks/use-debounce";

const CourseFormDialog = dynamic(
  () =>
    import("@/components/courses/dialogs/CourseFormDialog").then(
      (mod) => mod.CourseFormDialog
    ),
  { ssr: false }
);

interface CourseFilters {
  keyword: string;
  statusId: string;
  departmentId: string;
  levelId: string;
}

export default function CoursesPage() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [filters, setFilters] = useState<CourseFilters>({
    keyword: "",
    statusId: "all",
    departmentId: "all",
    levelId: "all",
  });
  const debouncedFilters = useDebounce(filters, 500);

  const apiParams: CourseSearchParams = useMemo(() => {
    const params: CourseSearchParams = {};
    if (debouncedFilters.keyword) {
      params.keyword = debouncedFilters.keyword;
    }
    if (debouncedFilters.statusId !== "all") {
      params.StatusIds = debouncedFilters.statusId;
    }
    if (debouncedFilters.departmentId !== "all") {
      params.DepartmentIds = debouncedFilters.departmentId;
    }
    if (debouncedFilters.levelId !== "all") {
      params.PositionIds = debouncedFilters.levelId;
    }
    return params;
  }, [debouncedFilters]);

  const { courses, isLoading, error: coursesError } = useCourses(apiParams);

  const {
    courseStatuses,
    isLoading: isLoadingStatuses,
    error: statusesError,
  } = useCourseStatuses();

  const { departments, isLoading: isLoadingDepts } = useDepartments();
  const { positions, loading: isLoadingPositions } = usePositions();
  const { users: trainees, isLoading: isLoadingTrainees } = useUsers({
    role: "HOCVIEN",
  });

  const isLoadingDependencies =
    isLoadingStatuses ||
    isLoadingDepts ||
    isLoadingPositions ||
    isLoadingTrainees;

  const createCourseMutation = useCreateCourse();
  const updateCourseMutation = useUpdateCourse();
  const deleteCourseMutation = useDeleteCourses();
  
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [archivingCourse, setArchivingCourse] = useState<Course | null>(null);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const departmentOptions = useMemo(() => {
    if (!departments) return [];
    return departments.map((d) => ({
      value: d.departmentId,
      label: d.name || "N/A",
    }));
  }, [departments]);

  const levelOptions = useMemo(() => {
    if (!positions) return [];
    return positions.map((p) => ({
      value: String(p.positionId),
      label: p.positionName,
    }));
  }, [positions]);

  const canManageCourses =
    currentUser?.role === "ADMIN" || currentUser?.role === "HR";

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, viewMode]);

  const paginatedCourses = useMemo(() => {
    if (viewMode === "card") {
      const startIndex = (currentPage - 1) * itemsPerPage;
      return courses.slice(startIndex, startIndex + itemsPerPage);
    }
    return courses;
  }, [courses, currentPage, itemsPerPage, viewMode]);

  const totalPages = Math.ceil(courses.length / itemsPerPage);

  const handleFormDialogOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setEditingCourse(null);
      setIsDuplicating(false);
    }
    setIsFormDialogOpen(isOpen);
  };

  const handleOpenAddDialog = () => {
    setEditingCourse(null);
    setIsDuplicating(false);
    setIsFormDialogOpen(true);
  };

  const handleOpenEditDialog = (course: Course) => {
    setIsDuplicating(false);
    setEditingCourse(course);
    setIsFormDialogOpen(true);
  };

  const handleSaveCourse = async (
    courseData:
      | Course
      | Omit<
          Course,
          "id" | "createdAt" | "modifiedAt" | "createdBy" | "modifiedBy"
        >,
    isEditing: boolean,
    imageFile?: File | null
  ): Promise<Course | void> => {
    if (!canManageCourses || !currentUser) {
      toast({
        title: "Không có quyền",
        description: "Bạn không có quyền thực hiện thao tác này.",
        variant: "destructive",
      });
      return;
    }
  
    try {
      const courseWithFile = {
        ...courseData,
        imageFile: imageFile || undefined,
      };
  
      if (isDuplicating || !isEditing) {
        const createPayload = mapCourseUiToCreatePayload(
          courseWithFile as Course
        );
        return await createCourseMutation.mutateAsync(createPayload);
      } else {
        const courseToUpdate = editingCourse!;
        return await updateCourseMutation.mutateAsync({
          courseId: courseToUpdate.id,
          payload: courseWithFile as Partial<Course>,
        });
      }
    } catch (error) {
      console.error("Lưu khóa học thất bại:", error);
      // Re-throw the error so the dialog can catch it and not close
      throw error;
    }
  };

  const handleDuplicateCourse = (course: Course) => {
    if (!canManageCourses) {
      toast({
        title: "Không có quyền",
        description: "Bạn không có quyền thực hiện thao tác này.",
        variant: "destructive",
      });
      return;
    }

    const duplicatedCourseForForm: Course = {
      ...course,
      id: crypto.randomUUID(),
      title: `${course.title} (Bản sao)`,
      courseCode: `${course.courseCode}-COPY-${Date.now()
        .toString()
        .slice(-4)}`,
      status: "Lưu nháp",
      statusId: courseStatuses.find((status) => status.name === "Lưu nháp")?.id,
      isPublic: false,
      enrolledTrainees: [],
      lessons: (course.lessons || []).map((l) => ({
        ...l,
        id: crypto.randomUUID(),
      })),
      tests: (course.tests || []).map((t) => ({
        ...t,
        id: crypto.randomUUID(),
        questions: (t.questions || []).map((q) => ({
          ...q,
          id: crypto.randomUUID(),
        })),
      })),
      materials: (course.materials || []).map((m) => ({
        ...m,
        id: crypto.randomUUID(),
      })),
    };

    setIsDuplicating(true);
    setEditingCourse(duplicatedCourseForForm);
    setIsFormDialogOpen(true);
  };

  const handleArchiveCourse = async () => {
    if (!canManageCourses || !currentUser || !archivingCourse) return;

    const cancelledStatus = courseStatuses.find((s) => s.name === "Hủy");
    if (!cancelledStatus) {
      toast({
        title: "Lỗi cấu hình",
        description:
          "Không tìm thấy trạng thái 'Hủy'. Vui lòng kiểm tra lại hệ thống.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateCourseMutation.mutateAsync({
        courseId: archivingCourse.id,
        payload: {
          statusId: cancelledStatus.id,
          status: cancelledStatus.name,
        },
      });

      setArchivingCourse(null);
    } catch (error) {
      console.error("Lưu trữ thất bại:", error);
    }
  };

  const handleDeleteCourse = async () => {
    if (!canManageCourses || !deletingCourse) return;
  
    const registrationStarted = deletingCourse.registrationStartDate && new Date(deletingCourse.registrationStartDate) <= new Date();
  
    if (deletingCourse.status === "Đang mở" || registrationStarted) {
        toast({
            title: "Thao tác bị từ chối",
            description: "Không thể xóa khóa học đã xuất bản hoặc đã bắt đầu cho đăng ký. Vui lòng lưu trữ trước.",
            variant: "destructive",
        });
        setDeletingCourse(null);
        return;
    }
  
    try {
        await deleteCourseMutation.mutateAsync([deletingCourse.id]);
        setDeletingCourse(null);
    } catch (error) {
        console.error("Xóa thất bại:", error);
        // Toast is handled by the mutation hook
    }
  };

  const columns = useMemo(
    () =>
      getColumns(
        handleOpenEditDialog,
        handleDuplicateCourse,
        setArchivingCourse,
        setDeletingCourse,
        canManageCourses,
        courseStatuses,
        getStatusBadgeVariant,
        departments || [],
        positions || []
      ),
    [canManageCourses, courseStatuses, departments, positions, handleOpenEditDialog, handleDuplicateCourse]
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
    const registrationStarted = course.registrationStartDate && new Date(course.registrationStartDate) <= new Date();
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

          {isLoading || isLoadingDependencies ? (
            <div className="flex h-60 w-full items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="ml-3 text-muted-foreground">
                Đang tải danh sách khóa học...
              </p>
            </div>
          ) : viewMode === "table" ? (
            <DataTable columns={columns} data={courses} />
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {paginatedCourses.map((course) => (
                  <Card
                    key={course.id}
                    className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col"
                  >
                    <div
                      className="relative h-40 w-full"
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
                                onClick={() => handleOpenEditDialog(course)}
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
                        className="font-headline text-lg truncate"
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
                          variant={getStatusBadgeVariant(course.status)}
                          className="whitespace-nowrap"
                        >
                          {course.status}
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
                        onClick={() => handleOpenEditDialog(course)}
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
                totalPages > 1 && (
                  <div className="flex items-center justify-between pt-6">
                    <div className="flex-1 text-sm text-muted-foreground">
                      Hiển thị {paginatedCourses.length} trên{" "}
                      {courses.length} khóa học.
                    </div>
                    <div className="flex items-center space-x-6 lg:space-x-8">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">Số mục mỗi trang</p>
                        <Select
                          value={`${itemsPerPage}`}
                          onValueChange={(value) => {
                            setItemsPerPage(Number(value));
                            setCurrentPage(1);
                          }}
                        >
                          <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={itemsPerPage} />
                          </SelectTrigger>
                          <SelectContent side="top">
                            {[8, 12, 16, 24].map((pageSize) => (
                              <SelectItem key={pageSize} value={`${pageSize}`}>
                                {pageSize}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                        Trang {currentPage} của {totalPages}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => setCurrentPage((p) => p - 1)}
                          disabled={currentPage === 1}
                        >
                          <span className="sr-only">Go to previous page</span>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => setCurrentPage((p) => p + 1)}
                          disabled={currentPage === totalPages}
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

      <CourseFormDialog
        isOpen={isFormDialogOpen}
        onOpenChange={handleFormDialogOpenChange}
        courseToEdit={editingCourse}
        isDuplicating={isDuplicating}
        onSave={handleSaveCourse}
        courseStatuses={courseStatuses}
        departmentOptions={departmentOptions}
        levelOptions={levelOptions}
        trainees={trainees}
      />

      {archivingCourse && (
        <Dialog
          open={!!archivingCourse}
          onOpenChange={() => setArchivingCourse(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận lưu trữ</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn lưu trữ khóa học &quot;
                {archivingCourse.title}&quot;?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => setArchivingCourse(null)}
              >
                Hủy
              </Button>
              <Button onClick={handleArchiveCourse}>Xác nhận</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {deletingCourse && (
        <Dialog
          open={!!deletingCourse}
          onOpenChange={() => setDeletingCourse(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận xóa</DialogTitle>
              <DialogDescription>
                <span>
                  Bạn có chắc chắn muốn xóa khóa học &quot;
                  {deletingCourse.title}
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
              <Button variant="outline" onClick={() => setDeletingCourse(null)}>
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteCourse}
                disabled={!canDeleteCourse(deletingCourse)}
              >
                Xác nhận xóa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
