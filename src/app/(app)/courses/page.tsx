'use client';

import { useState, useEffect } from 'react'; // Đã thêm useEffect
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, MoreHorizontal, Upload, X, CalendarClock, LayoutGrid, List } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from '@/hooks/useAuth';
import NextImage from "next/image";
import { useRouter } from 'next/navigation';
import type { Course, PublicCourse } from '@/lib/types'; // Kiểu PublicCourse nên được định nghĩa trong types.ts nếu có
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCookie } from '@/hooks/use-cookie';
import { mockCourses as initialMockCoursesFromLib, mockPublicCourses } from '@/lib/mock';
import { categoryOptions } from '@/lib/constants'; // Đã sửa đường dẫn import

const COURSES_COOKIE_KEY = 'becamex-courses-data';

export default function CoursesPage() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  // Lấy dữ liệu từ cookie nhưng không sử dụng
  const [allCoursesFromCookie] = useCookie<Course[]>(
    COURSES_COOKIE_KEY,
    initialMockCoursesFromLib
  );

  const [courses, setCourses] = useState<PublicCourse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  useEffect(() => {
    // Chỉ sử dụng mockPublicCourses
    setCourses(mockPublicCourses);
  }, []);


  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (course.category && course.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
    course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEnroll = (courseId: string) => {
    toast({
      title: "Đăng ký",
      description: `Chức năng đăng ký khóa học "${courses.find(c=>c.id === courseId)?.title}" đang được phát triển.`,
      duration: 3000,
      variant: "success"
    });
  };

  const isRegistrationOpen = (deadline: string | null | undefined): boolean => {
    if (!deadline) return true;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    return now <= deadlineDate;
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-headline font-semibold">Khóa học Công khai</h1>
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
          <Button variant={viewMode === 'table' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('table')} aria-label="Table view">
            <List className="h-5 w-5" />
          </Button>
          <Button variant={viewMode === 'card' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('card')} aria-label="Card view">
            <LayoutGrid className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {filteredCourses.length > 0 ? (
        viewMode === 'card' ? (
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
                  <NextImage
                    src={course.image}
                    alt={course.title}
                    layout="fill"
                    objectFit="cover"
                    data-ai-hint={course.dataAiHint || "course image"}
                  />
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="font-headline text-xl">{course.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{course.category}</Badge>
                    <Badge variant={course.enrollmentType === 'mandatory' ? 'default' : 'secondary'} className="text-xs">
                      {course.enrollmentType === 'mandatory' ? 'Bắt buộc' : 'Tùy chọn'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-3">{course.description}</p>
                  <p className="text-xs text-muted-foreground">Giảng viên: {course.instructor}</p>
                  <p className="text-xs text-muted-foreground">Thời lượng: {course.duration}</p>
                  {course.enrollmentType === 'optional' && course.registrationDeadline && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center">
                      <CalendarClock className="mr-1.5 h-3 w-3"/>
                      Hạn đăng ký: {new Date(course.registrationDeadline).toLocaleDateString('vi-VN')}
                      {!isRegistrationOpen(course.registrationDeadline) && <Badge variant="destructive" className="ml-2 text-xs">Hết hạn</Badge>}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="border-t mt-auto pt-4 flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    className="w-full sm:flex-1"
                    onClick={() => router.push(`/courses/${course.id}`)}
                  >
                    Xem chi tiết
                  </Button>
                  {currentUser?.role === 'Trainee' && course.enrollmentType === 'optional' && isRegistrationOpen(course.registrationDeadline) && (
                     <Button
                      className="w-full sm:flex-1"
                      onClick={() => handleEnroll(course.id)}
                    >
                      Đăng ký
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : ( // Chế độ xem Bảng
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên khóa học</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Giảng viên</TableHead>
                  <TableHead>Thời lượng</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map(course => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell>{course.category}</TableCell>
                    <TableCell>{course.instructor}</TableCell>
                    <TableCell>{course.duration}</TableCell>
                    <TableCell>
                      <Badge variant={course.enrollmentType === 'mandatory' ? 'default' : 'secondary'}>
                        {course.enrollmentType === 'mandatory' ? 'Bắt buộc' : 'Tùy chọn'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => router.push(`/courses/${course.id}`)}>
                        Xem chi tiết
                      </Button>
                      {currentUser?.role === 'Trainee' && course.enrollmentType === 'optional' && isRegistrationOpen(course.registrationDeadline) && (
                        <Button size="sm" onClick={() => handleEnroll(course.id)} className="ml-2">
                          Đăng ký
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )
        ) : (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-xl font-semibold">Không có khóa học công khai nào</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Vui lòng kiểm tra lại sau.
          </p>
        </div>
      )}
    </div>
  );
}

