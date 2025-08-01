
"use client";

import { useState, useEffect, useMemo } from "react";
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
import type { DepartmentInfo, CreateDepartmentPayload, UpdateDepartmentPayload } from "@/lib/types/department.types";
import type { User } from "@/lib/types/user.types";
import type { Status } from "@/lib/types/status.types";
import { NO_DEPARTMENT_VALUE } from "@/lib/config/constants";
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
  userStatuses: Status[];
}

const initialFormData: CreateDepartmentPayload = {
  DepartmentName: "",
  DepartmentCode: "",
  Description: "",
  ManagerId: "",
  StatusId: 2, // Default to "Đang hoạt động"
  ParentId: null,
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
  userStatuses,
}: DepartmentFormDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] =
    useState<CreateDepartmentPayload | UpdateDepartmentPayload>(initialFormData);

  const departmentStatuses = useMemo(
    () =>
      userStatuses.filter(
        (s) => s.name === "Đang hoạt động" || s.name === "Không hoạt động"
      ),
    [userStatuses]
  );

  useEffect(() => {
    if (isOpen && departmentToEdit) {
      setFormData({
        DepartmentName: departmentToEdit.name,
        DepartmentCode: departmentToEdit.code,
        Description: departmentToEdit.description,
        ManagerId: departmentToEdit.managerId || "",
        StatusId: departmentToEdit.status?.id || 2,
        ParentId: departmentToEdit.parentId ? parseInt(departmentToEdit.parentId, 10) : null,
      });
    } else {
      setFormData(initialFormData);
    }
  }, [departmentToEdit, isOpen]);

  const handleSubmit = () => {
    if (!formData.DepartmentName) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ Tên phòng ban.",
        variant: "destructive",
      });
      return;
    }

    const finalFormData = {
      ...formData,
      DepartmentCode: formData.DepartmentCode || generateDepartmentCode(),
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
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid gap-2">
            <Label htmlFor="name">Tên phòng ban *</Label>
            <Input
              id="name"
              value={formData.DepartmentName}
              onChange={(e) =>
                setFormData({ ...formData, DepartmentName: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="code">Mã phòng ban</Label>
            <div className="flex gap-2">
              <Input
                id="code"
                value={formData.DepartmentCode}
                onChange={(e) =>
                  setFormData({ ...formData, DepartmentCode: e.target.value })
                }
                placeholder="VD: DEPT001"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setFormData({ ...formData, DepartmentCode: generateDepartmentCode() })
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
              value={formData.Description}
              onChange={(e) =>
                setFormData({ ...formData, Description: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="managerId">Quản lý</Label>
            <Select
              value={formData.ManagerId || ""}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  ManagerId: value === "none" ? "" : value,
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
              value={formData.ParentId ? String(formData.ParentId) : NO_DEPARTMENT_VALUE}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  ParentId: value === NO_DEPARTMENT_VALUE ? null : parseInt(value, 10),
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
              value={String(formData.StatusId || "")}
              onValueChange={(value: string) =>
                setFormData({
                  ...formData,
                  StatusId: parseInt(value, 10),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                {departmentStatuses.map((status) => (
                  <SelectItem key={status.id} value={String(status.id)}>
                    {status.name}
                  </SelectItem>
                ))}
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
