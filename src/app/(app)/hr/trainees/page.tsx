"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { PlusCircle, Search, Eye, EyeOff } from "lucide-react";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  ServiceRole,
} from "@/lib/types/user.types";
import { UserDetailDialog } from "@/components/users";
import { useToast } from "@/components/ui/use-toast";
import { useError } from "@/hooks/use-error";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import { useDebounce } from "@/hooks/use-debounce";
import { LoadingButton } from "@/components/ui/loading";
import { useDepartments } from "@/hooks/use-departments";
import { useUserStatuses } from "@/hooks/use-statuses";
import { useEmployeeLevel } from "@/hooks/use-employeeLevel";
import { NO_DEPARTMENT_VALUE } from "@/lib/config/constants";
import { DatePicker } from "@/components/ui/datepicker";
import { formatLocalYMD, parseYMDToLocalDate } from "@/lib/utils/date.utils";
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useUsers,
} from "@/hooks/use-users";
import { rolesService } from "@/lib/services";
import { useQuery } from "@tanstack/react-query";
import type { PaginatedResponse } from "@/lib/core";
import type { PaginationState } from "@tanstack/react-table";
import { extractErrorMessage } from "@/lib/core";
import { generateEmployeeId } from "@/lib/utils/code-generator";

const initialNewTraineeState: Partial<
  User & { password?: string; confirmPassword?: string }
> = {
  fullName: "",
  email: "",
  phoneNumber: "",
  department: undefined,
  position: "",
  userStatus: { id: 2, name: "Đang hoạt động" },
  idCard: "",
  role: "HOCVIEN",
  urlAvatar: "https://placehold.co/40x40.png",
  password: "",
  confirmPassword: "",
  employeeId: "",
  startWork: "",
  endWork: "",
  employeeLevel: undefined,
};

