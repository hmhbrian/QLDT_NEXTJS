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
import type {
  DepartmentInfo,
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
} from "@/lib/types/department.types";
import { useManagersForDepartments } from "@/hooks/use-users";
import {
  useDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from "@/hooks/use-departments";
import { useUserStatuses } from "@/hooks/use-statuses";
import { DraggableDepartmentTree } from "@/components/departments/DraggableDepartmentTree";
import DepartmentFormDialog from "@/components/departments/DepartmentFormDialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { validateDepartmentTree } from "@/lib/utils/department-tree";
import { LoadingButton } from "@/components/ui/loading";
import { extractErrorMessage } from "@/lib/core";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import { useQuery } from "@tanstack/react-query";

export default function DepartmentsPage() {
  const {
    departments,
    isLoading: isDepartmentsLoading,
    error: departmentsError,
  } = useDepartments();

  const createDeptMutation = useCreateDepartment();
  const updateDeptMutation = useUpdateDepartment();
  const deleteDeptMutation = useDeleteDepartment();

  // Use new hook for managers suitable for departments
  const { managers, isLoading: isLoadingManagers } =
    useManagersForDepartments();

  const { userStatuses, isLoading: isStatusesLoading } = useUserStatuses();

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

  // Fetch department statuses from API
  const { data: departmentStatuses } = useQuery({
    queryKey: ["departmentStatuses"],
    queryFn: async () => {
      const response = await fetch(
        "http://localhost:5228/api/status/department"
      );
      if (!response.ok) throw new Error("Failed to fetch department statuses");
      const result = await response.json();
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const validation = useMemo(
    () => validateDepartmentTree(departments),
    [departments]
  );

  const filteredDepartments = useMemo(() => {
    return departments.filter((dept) => {
      const matchesSearch =
        dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dept.description || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (dept.managerName || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const statusIdToFilter = userStatuses.find(
        (s) => s.name === statusFilter
      )?.id;
      const matchesStatus =
        statusFilter === "all" || dept.status.id === statusIdToFilter;
      return matchesSearch && matchesStatus;
    });
  }, [departments, searchTerm, statusFilter, userStatuses]);

  const columns = useMemo(
    () =>
      getColumns(
        (dept: DepartmentInfo) => {
          setEditingDepartment(dept);
          setIsFormOpen(true);
        },
        setDeletingDepartment,
        departments,
        userStatuses
      ),
    [departments, userStatuses]
  );

  useEffect(() => {
    if (
      selectedDepartment &&
      !departments.some(
        (d) => d.departmentId === selectedDepartment.departmentId
      )
    ) {
      setSelectedDepartment(null);
    }
  }, [departments, selectedDepartment]);

  // Keep the selected department in sync with the latest data after updates
  useEffect(() => {
    if (!selectedDepartment) return;
    const fresh = departments.find(
      (d) => d.departmentId === selectedDepartment.departmentId
    );
    if (fresh && fresh !== selectedDepartment) {
      setSelectedDepartment(fresh);
    }
  }, [departments, selectedDepartment?.departmentId]);

  if (isDepartmentsLoading || isLoadingManagers) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 animate-pulse rounded w-48"></div>
          <div className="h-10 bg-gray-200 animate-pulse rounded w-32"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-gray-200 animate-pulse rounded"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  const handleOpenAddDialog = () => {
    setEditingDepartment(null);
    setIsFormOpen(true);
  };

  const handleOpenEditDialog = (dept: DepartmentInfo) => {
    setEditingDepartment(dept);
    setIsFormOpen(true);
  };

  const handleSaveDepartment = async (
    payload: CreateDepartmentPayload | UpdateDepartmentPayload,
    isEditing: boolean,
    deptId?: number
  ) => {
    try {
      if (isEditing && deptId) {
        await updateDeptMutation.mutateAsync({
          id: deptId,
          payload: payload as UpdateDepartmentPayload,
        });
      } else {
        await createDeptMutation.mutateAsync(
          payload as CreateDepartmentPayload
        );
      }
      // Only close form on success
      setIsFormOpen(false);
      setEditingDepartment(null);
    } catch (error) {
      // Form stays open on error, let DepartmentFormDialog handle the error display
      console.error("Failed to save department:", error);
    }
  };

  const handleDeleteDepartmentSubmit = () => {
    if (deletingDepartment) {
      deleteDeptMutation.mutate(deletingDepartment.departmentId, {
        onSuccess: () => {
          setDeletingDepartment(null);
          if (
            selectedDepartment?.departmentId ===
            deletingDepartment?.departmentId
          ) {
            setSelectedDepartment(null);
          }
        },
      });
    }
  };

  const handleUpdateDepartmentParent = (
    draggedDept: DepartmentInfo,
    newParentId: number | null
  ) => {
    const payload: UpdateDepartmentPayload = {
      DepartmentName: draggedDept.name,
      DepartmentCode: draggedDept.code,
      Description: draggedDept.description,
      ManagerId: draggedDept.managerId,
      StatusId: draggedDept.status.id,
      ParentId: newParentId,
    };

    updateDeptMutation.mutate({
      id: draggedDept.departmentId,
      payload: payload,
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
        onUpdateDepartments={handleUpdateDepartmentParent}
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
    const status = userStatuses.find(
      (s) => s.id === selectedDepartment.status.id
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
                  status?.name === "Đang hoạt động" ? "default" : "secondary"
                }
              >
                {status?.name || "Không có"}
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
            onClick={() => handleOpenAddDialog()}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Thêm phòng ban con
          </Button>
        </CardFooter>
      </>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="border border-border bg-card">
        <CardHeader className="pb-4 border-b p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <div>
                <CardTitle className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground">
                  Quản lý Phòng ban
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground mt-1">
                  Tạo, chỉnh sửa và quản lý tất cả phòng ban trong tổ chức
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={activeTab === "tree" ? "default" : "outline"}
                size="icon"
                onClick={() => setActiveTab("tree")}
                className="h-9 w-9"
              >
                <TreePine className="h-4 w-4" />
              </Button>
              <Button
                variant={activeTab === "table" ? "default" : "outline"}
                size="icon"
                onClick={() => setActiveTab("table")}
                className="h-9 w-9"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button onClick={handleOpenAddDialog} className="h-9 text-sm">
                <PlusCircle className="mr-1 sm:mr-2 h-4 w-4" /> 
                <span className="hidden sm:inline">Thêm phòng ban</span>
                <span className="sm:hidden">Thêm</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {activeTab === "tree" ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 items-start">
              <div className="space-y-4">
                <DraggableDepartmentTree
                  departments={departments}
                  onSelectDepartment={setSelectedDepartment}
                  onUpdateDepartments={handleUpdateDepartmentParent}
                  className="border border-border"
                />
              </div>
              <Card className="border border-border min-h-[400px] sm:min-h-[580px]">
                {renderRightPanelContent()}
              </Card>
            </div>
          ) : (
            <>
              <div className="mb-4 sm:mb-6">
                <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 bg-muted/40 p-3 sm:p-4 rounded-lg border border-border">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <Input
                      placeholder="Tìm kiếm phòng ban..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 h-9 sm:h-10 text-sm"
                    />
                  </div>
                  <Select
                    value={statusFilter}
                    onValueChange={(v) => setStatusFilter(v)}
                  >
                    <SelectTrigger className="w-full lg:w-[180px] h-9 sm:h-10">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      {departmentStatuses.map((status) => (
                        <SelectItem key={status.id} value={status.name}>
                          {status.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {isDepartmentsLoading || isStatusesLoading ? (
                <div className="flex h-48 sm:h-60 w-full items-center justify-center">
                  <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-primary" />
                  <p className="ml-2 sm:ml-3 text-sm text-muted-foreground">Đang tải...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                <DataTable columns={columns} data={filteredDepartments} />
                </div>
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
        isLoadingManagers={isLoadingManagers}
        departmentStatuses={departmentStatuses || []}
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
