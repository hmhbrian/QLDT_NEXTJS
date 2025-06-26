"use client";

import { useState, useEffect, useMemo } from "react";
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
import type { Course, TraineeLevel, Department } from "@/lib/types";
import {
  statusOptions,
  statusBadgeVariant,
  departmentOptions as globalDepartmentOptions,
  levelOptions as globalLevelOptions,
} from "@/lib/constants";
import NextImage from "next/image";
import { useCourseStore } from "@/stores/course-store";
import { useCourses, useCreateCourse, useUpdateCourse, useDeleteCourses } from "@/hooks/use-courses";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import { extractErrorMessage } from "@/lib/core";

const CourseFormDialog = dynamic(
  () =>
    import("@/components/courses/dialogs/CourseFormDialog").then(
      (mod) => mod.CourseFormDialog
    ),
  { ssr: false }
);

export default function CoursesPage() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  // Use only the store for consistency
  const {
    courses,
    isLoading,
    addCourse,
    updateCourse,
    deleteCourse,
    fetchCourses,
  } = useCourseStore();

  // Get mutation functions for handlers
  const createCourseMutation = useCreateCourse();
  const updateCourseMutation = useUpdateCourse();
  const deleteCourseMutation = useDeleteCourses();

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<Course["status"] | "all">(
    "all"
  );
  const [departmentFilter, setDepartmentFilter] = useState<Department | "all">(
    "all"
  );
  const [levelFilter, setLevelFilter] = useState<TraineeLevel | "all">("all");

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [archivingCourse, setArchivingCourse] = useState<Course | null>(null);
  const [isDuplicating, setIsDuplicating] = useState(false);

  // Trạng thái phân trang cho chế độ xem card
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const canManageCourses =
    currentUser?.role === "ADMIN" || currentUser?.role === "HR";

  const filteredCourses = useMemo(
    () =>
      courses.filter((course) => {
        const matchesSearch =
          (course.title || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (course.description || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (course.instructor || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || course.status === statusFilter;
        const matchesDepartment =
          departmentFilter === "all" ||
          (course.department &&
            course.department.includes(departmentFilter as Department));
        const matchesLevel =
          levelFilter === "all" ||
          (course.level && course.level.includes(levelFilter as TraineeLevel));
        return (
          matchesSearch && matchesStatus && matchesDepartment && matchesLevel
        );
      }),
    [courses, searchTerm, statusFilter, departmentFilter, levelFilter]
  );

  // Reset trang về 1 khi bộ lọc thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, departmentFilter, levelFilter, viewMode]);

  // Phân trang khóa học cho chế độ xem card
  const paginatedCourses = useMemo(() => {
    if (viewMode === "card") {
      const startIndex = (currentPage - 1) * itemsPerPage;
      return filteredCourses.slice(startIndex, startIndex + itemsPerPage);
    }
    return []; // Không sử dụng cho chế độ xem bảng
  }, [filteredCourses, currentPage, itemsPerPage, viewMode]);

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

  const handleFormDialogOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setIsDuplicating(false); // Reset cờ khi đóng dialog
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
    setEditingCourse({
      ...course,
      lessons: course.lessons || [],
      tests: course.tests || [],
      materials: (course.materials || []).map((m) => ({
        ...m,
        id: m.id || crypto.randomUUID(),
      })),
    });
    setIsFormDialogOpen(true);
  };

  const handleSaveCourse = async (
    courseData:
      | Course
      | Omit<
          Course,
          "id" | "createdAt" | "modifiedAt" | "createdBy" | "modifiedBy"
        >,
    isEditing: boolean
  ) => {
    if (!canManageCourses || !currentUser) {
      toast({
        title: "Lỗi quyền",
        description: "Bạn không có quyền thực hiện thao tác này.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isDuplicating || !isEditing) {
        // Create new course - use mutation directly
        if (createCourseMutation) {
          await createCourseMutation.mutateAsync(courseData);
        } else {
          // Fallback to store for legacy support
          await addCourse({
            ...courseData,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
            createdBy: currentUser.id,
            modifiedBy: currentUser.id,
          } as Course);
        }
      } else {
        // Update existing course
        const courseToUpdate = courseData as Course;
        
        if (updateCourseMutation) {
          const apiPayload = {
            code: courseToUpdate.courseCode,
            name: courseToUpdate.title,
            description: courseToUpdate.description,
            objectives: courseToUpdate.objectives,
            thumbUrl: courseToUpdate.image,
            sessions: courseToUpdate.duration?.sessions,
            hoursPerSessions: courseToUpdate.duration?.hoursPerSession,
            maxParticipant: courseToUpdate.maxParticipants,
            startDate: courseToUpdate.startDate,
            endDate: courseToUpdate.endDate,
            registrationClosingDate: courseToUpdate.registrationDeadline,
            location: courseToUpdate.location,
            statusId: courseToUpdate.status === "published" ? 2 : 1,
          };
          await updateCourseMutation.mutateAsync({ 
            courseId: courseToUpdate.id, 
            payload: apiPayload 
          });
        } else {
          await updateCourse(courseToUpdate.id, {
            ...courseToUpdate,
            modifiedAt: new Date().toISOString(),
            modifiedBy: currentUser.id,
          });
        }
      }
      
      setIsFormDialogOpen(false);
      setIsDuplicating(false);
    } catch (error) {
      // Errors will be handled by mutation hooks and displayed to user
      console.error("Save course failed:", error);
      throw error; // Re-throw to let dialog handle it
    }
  };

  const handleDuplicateCourse = (course: Course) => {
    if (!canManageCourses) {
      toast({
        title: "Lỗi quyền",
        description: "Bạn không có quyền thực hiện thao tác này.",
        variant: "destructive",
      });
      return;
    }

    const duplicatedCourseForForm: Course = {
      ...course,
      title: `${course.title} (Bản sao)`,
      courseCode: `${course.courseCode}-COPY-${Date.now()
        .toString()
        .slice(-4)}`,
      status: "draft",
      isPublic: false,
      enrolledTrainees: [],
      lessons: (course.lessons || []).map((l) => ({
        ...l,
        id: crypto.randomUUID(),
      })),
      tests: (course.tests || []).map((t) => ({
        ...t,
        id: crypto.randomUUID(),
        questions: t.questions.map((q) => ({ ...q, id: crypto.randomUUID() })),
      })),
      materials: (course.materials || []).map((m) => ({
        ...m,
        id: m.id || crypto.randomUUID(),
      })),
    };

    setIsDuplicating(true);
    setEditingCourse(duplicatedCourseForForm);
    setIsFormDialogOpen(true);
  };

  const handleArchiveCourse = async () => {
    if (!canManageCourses || !currentUser) {
      toast({
        title: "Lỗi quyền",
        description: "Bạn không có quyền thực hiện thao tác này.",
        variant: "destructive",
      });
      return;
    }
    if (!archivingCourse) return;

    try {
      await updateCourse(archivingCourse.id, {
        status: "archived" as const,
        isPublic: false,
        modifiedAt: new Date().toISOString(),
        modifiedBy: currentUser.id,
      });

      setArchivingCourse(null);
      toast({
        title: "Thành công",
        description: "Đã lưu trữ khóa học.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const handleDeleteCourse = async () => {
    if (!canManageCourses) {
      toast({
        title: "Lỗi quyền",
        description: "Bạn không có quyền thực hiện thao tác này.",
        variant: "destructive",
      });
      return;
    }
    if (!deletingCourse) return;
    if (deletingCourse.status === "published") {
      toast({
        title: "Lỗi",
        description: "Không thể xóa khóa học đã xuất bản.",
        variant: "destructive",
      });
      return;
    }

    try {
      await deleteCourse(deletingCourse.id);
      setDeletingCourse(null);
      toast({
        title: "Thành công",
        description: "Đã xóa khóa học thành công.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const columns = useMemo(
    () =>
      getColumns(
        handleOpenEditDialog,
        handleDuplicateCourse,
        setArchivingCourse,
        setDeletingCourse,
        canManageCourses
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canManageCourses]
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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(v: typeof statusFilter) => setStatusFilter(v)}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  {statusOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={departmentFilter}
                onValueChange={(v: typeof departmentFilter) =>
                  setDepartmentFilter(v)
                }
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Phòng ban" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả phòng ban</SelectItem>
                  {globalDepartmentOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={levelFilter}
                onValueChange={(v: typeof levelFilter) => setLevelFilter(v)}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Cấp độ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả cấp độ</SelectItem>
                  {globalLevelOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {viewMode === "table" ? (
            <DataTable columns={columns} data={filteredCourses} />
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {paginatedCourses.map((course) => (
                  <Card
                    key={course.id}
                    className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col"
                  >
                    <div className="relative h-40 w-full">
                      <NextImage
                        src={course.image}
                        alt={course.title}
                        layout="fill"
                        objectFit="cover"
                        data-ai-hint="course image"
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
                              {course.status !== "archived" && (
                                <DropdownMenuItem
                                  onClick={() => setArchivingCourse(course)}
                                >
                                  <Archive className="mr-2 h-4 w-4" /> Lưu trữ
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => setDeletingCourse(course)}
                                className="text-destructive focus:text-destructive"
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
                          variant={statusBadgeVariant[course.status]}
                          className="whitespace-nowrap"
                        >
                          {
                            statusOptions.find(
                              (opt) => opt.value === course.status
                            )?.label
                          }
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
                      <p className="truncate">
                        <span className="font-medium">Phòng ban:</span>{" "}
                        {course.department
                          ?.map(
                            (d) =>
                              globalDepartmentOptions.find(
                                (opt) => opt.value === d
                              )?.label
                          )
                          .join(", ") || "N/A"}
                      </p>
                      <p className="truncate">
                        <span className="font-medium">Cấp độ:</span>{" "}
                        {course.level
                          ?.map(
                            (l) =>
                              globalLevelOptions.find((opt) => opt.value === l)
                                ?.label
                          )
                          .join(", ") || "N/A"}
                      </p>
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

              {filteredCourses.length === 0 ? (
                <p className="text-center text-muted-foreground mt-6">
                  Không tìm thấy khóa học nào.
                </p>
              ) : (
                totalPages > 1 && (
                  <div className="flex items-center justify-between pt-6">
                    <div className="flex-1 text-sm text-muted-foreground">
                      Hiển thị {paginatedCourses.length} trên{" "}
                      {filteredCourses.length} khóa học.
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
        onSave={handleSaveCourse}
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
                {deletingCourse.status === "published" && (
                  <span className="mt-2 flex items-center text-destructive">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Không thể xóa khóa học đã xuất bản.
                  </span>
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
                disabled={deletingCourse.status === "published"}
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
