"use client";

import { useState, useMemo, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  PlusCircle,
  Pencil,
  Trash2,
  AlertCircle,
  Loader2,
  Search,
  List,
  TreePine,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type {
  DepartmentInfo,
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
} from "@/lib/types/department.types";
import type { User, Position } from "@/lib/types/user.types";
import { usersService, positionsService } from "@/lib/services";
import {
  useDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from "@/hooks/use-departments";
import { useUserStatuses } from "@/hooks/use-statuses";
import { DraggableDepartmentTree } from "@/components/departments/DraggableDepartmentTree";
import { DepartmentFormDialog } from "@/components/departments/DepartmentFormDialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { validateDepartmentTree } from "@/lib/utils/department-tree";
import { LoadingButton } from "@/components/ui/loading";
import { extractErrorMessage } from "@/lib/core";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import { useQuery } from "@tanstack/react-query";

export default function DepartmentsPage() {
  const { toast } = useToast();

  // Custom Hooks for data fetching and mutations
  const {
    departments,
    isLoading: isDepartmentsLoading,
    error: departmentsError,
  } = useDepartments();

  const createDeptMutation = useCreateDepartment();
  const updateDeptMutation = useUpdateDepartment();
  const deleteDeptMutation = useDeleteDepartment();

  // Fetching related data
  const { data: users = [], isLoading: isUsersLoading } = useQuery<User[], Error>({
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

  const { userStatuses, isLoading: isStatusesLoading } = useUserStatuses();

  const managers = useMemo(() => {
    if (isUsersLoading || isPositionsLoading || !users || !positions) {
      return [];
    }
    const managerPosition = positions.find(
      (p) => p.positionName === "Quản lý cấp trung"
    );
    if (!managerPosition) return [];
    const managerBaseLevelId = managerPosition.positionId;
    return users.filter((user) => {
      if (user.position && typeof user.position === "object" && user.position.positionId !== null) {
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
  const [activeTab, setActiveTab] = useState<"tree" | "table">("tree");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const validation = useMemo(() => validateDepartmentTree(departments), [departments]);

  const filteredDepartments = useMemo(() => {
    return departments.filter((dept) => {
      const matchesSearch =
        dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dept.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dept.managerName || "").toLowerCase().includes(searchTerm.toLowerCase());
      const statusIdToFilter = userStatuses.find((s) => s.name === statusFilter)?.id;
      const matchesStatus = statusFilter === "all" || dept.statusId === statusIdToFilter;
      return matchesSearch && matchesStatus;
    });
  }, [departments, searchTerm, statusFilter, userStatuses]);

  useEffect(() => {
    if (selectedDepartment && !departments.some((d) => d.departmentId === selectedDepartment.departmentId)) {
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

  const columns = useMemo(
    () => getColumns(handleOpenEditDialog, setDeletingDepartment, departments, userStatuses),
    [departments, userStatuses]
  );

  const handleSaveDepartment = async (
    payload: CreateDepartmentPayload | UpdateDepartmentPayload,
    isEditing: boolean,
    deptId?: string
  ) => {
    try {
      if (isEditing && deptId) {
        await updateDeptMutation.mutateAsync({ id: deptId, payload });
      } else {
        await createDeptMutation.mutateAsync(payload as CreateDepartmentPayload);
      }
      setIsFormOpen(false); // Close dialog on success
    } catch (error) {
      // Error is already handled by the mutation hook's toast
      console.error("Save department failed:", error);
    }
  };

  const handleDeleteDepartmentSubmit = () => {
    if (deletingDepartment) {
      deleteDeptMutation.mutate(deletingDepartment.departmentId, {
        onSuccess: () => {
          setDeletingDepartment(null);
          if (selectedDepartment?.departmentId === deletingDepartment?.departmentId) {
            setSelectedDepartment(null);
          }
        },
      });
    }
  };

  const handleUpdateDepartments = (updatedDepartments: DepartmentInfo[]) => {
    updatedDepartments.forEach((dept) => {
      const originalDept = departments.find((d) => d.departmentId === dept.departmentId);
      if (originalDept && (originalDept.parentId !== dept.parentId || originalDept.level !== dept.level)) {
        updateDeptMutation.mutate({
          id: dept.departmentId,
          payload: {
            name: originalDept.name,
            code: originalDept.code,
            description: originalDept.description,
            statusId: String(originalDept.statusId),
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
            <AlertDescription>{extractErrorMessage(departmentsError)}</AlertDescription>
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

    const parent = departments.find((d) => d.departmentId === selectedDepartment.parentId);
    const children = departments.filter((d) => d.parentId === selectedDepartment.departmentId);
    const status = userStatuses.find((s) => s.id === selectedDepartment.statusId);

    return (
      <>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{selectedDepartment.name}</CardTitle>
              <CardDescription>Mã: {selectedDepartment.code}</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => handleOpenEditDialog(selectedDepartment)}>
                <Pencil className="h-4 w-4 mr-2" /> Sửa
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setDeletingDepartment(selectedDepartment)}>
                <Trash2 className="h-4 w-4 mr-2" /> Xóa
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Mô tả</Label>
            <p className="text-sm text-muted-foreground">{selectedDepartment.description || "Không có mô tả"}</p>
          </div>
          <div className="space-y-1">
            <Label>Quản lý</Label>
            <p className="text-sm text-muted-foreground">{selectedDepartment.managerName || "Chưa có quản lý"}</p>
          </div>
          <div className="space-y-1">
            <Label>Trạng thái</Label>
            <div>
              <Badge variant={status?.name === "Đang hoạt động" ? "default" : "secondary"}>
                {status?.name || "N/A"}
              </Badge>
            </div>
          </div>
          <div className="space-y-1">
            <Label>Phòng ban cha</Label>
            <p className="text-sm text-muted-foreground">{parent ? parent.name : "Không có (Cấp cao nhất)"}</p>
          </div>
          <div className="space-y-1">
            <Label>Phòng ban con</Label>
            <div>
              {children.length > 0 ? (
                children.map((child) => (
                  <Badge key={child.departmentId} variant="outline" className="mr-2 mb-2">
                    {child.name}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Không có phòng ban con</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="secondary" className="w-full" onClick={() => handleOpenAddDialog(selectedDepartment.departmentId)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Thêm phòng ban con
          </Button>
        </CardFooter>
      </>
    );
  };

  const departmentStatuses = useMemo(
    () => userStatuses.filter((s) => s.name === "Đang hoạt động" || s.name === "Không hoạt động"),
    [userStatuses]
  );

  return (
    <div className="space-y-6">
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

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-headline">Quản lý Phòng ban</CardTitle>
              <CardDescription>Tạo, chỉnh sửa và quản lý tất cả phòng ban trong tổ chức.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant={activeTab === "tree" ? "default" : "outline"} size="icon" onClick={() => setActiveTab("tree")}>
                <TreePine className="h-4 w-4" />
              </Button>
              <Button variant={activeTab === "table" ? "default" : "outline"} size="icon" onClick={() => setActiveTab("table")}>
                <List className="h-4 w-4" />
              </Button>
              <Button onClick={() => handleOpenAddDialog()} className="ml-2">
                <PlusCircle className="mr-2 h-4 w-4" /> Thêm phòng ban
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === "tree" ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Cấu trúc</CardTitle>
                  <CardDescription>Kéo-thả để sắp xếp.</CardDescription>
                </CardHeader>
                <CardContent className="min-h-[400px]">{renderLeftPanelContent()}</CardContent>
              </Card>
              <Card className="shadow-sm min-h-[580px]">{renderRightPanelContent()}</Card>
            </div>
          ) : (
            <>
              <div className="mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <Input placeholder="Tìm kiếm phòng ban..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
                  </div>
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      {departmentStatuses.map((status) => (
                        <SelectItem key={status.id} value={status.name}>{status.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {isDepartmentsLoading || isStatusesLoading ? (
                <div className="flex h-60 w-full items-center justify-center">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="ml-3 text-muted-foreground">Đang tải danh sách phòng ban...</p>
                </div>
              ) : (
                <DataTable columns={columns} data={filteredDepartments} />
              )}
            </>
          )}
        </CardContent>
      </Card>

      <DepartmentFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        departmentToEdit={editingDepartment}
        onSave={handleSaveDepartment}
        existingDepartments={departments}
        managers={managers}
        isLoading={createDeptMutation.isPending || updateDeptMutation.isPending}
        isLoadingManagers={isUsersLoading || isPositionsLoading}
        userStatuses={userStatuses}
      />

      <Dialog open={deletingDepartment !== null} onOpenChange={() => setDeletingDepartment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa phòng ban</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xóa phòng ban "{deletingDepartment?.name}"? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingDepartment(null)} disabled={deleteDeptMutation.isPending}>
              Hủy
            </Button>
            <LoadingButton variant="destructive" onClick={handleDeleteDepartmentSubmit} isLoading={deleteDeptMutation.isPending}>
              Xóa
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
