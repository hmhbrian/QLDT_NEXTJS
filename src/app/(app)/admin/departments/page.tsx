"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"; // Đã xóa DialogTrigger
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2,
  PlusCircle,
  MoreHorizontal,
  Search,
  Pencil,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DepartmentInfo as Department } from "@/lib/types"; // Cập nhật tên kiểu dữ liệu thành DepartmentInfo
import { mockDepartments as initialMockDepartments } from "@/lib/mock";
import { useCookie } from "@/hooks/use-cookie";
import { DraggableDepartmentTree } from "@/components/departments/DraggableDepartmentTree";
import {
  getAllChildDepartments,
  validateDepartmentTree,
} from "@/lib/utils/department-tree";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const DEPARTMENTS_COOKIE_KEY = "becamex-departments-data";

export default function DepartmentsPage() {
  const { toast } = useToast();
  const [departments, setDepartments] = useCookie<Department[]>(
    DEPARTMENTS_COOKIE_KEY,
    initialMockDepartments
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false); // Đổi tên để rõ ràng hơn
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null
  );
  const [deletingDepartment, setDeletingDepartment] =
    useState<Department | null>(null);
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination for table view
  const [pageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const paginatedDepartments = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return departments
      .filter(
        (dept) =>
          dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dept.code.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(startIndex, startIndex + pageSize);
  }, [departments, searchTerm, currentPage, pageSize]);

  const totalPages = Math.ceil(
    departments.filter(
      (dept) =>
        dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.code.toLowerCase().includes(searchTerm.toLowerCase())
    ).length / pageSize
  );

  const initialFormData = {
    name: "",
    code: "",
    description: "",
    managerId: "", // Đổi từ manager (chuỗi) sang managerId (chuỗi)
    status: "active" as "active" | "inactive",
    level: 1,
    path: [] as string[],
    parentId: "",
  };
  const [formData, setFormData] =
    useState<Omit<Department, "id" | "createdAt" | "updatedAt">>(
      initialFormData
    );

  // Kiểm tra tính hợp lệ của cấu trúc phòng ban
  const validation = useMemo(
    () => validateDepartmentTree(departments),
    [departments]
  );

  // Khắc phục lỗi cấu trúc phòng ban
  const handleFixDepartmentStructure = () => {
    if (!validation.valid && validation.issues) {
      const updatedDepartments = [...departments];

      // Khắc phục từng loại lỗi
      validation.issues.forEach((issue) => {
        const dept = updatedDepartments.find(
          (d) => d.id === issue.departmentId
        );
        if (!dept) return;

        if (issue.type === "circular_reference") {
          // Cắt đứt tham chiếu vòng tròn bằng cách đặt phòng ban này thành root
          dept.parentId = undefined;
          dept.level = 1;
          dept.path = [dept.name];
        } else if (issue.type === "missing_parent") {
          // Phòng ban có parentId không tồn tại, đặt thành root
          dept.parentId = undefined;
          dept.level = 1;
          dept.path = [dept.name];
        } else if (
          issue.type === "invalid_level" ||
          issue.type === "invalid_path"
        ) {
          if (dept.parentId) {
            // Cập nhật lại level và path dựa trên phòng ban cha
            const parent = updatedDepartments.find(
              (d) => d.id === dept.parentId
            );
            if (parent) {
              dept.level = parent.level + 1;
              dept.path = [...parent.path, dept.name];
            }
          } else {
            // Là phòng ban gốc, đặt level = 1 và path chỉ chứa tên
            dept.level = 1;
            dept.path = [dept.name];
          }
        }
      });

      // Cập nhật danh sách phòng ban
      setDepartments(updatedDepartments);
      toast({
        title: "Thành công",
        description: "Đã khắc phục các lỗi trong cấu trúc phòng ban.",
        variant: "success",
      });
    } else {
      // Nếu không có lỗi validation hoặc muốn reset về trạng thái ban đầu
      setDepartments(initialMockDepartments);
      toast({
        title: "Thành công",
        description: "Đã reset cấu trúc phòng ban về trạng thái ban đầu.",
        variant: "success",
      });
    }
  };

  const handleOpenAddDialog = () => {
    setEditingDepartment(null);
    setFormData(initialFormData);
    setIsFormOpen(true);
  };

  const handleOpenEditDialog = (dept: Department) => {
    setEditingDepartment(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      description: dept.description || "",
      managerId: dept.managerId || "",
      status: dept.status,
      level: dept.level,
      path: dept.path || [dept.name], // Đường dẫn mặc định nếu chưa được đặt
      parentId: dept.parentId || "",
    });
    setIsFormOpen(true);
  };

  const handleSaveDepartment = async () => {
    setIsSaving(true);
    try {
      if (!formData.name || !formData.code) {
        toast({
          title: "Lỗi",
          description: "Vui lòng điền đầy đủ Tên và Mã phòng ban.",
          variant: "destructive",
        });
        return;
      }

      const now = new Date().toISOString();

      // Determine the path
      let path = formData.path;

      // If parent exists, update path
      if (formData.parentId) {
        const parentDept = departments.find((d) => d.id === formData.parentId);
        if (parentDept) {
          // Inherit path from parent and add current name
          path = [...parentDept.path, formData.name];
        }
      } else {
        // No parent, this is a root department
        path = [formData.name];
      }

      if (editingDepartment) {
        // When updating a department's parent, all its children need path updates too
        const updatedDepartment: Department = {
          ...editingDepartment,
          ...formData,
          path,
          updatedAt: now,
        };

        // Get all affected child departments that need path updates
        const childDepartments = getAllChildDepartments(
          editingDepartment.id,
          departments
        );

        setDepartments((prevDepts) => {
          const updatedDepts = prevDepts.map((dept) => {
            if (dept.id === editingDepartment.id) {
              return updatedDepartment;
            }

            // Update all child departments' paths
            if (childDepartments.some((child) => child.id === dept.id)) {
              // Find the direct parent to rebuild the path
              const parentDept = dept.parentId
                ? prevDepts.find((p) => p.id === dept.parentId)
                : null;

              if (parentDept) {
                // Get updated parent department (might have been updated above)
                const updatedParent =
                  parentDept.id === editingDepartment.id
                    ? updatedDepartment
                    : parentDept;

                return {
                  ...dept,
                  path: [...updatedParent.path, dept.name],
                  updatedAt: now,
                };
              }
            }

            return dept;
          });

          return updatedDepts;
        });

        toast({
          title: "Thành công",
          description: "Đã cập nhật thông tin phòng ban.",
          variant: "success",
        });
      } else {
        // Thêm phòng ban mới
        const newDepartment: Department = {
          id: crypto.randomUUID(),
          ...formData,
          path, // Use calculated path
          createdAt: now,
          updatedAt: now,
        };
        setDepartments((prevDepts) => [...prevDepts, newDepartment]);
        toast({
          title: "Thành công",
          description: "Đã thêm phòng ban mới.",
          variant: "success",
        });
      }

      setIsFormOpen(false);
      setEditingDepartment(null);
    } catch (error) {
      console.error("Error saving department:", error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu phòng ban. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDepartmentSubmit = async () => {
    if (!deletingDepartment) return;

    setIsDeleting(true);

    // Kiểm tra xem phòng ban có phòng ban con không
    const hasChildren = departments.some(
      (dept) => dept.parentId === deletingDepartment?.id
    );

    if (hasChildren) {
      toast({
        title: "Không thể xóa",
        description:
          "Phòng ban này có các phòng ban con. Vui lòng xóa các phòng ban con trước.",
        variant: "destructive",
      });
      setIsDeleting(false);
      return;
    }

    try {
      setDepartments((prevDepts) =>
        prevDepts.filter((dept) => dept.id !== deletingDepartment.id)
      );
      toast({
        title: "Thành công",
        description: "Đã xóa phòng ban.",
        variant: "success",
      });
      setDeletingDepartment(null);
    } catch {
      toast({
        title: "Lỗi",
        description: "Không thể xóa phòng ban. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle department selection from tree view
  const handleSelectDepartment = (dept: Department) => {
    setSelectedDepartment(dept);
  };

  // Handle department tree update after drag-and-drop
  const handleUpdateDepartments = (updatedDepartments: Department[]) => {
    setDepartments(updatedDepartments);
    toast({
      title: "Thành công",
      description: "Đã cập nhật cấu trúc phòng ban.",
      variant: "success",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-headline font-semibold">
          Quản lý Phòng ban
        </h1>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm phòng ban..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Đặt lại về trang đầu tiên khi tìm kiếm
              }}
              className="pl-8"
            />
          </div>
          <Button onClick={handleOpenAddDialog}>
            <PlusCircle className="mr-2 h-4 w-4" /> Thêm mới
          </Button>
        </div>
      </div>

      {/* Hiển thị thông báo lỗi nếu có */}
      {!validation.valid && validation.issues && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Phát hiện lỗi trong cấu trúc phòng ban</AlertTitle>
          <AlertDescription>
            <div className="space-y-2 mt-2">
              <ul className="list-disc pl-5 text-sm">
                {validation.issues.slice(0, 3).map((issue, index) => (
                  <li key={index}>{issue.details}</li>
                ))}
                {validation.issues.length > 3 && (
                  <li>...và {validation.issues.length - 3} lỗi khác</li>
                )}
              </ul>
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFixDepartmentStructure}
                >
                  Khắc phục tự động
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setDepartments(initialMockDepartments);
                    toast({
                      title: "Thành công",
                      description: "Đã reset về cấu trúc phòng ban ban đầu.",
                      variant: "success",
                    });
                  }}
                >
                  Reset về ban đầu
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="tree" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="tree">Cấu trúc phân cấp</TabsTrigger>
          <TabsTrigger value="table">Danh sách</TabsTrigger>
        </TabsList>

        <TabsContent value="tree" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cấu trúc phòng ban</CardTitle>
              <CardDescription>
                Quản lý cấu trúc phòng ban phân cấp và mối quan hệ cha-con.
                Kéo-thả để sắp xếp lại.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded-md">
                  <DraggableDepartmentTree
                    departments={departments}
                    onSelectDepartment={handleSelectDepartment}
                    onUpdateDepartments={handleUpdateDepartments}
                    className="h-[400px] overflow-y-auto"
                  />
                </div>

                <div>
                  {selectedDepartment ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {selectedDepartment.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Mã: {selectedDepartment.code}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleOpenEditDialog(selectedDepartment)
                            }
                          >
                            <Pencil className="h-4 w-4 mr-2" /> Sửa
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              setDeletingDepartment(selectedDepartment)
                            }
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Xóa
                          </Button>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <p className="text-sm font-medium">Mô tả</p>
                        <p className="text-sm">
                          {selectedDepartment.description || "Không có mô tả"}
                        </p>
                      </div>

                      <div className="grid gap-2">
                        <p className="text-sm font-medium">Quản lý</p>
                        <p className="text-sm">
                          {selectedDepartment.managerId || "Chưa có quản lý"}
                        </p>
                      </div>

                      <div className="grid gap-2">
                        <p className="text-sm font-medium">Trạng thái</p>
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

                      <div className="grid gap-2">
                        <p className="text-sm font-medium">Phòng ban cha</p>
                        <p className="text-sm">
                          {selectedDepartment.parentId
                            ? departments.find(
                                (d) => d.id === selectedDepartment.parentId
                              )?.name || "Không tìm thấy"
                            : "Không có (phòng ban cấp cao nhất)"}
                        </p>
                      </div>

                      <div className="grid gap-2">
                        <p className="text-sm font-medium">Phòng ban con</p>
                        <div>
                          {departments
                            .filter((d) => d.parentId === selectedDepartment.id)
                            .map((child) => (
                              <Badge
                                key={child.id}
                                variant="outline"
                                className="mr-2 mb-2"
                              >
                                {child.name}
                              </Badge>
                            ))}
                          {departments.filter(
                            (d) => d.parentId === selectedDepartment.id
                          ).length === 0 && (
                            <p className="text-sm text-muted-foreground">
                              Không có phòng ban con
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <p className="text-sm font-medium">Đường dẫn</p>
                        <p className="text-sm">
                          {selectedDepartment.path.join(" > ")}
                        </p>
                      </div>

                      <div className="pt-2">
                        <Button
                          variant="secondary"
                          className="w-full"
                          onClick={() => {
                            setFormData({
                              ...initialFormData,
                              parentId: selectedDepartment.id,
                              level: selectedDepartment.level + 1,
                              path: [...selectedDepartment.path],
                            });
                            setEditingDepartment(null);
                            setIsFormOpen(true);
                          }}
                        >
                          <PlusCircle className="h-4 w-4 mr-2" /> Thêm phòng ban
                          con
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full border rounded-md border-dashed p-6">
                      <div className="text-center">
                        <Building2 className="mx-auto h-8 w-8 text-muted-foreground" />
                        <h3 className="mt-2 text-sm font-semibold">
                          Chưa chọn phòng ban
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Chọn một phòng ban từ cấu trúc cây để xem thông tin
                          chi tiết
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="table" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách Phòng ban</CardTitle>
              <CardDescription>
                Quản lý thông tin và trạng thái các phòng ban trong công ty
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã phòng ban</TableHead>
                    <TableHead>Tên phòng ban</TableHead>
                    <TableHead>Phòng ban cha</TableHead>
                    <TableHead>Quản lý (ID)</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedDepartments.map((dept) => (
                    <TableRow key={dept.id}>
                      <TableCell className="font-medium">{dept.code}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{dept.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {dept.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {dept.parentId
                          ? departments.find((d) => d.id === dept.parentId)
                              ?.name || "N/A"
                          : "Không có"}
                      </TableCell>
                      <TableCell>{dept.managerId || "N/A"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            dept.status === "active" ? "default" : "secondary"
                          }
                        >
                          {dept.status === "active"
                            ? "Đang hoạt động"
                            : "Không hoạt động"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleOpenEditDialog(dept)}
                            >
                              <Pencil className="mr-2 h-4 w-4" /> Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeletingDepartment(dept)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {departments.filter(
                (dept) =>
                  dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  dept.code.toLowerCase().includes(searchTerm.toLowerCase())
              ).length === 0 && (
                <p className="text-center text-muted-foreground py-6">
                  Không có phòng ban nào.
                </p>
              )}

              {departments.filter(
                (dept) =>
                  dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  dept.code.toLowerCase().includes(searchTerm.toLowerCase())
              ).length > pageSize && (
                <div className="flex items-center justify-end space-x-2 py-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    Trước
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Sau
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Hộp thoại Thêm/Sửa */}
      <Dialog
        open={isFormOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setIsFormOpen(false);
            setEditingDepartment(null);
          } else {
            setIsFormOpen(true);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDepartment ? "Chỉnh sửa Phòng ban" : "Thêm phòng ban mới"}
            </DialogTitle>
            <DialogDescription>
              {editingDepartment
                ? "Cập nhật thông tin chi tiết về phòng ban."
                : "Điền thông tin chi tiết về phòng ban mới."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Tên phòng ban</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Nhập tên phòng ban"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="code">Mã phòng ban</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="Nhập mã phòng ban"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Nhập mô tả về phòng ban"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="managerId">ID Quản lý</Label>
              <Input
                id="managerId"
                value={formData.managerId || ""}
                onChange={(e) =>
                  setFormData({ ...formData, managerId: e.target.value })
                }
                placeholder="Nhập ID của người quản lý (nếu có)"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="parentId">Phòng ban cha</Label>
              <Select
                value={formData.parentId}
                onValueChange={(value: string) => {
                  // Lấy phòng ban cha
                  const parentDept = departments.find((d) => d.id === value);

                  // Cập nhật cấp độ và đường dẫn dựa trên phòng ban cha
                  if (parentDept) {
                    setFormData({
                      ...formData,
                      parentId: value,
                      level: parentDept.level + 1,
                      path: [...parentDept.path],
                    });
                  } else {
                    // Không có phòng ban cha - đây là phòng ban gốc
                    setFormData({
                      ...formData,
                      parentId: "",
                      level: 1,
                      path: [],
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn phòng ban cha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không có</SelectItem>
                  {departments
                    .filter((d) => d.id !== editingDepartment?.id)
                    .map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "active" | "inactive") =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Đang hoạt động</SelectItem>
                  <SelectItem value="inactive">Không hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsFormOpen(false);
                setEditingDepartment(null);
              }}
            >
              Hủy
            </Button>
            <LoadingButton
              onClick={handleSaveDepartment}
              isLoading={isSaving}
              disabled={isSaving}
            >
              {editingDepartment ? "Lưu thay đổi" : "Thêm phòng ban"}
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hộp thoại Xác nhận Xóa */}
      <Dialog
        open={deletingDepartment !== null}
        onOpenChange={() => setDeletingDepartment(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa phòng ban</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa phòng ban &quot;
              {deletingDepartment?.name}&quot;? Hành động này không thể hoàn
              tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setDeletingDepartment(null)}
            >
              Hủy
            </Button>
            <LoadingButton
              variant="destructive"
              onClick={handleDeleteDepartmentSubmit}
              isLoading={isDeleting}
              disabled={isDeleting}
            >
              Xóa
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
