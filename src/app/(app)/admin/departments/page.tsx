"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Building2,
  PlusCircle,
  Pencil,
  Trash2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type {
  DepartmentInfo,
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
  User,
  Position,
} from "@/lib/types";
import {
  departmentsService,
  usersService,
  positionsService,
} from "@/lib/services";
import { DEPARTMENTS_QUERY_KEY } from "@/hooks/use-departments";
import { DraggableDepartmentTree } from "@/components/departments/DraggableDepartmentTree";
import { DepartmentFormDialog } from "@/components/departments/DepartmentFormDialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { validateDepartmentTree } from "@/lib/utils/department-tree";
import { LoadingButton } from "@/components/ui/loading";
import { extractErrorMessage } from "@/lib/core";
import { Label } from "@/components/ui/label";

export default function DepartmentsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Data fetching
  const {
    data: departments = [],
    isLoading: isDepartmentsLoading,
    error: departmentsError,
  } = useQuery<DepartmentInfo[]>({
    queryKey: [DEPARTMENTS_QUERY_KEY],
    queryFn: () => departmentsService.getDepartments(),
  });

  const { data: users = [], isLoading: isUsersLoading } = useQuery<
    User[],
    Error
  >({
    queryKey: ["users"],
    queryFn: () => usersService.getUsers(),
  });

  const { data: positions = [], isLoading: isPositionsLoading } = useQuery<
    Position[],
    Error
  >({
    queryKey: ["positions"],
    queryFn: () => positionsService.getPositions(),
  });

  const managers = useMemo(() => {
    // Wait until both users and positions data are available
    if (isUsersLoading || isPositionsLoading || !users || !positions) {
      return [];
    }

    // Find the position object for "Quản lý cấp trung" to get its ID.
    const managerPosition = positions.find(
      (p) => p.positionName === "Quản lý cấp trung"
    );

    // If the base manager level isn't found, we cannot reliably determine managers.
    if (!managerPosition) {
      console.warn(
        "Could not find 'Quản lý cấp trung' position to identify managers."
      );
      return [];
    }

    const managerBaseLevelId = managerPosition.positionId;

    // Filter users who have a positionId at or above the base manager level.
    return users.filter((user) => {
      // Check if the user has a position object and a positionId
      if (
        user.position &&
        typeof user.position === "object" &&
        user.position.positionId !== null
      ) {
        const userLevelId = user.position.positionId;
        return userLevelId >= managerBaseLevelId;
      }
      return false;
    });
  }, [users, positions, isUsersLoading, isPositionsLoading]);

  // Component State
  const [selectedDepartment, setSelectedDepartment] =
    useState<DepartmentInfo | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] =
    useState<DepartmentInfo | null>(null);
  const [deletingDepartment, setDeletingDepartment] =
    useState<DepartmentInfo | null>(null);

  // Mutations
  const createDeptMutation = useMutation({
    mutationFn: (payload: CreateDepartmentPayload) =>
      departmentsService.createDepartment(payload),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã thêm phòng ban mới.",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: [DEPARTMENTS_QUERY_KEY] });
      setIsFormOpen(false);
    },
    onError: (error) =>
      toast({
        title: "Lỗi",
        description: extractErrorMessage(error),
        variant: "destructive",
      }),
  });

  const updateDeptMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateDepartmentPayload;
    }) => departmentsService.updateDepartment(id, payload),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã cập nhật thông tin phòng ban.",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: [DEPARTMENTS_QUERY_KEY] });
      setIsFormOpen(false);
    },
    onError: (error) =>
      toast({
        title: "Lỗi",
        description: extractErrorMessage(error),
        variant: "destructive",
      }),
  });

  const deleteDeptMutation = useMutation({
    mutationFn: (id: string) => departmentsService.deleteDepartment(id),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã xóa phòng ban.",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: [DEPARTMENTS_QUERY_KEY] });
      setDeletingDepartment(null);
      if (
        selectedDepartment?.departmentId === deletingDepartment?.departmentId
      ) {
        setSelectedDepartment(null);
      }
    },
    onError: (error) =>
      toast({
        title: "Lỗi",
        description: extractErrorMessage(error),
        variant: "destructive",
      }),
  });

  const validation = useMemo(
    () => validateDepartmentTree(departments || []),
    [departments]
  );

  useEffect(() => {
    // If the selected department is deleted, unselect it
    if (
      selectedDepartment &&
      !departments.some(
        (d) => d.departmentId === selectedDepartment.departmentId
      )
    ) {
      setSelectedDepartment(null);
    }
  }, [departments, selectedDepartment]);

  const handleOpenAddDialog = (parentId: string | null = null) => {
    setEditingDepartment(null);
    setIsFormOpen(true);
  };

  const handleOpenEditDialog = (dept: DepartmentInfo) => {
    setEditingDepartment(dept);
    setIsFormOpen(true);
  };

  const handleSaveDepartment = (
    payload: CreateDepartmentPayload | UpdateDepartmentPayload,
    isEditing: boolean,
    deptId?: string
  ) => {
    if (isEditing && deptId) {
      updateDeptMutation.mutate({ id: deptId, payload });
    } else {
      createDeptMutation.mutate(payload as CreateDepartmentPayload);
    }
  };

  const handleDeleteDepartmentSubmit = () => {
    if (deletingDepartment) {
      deleteDeptMutation.mutate(deletingDepartment.departmentId);
    }
  };

  const handleUpdateDepartments = (updatedDepartments: DepartmentInfo[]) => {
    updatedDepartments.forEach((dept) => {
      const originalDept = departments.find(
        (d) => d.departmentId === dept.departmentId
      );
      if (
        originalDept &&
        (originalDept.parentId !== dept.parentId ||
          originalDept.level !== dept.level)
      ) {
        updateDeptMutation.mutate({
          id: dept.departmentId,
          payload: {
            name: originalDept.name, // Include required fields
            code: originalDept.code, // Include required fields
            description: originalDept.description,
            status: originalDept.status,
            managerId: originalDept.managerId,
            parentId: dept.parentId || null,
          },
        });
      }
    });
  };

  const renderLeftPanelContent = () => {
    if (isDepartmentsLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (departmentsError) {
      return (
        <div className="p-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Lỗi tải dữ liệu</AlertTitle>
            <AlertDescription>
              {extractErrorMessage(departmentsError)}
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return (
      <DraggableDepartmentTree
        departments={departments}
        onSelectDepartment={setSelectedDepartment}
        onUpdateDepartments={handleUpdateDepartments}
        className="p-2"
      />
    );
  };

  const renderRightPanelContent = () => {
    if (!selectedDepartment) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
          <Building2 className="h-16 w-16 mb-4" />
          <p className="font-medium">Chọn một phòng ban để xem chi tiết</p>
          <p className="text-sm mt-1">Hoặc nhấn "Thêm phòng ban" để tạo mới.</p>
        </div>
      );
    }

    const parent = departments.find(
      (d) => d.departmentId === selectedDepartment.parentId
    );
    const children = departments.filter(
      (d) => d.parentId === selectedDepartment.departmentId
    );

    return (
      <>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{selectedDepartment.name}</CardTitle>
              <CardDescription>Mã: {selectedDepartment.code}</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenEditDialog(selectedDepartment)}
              >
                <Pencil className="h-4 w-4 mr-2" /> Sửa
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeletingDepartment(selectedDepartment)}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Xóa
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Mô tả</Label>
            <p className="text-sm text-muted-foreground">
              {selectedDepartment.description || "Không có mô tả"}
            </p>
          </div>
          <div className="space-y-1">
            <Label>Quản lý</Label>
            <p className="text-sm text-muted-foreground">
              {selectedDepartment.managerName || "Chưa có quản lý"}
            </p>
          </div>
          <div className="space-y-1">
            <Label>Trạng thái</Label>
            <div>
              <Badge
                variant={
                  selectedDepartment.status === "active"
                    ? "default"
                    : "secondary"
                }
              >
                {selectedDepartment.status === "active"
                  ? "Đang hoạt động"
                  : "Không hoạt động"}
              </Badge>
            </div>
          </div>
          <div className="space-y-1">
            <Label>Phòng ban cha</Label>
            <p className="text-sm text-muted-foreground">
              {parent ? parent.name : "Không có (Cấp cao nhất)"}
            </p>
          </div>
          <div className="space-y-1">
            <Label>Phòng ban con</Label>
            <div>
              {children.length > 0 ? (
                children.map((child) => (
                  <Badge
                    key={child.departmentId}
                    variant="outline"
                    className="mr-2 mb-2"
                  >
                    {child.name}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Không có phòng ban con
                </p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => handleOpenAddDialog(selectedDepartment.departmentId)}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Thêm phòng ban con
          </Button>
        </CardFooter>
      </>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl md:text-3xl font-headline font-semibold">
          Quản lý Phòng ban
        </h1>
        <Button onClick={() => handleOpenAddDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Thêm phòng ban
        </Button>
      </div>

      {!validation.valid && validation.issues && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Phát hiện lỗi trong cấu trúc phòng ban</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5 text-sm mt-2">
              {validation.issues.slice(0, 3).map((issue, index) => (
                <li key={index}>{issue.details}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Cấu trúc</CardTitle>
            <CardDescription>Kéo-thả để sắp xếp.</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[400px]">
            {renderLeftPanelContent()}
          </CardContent>
        </Card>

        <Card className="shadow-lg min-h-[580px]">
          {renderRightPanelContent()}
        </Card>
      </div>

      <DepartmentFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        departmentToEdit={editingDepartment}
        onSave={handleSaveDepartment}
        existingDepartments={departments}
        managers={managers}
        isLoading={createDeptMutation.isPending || updateDeptMutation.isPending}
        isLoadingManagers={isUsersLoading || isPositionsLoading}
      />

      <Dialog
        open={deletingDepartment !== null}
        onOpenChange={() => setDeletingDepartment(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa phòng ban</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xóa phòng ban "{deletingDepartment?.name}"? Hành
              động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingDepartment(null)}
              disabled={deleteDeptMutation.isPending}
            >
              Hủy
            </Button>
            <LoadingButton
              variant="destructive"
              onClick={handleDeleteDepartmentSubmit}
              isLoading={deleteDeptMutation.isPending}
            >
              Xóa
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
