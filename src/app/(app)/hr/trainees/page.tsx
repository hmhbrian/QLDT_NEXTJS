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
import { useState, useMemo, useCallback, useEffect } from "react";
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
import { NO_DEPARTMENT_VALUE } from "@/lib/config/constants";
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

const initialNewTraineeState: Partial<
  User & { password?: string; confirmPassword?: string }
> = {
  fullName: "",
  employeeId: "",
  email: "",
  phoneNumber: "",
  department: undefined,
  userStatus: { id: 2, name: "Đang hoạt động" },
  idCard: "",
  role: "HOCVIEN",
  urlAvatar: "https://placehold.co/40x40.png",
  password: "",
  confirmPassword: "",
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
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
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
  return trainees.filter(user => user.role === "HOCVIEN");
}, [trainees]);

  const { data: rolesResponse } = useQuery<PaginatedResponse<ServiceRole>>({
    queryKey: ["roles"],
    queryFn: () => rolesService.getRoles(),
  });
  const roles = rolesResponse?.items || [];

  const { departments: activeDepartments, isLoading: isDepartmentsLoading } =
    useDepartments({ status: "active" });
  const { userStatuses, isLoading: isStatusesLoading } = useUserStatuses();

  const createTraineeMutation = useCreateUserMutation();
  const updateTraineeMutation = useUpdateUserMutation();
  const deleteTraineeMutation = useDeleteUserMutation();

  const handleOpenAddDialog = () => {
    setEditingTrainee(null);
    setFormData(initialNewTraineeState);
    setIsFormOpen(true);
  };

  const handleOpenEditDialog = useCallback((trainee: User) => {
    setEditingTrainee(trainee);
    setFormData({
      ...trainee,
      password: "",
      confirmPassword: "",
    });
    setIsFormOpen(true);
  }, []);

  const handleDeleteTrainee = () => {
    if (deletingTrainee) {
      deleteTraineeMutation.mutate([deletingTrainee.id]);
      setDeletingTrainee(null);
    }
  };

  const handleSaveTrainee = async () => {
    if (!formData.fullName || !formData.email) {
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

    setIsFormOpen(false);

    if (editingTrainee) {
      const updatePayload: UpdateUserRequest = {
        fullName: formData.fullName,
        email: formData.email,
        idCard: formData.idCard,
        position: formData.position,
        numberPhone: formData.phoneNumber,
        departmentId: formData.department?.departmentId,
        roleId: hocvienRole.id,
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
      };
      console.log("Creating user with payload:", createPayload);
      await createTraineeMutation.mutateAsync(createPayload);
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-headline font-semibold">
          Quản lý Học viên
        </h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm học viên..."
              className="pl-10 w-full md:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={handleOpenAddDialog} className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-5 w-5" /> Thêm Học viên
          </Button>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Tất cả Học viên</CardTitle>
          <CardDescription>
            Quản lý thông tin học viên, ghi danh và phân công khóa học.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {traineesError ? (
            <p className="text-destructive text-center py-10">
              {extractErrorMessage(traineesError)}
            </p>
          ) : (
            <DataTable
              columns={columns}
              data={filteredTrainees}
              isLoading={isTraineesLoading}
              pageCount={pageCount}
              pagination={pagination}
              onPaginationChange={setPagination}
            />
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
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Họ và tên *</Label>
              <Input
                id="fullName"
                value={formData.fullName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="idCard">CMND/CCCD</Label>
              <Input
                id="idCard"
                value={formData.idCard || ""}
                onChange={(e) =>
                  setFormData({ ...formData, idCard: e.target.value })
                }
              />
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
            {!editingTrainee && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="password">Mật khẩu *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
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
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
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
