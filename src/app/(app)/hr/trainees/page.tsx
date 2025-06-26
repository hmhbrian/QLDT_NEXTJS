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
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { useState, useMemo } from "react";
import type { User, Role, CreateUserRequest } from "@/lib/types/user.types";
import type { DepartmentInfo } from "@/lib/types/department.types";
import type { Position } from "@/lib/types/user.types";
import { useToast } from "@/components/ui/use-toast";
import { useError } from "@/hooks/use-error";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersService, rolesService } from "@/lib/services";
import { useDebounce } from "@/hooks/use-debounce";
import { LoadingButton, Spinner } from "@/components/ui/loading";
import { extractErrorMessage } from "@/lib/core";
import { useDepartments } from "@/hooks/use-departments";
import { usePositions } from "@/hooks/use-positions";
import { NO_DEPARTMENT_VALUE } from "@/lib/constants";

const initialNewTraineeState: Omit<User, "id"> & { password?: string } = {
  fullName: "",
  employeeId: "",
  email: "",
  phoneNumber: "",
  department: "",
  position: "",
  level: "intern",
  joinDate: "",
  manager: "",
  status: "working",
  idCard: "",
  role: "HOCVIEN",
  urlAvatar: "https://placehold.co/40x40.png",
  password: "",
};

export default function TraineesPage() {
  const { toast } = useToast();
  const { showError } = useError();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchTerm = useDebounce(searchQuery, 300);

  const [selectedTrainee, setSelectedTrainee] = useState<User | null>(null);
  const [editingTrainee, setEditingTrainee] = useState<User | null>(null);
  const [deletingTrainee, setDeletingTrainee] = useState<User | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewingTrainee, setIsViewingTrainee] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [formData, setFormData] = useState<
    Partial<User & { password?: string; confirmPassword?: string }>
  >({});

  // Data fetching with TanStack Query
  const {
    data: trainees = [],
    isLoading: isTraineesLoading,
    error: traineesError,
  } = useQuery<User[]>({
    queryKey: ["trainees", debouncedSearchTerm],
    queryFn: () =>
      usersService.getUsers({
        role: "HOCVIEN",
        search: debouncedSearchTerm,
        limit: 24,
      }),
  });

  const { data: roles = [], isLoading: isRolesLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: () => rolesService.getRoles(),
  });

  const { activeDepartments, isLoading: isDepartmentsLoading } =
    useDepartments();
  const { positions, loading: isPositionsLoading } = usePositions();

  // Mutations
  const createTraineeMutation = useMutation({
    mutationFn: (payload: CreateUserRequest) =>
      usersService.createUser(payload),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã thêm học viên mới.",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["trainees"] });
      setIsFormOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  const updateTraineeMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateUserRequest>;
    }) => usersService.updateUserByAdmin(id, payload),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Thông tin học viên đã được cập nhật.",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["trainees"] });
      setIsFormOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  const deleteTraineeMutation = useMutation({
    mutationFn: (id: string) => usersService.deleteUser(id),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã xóa học viên.",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["trainees"] });
      setDeletingTrainee(null);
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  const handleOpenAddDialog = () => {
    setEditingTrainee(null);
    setFormData(initialNewTraineeState);
    setIsFormOpen(true);
  };

  const handleOpenEditDialog = (trainee: User) => {
    setEditingTrainee(trainee);
    setFormData({
      ...trainee,
      department:
        typeof trainee.department === "object"
          ? trainee.department.departmentId
          : trainee.department,
      position:
        trainee.position && typeof trainee.position === "object"
          ? String((trainee.position as Position).positionId)
          : "",
    });
    setIsFormOpen(true);
  };

  const handleDeleteTrainee = () => {
    if (deletingTrainee) {
      deleteTraineeMutation.mutate(deletingTrainee.id);
    }
  };

  const handleSaveTrainee = () => {
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

    if (editingTrainee) {
      // Update logic
      const updatePayload: Partial<CreateUserRequest> = {
        FullName: formData.fullName,
        Email: formData.email,
        IdCard: formData.idCard,
        NumberPhone: formData.phoneNumber,
        PositionId: formData.position
          ? parseInt(formData.position as string)
          : undefined,
        DepartmentId: formData.department
          ? parseInt(formData.department as string)
          : undefined,
      };
      if (formData.password) {
        updatePayload.Password = formData.password;
        updatePayload.ConfirmPassword = formData.confirmPassword;
      }
      updateTraineeMutation.mutate({
        id: editingTrainee.id,
        payload: updatePayload,
      });
    } else {
      // Create logic
      const createPayload: CreateUserRequest = {
        FullName: formData.fullName!,
        Email: formData.email!,
        Password: formData.password!,
        ConfirmPassword: formData.confirmPassword!,
        RoleId: hocvienRole.id,
        IdCard: formData.idCard,
        NumberPhone: formData.phoneNumber,
        PositionId: formData.position
          ? parseInt(formData.position as string)
          : undefined,
        DepartmentId: formData.department
          ? parseInt(formData.department as string)
          : undefined,
      };
      createTraineeMutation.mutate(createPayload);
    }
  };

  const renderDepartmentName = (
    department: string | DepartmentInfo | undefined
  ): string => {
    if (!department) return "N/A";
    if (typeof department === "string") {
      const foundDept = activeDepartments.find(
        (d) => d.departmentId === department
      );
      return foundDept ? foundDept.name : "Không xác định";
    }
    // Handle both departmentName and name properties
    return department.departmentName || department.name || "Không xác định";
  };

  const getPositionName = (user: User): string => {
    if (user.position && typeof user.position === "object") {
      return user.position.positionName;
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
    [activeDepartments, toast]
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
          {isTraineesLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : traineesError ? (
            <p className="text-destructive text-center py-10">
              {extractErrorMessage(traineesError)}
            </p>
          ) : (
            <DataTable columns={columns} data={trainees} />
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
                  (typeof formData.department === "object"
                    ? formData.department.departmentId
                    : formData.department) || NO_DEPARTMENT_VALUE
                }
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
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
              <Label htmlFor="position">Cấp bậc</Label>
              <Select
                value={formData.position ? String(formData.position) : ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, position: value })
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
            <DialogDescription>
              Bạn có chắc muốn xóa học viên "{deletingTrainee?.fullName}"? Hành
              động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
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
            <DialogDescription>
              Thông tin chi tiết và lịch sử học tập của học viên
            </DialogDescription>
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
                  <strong>Cấp bậc:</strong> {getPositionName(selectedTrainee)}
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
