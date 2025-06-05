'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, PlusCircle, Search } from "lucide-react";
import Image from "next/image";

// Mock data for courses
const mockCourses = [
  { id: '1', title: 'JavaScript Nâng cao', description: 'Tìm hiểu sâu về các tính năng JavaScript hiện đại và các phương pháp hay nhất.', category: 'Lập trình', instructor: 'TS. Code', duration: '6 Tuần', image: 'https://placehold.co/600x400.png', dataAiHint: 'technology code' },
  { id: '2', title: 'Nguyên tắc Quản lý Dự án', description: 'Học các yếu tố cần thiết để quản lý dự án hiệu quả.', category: 'Kinh doanh', instructor: 'CN. Planner', duration: '4 Tuần', image: 'https://placehold.co/600x400.png', dataAiHint: 'office meeting' },
  { id: '3', title: 'Nguyên tắc Thiết kế UI/UX', description: 'Nắm vững các nguyên tắc cốt lõi của thiết kế giao diện và trải nghiệm người dùng.', category: 'Thiết kế', instructor: 'KS. Pixel', duration: '8 Tuần', image: 'https://placehold.co/600x400.png', dataAiHint: 'design art' },
  { id: '4', title: 'Chiến lược Tiếp thị Kỹ thuật số', description: 'Phát triển và triển khai các chiến lược tiếp thị kỹ thuật số hiệu quả.', category: 'Tiếp thị', instructor: 'CN. Click', duration: '5 Tuần', image: 'https://placehold.co/600x400.png', dataAiHint: 'marketing social media' },
];


export default function CoursesPage() {
  // TODO: Implement actual data fetching and role-based actions
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-headline font-semibold">Khóa học</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Tìm kiếm khóa học..." className="pl-10 w-full md:w-64" />
          </div>
          <Button className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-5 w-5" /> Thêm khóa học
          </Button>
        </div>
      </div>
      
      {mockCourses.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mockCourses.map(course => (
            <Card key={course.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <div className="relative h-48 w-full">
                <Image 
                  src={course.image} 
                  alt={course.title} 
                  layout="fill" 
                  objectFit="cover" 
                  data-ai-hint={course.dataAiHint}
                />
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
                 <Button className="w-full mt-4">Xem chi tiết</Button>
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
    </div>
  );
}
