'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserCheck, PlusCircle, MoreHorizontal, Search, Mail, Phone } from "lucide-react";

const mockTrainees = [
  { id: 't1', name: 'Nguyễn Văn A', email: 'nva@example.com', phone: '0901234567', department: 'CNTT', enrolledCourses: 3, avatar: 'https://placehold.co/40x40.png', dataAiHint: 'person portrait' },
  { id: 't2', name: 'Trần Thị B', email: 'ttb@example.com', phone: '0907654321', department: 'Marketing', enrolledCourses: 2, avatar: 'https://placehold.co/40x40.png', dataAiHint: 'woman smiling' },
  { id: 't3', name: 'Lê Văn C', email: 'lvc@example.com', phone: '0908888999', department: 'Kinh doanh', enrolledCourses: 4, avatar: 'https://placehold.co/40x40.png', dataAiHint: 'man professional' },
];


export default function TraineesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-headline font-semibold">Quản lý Học viên</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Tìm kiếm học viên..." className="pl-10 w-full md:w-64" />
          </div>
          <Button className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-5 w-5" /> Thêm Học viên
          </Button>
        </div>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Tất cả Học viên</CardTitle>
          <CardDescription>Quản lý thông tin học viên, ghi danh và phân công khóa học.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead className="hidden md:table-cell">Liên hệ</TableHead>
                  <TableHead className="hidden lg:table-cell">Phòng ban</TableHead>
                  <TableHead>Khóa học đã đăng ký</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTrainees.map((trainee) => (
                  <TableRow key={trainee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={trainee.avatar} alt={trainee.name} data-ai-hint={trainee.dataAiHint} />
                          <AvatarFallback>{trainee.name.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{trainee.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" /> {trainee.email}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" /> {trainee.phone}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{trainee.department}</TableCell>
                    <TableCell>{trainee.enrolledCourses}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-5 w-5" />
                            <span className="sr-only">Hành động học viên</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Xem Hồ sơ</DropdownMenuItem>
                          <DropdownMenuItem>Sửa Chi tiết</DropdownMenuItem>
                          <DropdownMenuItem>Quản lý Ghi danh</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive">Xóa Học viên</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
       {mockTrainees.length === 0 && (
        <div className="text-center py-12">
          <UserCheck className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-xl font-semibold">Không tìm thấy Học viên nào</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Nhấn "Thêm Học viên" để bắt đầu.
          </p>
        </div>
      )}
    </div>
  );
}
