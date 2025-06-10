
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"; // Đã xóa DialogTrigger
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Building2, PlusCircle, MoreHorizontal, Search, Pencil, Trash2, AlertCircle } from "lucide-react";
import { useToast } from '@/components/ui/use-toast';
import type { DepartmentInfo as Department } from '@/lib/types'; // Cập nhật tên kiểu dữ liệu thành DepartmentInfo
import { mockDepartments as initialMockDepartments } from '@/lib/mock';
import { useCookie } from '@/hooks/use-cookie';

const DEPARTMENTS_COOKIE_KEY = 'becamex-departments-data';

export default function DepartmentsPage() {
  const { toast } = useToast();
  const [departments, setDepartments] = useCookie<Department[]>(DEPARTMENTS_COOKIE_KEY, initialMockDepartments);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false); // Đổi tên để rõ ràng hơn
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [deletingDepartment, setDeletingDepartment] = useState<Department | null>(null);
  
  const initialFormData = {
    name: '',
    code: '',
    description: '',
    managerId: '', // Đổi từ manager (chuỗi) sang managerId (chuỗi)
    status: 'active' as 'active' | 'inactive',
    level: 1,
    path: [] as string[],
  };
  const [formData, setFormData] = useState<Omit<Department, 'id' | 'createdAt' | 'updatedAt'>>(initialFormData);


  const handleOpenAddDialog = () => {
    setEditingDepartment(null);
    setFormData(initialFormData);
    setIsFormOpen(true);
  };

  const handleOpenEditDialog = (dept: Department) => {
    setEditingDepartment(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      description: dept.description || '',
      managerId: dept.managerId || '',
      status: dept.status,
      level: dept.level,
      path: dept.path || [dept.name], // Đường dẫn mặc định nếu chưa được đặt
    });
    setIsFormOpen(true);
  };
  
  const handleSaveDepartment = () => {
    try {
      if (!formData.name || !formData.code) {
        toast({
          title: "Lỗi",
          description: "Vui lòng điền đầy đủ Tên và Mã phòng ban.",
          variant: "destructive",
        });
        return;
      }
      
      const now = new Date().toISOString();

      if (editingDepartment) {
        // Cập nhật phòng ban hiện có
        setDepartments(prevDepts =>
          prevDepts.map(dept =>
            dept.id === editingDepartment.id
              ? { ...editingDepartment, ...formData, updatedAt: now }
              : dept
          )
        );
        toast({ title: "Thành công", description: "Đã cập nhật thông tin phòng ban.", variant: "success" });
      } else {
        // Thêm phòng ban mới
        const newDepartment: Department = {
          id: crypto.randomUUID(),
          ...formData,
          path: formData.path.length > 0 ? formData.path : [formData.name], // Đảm bảo đường dẫn được đặt
          createdAt: now,
          updatedAt: now,
        };
        setDepartments(prevDepts => [...prevDepts, newDepartment]);
        toast({ title: "Thành công", description: "Đã thêm phòng ban mới.", variant: "success" });
      }
      setIsFormOpen(false);
      setEditingDepartment(null);
    } catch (error) {
      toast({ title: "Lỗi", description: "Không thể lưu phòng ban. Vui lòng thử lại.", variant: "destructive" });
    }
  };


  const handleDeleteDepartmentSubmit = () => { // Đổi tên để tránh xung đột
    if (!deletingDepartment) return;
    try {
      setDepartments(prevDepts => prevDepts.filter(dept => dept.id !== deletingDepartment.id));
      toast({ title: "Thành công", description: "Đã xóa phòng ban.", variant: "success" });
      setDeletingDepartment(null);
    } catch (error) {
      toast({ title: "Lỗi", description: "Không thể xóa phòng ban. Vui lòng thử lại.", variant: "destructive" });
    }
  };

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.code.toLowerCase().includes(searchTerm.toLowerCase())
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button onClick={handleOpenAddDialog}>
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
                <TableHead>Quản lý (ID)</TableHead>
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
                  <TableCell>{dept.managerId || 'N/A'}</TableCell>
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
                        <DropdownMenuItem onClick={() => handleOpenEditDialog(dept)}>
                          <Pencil className="mr-2 h-4 w-4" /> Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeletingDepartment(dept)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           {filteredDepartments.length === 0 && (
            <p className="text-center text-muted-foreground py-6">Không có phòng ban nào.</p>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
          if (!isOpen) {
            setIsFormOpen(false);
            setEditingDepartment(null);
          } else {
            setIsFormOpen(true);
          }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingDepartment ? 'Chỉnh sửa Phòng ban' : 'Thêm phòng ban mới'}</DialogTitle>
            <DialogDescription>
              {editingDepartment ? 'Cập nhật thông tin chi tiết về phòng ban.' : 'Điền thông tin chi tiết về phòng ban mới.'}
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
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Nhập mô tả về phòng ban"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="managerId">ID Quản lý</Label>
              <Input
                id="managerId"
                value={formData.managerId || ''}
                onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                placeholder="Nhập ID của người quản lý (nếu có)"
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
            <Button variant="outline" onClick={() => { setIsFormOpen(false); setEditingDepartment(null); }}>
              Hủy
            </Button>
            <Button onClick={handleSaveDepartment}>{editingDepartment ? 'Lưu thay đổi' : 'Thêm phòng ban'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deletingDepartment !== null} onOpenChange={() => setDeletingDepartment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa phòng ban</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa phòng ban "{deletingDepartment?.name}"? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeletingDepartment(null)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteDepartmentSubmit}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
