'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PlusCircle, MoreHorizontal, Search, Pencil, Trash2, Copy, Archive, AlertCircle, BookOpen, LayoutGrid, List, Loader2 } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { useError } from '@/hooks/use-error';
import type { Course, TraineeLevel, Department } from '@/lib/types';
import {
  statusOptions,
  statusBadgeVariant,
  departmentOptions as globalDepartmentOptions,
  levelOptions as globalLevelOptions,
  traineeLevelLabels,
  NO_DEPARTMENT_VALUE,
  NO_LEVEL_VALUE,
} from '@/lib/constants';
import { mockCourses as initialMockCoursesFromLib } from '@/lib/mock'; // Đổi tên để tránh xung đột
import NextImage from 'next/image';
import { CourseFormDialog } from '@/components/courses/dialogs/CourseFormDialog';
import { useCookie, getCookie, setCookie } from '@/hooks/use-cookie';

const COURSES_COOKIE_KEY = 'becamex-courses-data';

export default function CoursesPage() {
  const { user: currentUser } = useAuth();
  const { showError } = useError();

  // Chuẩn bị dữ liệu mock
  const preparedMockCourses = initialMockCoursesFromLib.map(course => ({
      ...course,
      materials: (course.materials || []).map(material => ({
        ...material,
        id: material.id || crypto.randomUUID(),
      })),
      lessons: course.lessons || [],
      tests: course.tests || [],
  }));

  // Lấy dữ liệu từ cookie, nếu không có thì sử dụng mock data
  const [coursesFromCookie, setCoursesInCookie] = useCookie<Course[]>(
    COURSES_COOKIE_KEY,
    preparedMockCourses
  );

  // State cho danh sách khóa học hiển thị
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Kiểm tra và khởi tạo dữ liệu khi component mount
  useEffect(() => {
    setIsLoading(true);
    
    // Đảm bảo dữ liệu hiển thị ngay cả khi cookie rỗng
    if (preparedMockCourses.length > 0) {
      setCourses(preparedMockCourses);
      
      // Đồng thời lưu vào cookie nếu cookie rỗng
      if (coursesFromCookie.length === 0) {
        setCoursesInCookie(preparedMockCourses);
      }
    } else if (coursesFromCookie.length > 0) {
      setCourses(coursesFromCookie);
    } else {
      // Trường hợp cả hai đều rỗng, sẽ không xảy ra nếu preparedMockCourses có dữ liệu
      setCourses([]);
    }
    
    setIsLoading(false);
  }, [coursesFromCookie, setCoursesInCookie]);

  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Course['status'] | 'all'>('all');
  const [departmentFilter, setDepartmentFilter] = useState<Department | 'all'>('all');
  const [levelFilter, setLevelFilter] = useState<TraineeLevel | 'all'>('all');

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [archivingCourse, setArchivingCourse] = useState<Course | null>(null);

  const canManageCourses = currentUser?.role === 'Admin' || currentUser?.role === 'HR';

  const filteredCourses = courses.filter(course => {
    const matchesSearch =
      (course.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.instructor || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || (course.department && course.department.includes(departmentFilter as Department));
    const matchesLevel = levelFilter === 'all' || (course.level && course.level.includes(levelFilter as TraineeLevel));
    return matchesSearch && matchesStatus && matchesDepartment && matchesLevel;
  });

  const handleOpenAddDialog = () => {
    setEditingCourse(null);
    setIsFormDialogOpen(true);
  };

  const handleOpenEditDialog = (course: Course) => {
     setEditingCourse({
      ...course,
      lessons: course.lessons || [],
      tests: course.tests || [],
      materials: (course.materials || []).map(m => ({ ...m, id: m.id || crypto.randomUUID() })),
    });
    setIsFormDialogOpen(true);
  };

  const handleSaveCourse = (
    courseData: Course | Omit<Course, 'id' | 'createdAt' | 'modifiedAt' | 'createdBy' | 'modifiedBy'>,
    isEditing: boolean
  ) => {
    if (!canManageCourses || !currentUser) { showError('USER003'); return; }

    const now = new Date().toISOString();
    let updatedCourses: Course[] = [];
    
    if (isEditing) {
      const courseToUpdate = courseData as Course;
      if (courses.some(c => c.id !== courseToUpdate.id && c.courseCode === courseToUpdate.courseCode)) {
        showError('COURSE001');
        return;
      }
      updatedCourses = courses.map(c => c.id === courseToUpdate.id ? {
        ...courseToUpdate,
        modifiedAt: now,
        modifiedBy: currentUser.id
      } : c);
    } else {
      const newCourseData = courseData as Omit<Course, 'id' | 'createdAt' | 'modifiedAt' | 'createdBy' | 'modifiedBy'>;
       if (courses.some(c => c.courseCode === newCourseData.courseCode)) {
        showError('COURSE001');
        return;
      }
      const newId = crypto.randomUUID(); // Sử dụng UUID cho các khóa học mới
      const courseToAdd: Course = {
        id: newId,
        ...newCourseData,
        createdAt: now,
        modifiedAt: now,
        createdBy: currentUser.id,
        modifiedBy: currentUser.id,
        lessons: newCourseData.lessons || [],
        tests: newCourseData.tests || [],
        materials: newCourseData.materials || [],
      };
      updatedCourses = [...courses, courseToAdd];
    }
    
    // Cập nhật State và lưu vào Cookie
    setCourses(updatedCourses);
    setCoursesInCookie(updatedCourses);
    
    showError('SUCCESS006');
    setIsFormDialogOpen(false);
  };

  const handleDuplicateCourse = (course: Course) => {
    if (!canManageCourses || !currentUser) { showError('USER003'); return; }
    const newId = crypto.randomUUID();
    const now = new Date().toISOString();
    const duplicatedCourse: Course = {
      ...course,
      id: newId,
      title: `${course.title} (Bản sao)`,
      courseCode: `${course.courseCode}-COPY${new Date().getTime().toString().slice(-4)}`,
      status: 'draft',
      isPublic: false,
      createdAt: now, modifiedAt: now, createdBy: currentUser.id, modifiedBy: currentUser.id,
      lessons: (course.lessons || []).map(l => ({ ...l, id: crypto.randomUUID() })),
      tests: (course.tests || []).map(t => ({ ...t, id: crypto.randomUUID(), questions: t.questions.map(q => ({ ...q, id: crypto.randomUUID() })) })),
      materials: (course.materials || []).map(m => ({ ...m, id: m.id || crypto.randomUUID() })),
    };
    
    // Cập nhật State và lưu vào Cookie
    const updatedCourses = [...courses, duplicatedCourse];
    setCourses(updatedCourses);
    setCoursesInCookie(updatedCourses);
    
    showError('SUCCESS006');
  };

  const handleArchiveCourse = () => {
    if (!canManageCourses || !currentUser) { showError('USER003'); return; }
    if (!archivingCourse) return;
    const now = new Date().toISOString();
    
    // Cập nhật State và lưu vào Cookie
    const updatedCourses = courses.map(c => c.id === archivingCourse.id ? 
      { ...c, status: 'archived' as const, isPublic: false, modifiedAt: now, modifiedBy: currentUser.id } : c);
    setCourses(updatedCourses);
    setCoursesInCookie(updatedCourses);
    
    setArchivingCourse(null);
    showError('SUCCESS006');
  };

  const handleDeleteCourse = () => {
    if (!canManageCourses) { showError('USER003'); return; }
    if (!deletingCourse) return;
    if (deletingCourse.status === 'published') { showError('COURSE002'); return; }
    
    // Cập nhật State và lưu vào Cookie
    const updatedCourses = courses.filter(c => c.id !== deletingCourse.id);
    setCourses(updatedCourses);
    setCoursesInCookie(updatedCourses);
    
    setDeletingCourse(null);
    showError('SUCCESS006');
  };

  if (isLoading) {
    return (
      <div className="flex h-60 w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Đang tải danh sách khóa học...</p>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-headline">Quản lý Khóa học</CardTitle>
              <CardDescription>Tạo, chỉnh sửa và quản lý tất cả khóa học nội bộ.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant={viewMode === 'table' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('table')}><List className="h-4 w-4" /></Button>
              <Button variant={viewMode === 'card' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('card')}><LayoutGrid className="h-4 w-4" /></Button>
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
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Tìm kiếm khóa học..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
              </div>
              <Select value={statusFilter} onValueChange={(v: typeof statusFilter) => setStatusFilter(v)}>
                <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  {statusOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={departmentFilter} onValueChange={(v: typeof departmentFilter) => setDepartmentFilter(v)}>
                <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Phòng ban" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả phòng ban</SelectItem>
                  {globalDepartmentOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={levelFilter} onValueChange={(v: typeof levelFilter) => setLevelFilter(v)}>
                <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Cấp độ" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả cấp độ</SelectItem>
                  {globalLevelOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên khóa học</TableHead>
                    <TableHead>Mã</TableHead>
                    <TableHead>Loại Ghi danh</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Công khai</TableHead>
                    <TableHead className="hidden md:table-cell">Phòng ban</TableHead>
                    <TableHead className="hidden md:table-cell">Cấp độ</TableHead>
                    <TableHead className="hidden lg:table-cell">Giảng viên</TableHead>
                    {canManageCourses && <TableHead className="w-[100px] text-right">Thao tác</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="truncate" title={course.title}>{course.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>{course.courseCode}</TableCell>
                      <TableCell><Badge variant={course.enrollmentType === 'mandatory' ? 'default' : 'secondary'}>{course.enrollmentType === 'mandatory' ? 'Bắt buộc' : 'Tùy chọn'}</Badge></TableCell>
                      <TableCell><Badge variant={statusBadgeVariant[course.status]}>{statusOptions.find(opt => opt.value === course.status)?.label}</Badge></TableCell>
                      <TableCell><Badge variant={course.isPublic ? 'default' : 'outline'}>{course.isPublic ? 'Công khai' : 'Nội bộ'}</Badge></TableCell>
                      <TableCell className="hidden md:table-cell">{course.department?.map(dept => globalDepartmentOptions.find(opt => opt.value === dept)?.label).join(', ') || 'N/A'}</TableCell>
                      <TableCell className="hidden md:table-cell">{course.level?.map((lvl: TraineeLevel) => traineeLevelLabels[lvl]).join(', ') || 'N/A'}</TableCell>
                      <TableCell className="hidden lg:table-cell">{course.instructor}</TableCell>
                      {canManageCourses && (
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Mở menu</span></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenEditDialog(course)}><Pencil className="mr-2 h-4 w-4" /> Chỉnh sửa</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicateCourse(course)}><Copy className="mr-2 h-4 w-4" /> Nhân bản</DropdownMenuItem>
                              {course.status !== 'archived' && <DropdownMenuItem onClick={() => setArchivingCourse(course)}><Archive className="mr-2 h-4 w-4" /> Lưu trữ</DropdownMenuItem>}
                              <DropdownMenuItem onClick={() => setDeletingCourse(course)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Xóa</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredCourses.map(course => (
                <Card key={course.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                  <div className="relative h-40 w-full">
                    <NextImage src={course.image} alt={course.title} layout="fill" objectFit="cover" data-ai-hint="course image" />
                    <div className="absolute top-2 right-2">
                      {canManageCourses && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="bg-white/30 hover:bg-white/50 text-black"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenEditDialog(course)}><Pencil className="mr-2 h-4 w-4" /> Chỉnh sửa</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicateCourse(course)}><Copy className="mr-2 h-4 w-4" /> Nhân bản</DropdownMenuItem>
                            {course.status !== 'archived' && <DropdownMenuItem onClick={() => setArchivingCourse(course)}><Archive className="mr-2 h-4 w-4" /> Lưu trữ</DropdownMenuItem>}
                            <DropdownMenuItem onClick={() => setDeletingCourse(course)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Xóa</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="font-headline text-lg truncate" title={course.title}>{course.title}</CardTitle>
                    <CardDescription className="text-xs">{course.courseCode}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow text-sm space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Badge variant={statusBadgeVariant[course.status]}>{statusOptions.find(opt => opt.value === course.status)?.label}</Badge>
                      <Badge variant={course.isPublic ? 'default' : 'outline'}>{course.isPublic ? 'Công khai' : 'Nội bộ'}</Badge>
                    </div>
                    <p className="text-muted-foreground line-clamp-2" title={course.description}>{course.description}</p>
                    <p><span className="font-medium">Giảng viên:</span> {course.instructor}</p>
                    <p><span className="font-medium">Phòng ban:</span> {course.department?.map(d => globalDepartmentOptions.find(opt => opt.value === d)?.label).join(', ') || 'N/A'}</p>
                    <p><span className="font-medium">Cấp độ:</span> {course.level?.map(l => globalLevelOptions.find(opt => opt.value === l)?.label).join(', ') || 'N/A'}</p>
                  </CardContent>
                  <CardFooter className="border-t pt-3">
                    <Button variant="outline" className="w-full" onClick={() => handleOpenEditDialog(course)}>Xem & Chỉnh sửa chi tiết</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {filteredCourses.length === 0 && <p className="text-center text-muted-foreground mt-6">Không tìm thấy khóa học nào.</p>}
        </CardContent>
      </Card>

      <CourseFormDialog
        isOpen={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        courseToEdit={editingCourse}
        onSave={handleSaveCourse}
      />

      {archivingCourse && (
        <Dialog open={!!archivingCourse} onOpenChange={() => setArchivingCourse(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận lưu trữ</DialogTitle>
              <DialogDescription>Bạn có chắc chắn muốn lưu trữ khóa học "{archivingCourse.title}"?</DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setArchivingCourse(null)}>Hủy</Button>
              <Button onClick={handleArchiveCourse}>Xác nhận</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {deletingCourse && (
        <Dialog open={!!deletingCourse} onOpenChange={() => setDeletingCourse(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận xóa</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa khóa học "{deletingCourse.title}"? Hành động này không thể hoàn tác.
                {deletingCourse.status === 'published' && <div className="mt-2 flex items-center text-destructive"><AlertCircle className="h-4 w-4 mr-2" />Không thể xóa khóa học đã xuất bản.</div>}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setDeletingCourse(null)}>Hủy</Button>
              <Button variant="destructive" onClick={handleDeleteCourse} disabled={deletingCourse.status === 'published'}>Xác nhận xóa</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
