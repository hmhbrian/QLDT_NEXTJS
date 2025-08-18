"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingButton, Spinner } from "@/components/ui/loading";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/datepicker";
import { useAuth } from "@/hooks/useAuth";
import { useError } from "@/hooks/use-error";
import { useDebounce } from "@/hooks/use-debounce";
import {
  User,
  Role,
  CreateUserRequest,
  UpdateUserRequest,
  ResetPasswordRequest,
  ServiceRole,
  UserDepartmentInfo,
} from "@/lib/types/user.types";
import { UserDetailDialog } from "@/components/users";
import { useToast } from "@/components/ui/use-toast";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import { cn } from "@/lib/utils";
import { extractErrorMessage } from "@/lib/core";
import { generateEmployeeId } from "@/lib/utils/code-generator";
import { rolesService, usersService } from "@/lib/services";
import {
  useUsers,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "@/hooks/use-users";
import { useUserStatuses } from "@/hooks/use-statuses";
import { useQuery } from "@tanstack/react-query";
import {
  PlusCircle,
  Search,
  Eye,
  EyeOff,
  Pencil,
} from "lucide-react";
import { NO_DEPARTMENT_VALUE } from "@/lib/config/constants";
import type { PaginatedResponse } from "@/lib/core";
import type { PaginationState } from "@tanstack/react-table";
import { useDepartments } from "@/hooks/use-departments";
import { useEmployeeLevel } from "@/hooks/use-employeeLevel";

// Role translations for UI display
const roleTranslations: Record<string, string> = {
  ADMIN: "Quản trị viên",
  HR: "Nhân sự",
  HOCVIEN: "Học viên",
};

type UserFormState = Partial<
  Omit<User, "department" | "employeeLevel"> & {
    password?: string;
    confirmPassword?: string;
    department?: string; // Storing as ID
    employeeLevel?: string; // Storing as ID
  }
>;

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const { showError } = useError();
  const { toast } = useToast();

  // UI State
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewingUser, setIsViewingUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Reset pagination to page 1 when search term changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, [debouncedSearchTerm]);

  // Form State
  const initialNewUserState: UserFormState = {
    fullName: "",
    idCard: "",
    role: "HOCVIEN",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    employeeLevel: "",
    userStatus: { id: 0, name: "" },
    employeeId: "",
    startWork: "",
    endWork: "",
  };
  const [newUser, setNewUser] = useState<UserFormState>(initialNewUserState);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateUserRequest, string>>
  >({});

  // Refs for focusing fields on validation error
  const fullNameRef = useRef<HTMLInputElement>(null);
  const idCardRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  // Data Fetching with TanStack Query - optimize for instant navigation
  const {
    users,
    paginationInfo,
    isLoading: isUsersLoading,
    isError: isUsersError,
    error: usersError,
  } = useUsers({
    keyword: debouncedSearchTerm,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  });

  const { data: rolesResponse, isLoading: isRolesLoading } = useQuery<
    PaginatedResponse<ServiceRole>,
    Error
  >({
    queryKey: ["roles"],
    queryFn: () => rolesService.getRoles(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: false,
  });
  const roles = rolesResponse?.items || [];

  const { userStatuses, isLoading: isStatusesLoading } = useUserStatuses();
  const { departments: activeDepartments, isLoading: isDepartmentsLoading } =
    useDepartments({ status: "active" });
  const { EmployeeLevel, loading: isEmployeeLevelLoading } = useEmployeeLevel();

  // Mutations from hooks
  const createUserMutation = useCreateUserMutation();
  const updateUserMutation = useUpdateUserMutation();
  const deleteUserMutation = useDeleteUserMutation();

  const pageCount = paginationInfo?.totalPages ?? 0;

  // Compute loading states
  const isLoading =
    isUsersLoading ||
    isRolesLoading ||
    isStatusesLoading ||
    isDepartmentsLoading ||
    isEmployeeLevelLoading;
  const isInitialLoading = isLoading && !users?.length && !roles.length;

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

  // Filter users based on current user role - HR cannot see ADMIN users
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    
    // If current user is HR, filter out ADMIN users
    if (currentUser?.role === "HR") {
      return users.filter(user => user.role !== "ADMIN");
    }
    
    // ADMIN can see all users
    return users;
  }, [users, currentUser?.role]);

  const getEmployeeLevel = (user: User): string => {
    return user.employeeLevel?.eLevelName || "Chưa có cấp bậc";
  };

  const handleOpenAddDialog = () => {
    setEditingUser(null);
    setNewUser(initialNewUserState);
    setErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEditDialog = useCallback((userToEdit: User) => {


    setEditingUser(userToEdit);
    setNewUser({
      ...userToEdit,
      role: userToEdit.role?.toUpperCase() as Role,
      department: userToEdit.department?.departmentId
        ? String(userToEdit.department.departmentId)
        : "",
      employeeLevel: userToEdit.employeeLevel
        ? String(userToEdit.employeeLevel.eLevelId)
        : "",
      password: "",
      confirmPassword: "",
      startWork: userToEdit.startWork ? userToEdit.startWork.slice(0, 10) : "",
      endWork: userToEdit.endWork ? userToEdit.endWork.slice(0, 10) : "",
    });
    setErrors({});
    setIsFormOpen(true);
  }, []);

  const validateField = (
    field: keyof CreateUserRequest | "confirmPassword",
    value: any,
    context: { isEdit: boolean; password?: string }
  ): string | undefined => {
    switch (field) {
      case "fullName":
        if (!value) return "Họ và tên là bắt buộc!";
        break;
      case "idCard":
        if (!value) return "CMND/CCCD là bắt buộc!";
        break;
      case "email":
        if (!value) return "Email là bắt buộc!";
        if (!/^[a-zA-Z0-9._%+-]+@becamex\.com$/.test(String(value)))
          return "Email phải có domain @becamex.com.";
        break;
      case "password":
        if (!context.isEdit && !value) return "Mật khẩu là bắt buộc!";
        if (value && String(value).length < 6)
          return "Mật khẩu phải có ít nhất 6 ký tự.";
        break;
      case "confirmPassword":
        if (!context.isEdit && value == null) return "Xác nhận mật khẩu là bắt buộc!";
        if (value !== context.password)
          return "Mật khẩu xác nhận không khớp.";
        break;
      default:
        break;
    }
    return undefined;
  };

  const validateForm = (isEdit: boolean) => {
    const data = newUser;
    const newErrors: Partial<Record<keyof CreateUserRequest, string>> = {};

    newErrors.fullName = validateField("fullName", data.fullName, { isEdit });
    newErrors.idCard = validateField("idCard", data.idCard, { isEdit });
    newErrors.email = validateField("email", data.email, { isEdit });
    newErrors.password = validateField("password", data.password, { isEdit });
    const confirmErr = validateField(
      "confirmPassword",
      data.confirmPassword,
      { isEdit, password: data.password }
    );
    if (confirmErr) newErrors.confirmPassword = confirmErr;

    // Remove undefined entries
    (Object.keys(newErrors) as Array<keyof CreateUserRequest>).forEach((k) =>
      newErrors[k] === undefined ? delete newErrors[k] : undefined
    );

    setErrors(newErrors);

    // Focus first error field
    const errorOrder: Array<keyof CreateUserRequest | "confirmPassword"> = [
      "fullName",
      "idCard",
      "email",
      "password",
      "confirmPassword",
    ];
    const firstError = errorOrder.find((k) =>
      k === "confirmPassword"
        ? !!newErrors.confirmPassword
        : !!newErrors[k as keyof CreateUserRequest]
    );
    if (firstError) {
      if (firstError === "fullName") fullNameRef.current?.focus();
      else if (firstError === "idCard") idCardRef.current?.focus();
      else if (firstError === "email") emailRef.current?.focus();
      else if (firstError === "password") passwordRef.current?.focus();
      else if (firstError === "confirmPassword")
        confirmPasswordRef.current?.focus();
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSaveUser = async () => {
    const isEdit = !!editingUser;
    if (!validateForm(isEdit)) {
      showError("FORM001");
      return;
    }

    const selectedRole = roles.find(
      (role) => role.name.toUpperCase() === newUser.role
    );
    if (!selectedRole) {
      toast({
        title: "Lỗi",
        description: `Không tìm thấy vai trò ${newUser.role}.`,
        variant: "destructive",
      });
      return;
    }

    try {
      if (isEdit && editingUser) {
        const updatePayload: UpdateUserRequest = {
          fullName: newUser.fullName,
          email: newUser.email,
          idCard: newUser.idCard,
          position: newUser.position,
          numberPhone: newUser.phoneNumber,
          departmentId: newUser.department
            ? parseInt(newUser.department, 10)
            : undefined,
          roleId: selectedRole.id,
          eLevelId: newUser.employeeLevel
            ? parseInt(newUser.employeeLevel, 10)
            : undefined,
          statusId: newUser.userStatus?.id,
          code: newUser.employeeId || undefined,
          startWork: newUser.startWork ? `${newUser.startWork}T00:00:00` : undefined,
          endWork: newUser.endWork ? `${newUser.endWork}T00:00:00` : undefined,
        };

        await updateUserMutation.mutateAsync({
          id: editingUser.id,
          payload: updatePayload,
        });

        if (newUser.password && newUser.password.trim()) {
          const resetPayload: ResetPasswordRequest = {
            NewPassword: newUser.password,
            ConfirmNewPassword: newUser.confirmPassword!,
          };
          await usersService.resetPassword(editingUser.id, resetPayload);
        }
      } else {
        const createUserPayload: CreateUserRequest = {
          fullName: newUser.fullName!,
          email: newUser.email!,
          password: newUser.password!,
          confirmPassword: newUser.confirmPassword!,
          roleId: selectedRole.id,
          idCard: newUser.idCard,
          position: newUser.position,
          numberPhone: newUser.phoneNumber,
          eLevelId: newUser.employeeLevel
            ? parseInt(newUser.employeeLevel, 10)
            : undefined,
          departmentId: newUser.department
            ? parseInt(newUser.department, 10)
            : undefined,
          statusId: newUser.userStatus?.id,
          code: newUser.employeeId || undefined,
          startWork: newUser.startWork ? `${newUser.startWork}T00:00:00` : undefined,
          endWork: newUser.endWork ? `${newUser.endWork}T00:00:00` : undefined,
        };
        await createUserMutation.mutateAsync(createUserPayload);
      }
      // Close only on success
      setIsFormOpen(false);
    } catch (error) {
      console.error("Failed to save user:", error);
      // Keep form open on error
    }
  };

  const handleDeleteUser = () => {
    if (!deletingUser) return;
    if (deletingUser.email === currentUser?.email) {
      toast({
        title: "Thao tác bị từ chối",
        description: "Bạn không thể xóa tài khoản của chính mình.",
        variant: "destructive",
      });
      return;
    }
    deleteUserMutation.mutate([deletingUser.id]);
    setDeletingUser(null);
  };

  const columns = useMemo(
    () =>
      getColumns(
        currentUser,
        (user) => {
          setSelectedUser(user);
          setIsViewingUser(true);
        },
        handleOpenEditDialog,
        (user) => setDeletingUser(user)
      ),
    [currentUser, handleOpenEditDialog]
  );

  const renderDepartment = (department?: UserDepartmentInfo | null) => {
    return department?.departmentName || "Chưa có phòng ban";
  };

  const getEmployeeCode = (user: any): string => {
    return user.employeeId || user.code || "Không có";
  };

  if (isInitialLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 w-full bg-gray-200 rounded animate-pulse"
                  ></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Card className="border border-border bg-card">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl font-semibold">Tất cả Người dùng</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Quản lý tất cả tài khoản người dùng trong hệ thống
              </CardDescription>
            </div>
            <Button onClick={handleOpenAddDialog} className="w-full sm:w-auto h-9 sm:h-10 text-sm">
              <PlusCircle className="mr-1 sm:mr-2 h-4 w-4" /> 
              <span className="hidden sm:inline">Thêm người dùng</span>
              <span className="sm:hidden">Thêm</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input
                  placeholder="Tìm kiếm theo tên, email, mã NV..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={cn(
                    "pl-9 pr-9",
                    isUsersLoading && "pr-10",
                    "transition-colors"
                  )}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                  {isUsersLoading ? (
                    <Spinner size="sm" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-muted-foreground/30" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {isUsersError ? (
            <p className="text-destructive text-center py-10">
              {extractErrorMessage(usersError)}
            </p>
          ) : (
            <DataTable
              columns={columns}
              data={filteredUsers}
              isLoading={isUsersLoading}
              pageCount={pageCount}
              pagination={pagination}
              onPaginationChange={setPagination}
            />
          )}
        </CardContent>
      </Card>

      {/* View User Detail Dialog */}
      <UserDetailDialog
        user={selectedUser}
        isOpen={isViewingUser}
        onOpenChange={setIsViewingUser}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px] border-orange-200">
          <DialogHeader className="border-b border-orange-100 pb-4">
            <DialogTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <div className="p-2 bg-orange-500 rounded-lg text-white">
                {editingUser ? (
                  <Pencil className="h-4 w-4" />
                ) : (
                  <PlusCircle className="h-4 w-4" />
                )}
              </div>
              {editingUser ? "Chỉnh sửa Người dùng" : "Thêm người dùng mới"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Họ và tên *</Label>
              <Input
                id="fullName"
                ref={fullNameRef}
                value={newUser.fullName}
                onChange={(e) =>
                  setNewUser({ ...newUser, fullName: e.target.value })
                }
                onBlur={(e) =>
                  setErrors((prev) => ({
                    ...prev,
                    fullName: validateField("fullName", e.target.value, {
                      isEdit: !!editingUser,
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
              <Label htmlFor="idCard">CMND/CCCD *</Label>
              <Input
                id="idCard"
                ref={idCardRef}
                value={newUser.idCard}
                onChange={(e) =>
                  setNewUser({ ...newUser, idCard: e.target.value })
                }
                onBlur={(e) =>
                  setErrors((prev) => ({
                    ...prev,
                    idCard: validateField("idCard", e.target.value, {
                      isEdit: !!editingUser,
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
              <Label htmlFor="employeeId">Mã nhân viên</Label>
              <div className="flex gap-2">
                <Input
                  id="employeeId"
                  value={newUser.employeeId}
                  onChange={(e) =>
                    setNewUser({ ...newUser, employeeId: e.target.value })
                  }
                  placeholder="VD: EMP001"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setNewUser({ ...newUser, employeeId: generateEmployeeId() })
                  }
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
                type="email"
                ref={emailRef}
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                onBlur={(e) =>
                  setErrors((prev) => ({
                    ...prev,
                    email: validateField("email", e.target.value, {
                      isEdit: !!editingUser,
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
              <Label>Ngày bắt đầu làm việc</Label>
              <DatePicker
                date={parseYMDToLocalDate(newUser.startWork as string)}
                setDate={(d) =>
                  setNewUser({
                    ...newUser,
                    startWork: d ? formatLocalYMD(d) : "",
                  })
                }
                placeholder="Chọn ngày bắt đầu"
              />
            </div>
            <div className="grid gap-2">
              <Label>Ngày kết thúc làm việc (nếu có)</Label>
              <DatePicker
                date={parseYMDToLocalDate(newUser.endWork as string)}
                setDate={(d) =>
                  setNewUser({
                    ...newUser,
                    endWork: d ? formatLocalYMD(d) : "",
                  })
                }
                placeholder="Chọn ngày kết thúc"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="numberPhone">Số điện thoại</Label>
              <Input
                id="numberPhone"
                value={newUser.phoneNumber}
                onChange={(e) =>
                  setNewUser({ ...newUser, phoneNumber: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="position">Chức vụ</Label>
              <Input
                id="position"
                placeholder="Nhập chức vụ"
                value={newUser.position || ""}
                onChange={(e) =>
                  setNewUser({ ...newUser, position: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="department">Phòng ban</Label>
              <Select
                value={newUser.department || NO_DEPARTMENT_VALUE}
                onValueChange={(value) =>
                  setNewUser({
                    ...newUser,
                    department: value === NO_DEPARTMENT_VALUE ? "" : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn phòng ban" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_DEPARTMENT_VALUE}>
                    -- Không chọn --
                  </SelectItem>
                  {isDepartmentsLoading ? (
                    <SelectItem value="loading" disabled>
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
                    <SelectItem value="none" disabled>
                      Không có dữ liệu
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="employeeLevel">Cấp bậc</Label>
              <Select
                value={newUser.employeeLevel}
                onValueChange={(value: string) =>
                  setNewUser({ ...newUser, employeeLevel: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn cấp bậc" />
                </SelectTrigger>
                <SelectContent>
                  {isEmployeeLevelLoading ? (
                    <SelectItem value="loading_pos" disabled>
                      Đang tải...
                    </SelectItem>
                  ) : EmployeeLevel.length > 0 ? (
                    EmployeeLevel.map((pos) => (
                      <SelectItem
                        key={pos.eLevelId}
                        value={String(pos.eLevelId)}
                      >
                        {pos.eLevelName}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no_pos" disabled>
                      Không có dữ liệu
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Vai trò</Label>
              <Select
                value={newUser.role?.toUpperCase() || ""}
                onValueChange={(value) =>
                  setNewUser({ ...newUser, role: value as Role })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  {isRolesLoading ? (
                    <SelectItem value="loading_roles" disabled>
                      Đang tải...
                    </SelectItem>
                  ) : roles.length > 0 ? (
                    roles.map((role) => (
                      <SelectItem
                        key={role.id}
                        value={role.name.toUpperCase() as Role}
                      >
                        {roleTranslations[role.name.toUpperCase()] || role.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no_roles" disabled>
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
                  newUser.userStatus?.id ? String(newUser.userStatus.id) : ""
                }
                onValueChange={(value: string) => {
                  const selectedStatus = userStatuses.find(
                    (s) => String(s.id) === value
                  );
                  if (selectedStatus) {
                    setNewUser({ ...newUser, userStatus: selectedStatus });
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
            <div className="grid gap-2">
              <Label htmlFor="password">
                {editingUser
                  ? "Mật khẩu mới (để trống nếu không đổi)"
                  : "Mật khẩu *"}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  ref={passwordRef}
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  onBlur={(e) =>
                    setErrors((prev) => ({
                      ...prev,
                      password: validateField("password", e.target.value, {
                        isEdit: !!editingUser,
                      }),
                    }))
                  }
                  className={errors.password ? "border-destructive" : ""}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">
                {editingUser ? "Xác nhận mật khẩu mới" : "Xác nhận mật khẩu *"}
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  ref={confirmPasswordRef}
                  value={newUser.confirmPassword}
                  onChange={(e) =>
                    setNewUser({ ...newUser, confirmPassword: e.target.value })
                  }
                  onBlur={(e) =>
                    setErrors((prev) => ({
                      ...prev,
                      confirmPassword: validateField(
                        "confirmPassword",
                        e.target.value,
                        { isEdit: !!editingUser, password: newUser.password }
                      ) as string,
                    }))
                  }
                  className={errors.confirmPassword ? "border-destructive" : ""}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsFormOpen(false)}
              disabled={
                createUserMutation.isPending || updateUserMutation.isPending
              }
            >
              Hủy
            </Button>
            <LoadingButton
              onClick={handleSaveUser}
              isLoading={
                createUserMutation.isPending || updateUserMutation.isPending
              }
            >
              {editingUser ? "Lưu thay đổi" : "Thêm người dùng"}
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deletingUser}
        onOpenChange={(isOpen) => !isOpen && setDeletingUser(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Bạn có chắc muốn xóa người dùng "{deletingUser?.fullName}"? Hành
            động này không thể hoàn tác.
          </DialogDescription>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingUser(null)}
              disabled={deleteUserMutation.isPending}
            >
              Hủy
            </Button>
            <LoadingButton
              variant="destructive"
              onClick={handleDeleteUser}
              isLoading={deleteUserMutation.isPending}
            >
              Xóa
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
