'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, PlusCircle, Search, MoreVertical, Pencil, Trash2, MoreHorizontal, Upload, X, Copy } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from '@/hooks/useAuth';
import { useError } from '@/hooks/use-error';
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { PublicCourse, mockPublicCourses } from '@/lib/mock';

interface FileUpload {
  file: File;
  preview: string;
}

export default function CoursesPage() {
  const { user: currentUser } = useAuth();
  const { showError } = useError();
  const [courses, setCourses] = useState<PublicCourse[]>(mockPublicCourses);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState<PublicCourse | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<PublicCourse | null>(null);
  const [newCourse, setNewCourse] = useState<Omit<PublicCourse, 'id'>>({
    title: '',
    description: '',
    category: 'Lập trình',
    instructor: '',
    duration: '',
    image: 'https://placehold.co/600x400.png'
  });
  const [selectedFile, setSelectedFile] = useState<FileUpload | null>(null);
  const [editingFile, setEditingFile] = useState<FileUpload | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Check if user has permission to manage courses
  const canManageCourses = currentUser?.role === 'Admin' || currentUser?.role === 'HR';

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, isEditing = false) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showError('FILE002'); // File too large
        return;
      }

      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        const preview = file.type.startsWith('image/') 
          ? URL.createObjectURL(file)
          : '/pdf-icon.png'; // Add a PDF icon to your public folder
        
        if (isEditing) {
          setEditingFile({ file, preview });
        } else {
          setSelectedFile({ file, preview });
        }
      } else {
        showError('FILE001'); // Invalid file type
      }
    }
  };

  const handleAddCourse = async () => {
    if (!canManageCourses) {
      showError('USER003');
      return;
    }

    if (!newCourse.title || !newCourse.description || !newCourse.instructor || !newCourse.duration) {
      showError('FORM001');
      return;
    }

    try {
      let fileUrl = 'https://placehold.co/600x400.png';
      
      if (selectedFile) {
        // TODO: Implement actual file upload to your server/storage
        // For now, we'll use object URL
        fileUrl = URL.createObjectURL(selectedFile.file);
      }

      const newId = (Math.max(...courses.map(c => parseInt(c.id))) + 1).toString();
      setCourses([...courses, { 
        id: newId, 
        ...newCourse,
        image: fileUrl 
      }]);
      setIsAddingCourse(false);
      setNewCourse({
        title: '',
        description: '',
        category: 'Lập trình',
        instructor: '',
        duration: '',
        image: 'https://placehold.co/600x400.png'
      });
      setSelectedFile(null);
      showError('SUCCESS001');
    } catch (error) {
      showError('FILE003'); // Error uploading file
    }
  };

  const handleUpdateCourse = async () => {
    if (!canManageCourses) {
      showError('USER003');
      return;
    }

    if (!editingCourse) return;

    try {
      let fileUrl = editingCourse.image;
      
      if (editingFile) {
        // TODO: Implement actual file upload to your server/storage
        // For now, we'll use object URL
        fileUrl = URL.createObjectURL(editingFile.file);
      }

      setCourses(courses.map(c => c.id === editingCourse.id ? {
        ...editingCourse,
        image: fileUrl
      } : c));
      setEditingCourse(null);
      setEditingFile(null);
      showError('SUCCESS001');
    } catch (error) {
      showError('FILE003');
    }
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

  const handleDuplicateCourse = (course: PublicCourse) => {
    if (!canManageCourses) {
      showError('USER003');
      return;
    }

    const newId = (Math.max(...courses.map(c => parseInt(c.id))) + 1).toString();
    const now = new Date();
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-headline font-semibold">Khóa học</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Tìm kiếm khóa học..." 
              className="pl-10 w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {canManageCourses && (
            <Button onClick={() => setIsAddingCourse(true)} className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-5 w-5" /> Thêm khóa học
          </Button>
          )}
        </div>
      </div>
      
      {filteredCourses.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCourses.map(course => (
            <Card key={course.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <div className="relative h-48 w-full">
                {course.image.endsWith('.pdf') ? (
                  <div className="h-full w-full flex items-center justify-center bg-gray-100">
                    <BookOpen className="h-12 w-12 text-gray-400" />
                    <span className="ml-2 text-gray-600">PDF Document</span>
                  </div>
                ) : (
                <Image 
                  src={course.image} 
                  alt={course.title} 
                  layout="fill" 
                  objectFit="cover" 
                />
                )}
                {canManageCourses && (
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:bg-white/10">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => setEditingCourse(course)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateCourse(course)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Nhân bản
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
                  </div>
                )}
              </div>
              <CardHeader>
                <CardTitle className="font-headline text-xl">{course.title}</CardTitle>
                <CardDescription className="text-xs text-primary">{course.category}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground mb-2 line-clamp-3">{course.description}</p>
                <p className="text-xs text-muted-foreground">Giảng viên: {course.instructor}</p>
                <p className="text-xs text-muted-foreground">Thời lượng: {course.duration}</p>
              </CardContent>
              <CardFooter className="border-t mt-auto">
                <Button 
                  className="w-full mt-4"
                  onClick={() => router.push(`/courses/${course.id}`)}
                >
                  Xem chi tiết
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        ) : (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-xl font-semibold">Không có khóa học nào</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Vui lòng kiểm tra lại sau hoặc liên hệ quản trị viên để thêm khóa học.
          </p>
        </div>
      )}

      {/* Dialog thêm khóa học */}
      {isAddingCourse && (
        <Dialog open={isAddingCourse} onOpenChange={setIsAddingCourse}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Thêm khóa học mới</DialogTitle>
              <DialogDescription>
                Điền thông tin để tạo khóa học mới.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              {/* Thông tin cơ bản */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Thông tin cơ bản</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="title" className="font-medium">
                      Tên khóa học <span className="text-destructive">*</span>
                    </Label>
                <Input
                  id="title"
                      placeholder="Nhập tên khóa học"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                      className="mt-1"
                />
              </div>

                  <div>
                    <Label htmlFor="category" className="font-medium">
                      Danh mục <span className="text-destructive">*</span>
                    </Label>
                  <Select
                    value={newCourse.category}
                      onValueChange={(value) => 
                        setNewCourse({ ...newCourse, category: value as PublicCourse['category'] })
                      }
                  >
                      <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lập trình">Lập trình</SelectItem>
                      <SelectItem value="Kinh doanh">Kinh doanh</SelectItem>
                      <SelectItem value="Thiết kế">Thiết kế</SelectItem>
                      <SelectItem value="Tiếp thị">Tiếp thị</SelectItem>
                      <SelectItem value="Kỹ năng mềm">Kỹ năng mềm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                  <div>
                    <Label htmlFor="instructor" className="font-medium">
                      Giảng viên <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="instructor"
                      placeholder="Tên giảng viên"
                      value={newCourse.instructor}
                      onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description" className="font-medium">
                    Mô tả ngắn <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Mô tả chi tiết về khóa học"
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Thông tin khóa học */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Thông tin khóa học</h3>

                <div>
                  <Label htmlFor="duration" className="font-medium">
                    Thời lượng <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="duration"
                    placeholder="VD: 6 Tuần"
                    value={newCourse.duration}
                    onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Hình ảnh khóa học */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Hình ảnh khóa học</h3>
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="course-image" className="font-medium">
                      Tải lên ảnh hoặc tài liệu PDF <span className="text-destructive">*</span>
                    </Label>
                    <div className="mt-1 flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2"
                  >
                        <Upload className="h-4 w-4" /> 
                    Chọn file
                  </Button>
                  <input
                    type="file"
                        id="course-image"
                    ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileSelect(e)}
                      />
                      <p className="text-sm text-muted-foreground">
                        Hỗ trợ: PNG, JPG, GIF hoặc PDF. Tối đa 5MB.
                      </p>
                    </div>
                  {selectedFile && (
                      <div className="mt-4 flex items-center gap-2">
                        <div className="relative h-16 w-16 overflow-hidden rounded border">
                      <Image
                        src={selectedFile.preview}
                        alt="Preview"
                        layout="fill"
                        objectFit="cover"
                      />
                        </div>
                      <Button
                          type="button"
                          variant="ghost"
                        size="icon"
                          onClick={() => {
                            setSelectedFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-4">
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
      {canManageCourses && editingCourse && (
        <Dialog open={!!editingCourse} onOpenChange={() => setEditingCourse(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Chỉnh sửa khóa học</DialogTitle>
              <DialogDescription>
                Chỉnh sửa thông tin khóa học.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Tên khóa học</Label>
                <Input
                  id="edit-title"
                  value={editingCourse.title}
                  onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                  placeholder="Nhập tên khóa học"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Mô tả</Label>
                <Textarea
                  id="edit-description"
                  value={editingCourse.description}
                  onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                  placeholder="Mô tả chi tiết về khóa học"
                  className="min-h-[100px] resize-y"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-category">Danh mục</Label>
                  <Select
                    value={editingCourse.category}
                    onValueChange={(value: PublicCourse['category']) => setEditingCourse({ ...editingCourse, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lập trình">Lập trình</SelectItem>
                      <SelectItem value="Kinh doanh">Kinh doanh</SelectItem>
                      <SelectItem value="Thiết kế">Thiết kế</SelectItem>
                      <SelectItem value="Tiếp thị">Tiếp thị</SelectItem>
                      <SelectItem value="Kỹ năng mềm">Kỹ năng mềm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-duration">Thời lượng</Label>
                  <Input
                    id="edit-duration"
                    value={editingCourse.duration}
                    onChange={(e) => setEditingCourse({ ...editingCourse, duration: e.target.value })}
                    placeholder="Ví dụ: 6 Tuần"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-instructor">Giảng viên</Label>
                <Input
                  id="edit-instructor"
                  value={editingCourse.instructor}
                  onChange={(e) => setEditingCourse({ ...editingCourse, instructor: e.target.value })}
                  placeholder="Tên giảng viên"
                />
              </div>
              <div className="grid gap-2">
                <Label>Tải lên ảnh hoặc tài liệu PDF</Label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Chọn file
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={handleFileSelect}
                  />
                  {selectedFile && (
                    <div className="relative h-20 w-20">
                      <Image
                        src={selectedFile.preview}
                        alt="Preview"
                        layout="fill"
                        objectFit="cover"
                        className="rounded"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={() => setSelectedFile(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Hỗ trợ: PNG, JPG, GIF hoặc PDF. Tối đa 5MB.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingCourse(null)} className="w-full sm:w-auto">
                Hủy
              </Button>
              <Button onClick={handleUpdateCourse} className="w-full sm:w-auto">
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
                <div className="relative h-16 w-16 rounded overflow-hidden">
                  <Image
                    src={deletingCourse.image}
                    alt={deletingCourse.title}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
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
    </div>
  );
}