export default function TraineesPage() {
  const { toast } = useToast();
  const { showError } = useError();

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchTerm = useDebounce(searchQuery, 300);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Reset pagination to page 1 when search term changes
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [debouncedSearchTerm]);

  const [selectedTrainee, setSelectedTrainee] = useState<User | null>(null);
  const [editingTrainee, setEditingTrainee] = useState<User | null>(null);
  const [deletingTrainee, setDeletingTrainee] = useState<User | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewingTrainee, setIsViewingTrainee] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState<
    Partial<User & { password?: string; confirmPassword?: string }>
  >({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fullNameRef = useRef<HTMLInputElement | null>(null);
  const idCardRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const confirmPasswordRef = useRef<HTMLInputElement | null>(null);

  const validateField = (
    field: string,
    value: any,
    context: { isEdit: boolean; password?: string } = { isEdit: false }
  ): string | undefined => {
    switch (field) {
      case "fullName":
        if (!value) return "Họ và tên là bắt buộc.";
        break;
      case "idCard":
        if (!value) return "CMND/CCCD là bắt buộc.";
        break;
      case "email":
        if (!value) return "Email là bắt buộc.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value)))
          return "Email không hợp lệ.";
        break;
      case "password":
        if (!context.isEdit && !value) return "Mật khẩu là bắt buộc.";
        if (value && String(value).length < 6)
          return "Mật khẩu phải có ít nhất 6 ký tự.";
        break;
      case "confirmPassword":
        if (!context.isEdit && (value == null || value === ""))
          return "Xác nhận mật khẩu là bắt buộc.";
        if (value !== context.password) return "Xác nhận mật khẩu không khớp.";
        break;
      default:
        break;
    }
    return undefined;
  };

  const validateForm = (isEdit: boolean) => {
    const newErrors: Record<string, string> = {};
    newErrors.fullName =
      validateField("fullName", formData.fullName, { isEdit }) || "";
    newErrors.idCard =
      validateField("idCard", formData.idCard, { isEdit }) || "";
    newErrors.email = validateField("email", formData.email, { isEdit }) || "";
    if (!isEdit) {
      newErrors.password =
        validateField("password", formData.password, { isEdit }) || "";
      const confirmErr = validateField(
        "confirmPassword",
        formData.confirmPassword,
        { isEdit, password: formData.password }
      );
      if (confirmErr) newErrors.confirmPassword = confirmErr;
    }

    // Remove empty entries
    Object.keys(newErrors).forEach((k) => {
      if (!newErrors[k]) delete newErrors[k];
    });

    setErrors(newErrors);

    // Focus first error
    const order = [
      "fullName",
      "idCard",
      "email",
      "password",
      "confirmPassword",
    ];
    const first = order.find((k) => !!newErrors[k]);
    if (first) {
      if (first === "fullName") fullNameRef.current?.focus();
      else if (first === "idCard") idCardRef.current?.focus();
      else if (first === "email") emailRef.current?.focus();
      else if (first === "password") passwordRef.current?.focus();
      else if (first === "confirmPassword") confirmPasswordRef.current?.focus();
    }

    return Object.keys(newErrors).length === 0;
  };

  // Date helpers to avoid timezone shifts (store/display as local YYYY-MM-DD)
  const formatLocalYMD = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const parseYMDToLocalDate = (ymd?: string): Date | undefined => {
    if (!ymd) return undefined;
    const [y, m, d] = ymd.split("-").map((v) => parseInt(v, 10));
    if (!y || !m || !d) return undefined;
    return new Date(y, m - 1, d);
  };

  // Convert YYYY-MM-DD to API datetime string without timezone
  // Example: "2025-08-14" -> "2025-08-14T00:00:00"
  const ymdToApiDateTime = (ymd?: string | null): string | undefined => {
    if (!ymd) return undefined;
    const part = String(ymd).trim().slice(0, 10);
    if (!/\d{4}-\d{2}-\d{2}/.test(part)) return undefined;
    return `${part}T00:00:00`;
  };

  const {
    users: trainees,
    paginationInfo,
    isLoading: isTraineesLoading,
    error: traineesError,
  } = useUsers({
    // RoleName: "HOCVIEN",
    keyword: debouncedSearchTerm,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  });

  const pageCount = useMemo(
    () => paginationInfo?.totalPages ?? 0,
    [paginationInfo]
  );

  // Filter out ADMIN and HR users - HR chỉ xem được HOCVIEN
  const filteredTrainees = useMemo(() => {
    if (!trainees) return [];
    return trainees.filter((user) => user.role === "HOCVIEN");
  }, [trainees]);

  const { data: rolesResponse } = useQuery<PaginatedResponse<ServiceRole>>({
    queryKey: ["roles"],
    queryFn: () => rolesService.getRoles(),
  });
  const roles = rolesResponse?.items || [];

  const { departments: activeDepartments, isLoading: isDepartmentsLoading } =
    useDepartments({ status: "active" });
  const { userStatuses, isLoading: isStatusesLoading } = useUserStatuses();
  const { EmployeeLevel, loading: isEmployeeLevelLoading } = useEmployeeLevel();

  const createTraineeMutation = useCreateUserMutation();
  const updateTraineeMutation = useUpdateUserMutation();
  const deleteTraineeMutation = useDeleteUserMutation();

  const handleOpenAddDialog = () => {
    setEditingTrainee(null);
    setFormData(initialNewTraineeState);
    setErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEditDialog = useCallback((trainee: User) => {
    setEditingTrainee(trainee);
    setFormData({
      ...trainee,
      password: "",
      confirmPassword: "",
      startWork: trainee.startWork ? trainee.startWork.slice(0, 10) : "",
      endWork: trainee.endWork ? trainee.endWork.slice(0, 10) : "",
    });
    setErrors({});
    setIsFormOpen(true);
  }, []);

  const handleDeleteTrainee = () => {
    if (deletingTrainee) {
      deleteTraineeMutation.mutate([deletingTrainee.id]);
      setDeletingTrainee(null);
    }
  };

  const handleSaveTrainee = async () => {
    const isEdit = !!editingTrainee;

    if (!validateForm(isEdit)) {
      showError("FORM001");
      return;
    }

    const hocvienRole = roles.find((r) => r.name.toUpperCase() === "HOCVIEN");
    if (!hocvienRole) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy vai trò Học viên.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingTrainee) {
        const updatePayload: UpdateUserRequest = {
          fullName: formData.fullName,
          email: formData.email,
          idCard: formData.idCard,
          position: formData.position,
          numberPhone: formData.phoneNumber,
          departmentId: formData.department?.departmentId,
          roleId: hocvienRole.id,
          code: formData.employeeId,
          startWork: ymdToApiDateTime(formData.startWork as string),
          endWork: ymdToApiDateTime(formData.endWork as string),
          eLevelId: formData.employeeLevel?.eLevelId,
          statusId: formData.userStatus?.id,
        };

        await updateTraineeMutation.mutateAsync({
          id: editingTrainee.id,
          payload: updatePayload,
        });
      } else {
        const createPayload: CreateUserRequest = {
          fullName: formData.fullName!,
          email: formData.email!,
          password: formData.password!,
          confirmPassword: formData.confirmPassword!,
          idCard: formData.idCard,
          position: formData.position,
          numberPhone: formData.phoneNumber,
          departmentId: formData.department?.departmentId,
          roleId: hocvienRole.id,
          code: formData.employeeId,
          startWork: ymdToApiDateTime(formData.startWork as string),
          endWork: ymdToApiDateTime(formData.endWork as string),
          eLevelId: formData.employeeLevel?.eLevelId,
          statusId: formData.userStatus?.id,
        };

        console.log("Creating user with payload:", createPayload);
        await createTraineeMutation.mutateAsync(createPayload);
      }

      // Only close dialog when save succeeds
      setIsFormOpen(false);
      setErrors({});
    } catch (error) {
      console.error("Failed to save trainee:", error);
      // keep dialog open and show toast
      toast({
        title: "Lỗi",
        description: extractErrorMessage(error as any) || "Lưu thất bại",
        variant: "destructive",
      });
    }
  };

  const columns = useMemo(
    () =>
      getColumns(
        (trainee) => {
          setSelectedTrainee(trainee);
          setIsViewingTrainee(true);
        },
        handleOpenEditDialog,
        () =>
          toast({
            title: "Thông báo",
            description:
              "Chức năng quản lý khóa học cho học viên đang được phát triển.",
            variant: "default",
          }),
        (trainee) => setDeletingTrainee(trainee)
      ),
    [toast, handleOpenEditDialog]
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-headline font-semibold">
          Quản lý Học viên
        </h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <div className="relative flex-grow lg:flex-grow-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm học viên..."
              className="pl-9 sm:pl-10 w-full lg:w-64 h-9 sm:h-10 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            onClick={handleOpenAddDialog}
            className="w-full sm:w-auto h-9 sm:h-10 text-sm"
          >
            <PlusCircle className="mr-1 sm:mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Thêm Học viên</span>
            <span className="sm:hidden">Thêm</span>
          </Button>
        </div>
      </div>

      <Card className="border border-border bg-card">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">
            Tất cả Học viên
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Quản lý thông tin học viên, ghi danh và phân công khóa học
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {traineesError ? (
            <div className="p-6 sm:p-10">
              <p className="text-destructive text-center text-sm">
                {extractErrorMessage(traineesError)}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <DataTable
                columns={columns}
                data={filteredTrainees}
                isLoading={isTraineesLoading}
                pageCount={pageCount}
                pagination={pagination}
                onPaginationChange={setPagination}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingTrainee ? "Chỉnh sửa Học viên" : "Thêm Học viên Mới"}
            </DialogTitle>
            <DialogDescription>
              {editingTrainee
                ? "Cập nhật thông tin chi tiết cho học viên."
                : "Điền thông tin chi tiết để tạo học viên mới."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Họ và tên *</Label>
              <Input
                id="fullName"
                ref={fullNameRef}
                value={formData.fullName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                onBlur={(e) =>
                  setErrors((prev) => ({
                    ...prev,
                    fullName: validateField("fullName", e.target.value, {
                      isEdit: !!editingTrainee,
                    }),
                  }))
                }
                className={errors.fullName ? "border-destructive" : ""}
              />
              {errors.fullName && (
                <p className="text-sm text-destructive">{errors.fullName}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="employeeId">Mã học viên</Label>
              <div className="flex gap-2">
                <Input
                  id="employeeId"
                  value={formData.employeeId || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, employeeId: e.target.value })
                  }
                  placeholder="VD: EMP001"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const id = generateEmployeeId();
                    setFormData({ ...formData, employeeId: id });
                  }}
                  className="whitespace-nowrap"
                >
                  Tạo tự động
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                ref={emailRef}
                type="email"
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                onBlur={(e) =>
                  setErrors((prev) => ({
                    ...prev,
                    email: validateField("email", e.target.value, {
                      isEdit: !!editingTrainee,
                    }),
                  }))
                }
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="idCard">CMND/CCCD</Label>
              <Input
                id="idCard"
                ref={idCardRef}
                value={formData.idCard || ""}
                onChange={(e) =>
                  setFormData({ ...formData, idCard: e.target.value })
                }
                onBlur={(e) =>
                  setErrors((prev) => ({
                    ...prev,
                    idCard: validateField("idCard", e.target.value, {
                      isEdit: !!editingTrainee,
                    }),
                  }))
                }
                className={errors.idCard ? "border-destructive" : ""}
              />
              {errors.idCard && (
                <p className="text-sm text-destructive">{errors.idCard}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Số điện thoại</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber || ""}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Ngày bắt đầu học tập</Label>
              <DatePicker
                date={parseYMDToLocalDate(formData.startWork as string)}
                setDate={(d) =>
                  setFormData({
                    ...formData,
                    startWork: d ? formatLocalYMD(d) : "",
                  })
                }
                placeholder="Chọn ngày bắt đầu"
              />
            </div>
            <div className="grid gap-2">
              <Label>Ngày kết thúc học tập (nếu có)</Label>
              <DatePicker
                date={parseYMDToLocalDate(formData.endWork as string)}
                setDate={(d) =>
                  setFormData({
                    ...formData,
                    endWork: d ? formatLocalYMD(d) : "",
                  })
                }
                placeholder="Chọn ngày kết thúc"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="department">Phòng ban</Label>
              <Select
                value={
                  formData.department?.departmentId
                    ? String(formData.department.departmentId)
                    : NO_DEPARTMENT_VALUE
                }
                onValueChange={(value) => {
                  const selectedDept = activeDepartments.find(
                    (d) => String(d.departmentId) === value
                  );
                  setFormData({
                    ...formData,
                    department:
                      value === NO_DEPARTMENT_VALUE
                        ? undefined
                        : selectedDept
                        ? {
                            departmentId: selectedDept.departmentId,
                            departmentName: selectedDept.name,
                          }
                        : undefined,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn phòng ban" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_DEPARTMENT_VALUE}>
                    -- Không chọn --
                  </SelectItem>
                  {isDepartmentsLoading ? (
                    <SelectItem value="loading_depts" disabled>
                      Đang tải...
                    </SelectItem>
                  ) : activeDepartments.length > 0 ? (
                    activeDepartments.map((dept) => (
                      <SelectItem
                        key={dept.departmentId}
                        value={String(dept.departmentId)}
                      >
                        {dept.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no_depts" disabled>
                      Không có dữ liệu
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="position">Chức vụ</Label>
              <Input
                id="position"
                placeholder="Nhập chức vụ"
                value={formData.position || ""}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="employeeLevel">Cấp bậc</Label>
              <Select
                value={
                  formData.employeeLevel?.eLevelId
                    ? String(formData.employeeLevel.eLevelId)
                    : "no_level_selected"
                }
                onValueChange={(value: string) => {
                  if (value === "no_level_selected") {
                    setFormData({
                      ...formData,
                      employeeLevel: undefined,
                    });
                  } else {
                    const selectedLevel = EmployeeLevel.find(
                      (level) => String(level.eLevelId) === value
                    );
                    setFormData({
                      ...formData,
                      employeeLevel: selectedLevel || undefined,
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn cấp bậc" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no_level_selected">
                    -- Không chọn --
                  </SelectItem>
                  {isEmployeeLevelLoading ? (
                    <SelectItem value="loading_level" disabled>
                      Đang tải...
                    </SelectItem>
                  ) : EmployeeLevel.length > 0 ? (
                    EmployeeLevel.map((level) => (
                      <SelectItem
                        key={level.eLevelId}
                        value={String(level.eLevelId)}
                      >
                        {level.eLevelName}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no_level" disabled>
                      Không có dữ liệu
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={
                  formData.userStatus?.id ? String(formData.userStatus.id) : ""
                }
                onValueChange={(value: string) => {
                  const selectedStatus = userStatuses.find(
                    (s) => String(s.id) === value
                  );
                  if (selectedStatus) {
                    setFormData({ ...formData, userStatus: selectedStatus });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {isStatusesLoading ? (
                    <SelectItem value="loading_status" disabled>
                      Đang tải...
                    </SelectItem>
                  ) : userStatuses.length > 0 ? (
                    userStatuses.map((status) => (
                      <SelectItem key={status.id} value={String(status.id)}>
                        {status.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no_status" disabled>
                      Không có dữ liệu
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            {!editingTrainee && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="password">Mật khẩu *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      ref={passwordRef}
                      type={showPassword ? "text" : "password"}
                      value={formData.password || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      onBlur={(e) =>
                        setErrors((prev) => ({
                          ...prev,
                          password: validateField("password", e.target.value, {
                            isEdit: !!editingTrainee,
                          }),
                        }))
                      }
                      className={errors.password ? "border-destructive" : ""}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      ref={confirmPasswordRef}
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      onBlur={(e) =>
                        setErrors((prev) => ({
                          ...prev,
                          confirmPassword: validateField(
                            "confirmPassword",
                            e.target.value,
                            {
                              isEdit: !!editingTrainee,
                              password: formData.password,
                            }
                          ),
                        }))
                      }
                      className={
                        errors.confirmPassword ? "border-destructive" : ""
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsFormOpen(false)}
              disabled={
                createTraineeMutation.isPending ||
                updateTraineeMutation.isPending
              }
            >
              Hủy
            </Button>
            <LoadingButton
              onClick={handleSaveTrainee}
              isLoading={
                createTraineeMutation.isPending ||
                updateTraineeMutation.isPending
              }
            >
              {editingTrainee ? "Lưu thay đổi" : "Thêm Học viên"}
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Trainee Dialog */}
      <Dialog
        open={!!deletingTrainee}
        onOpenChange={() => setDeletingTrainee(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Bạn có chắc muốn xóa học viên "{deletingTrainee?.fullName}"? Hành
            động này không thể hoàn tác.
          </DialogDescription>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingTrainee(null)}
              disabled={deleteTraineeMutation.isPending}
            >
              Hủy
            </Button>
            <LoadingButton
              variant="destructive"
              onClick={handleDeleteTrainee}
              isLoading={deleteTraineeMutation.isPending}
            >
              Xóa
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Trainee Detail Dialog */}
      <UserDetailDialog
        user={selectedTrainee}
        isOpen={isViewingTrainee}
        onOpenChange={setIsViewingTrainee}
      />
    </div>
  );
}
