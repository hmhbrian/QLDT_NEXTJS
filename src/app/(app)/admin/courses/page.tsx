'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PlusCircle, MoreHorizontal, Search, Pencil, Trash2, Copy, Archive, AlertCircle, BookOpen, X, Upload } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { useError } from '@/hooks/use-error';
import type { Course, TraineeLevel, Department } from '@/lib/types';
import { 
  statusOptions, 
  statusBadgeVariant, 
  departmentOptions, 
  levelOptions,
  traineeLevelLabels,
  categoryOptions
} from '@/lib/constants';
import { mockCourses } from '@/lib/mock';

export default function CoursesPage() {
  const { user: currentUser } = useAuth();
  const { showError } = useError();
  const [courses, setCourses] = useState<Course[]>(mockCourses);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Course['status'] | 'all'>('all');
  const [departmentFilter, setDepartmentFilter] = useState<Department | 'all'>('all');
  const [levelFilter, setLevelFilter] = useState<TraineeLevel | 'all'>('all');

  // Modal states
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [archivingCourse, setArchivingCourse] = useState<Course | null>(null);

  // New course state
  const [newCourse, setNewCourse] = useState<Omit<Course, 'id' | 'createdAt' | 'modifiedAt' | 'createdBy' | 'modifiedBy'>>({
    title: '',
    courseCode: '',
    description: '',
    objectives: '',
    category: 'programming',
    instructor: '',
    duration: {
      sessions: 1,
      hoursPerSession: 2
    },
    learningType: 'online',
    startDate: null,
    endDate: null,
    location: '', // URL for online course
    image: 'https://placehold.co/600x400',
    status: 'draft',
    department: [],
    level: [],
    materials: []
  });

  // Check if user has permission to manage courses
  const canManageCourses = currentUser?.role === 'Admin' || currentUser?.role === 'HR';

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    
    const matchesDepartment = departmentFilter === 'all' || 
      course.department?.includes(departmentFilter as Department);
    
    const matchesLevel = levelFilter === 'all' || 
      course.level?.includes(levelFilter as TraineeLevel);

    return matchesSearch && matchesStatus && matchesDepartment && matchesLevel;
  });

  const handleAddCourse = () => {
    if (!canManageCourses) {
      showError('USER003');
      return;
    }

    if (!newCourse.title || !newCourse.description || !newCourse.instructor || !newCourse.duration) {
      showError('FORM001');
      return;
    }

    const newId = (Math.max(...courses.map(c => parseInt(c.id))) + 1).toString();
    const now = new Date().toISOString();
    setCourses([...courses, {
      id: newId,
      ...newCourse,
      createdAt: now,
      modifiedAt: now,
      createdBy: currentUser.id,
      modifiedBy: currentUser.id
    }]);
    setIsAddingCourse(false);
    setNewCourse({
      title: '',
      courseCode: '',
      description: '',
      objectives: '',
      category: 'programming',
      instructor: '',
      duration: {
        sessions: 1,
        hoursPerSession: 2
      },
      learningType: 'online',
      startDate: null,
      endDate: null,
      location: '',
      image: 'https://placehold.co/600x400',
      status: 'draft',
      department: [],
      level: [],
      materials: []
    });
    showError('SUCCESS001');
  };

  const handleUpdateCourse = () => {
    if (!canManageCourses) {
      showError('USER003');
      return;
    }

    if (!editingCourse) return;
    
    const now = new Date().toISOString();
    setCourses(courses.map(c => c.id === editingCourse.id ? {
      ...editingCourse,
      modifiedAt: now,
      modifiedBy: currentUser.id
    } : c));
    setEditingCourse(null);
    showError('SUCCESS001');
  };

  const handleDuplicateCourse = (course: Course) => {
    if (!canManageCourses) {
      showError('USER003');
      return;
    }

    const newId = (Math.max(...courses.map(c => parseInt(c.id))) + 1).toString();
    const now = new Date().toISOString();
    const duplicatedCourse = {
      ...course,
      id: newId,
      title: `${course.title} (Bản sao)`,
      status: 'draft' as const,
      createdAt: now,
      modifiedAt: now,
      createdBy: currentUser.id,
      modifiedBy: currentUser.id
    };

    setCourses([...courses, duplicatedCourse]);
    showError('SUCCESS001');
  };

  const handleArchiveCourse = () => {
    if (!canManageCourses) {
      showError('USER003');
      return;
    }

    if (!archivingCourse) return;

    const now = new Date().toISOString();
    setCourses(courses.map(c => c.id === archivingCourse.id ? {
      ...archivingCourse,
      status: 'archived',
      modifiedAt: now,
      modifiedBy: currentUser.id
    } : c));
    setArchivingCourse(null);
    showError('SUCCESS001');
  };

  const handleDeleteCourse = () => {
    if (!canManageCourses) {
      showError('USER003');
      return;
    }

    if (!deletingCourse) return;
    
    if (deletingCourse.status === 'published') {
      showError('COURSE002'); // Cannot delete published course
      return;
    }

    setCourses(courses.filter(c => c.id !== deletingCourse.id));
    setDeletingCourse(null);
    showError('SUCCESS001');
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Khóa học</CardTitle>
              <CardDescription>Quản lý tất cả khóa học trong hệ thống.</CardDescription>
            </div>
            {canManageCourses && (
              <Button onClick={() => setIsAddingCourse(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Thêm khóa học
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Tìm kiếm khóa học..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value: typeof statusFilter) => setStatusFilter(value)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={departmentFilter} onValueChange={(value: typeof departmentFilter) => setDepartmentFilter(value)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Phòng ban" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả phòng ban</SelectItem>
                  {departmentOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={levelFilter} onValueChange={(value: typeof levelFilter) => setLevelFilter(value)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Cấp độ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả cấp độ</SelectItem>
                  {levelOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên khóa học</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Phòng ban</TableHead>
                <TableHead>Cấp độ</TableHead>
                <TableHead>Giảng viên</TableHead>
                <TableHead>Thời lượng</TableHead>
                {canManageCourses && <TableHead className="w-[100px]">Thao tác</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      {course.title}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant[course.status]}>
                      {statusOptions.find(opt => opt.value === course.status)?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {course.department?.map(dept => 
                      departmentOptions.find(opt => opt.value === dept)?.label
                    ).join(', ')}
                  </TableCell>
                  <TableCell>
                    {course.level?.map((lvl: TraineeLevel) => traineeLevelLabels[lvl]).join(', ')}
                  </TableCell>
                  <TableCell>{course.instructor}</TableCell>
                  <TableCell>
                    {`${course.duration.sessions} buổi x ${course.duration.hoursPerSession} giờ`}
                  </TableCell>
                  {canManageCourses && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Mở menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingCourse(course)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateCourse(course)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Nhân bản
                          </DropdownMenuItem>
                          {course.status !== 'archived' && (
                            <DropdownMenuItem onClick={() => setArchivingCourse(course)}>
                              <Archive className="mr-2 h-4 w-4" />
                              Lưu trữ
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => setDeletingCourse(course)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog thêm khóa học */}
      {canManageCourses && (
        <Dialog open={isAddingCourse} onOpenChange={setIsAddingCourse}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Thêm khóa học mới</DialogTitle>
              <DialogDescription>
                Điền thông tin để tạo khóa học mới.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="title" className="text-right">
                    Tên khóa học
                  </Label>
                <Input
                  id="title"
                    placeholder="Nhập tên khóa học"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                />
              </div>

                <div>
                  <Label htmlFor="courseCode">
                    Mã khóa học
                  </Label>
                <Input
                  id="courseCode"
                    placeholder="VD: REACT001"
                  value={newCourse.courseCode}
                  onChange={(e) => setNewCourse({ ...newCourse, courseCode: e.target.value })}
                />
              </div>

                <div>
                  <Label htmlFor="category">
                    Danh mục
                  </Label>
                  <Select
                    value={newCourse.category}
                    onValueChange={(value: Course['category']) => 
                      setNewCourse({ ...newCourse, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label htmlFor="description">
                    Mô tả
                  </Label>
                <Textarea
                  id="description"
                    placeholder="Mô tả chi tiết về khóa học"
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                />
              </div>

                <div className="col-span-2">
                  <Label htmlFor="objectives">
                    Mục tiêu đào tạo
                  </Label>
                <Textarea
                  id="objectives"
                    placeholder="Liệt kê các mục tiêu của khóa học"
                  value={newCourse.objectives}
                  onChange={(e) => setNewCourse({ ...newCourse, objectives: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="instructor">
                    Giảng viên
                  </Label>
                  <Input
                    id="instructor"
                    placeholder="Tên giảng viên"
                    value={newCourse.instructor}
                    onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="learningType">
                    Hình thức học
                  </Label>
                  <Select
                    value={newCourse.learningType}
                    onValueChange={(value: 'online') => 
                      setNewCourse({ ...newCourse, learningType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn hình thức" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Trực tuyến</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="sessions">
                    Số buổi học
                  </Label>
                  <Input
                    id="sessions"
                    type="number"
                    min={1}
                    value={newCourse.duration.sessions}
                    onChange={(e) => setNewCourse({
                      ...newCourse,
                      duration: {
                        ...newCourse.duration,
                        sessions: parseInt(e.target.value) || 1
                      }
                    })}
                  />
                </div>

                <div>
                  <Label htmlFor="hoursPerSession">
                    Số giờ/buổi
                  </Label>
                  <Input
                    id="hoursPerSession"
                    type="number"
                    min={1}
                    value={newCourse.duration.hoursPerSession}
                    onChange={(e) => setNewCourse({
                      ...newCourse,
                      duration: {
                        ...newCourse.duration,
                        hoursPerSession: parseInt(e.target.value) || 1
                      }
                    })}
                  />
                </div>

                <div>
                  <Label htmlFor="startDate">
                    Ngày bắt đầu (không bắt buộc)
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newCourse.startDate || ''}
                    onChange={(e) => setNewCourse({ ...newCourse, startDate: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">
                    Ngày kết thúc (không bắt buộc)
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newCourse.endDate || ''}
                    onChange={(e) => setNewCourse({ ...newCourse, endDate: e.target.value })}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="location">
                    Link học trực tuyến
                  </Label>
                  <Input
                    id="location"
                    placeholder="Nhập link học trực tuyến"
                    value={newCourse.location}
                    onChange={(e) => setNewCourse({ ...newCourse, location: e.target.value })}
                />
              </div>

                <div>
                  <Label htmlFor="department">
                    Phòng ban
                  </Label>
                  <Select
                    value={newCourse.department[0]}
                    onValueChange={(value: Department) => 
                      setNewCourse({ ...newCourse, department: [value] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn phòng ban" />
                    </SelectTrigger>
                    <SelectContent>
                      {departmentOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="level">
                    Cấp độ
                  </Label>
                  <Select
                    value={newCourse.level[0]}
                    onValueChange={(value: TraineeLevel) => 
                      setNewCourse({ ...newCourse, level: [value] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn cấp độ" />
                    </SelectTrigger>
                    <SelectContent>
                      {levelOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                </div>

                <div className="col-span-2">
                  <Label htmlFor="image">
                    Ảnh khóa học
                  </Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="image"
                      placeholder="URL ảnh khóa học"
                      value={newCourse.image}
                      onChange={(e) => setNewCourse({ ...newCourse, image: e.target.value })}
                    />
                    {newCourse.image && (
                      <img 
                        src={newCourse.image} 
                        alt="Preview" 
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                </div>
              </div>

                <div className="col-span-2">
                  <Label>Tài liệu khóa học</Label>
                  {newCourse.materials.map((material, index) => (
                    <div key={index} className="flex items-center gap-2 mt-2">
                  <Select
                        value={material.type}
                        onValueChange={(value: 'pdf' | 'slide' | 'video' | 'link') => {
                          const newMaterials = [...newCourse.materials];
                          newMaterials[index] = { ...material, type: value };
                          setNewCourse({ ...newCourse, materials: newMaterials });
                        }}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="slide">Slide</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="link">Link</SelectItem>
                    </SelectContent>
                  </Select>
                      <Input
                        placeholder="Tiêu đề tài liệu"
                        value={material.title}
                        onChange={(e) => {
                          const newMaterials = [...newCourse.materials];
                          newMaterials[index] = { ...material, title: e.target.value };
                          setNewCourse({ ...newCourse, materials: newMaterials });
                        }}
                      />
                      <Input
                        placeholder="URL tài liệu"
                        value={material.url}
                        onChange={(e) => {
                          const newMaterials = [...newCourse.materials];
                          newMaterials[index] = { ...material, url: e.target.value };
                          setNewCourse({ ...newCourse, materials: newMaterials });
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newMaterials = newCourse.materials.filter((_, i) => i !== index);
                          setNewCourse({ ...newCourse, materials: newMaterials });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setNewCourse({
                        ...newCourse,
                        materials: [
                        ...newCourse.materials,
                        { type: 'pdf', title: '', url: '' }
                        ]
                    })}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Thêm tài liệu
                  </Button>
                </div>

              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingCourse(false)}>
                Hủy
              </Button>
              <Button onClick={handleAddCourse}>
                Thêm khóa học
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog chỉnh sửa khóa học */}
      {editingCourse && (
        <Dialog open={!!editingCourse} onOpenChange={() => setEditingCourse(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa khóa học</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin khóa học.
              </DialogDescription>
            </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-title">Tên khóa học</Label>
                  <Input
                    id="edit-title"
                    value={editingCourse.title}
                    onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-description">Mô tả</Label>
                  <Textarea
                    id="edit-description"
                    value={editingCourse.description}
                    onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                  />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Trạng thái</Label>
                  <Select
                    value={editingCourse.status}
                    onValueChange={(value: Course['status']) => setEditingCourse({ ...editingCourse, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-category">Danh mục</Label>
                  <Select
                    value={editingCourse.category}
                    onValueChange={(value: Course['category']) => setEditingCourse({ ...editingCourse, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-department">Phòng ban</Label>
                  <Select
                    value={editingCourse.department?.[0] || ''}
                    onValueChange={(value: Department) => setEditingCourse({ ...editingCourse, department: [value] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn phòng ban" />
                    </SelectTrigger>
                    <SelectContent>
                      {departmentOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-level">Cấp độ</Label>
                  <Select
                    value={editingCourse.level?.[0] || ''}
                    onValueChange={(value: TraineeLevel) => setEditingCourse({ ...editingCourse, level: [value] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn cấp độ" />
                    </SelectTrigger>
                    <SelectContent>
                      {levelOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-instructor">Giảng viên</Label>
                  <Input
                    id="edit-instructor"
                    value={editingCourse.instructor}
                    onChange={(e) => setEditingCourse({ ...editingCourse, instructor: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-duration">Thời lượng</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="edit-duration-sessions"
                      type="number"
                      min={1}
                      value={editingCourse.duration.sessions}
                      onChange={(e) => setEditingCourse({
                        ...editingCourse,
                        duration: {
                          ...editingCourse.duration,
                          sessions: parseInt(e.target.value) || 1
                        }
                      })}
                      placeholder="Số buổi"
                    />
                    <span>x</span>
                  <Input
                      id="edit-duration-hours"
                      type="number"
                      min={1}
                      value={editingCourse.duration.hoursPerSession}
                      onChange={(e) => setEditingCourse({
                        ...editingCourse,
                        duration: {
                          ...editingCourse.duration,
                          hoursPerSession: parseInt(e.target.value) || 1
                        }
                      })}
                      placeholder="Số giờ/buổi"
                    />
                    <span>giờ</span>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingCourse(null)}>
                Hủy
              </Button>
              <Button onClick={handleUpdateCourse}>
                Lưu thay đổi
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog xác nhận lưu trữ */}
      {archivingCourse && (
        <Dialog open={!!archivingCourse} onOpenChange={() => setArchivingCourse(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận lưu trữ</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn lưu trữ khóa học này? Khóa học đã lưu trữ sẽ không hiển thị trong danh sách chính.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setArchivingCourse(null)}>
                Hủy
              </Button>
              <Button onClick={handleArchiveCourse}>
                Xác nhận lưu trữ
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog xác nhận xóa */}
      {deletingCourse && (
        <Dialog open={!!deletingCourse} onOpenChange={() => setDeletingCourse(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận xóa</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa khóa học này? Hành động này không thể hoàn tác.
                {deletingCourse.status === 'published' && (
                  <div className="mt-2 flex items-center text-destructive">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Không thể xóa khóa học đang diễn ra.
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeletingCourse(null)}>
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteCourse}
                disabled={deletingCourse.status === 'published'}
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