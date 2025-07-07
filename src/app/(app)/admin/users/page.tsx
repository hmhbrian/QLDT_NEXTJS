
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
import type {
  User,
  Role,
  CreateUserRequest,
  RegisterDTO,
  Position,
} from "@/lib/types/user.types";
import type { DepartmentInfo } from "@/lib/types/department.types";
import { useToast } from "@/components/ui/use-toast";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import { cn } from "@/lib/utils";
import { extractErrorMessage } from "@/lib/core";
import { generateEmployeeId } from "@/lib/utils/code-generator";
import {
  usersService,
  rolesService,
  departmentsService,
  positionsService,
} from "@/lib/services";
import {
  useUsers,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "@/hooks/use-users";
import { useUserStatuses } from "@/hooks/use-statuses";
import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  PlusCircle,
  Search,
  UserCircle2,
  Calendar,
  Award,
  Eye,
  EyeOff,
} from "lucide-react";
import { NO_DEPARTMENT_VALUE } from "@/lib/constants";
import type { PaginationState } from "@tanstack/react-table";

// Define a specific type for the form state to avoid conflicts
// This resolves the 'is not assignable to type never' error
type UserFormState = Omit<Partial<RegisterDTO>, "statusId"> & {
  statusId?: string;
};

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const { showError } = useError();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
    numberPhone: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    position: "",
    level: "",
    statusId: "",
    employeeId: "",
  };
  const [newUser, setNewUser] = useState<UserFormState>(initialNewUserState);
  const [errors, setErrors] = useState<
    Partial<Record<keyof RegisterDTO, string>>
  >({});

  // Data Fetching with TanStack Query
  const {
    data: paginatedUsers,
    isLoading: isUsersLoading,
    isError: isUsersError,
    error: usersError,
  } = useQuery({
    queryKey: [
      "users",
      debouncedSearchTerm,
      pagination.pageIndex,
      pagination.pageSize,
    ],
    queryFn: () =>
      usersService.getUsersWithPagination({
        search: debouncedSearchTerm,
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
      }),
    placeholderData: (previousData) => previousData,
  });
  
  const users = useMemo(() => paginatedUsers?.items ?? [], [paginatedUsers]);
  const pageCount = useMemo(() => paginatedUsers?.pagination?.totalPages ?? 0, [paginatedUsers]);


  const { data: roles = [], isLoading: isRolesLoading } = useQuery<
    any[],
    Error
  >({
    queryKey: ["roles"],
    queryFn: () => rolesService.getRoles(),
  });

  const { userStatuses, isLoading: isStatusesLoading } = useUserStatuses();

  const { data: activeDepartments = [], isLoading: isDepartmentsLoading } =
    useQuery<DepartmentInfo[], Error>({
      queryKey: ["departments", { status: "active" }],
      queryFn: () => departmentsService.getDepartments({ status: "active" }),
    });

  const { data: positions = [], isLoading: isPositionsLoading } = useQuery<
    Position[],
    Error
  >({
    queryKey: ["positions"],
    queryFn: () => positionsService.getPositions(),
  });

  // Mutations from hooks
  const createUserMutation = useCreateUserMutation();
  const updateUserMutation = useUpdateUserMutation();
  const deleteUserMutation = useDeleteUserMutation();

  const sortedUsers = useMemo(
    () =>
      [...(users || [])].sort((a, b) => {
        if (a.email === currentUser?.email) return -1;
        if (b.email === currentUser?.email) return 1;
        return (a.fullName || "").localeCompare(b.fullName || "");
      }),
    [users, currentUser]
  );

  const getPositionName = (user: User): string => {
    if (user.position && typeof user.position === "object") {
      return user.position.positionName;
    }
    return "Chưa có cấp bậc";
  };

  const handleOpenAddDialog = () => {
    setEditingUser(null);
    setNewUser(initialNewUserState);
    setErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEditDialog = useCallback((userToEdit: User) => {
    setEditingUser(userToEdit);

    let departmentValue = "";
    if (userToEdit.department) {
      if (typeof userToEdit.department === "object") {
        departmentValue = String(userToEdit.department.departmentId);
      } else {
        departmentValue = userToEdit.department;
      }
    }

    setNewUser({
      fullName: userToEdit.fullName || "",
      idCard: userToEdit.idCard || "",
      role: userToEdit.role || "HOCVIEN",
      numberPhone: userToEdit.phoneNumber || "",
      email: userToEdit.email || "",
      password: "",
      confirmPassword: "",
      department: departmentValue,
      position:
        userToEdit.position && typeof userToEdit.position === "object"
          ? String((userToEdit.position as Position).positionId)
          : "",
      level: userToEdit.level || "",
      statusId: userToEdit.userStatus?.id
        ? String(userToEdit.userStatus.id)
        : "",
      employeeId: userToEdit.employeeId || (userToEdit as any).code || "",
    });
    setErrors({});
    setIsFormOpen(true);
  }, []);

  const validateForm = (isEdit: boolean) => {
    const data = newUser;
    const newErrors: Partial<Record<keyof RegisterDTO, string>> = {};

    if (!data.fullName) newErrors.fullName = "Họ và tên là bắt buộc!";
    if (!data.idCard) newErrors.idCard = "CMND/CCCD là bắt buộc!";
    if (!data.email) newErrors.email = "Email là bắt buộc!";
    else if (!/^[a-zA-Z0-9._%+-]+@becamex\.com$/.test(data.email)) {
      newErrors.email = "Email phải có domain @becamex.com.";
    }

    if (!isEdit) {
      if (!data.password) newErrors.password = "Mật khẩu là bắt buộc!";
      else if (data.password.length < 6)
        newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
      if (data.confirmPassword !== data.password)
        newErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
    } else if (data.password && data.password.trim()) {
      if (data.password.length < 6)
        newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
      if (data.confirmPassword !== data.password)
        newErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
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

    const selectedRole = roles.find(role => role.name.toUpperCase() === newUser.role);
    if (!selectedRole) {
        toast({ title: "Lỗi", description: `Không tìm thấy vai trò ${newUser.role}.`, variant: "destructive" });
        return;
    }

    try {
        if (isEdit && editingUser) {
            // Sequential Operations: Reset Password, then Update User Info
            if (newUser.password && newUser.password.trim()) {
                await usersService.resetPassword(editingUser.id, {
                    newPassword: newUser.password,
                    confirmNewPassword: newUser.confirmPassword!,
                });
                toast({ title: "Thành công", description: "Mật khẩu người dùng đã được đặt lại.", variant: "success" });
            }

            const updatePayload: Partial<CreateUserRequest> = {
                FullName: newUser.fullName,
                Email: newUser.email,
                IdCard: newUser.idCard,
                NumberPhone: newUser.numberPhone,
                DepartmentId: newUser.department ? parseInt(newUser.department, 10) : undefined,
                RoleId: selectedRole.id,
                PositionId: newUser.position ? parseInt(newUser.position, 10) : undefined,
                StatusId: newUser.statusId ? parseInt(newUser.statusId, 10) : undefined,
                Code: newUser.employeeId || undefined,
            };
            
            await updateUserMutation.mutateAsync({ id: editingUser.id, payload: updatePayload });

        } else {
            // Create new user
            const createUserPayload: CreateUserRequest = {
                FullName: newUser.fullName!,
                Email: newUser.email!,
                Password: newUser.password!,
                ConfirmPassword: newUser.confirmPassword!,
                RoleId: selectedRole.id,
                IdCard: newUser.idCard,
                NumberPhone: newUser.numberPhone,
                PositionId: newUser.position ? parseInt(newUser.position, 10) : undefined,
                DepartmentId: newUser.department ? parseInt(newUser.department, 10) : undefined,
                StatusId: newUser.statusId ? parseInt(newUser.statusId, 10) : undefined,
                Code: newUser.employeeId || undefined,
            };
            await createUserMutation.mutateAsync(createUserPayload);
        }

        setIsFormOpen(false); // Close dialog on success

    } catch (error) {
        // Errors from mutations are handled by the hooks themselves (toast).
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
    deleteUserMutation.mutate(deletingUser.id);
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

  const renderDepartment = (
    department: string | DepartmentInfo | undefined
  ) => {
    if (!department) return "Chưa có phòng ban";
    if (typeof department === "string") return department;
    return department.name || "Không xác định";
  };

  const getEmployeeCode = (user: any): string => {
    if (user.employeeId) return user.employeeId;
    if (user.code) return user.code;
    if (user.Code) return user.Code;
    if (typeof user.userData === "object" && user.userData) {
      if (user.userData.employeeId) return user.userData.employeeId;
      if (user.userData.code) return user.userData.code;
      if (user.userData.Code) return user.userData.Code;
    }
    return "N/A";
  };

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
              data={sortedUsers}
              isLoading={isUsersLoading}
              pageCount={pageCount}
              pagination={pagination}
              onPaginationChange={setPagination}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={isViewingUser} onOpenChange={setIsViewingUser}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Chi tiết Học viên</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết và lịch sử học tập của học viên
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <Tabs defaultValue="info" className="mt-4">
              <TabsList>
                <TabsTrigger value="info">
                  <UserCircle2 className="h-4 w-4 mr-2" />
                  Thông tin cơ bản
                </TabsTrigger>
                <TabsTrigger value="courses">
                  <Calendar className="h-4 w-4 mr-2" />
                  Khóa học
                </TabsTrigger>
                <TabsTrigger value="certificates">
                  <Award className="h-4 w-4 mr-2" />
                  Chứng chỉ
                </TabsTrigger>
              </TabsList>
              <TabsContent value="info" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Thông tin cá nhân</h4>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <strong>Họ và tên:</strong> {selectedUser.fullName}
                      </p>
                      <p className="text-sm">
                        <strong>Mã nhân viên:</strong>{" "}
                        {getEmployeeCode(selectedUser)}
                      </p>
                      <p className="text-sm">
                        <strong>Email:</strong> {selectedUser.email}
                      </p>
                      <p className="text-sm">
                        <strong>Số điện thoại:</strong>{" "}
                        {selectedUser.phoneNumber || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Thông tin công việc</h4>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <strong>Phòng ban:</strong>{" "}
                        {renderDepartment(selectedUser.department)}
                      </p>
                      <p className="text-sm">
                        <strong>Chức vụ:</strong> Chưa có
                      </p>
                      <p className="text-sm">
                        <strong>Cấp bậc:</strong>{" "}
                        {getPositionName(selectedUser)}
                      </p>
                      <p className="text-sm">
                        <strong>Quản lý:</strong>{" "}
                        {selectedUser.manager || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="courses">
                <div className="space-y-4 pt-4">
                  {selectedUser.completedCourses &&
                  selectedUser.completedCourses.length > 0 ? (
                    selectedUser.completedCourses.map((course) => (
                      <div
                        key={course.courseId}
                        className="p-4 border rounded-lg"
                      >
                        <h4 className="font-medium">{course.courseName}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Hoàn thành:{" "}
                          {new Date(course.completionDate).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                        <p className="text-sm mt-2">
                          <strong>Điểm số:</strong> {course.grade}/100
                        </p>
                        {course.feedback && (
                          <p className="text-sm mt-2">
                            <strong>Nhận xét:</strong> {course.feedback}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      Chưa có khóa học nào được hoàn thành
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
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
                value={newUser.idCard}
                onChange={(e) =>
                  setNewUser({ ...newUser, idCard: e.target.value })
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
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="numberPhone">Số điện thoại</Label>
              <Input
                id="numberPhone"
                value={newUser.numberPhone}
                onChange={(e) =>
                  setNewUser({ ...newUser, numberPhone: e.target.value })
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
              <Label htmlFor="position">Cấp bậc</Label>
              <Select
                value={newUser.position}
                onValueChange={(value: string) =>
                  setNewUser({ ...newUser, position: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn cấp bậc" />
                </SelectTrigger>
                <SelectContent>
                  {isPositionsLoading ? (
                    <SelectItem value="loading_pos" disabled>
                      Đang tải...
                    </SelectItem>
                  ) : positions.length > 0 ? (
                    positions.map((pos) => (
                      <SelectItem
                        key={pos.positionId}
                        value={String(pos.positionId)}
                      >
                        {pos.positionName}
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
                value={newUser.role}
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
                        {role.name}
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
                value={newUser.statusId}
                onValueChange={(value: string) =>
                  setNewUser({ ...newUser, statusId: value })
                }
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
                {editingUser ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu *"}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
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
                  value={newUser.confirmPassword}
                  onChange={(e) =>
                    setNewUser({ ...newUser, confirmPassword: e.target.value })
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
            <DialogDescription>
              Bạn có chắc muốn xóa người dùng "{deletingUser?.fullName}"? Hành
              động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
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
 