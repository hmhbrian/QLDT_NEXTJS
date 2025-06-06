'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Building2, PlusCircle, MoreHorizontal, Search, Pencil, Trash2, AlertCircle } from "lucide-react";
import { useToast } from '@/components/ui/use-toast';
import type { Department } from '@/lib/types';

// Mock data - replace with API calls later
const mockDepartments: Department[] = [
  {
    id: 'd1',
    name: 'Công nghệ thông tin',
    code: 'CNTT',
    description: 'Phòng phát triển và quản lý hệ thống công nghệ thông tin',
    manager: 'Nguyễn Văn A',
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: 'd2',
    name: 'Nhân sự',
    code: 'HR',
    description: 'Phòng quản lý nhân sự và tuyển dụng',
    manager: 'Trần Thị B',
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
];

export default function DepartmentsPage() {
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);
  const [isAddingDepartment, setIsAddingDepartment] = useState(false);
  const [isEditingDepartment, setIsEditingDepartment] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    manager: '',
    status: 'active' as 'active' | 'inactive'
  });

  const handleAddDepartment = () => {
    try {
      if (!formData.name || !formData.code) {
        toast({
          title: "Lỗi",
          description: "Vui lòng điền đầy đủ thông tin bắt buộc",
          variant: "destructive",
        });
        return;
      }

      const newDepartment: Department = {
        id: `d${departments.length + 1}`,
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setDepartments([...departments, newDepartment]);
      setIsAddingDepartment(false);
      setFormData({ name: '', code: '', description: '', manager: '', status: 'active' as 'active' | 'inactive' });
      toast({
        title: "Thành công",
        description: "Đã thêm phòng ban mới",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể thêm phòng ban. Vui lòng thử lại",
        variant: "destructive",
      });
    }
  };

  const handleEditDepartment = () => {
    try {
      if (!selectedDepartment) return;
      if (!formData.name || !formData.code) {
        toast({
          title: "Lỗi",
          description: "Vui lòng điền đầy đủ thông tin bắt buộc",
          variant: "destructive",
        });
        return;
      }

      const updatedDepartments = departments.map(dept =>
        dept.id === selectedDepartment.id
          ? { ...dept, ...formData, updatedAt: new Date().toISOString() }
          : dept
      );

      setDepartments(updatedDepartments);
      setIsEditingDepartment(false);
      setSelectedDepartment(null);
      setFormData({ name: '', code: '', description: '', manager: '', status: 'active' as 'active' | 'inactive' });
      toast({
        title: "Thành công",
        description: "Đã cập nhật thông tin phòng ban",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật phòng ban. Vui lòng thử lại",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDepartment = (id: string) => {
    try {
      setDepartments(departments.filter(dept => dept.id !== id));
      toast({
        title: "Thành công",
        description: "Đã xóa phòng ban",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa phòng ban. Vui lòng thử lại",
        variant: "destructive",
      });
    }
  };

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dept.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-headline font-semibold">Quản lý Phòng ban</h1>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm phòng ban..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button onClick={() => setIsAddingDepartment(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Thêm mới
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách Phòng ban</CardTitle>
          <CardDescription>
            Quản lý thông tin và trạng thái các phòng ban trong công ty
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã phòng ban</TableHead>
                <TableHead>Tên phòng ban</TableHead>
                <TableHead>Quản lý</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDepartments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className="font-medium">{dept.code}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{dept.name}</p>
                      <p className="text-sm text-muted-foreground">{dept.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>{dept.manager}</TableCell>
                  <TableCell>
                    <Badge variant={dept.status === 'active' ? 'default' : 'secondary'}>
                      {dept.status === 'active' ? 'Đang hoạt động' : 'Không hoạt động'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedDepartment(dept);
                            setFormData({
                              name: dept.name,
                              code: dept.code,
                              description: dept.description || '',
                              manager: dept.manager || '',
                              status: dept.status
                            });
                            setIsEditingDepartment(true);
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDeleteDepartment(dept.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isAddingDepartment} onOpenChange={setIsAddingDepartment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm phòng ban mới</DialogTitle>
            <DialogDescription>
              Điền thông tin chi tiết về phòng ban mới
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Tên phòng ban</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nhập tên phòng ban"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="code">Mã phòng ban</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="Nhập mã phòng ban"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Nhập mô tả về phòng ban"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="manager">Quản lý</Label>
              <Input
                id="manager"
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                placeholder="Nhập tên quản lý"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'active' | 'inactive') =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Đang hoạt động</SelectItem>
                  <SelectItem value="inactive">Không hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingDepartment(false)}>
              Hủy
            </Button>
            <Button onClick={handleAddDepartment}>Thêm phòng ban</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditingDepartment} onOpenChange={setIsEditingDepartment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa phòng ban</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin chi tiết về phòng ban
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Tên phòng ban</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-code">Mã phòng ban</Label>
              <Input
                id="edit-code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Mô tả</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-manager">Quản lý</Label>
              <Input
                id="edit-manager"
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Trạng thái</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'active' | 'inactive') =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Đang hoạt động</SelectItem>
                  <SelectItem value="inactive">Không hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingDepartment(false)}>
              Hủy
            </Button>
            <Button onClick={handleEditDepartment}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 