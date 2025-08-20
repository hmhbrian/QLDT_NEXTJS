"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
import type { Status } from "@/lib/types/status.types";
import { NO_DEPARTMENT_VALUE } from "@/lib/config/constants";
import { generateDepartmentCode } from "@/lib/utils/code-generator";

// Type for manager from new API
interface Manager {
  id: string;
  name: string;
  email: string;
}

interface DepartmentFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  departmentToEdit: DepartmentInfo | null;
  onSave: (
    payload: CreateDepartmentPayload | UpdateDepartmentPayload,
    isEditing: boolean,
    deptId?: number
  ) => Promise<void>;
  existingDepartments: DepartmentInfo[];
  managers: Manager[];
  isLoading?: boolean;
  isLoadingManagers?: boolean;
  departmentStatuses: Status[]; // Changed from userStatuses to departmentStatuses
}

const initialFormData: CreateDepartmentPayload = {
  DepartmentName: "",
  DepartmentCode: "",
  Description: "",
  ManagerId: "",
  StatusId: 2, // Default to "Đang hoạt động"
  ParentId: null,
};

export default function DepartmentFormDialog({
  isOpen,
  onOpenChange,
  departmentToEdit,
  onSave,
  existingDepartments,
  managers,
  isLoading,
  isLoadingManagers,
  departmentStatuses, // Changed from userStatuses to departmentStatuses
}: DepartmentFormDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<
    CreateDepartmentPayload | UpdateDepartmentPayload
  >(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);

  // Eligible managers: API already filters managers suitable for departments
  const eligibleManagers = useMemo(() => {
    if (!managers) return [] as Manager[];
    const usedManagerIds = new Set(
      (existingDepartments || [])
        .map((d) => d.managerId)
        .filter((id): id is string => !!id)
    );

    // If editing, allow keeping current manager in options
    if (departmentToEdit?.managerId) {
      usedManagerIds.delete(departmentToEdit.managerId);
    }

    // API already provides filtered list of eligible managers
    return managers.filter((u) => !usedManagerIds.has(u.id));
  }, [managers, existingDepartments, departmentToEdit?.managerId]);

  useEffect(() => {
    if (!managers || managers.length === 0) {
       
      console.warn("[DepartmentFormDialog] managers is empty", managers);
    }
    if (!departmentStatuses || departmentStatuses.length === 0) {
       
      console.warn(
        "[DepartmentFormDialog] departmentStatuses is empty",
        departmentStatuses
      );
    }
  }, [managers, departmentStatuses]);

  useEffect(() => {
    if (isOpen && departmentToEdit) {
      setFormData({
        DepartmentName: departmentToEdit.name,
        DepartmentCode: departmentToEdit.code,
        Description: departmentToEdit.description,
        ManagerId: departmentToEdit.managerId || "",
        StatusId: departmentToEdit.status?.id || 2,
        ParentId: departmentToEdit.parentId || null,
      });
    } else {
      setFormData(initialFormData);
    }
    // Clear errors when dialog opens/closes or switches between add/edit
    setErrors({});
    setSubmitted(false);
  }, [departmentToEdit, isOpen]);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    const nameMsg = validateField("DepartmentName", formData.DepartmentName);
    if (nameMsg) newErrors.DepartmentName = nameMsg;

    const codeMsg = validateField("DepartmentCode", formData.DepartmentCode);
    if (codeMsg) newErrors.DepartmentCode = codeMsg;

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    return { isValid, newErrors };
  }, [
    formData.DepartmentName,
    formData.DepartmentCode,
    existingDepartments,
    departmentToEdit?.departmentId,
  ]);

  const clearFieldError = (fieldName: string) => {
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const validateField = (
    field: "DepartmentName" | "DepartmentCode",
    value: string
  ): string | undefined => {
    switch (field) {
      case "DepartmentName": {
        if (!value?.trim()) return "Tên phòng ban không được để trống";
        const duplicate = existingDepartments.find(
          (d) =>
            d.name.toLowerCase() === value.trim().toLowerCase() &&
            d.departmentId !== departmentToEdit?.departmentId
        );
        if (duplicate) return "Tên phòng ban đã tồn tại";
        break;
      }
      case "DepartmentCode": {
        if (!value?.trim()) return "Mã phòng ban không được để trống";
        const duplicate = existingDepartments.find(
          (d) =>
            d.code.toLowerCase() === value.trim().toLowerCase() &&
            d.departmentId !== departmentToEdit?.departmentId
        );
        if (duplicate) return "Mã phòng ban đã tồn tại";
        break;
      }
      default:
        break;
    }
    return undefined;
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    const { isValid, newErrors } = validateForm();
    if (!isValid) {
      // Focus on first error field
      const firstErrorField = Object.keys(newErrors)[0];
      if (firstErrorField) {
        const element = document.querySelector(
          `[name="${firstErrorField}"]`
        ) as HTMLElement;
        element?.focus();
      }
      // Show generic error message only on submit
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng kiểm tra lại các trường bắt buộc.",
        variant: "destructive",
      });
      return;
    }

    const finalFormData = {
      ...formData,
      DepartmentCode: formData.DepartmentCode || generateDepartmentCode(),
    };

    try {
      await onSave(
        finalFormData,
        !!departmentToEdit,
        departmentToEdit?.departmentId
      );
      // Form will be closed by parent component on success
    } catch (error: any) {
      // Handle server-side errors
      const errorMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        "Có lỗi xảy ra khi lưu phòng ban";

      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    }
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
              name="DepartmentName"
              value={formData.DepartmentName}
              onChange={(e) => {
                setFormData({ ...formData, DepartmentName: e.target.value });
                clearFieldError("DepartmentName");
              }}
              onBlur={(e) => {
                const msg = validateField("DepartmentName", e.target.value);
                if (msg) {
                  setErrors((prev) => ({ ...prev, DepartmentName: msg }));
                } else {
                  clearFieldError("DepartmentName");
                }
              }}
              className={errors.DepartmentName ? "border-red-500" : ""}
            />
            {errors.DepartmentName && (
              <p className="text-sm text-red-500">{errors.DepartmentName}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="code">Mã phòng ban *</Label>
            <div className="flex gap-2">
              <Input
                id="code"
                name="DepartmentCode"
                value={formData.DepartmentCode}
                onChange={(e) => {
                  setFormData({ ...formData, DepartmentCode: e.target.value });
                  clearFieldError("DepartmentCode");
                }}
                onBlur={(e) => {
                  const msg = validateField("DepartmentCode", e.target.value);
                  if (msg) {
                    setErrors((prev) => ({ ...prev, DepartmentCode: msg }));
                  } else {
                    clearFieldError("DepartmentCode");
                  }
                }}
                placeholder="VD: DEPT001"
                className={errors.DepartmentCode ? "border-red-500" : ""}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setFormData({
                    ...formData,
                    DepartmentCode: generateDepartmentCode(),
                  });
                  clearFieldError("DepartmentCode");
                }}
                className="whitespace-nowrap"
              >
                Tạo tự động
              </Button>
            </div>
            {errors.DepartmentCode && (
              <p className="text-sm text-red-500">{errors.DepartmentCode}</p>
            )}
          
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.Description}
              onChange={(e) =>
                setFormData({ ...formData, Description: e.target.value })
              }
              placeholder="Mô tả ngắn gọn chức năng, nhiệm vụ của phòng ban"
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
                ) : eligibleManagers.length > 0 ? (
                  eligibleManagers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.name} ({manager.email})
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
              value={
                formData.ParentId
                  ? String(formData.ParentId)
                  : NO_DEPARTMENT_VALUE
              }
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  ParentId:
                    value === NO_DEPARTMENT_VALUE ? null : parseInt(value, 10),
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
                      value={String(dept.departmentId)}
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
