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
import { PlusCircle, MoreHorizontal, Search, Pencil, Trash2, AlertCircle, BookOpen } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { useError } from '@/hooks/use-error';

type CourseCategory = 'Lập trình' | 'Kinh doanh' | 'Thiết kế' | 'Tiếp thị';

interface Course {
  id: string;
  title: string;
  description: string;
  category: CourseCategory;
  instructor: string;
  duration: string;
  image: string;
}

const categoryBadgeVariant: Record<CourseCategory, "default" | "secondary" | "outline" | "destructive"> = {
  "Lập trình": "default",
  "Kinh doanh": "secondary",
  "Thiết kế": "outline",
  "Tiếp thị": "destructive"
};

export default function CoursesPage() {
  const { user: currentUser } = useAuth();
  const { showError } = useError();
  const [courses, setCourses] = useState<Course[]>([
    {
      id: '1',
      title: 'JavaScript Nâng cao',
      description: 'Tìm hiểu sâu về các tính năng JavaScript hiện đại và các phương pháp hay nhất.',
      category: 'Lập trình',
      instructor: 'TS. Code',
      duration: '6 Tuần',
      image: 'https://placehold.co/600x400'
    },
    {
      id: '2',
      title: 'Nguyên tắc Quản lý Dự án',
      description: 'Học các yếu tố cần thiết để quản lý dự án hiệu quả.',
      category: 'Kinh doanh',
      instructor: 'CN. Planner',
      duration: '4 Tuần',
      image: 'https://placehold.co/600x400'
    },
    {
      id: '3',
      title: 'Nguyên tắc Thiết kế UI/UX',
      description: 'Nắm vững các nguyên tắc cốt lõi của thiết kế giao diện và trải nghiệm người dùng.',
      category: 'Thiết kế',
      instructor: 'KS. Pixel',
      duration: '8 Tuần',
      image: 'https://placehold.co/600x400'
    },
    {
      id: '4',
      title: 'Chiến lược Tiếp thị Kỹ thuật số',
      description: 'Phát triển và triển khai các chiến lược tiếp thị kỹ thuật số hiệu quả.',
      category: 'Tiếp thị',
      instructor: 'CN. Click',
      duration: '5 Tuần',
      image: 'https://placehold.co/600x400'
    },
  ]);

  // Check if user has permission to manage courses
  const canManageCourses = currentUser?.role === 'Admin' || currentUser?.role === 'HR';

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [newCourse, setNewCourse] = useState<Omit<Course, 'id'>>({
    title: '',
    description: '',
    category: 'Lập trình',
    instructor: '',
    duration: '',
    image: 'https://placehold.co/600x400'
  });

  const filteredCourses = courses.filter(course => 
    (course.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (course.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (course.instructor || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (course.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCourse = () => {
    if (!canManageCourses) {
      showError('USER003'); // Insufficient permissions
      return;
    }

    if (!newCourse.title || !newCourse.description || !newCourse.instructor || !newCourse.duration) {
      showError('FORM001');
      return;
    }

    const newId = (Math.max(...courses.map(c => parseInt(c.id))) + 1).toString();
    setCourses([...courses, { id: newId, ...newCourse }]);
    setIsAddingCourse(false);
    setNewCourse({
      title: '',
      description: '',
      category: 'Lập trình',
      instructor: '',
      duration: '',
      image: 'https://placehold.co/600x400'
    });
    showError('SUCCESS001');
  };

  const handleUpdateCourse = () => {
    if (!canManageCourses) {
      showError('USER003');
      return;
    }

    if (!editingCourse) return;
    setCourses(courses.map(c => c.id === editingCourse.id ? editingCourse : c));
    setEditingCourse(null);
    showError('SUCCESS001');
  };

  const handleDeleteCourse = () => {
    if (!canManageCourses) {
      showError('USER003');
      return;
    }

    if (!deletingCourse) return;
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
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Tìm kiếm khóa học..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên khóa học</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Giảng viên</TableHead>
                <TableHead>Thời lượng</TableHead>
                {canManageCourses && <TableHead className="w-[100px]">Hành động</TableHead>}
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
                    <Badge variant={categoryBadgeVariant[course.category]}>
                      {course.category}
                    </Badge>
                  </TableCell>
                  <TableCell>{course.instructor}</TableCell>
                  <TableCell>{course.duration}</TableCell>
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Thêm khóa học mới</DialogTitle>
              <DialogDescription>
                Điền thông tin để tạo khóa học mới.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Tên khóa học</Label>
                <Input
                  id="title"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Danh mục</Label>
                <Select
                  value={newCourse.category}
                  onValueChange={(value: CourseCategory) => setNewCourse({ ...newCourse, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lập trình">Lập trình</SelectItem>
                    <SelectItem value="Kinh doanh">Kinh doanh</SelectItem>
                    <SelectItem value="Thiết kế">Thiết kế</SelectItem>
                    <SelectItem value="Tiếp thị">Tiếp thị</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="instructor">Giảng viên</Label>
                <Input
                  id="instructor"
                  value={newCourse.instructor}
                  onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="duration">Thời lượng</Label>
                <Input
                  id="duration"
                  value={newCourse.duration}
                  onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                  placeholder="Ví dụ: 6 Tuần"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingCourse(false)}>
                Hủy
              </Button>
              <Button onClick={handleAddCourse} className="bg-green-600 hover:bg-green-700">
                Thêm khóa học
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog chỉnh sửa khóa học */}
      {canManageCourses && (
        <Dialog open={!!editingCourse} onOpenChange={() => setEditingCourse(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa khóa học</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin khóa học.
              </DialogDescription>
            </DialogHeader>
            {editingCourse && (
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
                <div className="grid gap-2">
                  <Label htmlFor="edit-category">Danh mục</Label>
                  <Select
                    value={editingCourse.category}
                    onValueChange={(value: CourseCategory) => setEditingCourse({ ...editingCourse, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lập trình">Lập trình</SelectItem>
                      <SelectItem value="Kinh doanh">Kinh doanh</SelectItem>
                      <SelectItem value="Thiết kế">Thiết kế</SelectItem>
                      <SelectItem value="Tiếp thị">Tiếp thị</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                  <Input
                    id="edit-duration"
                    value={editingCourse.duration}
                    onChange={(e) => setEditingCourse({ ...editingCourse, duration: e.target.value })}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingCourse(null)}>
                Hủy
              </Button>
              <Button onClick={handleUpdateCourse} className="bg-green-600 hover:bg-green-700">
                Lưu thay đổi
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog xác nhận xóa */}
      {canManageCourses && (
        <Dialog open={!!deletingCourse} onOpenChange={() => setDeletingCourse(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận xóa khóa học</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa khóa học này? Hành động này không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            {deletingCourse && (
              <div className="flex items-center gap-4 py-4">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <div>
                  <p className="font-medium">{deletingCourse.title}</p>
                  <p className="text-sm text-muted-foreground">Giảng viên: {deletingCourse.instructor}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeletingCourse(null)}>
                Hủy
              </Button>
              <Button variant="destructive" onClick={handleDeleteCourse}>
                Xóa khóa học
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
} 