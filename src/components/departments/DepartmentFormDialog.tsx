"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import type {
  DepartmentInfo,
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
} from "@/lib/types/department.types";
import type { User } from "@/lib/types/user.types";
import { NO_DEPARTMENT_VALUE } from "@/lib/constants";
import { generateDepartmentCode } from "@/lib/utils/code-generator";

interface DepartmentFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  departmentToEdit: DepartmentInfo | null;
  onSave: (
    payload: CreateDepartmentPayload | UpdateDepartmentPayload,
    isEditing: boolean,
    deptId?: string
  ) => void;
  existingDepartments: DepartmentInfo[];
  managers: User[];
  isLoading?: boolean;
  isLoadingManagers?: boolean;
}

const initialFormData: CreateDepartmentPayload = {
  name: "",
  code: "",
  description: "",
  managerId: "",
  status: "active",
  parentId: null,
};

export function DepartmentFormDialog({
  isOpen,
  onOpenChange,
  departmentToEdit,
  onSave,
  existingDepartments,
  managers,
  isLoading,
  isLoadingManagers,
}: DepartmentFormDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] =
    useState<CreateDepartmentPayload>(initialFormData);

  useEffect(() => {
    if (departmentToEdit) {
      setFormData({
        name: departmentToEdit.name,
        code: departmentToEdit.code,
        description: departmentToEdit.description,
        managerId: departmentToEdit.managerId || "",
        status: departmentToEdit.status as "active" | "inactive",
        parentId: departmentToEdit.parentId,
      });
    } else {
      setFormData(initialFormData);
    }
  }, [departmentToEdit, isOpen]);

  const handleSubmit = () => {
    if (!formData.name) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ Tên phòng ban.",
        variant: "destructive",
      });
      return;
    }

    // Tự động tạo mã phòng ban nếu chưa có
    const finalFormData = {
      ...formData,
      code: formData.code || generateDepartmentCode(),
    };

    onSave(finalFormData, !!departmentToEdit, departmentToEdit?.departmentId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {departmentToEdit ? "Chỉnh sửa Phòng ban" : "Thêm phòng ban mới"}
          </DialogTitle>
          <DialogDescription>
            {departmentToEdit
              ? "Cập nhật thông tin chi tiết cho phòng ban."
              : "Điền thông tin chi tiết để tạo phòng ban mới."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Tên phòng ban *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="code">Mã phòng ban</Label>
            <div className="flex gap-2">
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="VD: DEPT001"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setFormData({ ...formData, code: generateDepartmentCode() })
                }
                className="whitespace-nowrap"
              >
                Tạo tự động
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Nếu để trống, hệ thống sẽ tự động tạo mã phòng ban
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="managerId">Quản lý</Label>
            <Select
              value={formData.managerId || ""}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  managerId: value === "none" ? "" : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn người quản lý" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">-- Không có --</SelectItem>
                {isLoadingManagers ? (
                  <SelectItem value="loading" disabled>
                    Đang tải...
                  </SelectItem>
                ) : managers.length > 0 ? (
                  managers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.fullName} ({manager.email})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no_data" disabled>
                    Không có dữ liệu
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="parentId">Phòng ban cha</Label>
            <Select
              value={formData.parentId || NO_DEPARTMENT_VALUE}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  parentId: value === NO_DEPARTMENT_VALUE ? null : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn phòng ban cha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_DEPARTMENT_VALUE}>
                  Không có (Cấp cao nhất)
                </SelectItem>
                {existingDepartments
                  .filter(
                    (d) => d.departmentId !== departmentToEdit?.departmentId
                  )
                  .map((dept) => (
                    <SelectItem
                      key={dept.departmentId}
                      value={dept.departmentId}
                    >
                      {dept.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="status">Trạng thái</Label>
            <Select
              value={formData.status}
              onValueChange={(value: "active" | "inactive") =>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <LoadingButton onClick={handleSubmit} isLoading={isLoading}>
            {departmentToEdit ? "Lưu thay đổi" : "Thêm mới"}
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
