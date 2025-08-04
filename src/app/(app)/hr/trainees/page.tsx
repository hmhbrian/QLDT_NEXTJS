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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PlusCircle,
  Search,
  Building2,
  UserCircle2,
  Calendar,
  Award,
  Eye,
  EyeOff,
} from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import {
  User,
  Role,
  CreateUserRequest,
  UpdateUserRequest,
  ServiceRole,
} from "@/lib/types/user.types";
import { DepartmentInfo } from "@/lib/types/department.types";
import { useToast } from "@/components/ui/use-toast";
import { useError } from "@/hooks/use-error";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import { useDebounce } from "@/hooks/use-debounce";
import { LoadingButton } from "@/components/ui/loading";
import { useDepartments } from "@/hooks/use-departments";
import { useEmployeeLevel } from "@/hooks/use-employeeLevel";
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
  employeeLevel: undefined,
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

  const { data: rolesResponse } = useQuery<PaginatedResponse<ServiceRole>>({
    queryKey: ["roles"],
    queryFn: () => rolesService.getRoles(),
  });
  const roles = rolesResponse?.items || [];

  const { departments: activeDepartments, isLoading: isDepartmentsLoading } =
    useDepartments({ status: "active" });
  const { EmployeeLevel, loading: isEmployeeLevelLoading } = useEmployeeLevel();
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
        FullName: formData.fullName,
        Email: formData.email,
        IdCard: formData.idCard,
        NumberPhone: formData.phoneNumber,
        eLevelId: formData.employeeLevel?.eLevelId,
        DepartmentId: formData.department?.departmentId
          ? parseInt(formData.department.departmentId)
          : undefined,
        RoleId: hocvienRole.id,
      };
      await updateTraineeMutation.mutateAsync({
        id: editingTrainee.id,
        payload: updatePayload,
      });
    } else {
      const createPayload: CreateUserRequest = {
        FullName: formData.fullName!,
        Email: formData.email!,
        Password: formData.password!,
        ConfirmPassword: formData.confirmPassword!,
        IdCard: formData.idCard,
        NumberPhone: formData.phoneNumber,
        eLevelId: formData.employeeLevel?.eLevelId,
        DepartmentId: formData.department?.departmentId
          ? parseInt(formData.department.departmentId)
          : undefined,
        RoleId: hocvienRole.id,
      };
      await createTraineeMutation.mutateAsync(createPayload);
    }
  };

  const renderDepartmentName = (department?: DepartmentInfo): string => {
    if (!department) return "N/A";
    return department.name || "Không xác định";
  };

  const getEmployeeLevel = (user: User): string => {
    if (user.employeeLevel && typeof user.employeeLevel === "object") {
      return user.employeeLevel.eLevelName;
    }
    return "Chưa có cấp bậc";
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
              data={trainees}
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
                value={formData.department?.departmentId || NO_DEPARTMENT_VALUE}
                onValueChange={(value) => {
                  const selectedDept = activeDepartments.find(
                    (d) => d.departmentId === value
                  );
                  setFormData({
                    ...formData,
                    department:
                      value === NO_DEPARTMENT_VALUE ? undefined : selectedDept,
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
                        value={dept.departmentId}
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
              <Label htmlFor="employeeLevel">Cấp bậc</Label>
              <Select
                value={
                  formData.employeeLevel
                    ? String(formData.employeeLevel.eLevelId)
                    : ""
                }
                onValueChange={(value) => {
                  const selectedPos = EmployeeLevel.find(
                    (p) => String(p.eLevelId) === value
                  );
                  setFormData({ ...formData, employeeLevel: selectedPos });
                }}
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

      {/* View Trainee Dialog */}
      <Dialog open={isViewingTrainee} onOpenChange={setIsViewingTrainee}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Chi tiết Học viên</DialogTitle>
          </DialogHeader>
          {selectedTrainee && (
            <Tabs defaultValue="info" className="mt-4">
              <TabsList>
                <TabsTrigger value="info">
                  <UserCircle2 className="h-4 w-4 mr-2" />
                  Thông tin cơ bản
                </TabsTrigger>
                <TabsTrigger value="department">
                  <Building2 className="h-4 w-4 mr-2" />
                  Phòng ban
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
                <p>
                  <strong>Họ tên:</strong> {selectedTrainee.fullName}
                </p>
                <p>
                  <strong>Email:</strong> {selectedTrainee.email}
                </p>
                <p>
                  <strong>Phòng ban:</strong>{" "}
                  {renderDepartmentName(selectedTrainee.department)}
                </p>
                <p>
                  <strong>Chức vụ:</strong> Chưa có
                </p>
                <p>
                  <strong>Cấp bậc:</strong> {getEmployeeLevel(selectedTrainee)}
                </p>
              </TabsContent>
              <TabsContent value="courses">
                <p className="text-center text-muted-foreground py-4">
                  Chức năng đang được phát triển.
                </p>
              </TabsContent>
              <TabsContent value="certificates">
                <p className="text-center text-muted-foreground py-4">
                  Chức năng đang được phát triển.
                </p>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
