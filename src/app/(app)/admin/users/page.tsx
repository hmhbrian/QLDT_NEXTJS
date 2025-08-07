"use client";

import { useState, useMemo, useCallback } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useError } from "@/hooks/use-error";
import { useDebounce } from "@/hooks/use-debounce";
import {
  User,
  Role,
  CreateUserRequest,
  UpdateUserRequest,
  EmployeeLevel,
  ResetPasswordRequest,
  ServiceRole,
} from "@/lib/types/user.types";
import { UserDetailDialog } from "@/components/users";
import { DepartmentInfo } from "@/lib/types/department.types";
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
  UserCircle2,
  Calendar,
  Award,
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
  };
  const [newUser, setNewUser] = useState<UserFormState>(initialNewUserState);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateUserRequest, string>>
  >({});

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
    refetchOnWindowFocus: false,
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
      role: userToEdit.role?.toUpperCase() as Role, // Ensure uppercase for consistency
      department: userToEdit.department?.departmentId,
      employeeLevel: userToEdit.employeeLevel
        ? String(userToEdit.employeeLevel.eLevelId)
        : "",
      password: "",
      confirmPassword: "",
    });
    setErrors({});
    setIsFormOpen(true);
  }, []);

  const validateForm = (isEdit: boolean) => {
    const data = newUser;
    const newErrors: Partial<Record<keyof CreateUserRequest, string>> = {};

    if (!data.fullName) newErrors.FullName = "Họ và tên là bắt buộc!";
    if (!data.idCard) newErrors.IdCard = "CMND/CCCD là bắt buộc!";
    if (!data.email) newErrors.Email = "Email là bắt buộc!";
    else if (!/^[a-zA-Z0-9._%+-]+@becamex\.com$/.test(data.email)) {
      newErrors.Email = "Email phải có domain @becamex.com.";
    }

    if (!isEdit) {
      if (!data.password) newErrors.Password = "Mật khẩu là bắt buộc!";
      else if (data.password.length < 6)
        newErrors.Password = "Mật khẩu phải có ít nhất 6 ký tự.";
      if (data.confirmPassword !== data.password)
        newErrors.ConfirmPassword = "Mật khẩu xác nhận không khớp.";
    } else if (data.password && data.password.trim()) {
      if (data.password.length < 6)
        newErrors.Password = "Mật khẩu phải có ít nhất 6 ký tự.";
      if (data.confirmPassword !== data.password)
        newErrors.ConfirmPassword = "Mật khẩu xác nhận không khớp.";
    }

    setErrors(newErrors);
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

    setIsFormOpen(false);

    try {
      if (isEdit && editingUser) {
        const updatePayload: UpdateUserRequest = {
          FullName: newUser.fullName,
          Email: newUser.email,
          IdCard: newUser.idCard,
          NumberPhone: newUser.phoneNumber,
          DepartmentId: newUser.department
            ? parseInt(newUser.department, 10)
            : undefined,
          RoleId: selectedRole.id,
          eLevelId: newUser.employeeLevel
            ? parseInt(newUser.employeeLevel, 10)
            : undefined,
          StatusId: newUser.userStatus?.id,
          Code: newUser.employeeId || undefined,
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
          FullName: newUser.fullName!,
          Email: newUser.email!,
          Password: newUser.password!,
          ConfirmPassword: newUser.confirmPassword!,
          RoleId: selectedRole.id,
          IdCard: newUser.idCard,
          NumberPhone: newUser.phoneNumber,
          eLevelId: newUser.employeeLevel
            ? parseInt(newUser.employeeLevel, 10)
            : undefined,
          DepartmentId: newUser.department
            ? parseInt(newUser.department, 10)
            : undefined,
          StatusId: newUser.userStatus?.id,
          Code: newUser.employeeId || undefined,
        };
        await createUserMutation.mutateAsync(createUserPayload);
      }
    } catch (error) {
      console.error("Failed to save user:", error);
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

  const renderDepartment = (department?: DepartmentInfo) => {
    return department?.name || "Chưa có phòng ban";
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tất cả Người dùng</CardTitle>
              <CardDescription>
                Quản lý tất cả tài khoản người dùng trong hệ thống.
              </CardDescription>
            </div>
            <Button onClick={handleOpenAddDialog}>
              <PlusCircle className="mr-2 h-4 w-4" /> Thêm người dùng
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input
                  placeholder="Tìm kiếm theo tên, email, mã NV..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={cn("pl-9", isUsersLoading && "pr-10")}
                />
                {isUsersLoading && (
                  <Spinner
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    size="sm"
                  />
                )}
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
              data={users}
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
                value={newUser.fullName}
                onChange={(e) =>
                  setNewUser({ ...newUser, fullName: e.target.value })
                }
                className={errors.FullName ? "border-destructive" : ""}
              />
              {errors.FullName && (
                <p className="text-sm text-destructive">{errors.FullName}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="idCard">CMND/CCCD *</Label>
              <Input
                id="idCard"
                value={newUser.idCard}
                onChange={(e) =>
                  setNewUser({ ...newUser, idCard: e.target.value })
                }
                className={errors.IdCard ? "border-destructive" : ""}
              />
              {errors.IdCard && (
                <p className="text-sm text-destructive">{errors.IdCard}</p>
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
              <p className="text-xs text-muted-foreground">
                Nếu để trống, hệ thống sẽ tự động tạo mã nhân viên
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                className={errors.Email ? "border-destructive" : ""}
              />
              {errors.Email && (
                <p className="text-sm text-destructive">{errors.Email}</p>
              )}
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
                        value={dept.departmentId}
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
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  className={errors.Password ? "border-destructive" : ""}
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
              {errors.Password && (
                <p className="text-sm text-destructive">{errors.Password}</p>
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
                  value={newUser.confirmPassword}
                  onChange={(e) =>
                    setNewUser({ ...newUser, confirmPassword: e.target.value })
                  }
                  className={errors.ConfirmPassword ? "border-destructive" : ""}
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
              {errors.ConfirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.ConfirmPassword}
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
