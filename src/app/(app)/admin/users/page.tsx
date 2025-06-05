'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Users, PlusCircle, MoreHorizontal, Search } from "lucide-react";
import type { User, Role } from '@/lib/types';

// Mock data for users
const mockUsers: User[] = [
  { id: '1', name: 'Quản trị viên', email: 'admin@becamex.com', role: 'Admin', avatar: 'https://placehold.co/40x40.png' },
  { id: '2', name: 'Quản lý nhân sự', email: 'hr@becamex.com', role: 'HR', avatar: 'https://placehold.co/40x40.png' },
  { id: '3', name: 'Học viên Một', email: 'trainee1@becamex.com', role: 'Trainee', avatar: 'https://placehold.co/40x40.png' },
  { id: '4', name: 'Quản trị viên Khác', email: 'admin2@becamex.com', role: 'Admin', avatar: 'https://placehold.co/40x40.png' },
  { id: '5', name: 'Học viên Hai', email: 'trainee2@becamex.com', role: 'Trainee', avatar: 'https://placehold.co/40x40.png' },
];

const roleBadgeVariant: Record<Role, "default" | "secondary" | "outline"> = {
  Admin: "default",
  HR: "secondary",
  Trainee: "outline",
};

const roleTranslations: Record<Role, string> = {
  Admin: "Quản trị viên",
  HR: "Nhân sự",
  Trainee: "Học viên",
};

export default function UsersPage() {
  // TODO: Implement actual data fetching, pagination, search, and CRUD operations
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-headline font-semibold">Quản lý Người dùng</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Tìm kiếm người dùng..." className="pl-10 w-full md:w-64" />
          </div>
          <Button className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-5 w-5" /> Thêm người dùng
          </Button>
        </div>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Tất cả Người dùng</CardTitle>
          <CardDescription>Quản lý tất cả tài khoản người dùng trong hệ thống.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name || 'Chưa có tên'}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={roleBadgeVariant[user.role]}>{roleTranslations[user.role]}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-5 w-5" />
                            <span className="sr-only">Hành động người dùng</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Sửa người dùng</DropdownMenuItem>
                          <DropdownMenuItem>Thay đổi vai trò</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive">Xóa người dùng</DropdownMenuItem>
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
       {mockUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-xl font-semibold">Không tìm thấy Người dùng nào</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Nhấn "Thêm người dùng" để tạo tài khoản người dùng mới.
          </p>
        </div>
      )}
    </div>
  );
}
