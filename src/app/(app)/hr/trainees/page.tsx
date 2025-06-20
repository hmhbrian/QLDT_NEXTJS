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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  UserCheck,
  PlusCircle,
  MoreHorizontal,
  Search,
  Mail,
  Phone,
  Building2,
  UserCircle2,
  Calendar,
  Award,
  Edit,
  Trash2,
  AlertCircle,
  BookOpen,
} from "lucide-react"; // Đã thêm BookOpen
import { useState, useEffect } from "react";
import type {
  User,
  TraineeLevel,
  WorkStatus,
  CreateUserRequest,
} from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { useUserStore } from "@/stores/user-store";
import { useError } from "@/hooks/use-error";
import { API_CONFIG } from "@/lib/legacy-api/config";
import "@/lib/utils/api-test"; // Auto-test API connection

const initialNewTraineeState = {
  fullName: "",
  employeeId: "",
  email: "",
  phoneNumber: "",
  department: "",
  position: "",
  level: "beginner" as TraineeLevel,
  joinDate: "",
  manager: "",
  status: "working" as WorkStatus,
  idCard: "",
  urlAvatar: "https://placehold.co/40x40.png",
  password: "",
};

// Thêm type helper cho các key có thể sử dụng trong User
type KeysOfUser = keyof Omit<
  User,
  | "id"
  | "role"
  | "completedCourses"
  | "certificates"
  | "evaluations"
  | "createdAt"
  | "modifiedAt"
  | "startWork"
  | "endWork"
>;

export default function HOCVIENsPage() {
  const { toast } = useToast();
  const { showError } = useError();
  const { users, addUser, addUserViaApi, updateUser, deleteUser } =
    useUserStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHOCVIEN, setSelectedHOCVIEN] = useState<User | null>(null);
  const [isAddingHOCVIEN, setIsAddingHOCVIEN] = useState(false);
  const [isViewingHOCVIEN, setIsViewingHOCVIEN] = useState(false);
  const [editingHOCVIEN, setEditingHOCVIEN] = useState<User | null>(null);
  const [deletingHOCVIEN, setDeletingHOCVIEN] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Trạng thái form cho học viên mới
  const [newTraineesData, setNewTraineesData] = useState<
    Omit<
      User,
      | "id"
      | "role"
      | "completedCourses"
      | "certificates"
      | "evaluations"
      | "createdAt"
      | "modifiedAt"
      | "startWork"
      | "endWork"
    > & { password?: string }
  >(initialNewTraineeState);
  const [editTraineesData, setEditTraineesData] = useState<Partial<User>>({});

  useEffect(() => {
    if (editingHOCVIEN) {
      setEditTraineesData({ ...editingHOCVIEN });
    } else {
      setEditTraineesData({});
    }
  }, [editingHOCVIEN]);

  const HOCVIENs = users.filter((user: User) => user.role === "HOCVIEN");

  const filteredTrainees = HOCVIENs.filter(
    (HOCVIEN: User) =>
      (HOCVIEN.fullName || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (HOCVIEN.employeeId || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (HOCVIEN.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (HOCVIEN.department || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const handleAddTrainee = async () => {
    if (
      !newTraineesData.fullName ||
      !newTraineesData.employeeId ||
      !newTraineesData.email ||
      !newTraineesData.idCard
    ) {
      showError("FORM001");
      return;
    }

    // Validation email domain
    if (!newTraineesData.email.endsWith("@becamex.com")) {
      toast({
        title: "Lỗi",
        description: "Email phải có domain @becamex.com",
        variant: "destructive",
      });
      return;
    }

    if (!newTraineesData.password || newTraineesData.password.length < 6) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu phải có ít nhất 6 ký tự.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Tạo payload phù hợp với API backend
      const createUserPayload: CreateUserRequest = {
        FullName: newTraineesData.fullName,
        Email: newTraineesData.email,
        Password: newTraineesData.password || "123456",
        ConfirmPassword: newTraineesData.password || "123456",
        IdCard: newTraineesData.idCard,
        Code: newTraineesData.employeeId,
        NumberPhone: newTraineesData.phoneNumber,
        RoleId: "HOCVIEN",
        StartWork: newTraineesData.joinDate
          ? new Date(newTraineesData.joinDate).toISOString()
          : new Date().toISOString(),
        DepartmentId: 1, // Default department ID
        StatusId: 1, // Default status ID (working)
        PositionId: 1, // Default position ID
      };

      await addUserViaApi(createUserPayload);

      setIsAddingHOCVIEN(false);
      setNewTraineesData(initialNewTraineeState);

      toast({
        title: "Thành công",
        description: "Đã thêm học viên mới thành công.",
        variant: "success",
      });
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Đã xảy ra lỗi khi thêm học viên.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateHOCVIEN = () => {
    if (!editingHOCVIEN || !editTraineesData.id) return;
    if (
      !editTraineesData.fullName ||
      !editTraineesData.employeeId ||
      !editTraineesData.email ||
      !editTraineesData.idCard
    ) {
      showError("FORM001");
      return;
    }

    updateUser(editingHOCVIEN.id, {
      ...editTraineesData,
      modifiedAt: new Date(),
    });
    setEditingHOCVIEN(null);
    toast({
      title: "Thành công",
      description: "Thông tin học viên đã được cập nhật.",
      variant: "success",
    });
  };

  const handleDeleteHOCVIEN = () => {
    if (!deletingHOCVIEN) return;
    deleteUser(deletingHOCVIEN.id);
    setDeletingHOCVIEN(null);
    toast({
      title: "Thành công",
      description: "Đã xóa học viên.",
      variant: "success",
    });
  };

  const getLevelBadgeColor = (level?: TraineeLevel) => {
    if (!level) return "bg-gray-100 text-gray-800";
    switch (level) {
      case "intern":
        return "bg-blue-100 text-blue-800";
      case "probation":
        return "bg-yellow-100 text-yellow-800";
      case "employee":
        return "bg-green-100 text-green-800";
      case "middle_manager":
        return "bg-purple-100 text-purple-800";
      case "senior_manager":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status?: WorkStatus) => {
    if (!status) return "bg-gray-100 text-gray-800";
    switch (status) {
      case "working":
        return "bg-green-100 text-green-800";
      case "resigned":
        return "bg-red-100 text-red-800";
      case "suspended":
        return "bg-yellow-100 text-yellow-800";
      case "maternity_leave":
        return "bg-purple-100 text-purple-800";
      case "sick_leave":
        return "bg-orange-100 text-orange-800";
      case "sabbatical":
        return "bg-blue-100 text-blue-800";
      case "terminated":
        return "bg-destructive text-destructive-foreground";
    }
  };

  const getStatusText = (status?: WorkStatus) => {
    if (!status) return "Không xác định";
    switch (status) {
      case "working":
        return "Đang làm việc";
      case "resigned":
        return "Đã nghỉ việc";
      case "suspended":
        return "Tạm nghỉ";
      case "maternity_leave":
        return "Nghỉ thai sản";
      case "sick_leave":
        return "Nghỉ bệnh dài hạn";
      case "sabbatical":
        return "Nghỉ phép dài hạn";
      case "terminated":
        return "Đã sa thải";
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: KeysOfUser,
    isEdit: boolean
  ) => {
    const value = e.target.value;
    if (isEdit) {
      setEditTraineesData((prev) => ({ ...prev, [field]: value }));
    } else {
      setNewTraineesData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSelectChange = (
    value: string,
    field: KeysOfUser,
    isEdit: boolean
  ) => {
    if (isEdit) {
      setEditTraineesData((prev) => ({
        ...prev,
        [field]: value as TraineeLevel | WorkStatus,
      }));
    } else {
      setNewTraineesData((prev) => ({
        ...prev,
        [field]: value as TraineeLevel | WorkStatus,
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Thông báo trạng thái API */}
      {!API_CONFIG.useApi && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                Chế độ Mock Data
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                API đang bị tắt. Hiện tại đang sử dụng dữ liệu mô phỏng. Để sử
                dụng API thực tế, vui lòng cài đặt{" "}
                <code>NEXT_PUBLIC_USE_API=true</code> trong file .env
              </p>
            </div>
          </div>
        </div>
      )}

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
          <Button
            onClick={() => {
              setNewTraineesData(initialNewTraineeState);
              setIsAddingHOCVIEN(true);
            }}
            className="w-full sm:w-auto"
            disabled={!API_CONFIG.useApi}
          >
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên & Mã NV</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Liên hệ
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Phòng ban
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Cấp bậc
                  </TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrainees.map((HOCVIEN) => (
                  <TableRow key={HOCVIEN.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={HOCVIEN.urlAvatar}
                            alt={HOCVIEN.fullName}
                            data-ai-hint="avatar person"
                          />
                          <AvatarFallback>
                            {HOCVIEN.fullName
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{HOCVIEN.fullName}</div>
                          <div className="text-xs text-muted-foreground">
                            {HOCVIEN.employeeId}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" /> {HOCVIEN.email}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" /> {HOCVIEN.phoneNumber}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {HOCVIEN.department}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {HOCVIEN.level && (
                        <Badge
                          variant="outline"
                          className={getLevelBadgeColor(
                            HOCVIEN.level as TraineeLevel
                          )}
                        >
                          {HOCVIEN.level.replace("_", " ").toUpperCase()}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusColor(HOCVIEN.status ?? "working")}
                      >
                        {getStatusText(HOCVIEN.status ?? "working")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-5 w-5" />
                            <span className="sr-only">Hành động học viên</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedHOCVIEN(HOCVIEN);
                              setIsViewingHOCVIEN(true);
                            }}
                          >
                            <UserCircle2 className="mr-2 h-4 w-4" /> Xem Chi
                            tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setEditingHOCVIEN(HOCVIEN)}
                          >
                            <Edit className="mr-2 h-4 w-4" /> Sửa Thông tin
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              toast({
                                title: "Thông báo",
                                description:
                                  "Chức năng quản lý khóa học cho học viên đang được phát triển.",
                                variant: "default",
                              })
                            }
                          >
                            <BookOpen className="mr-2 h-4 w-4" /> Quản lý Khóa
                            học
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeletingHOCVIEN(HOCVIEN)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Xóa Học viên
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add or Edit HOCVIEN Dialog */}
      <Dialog
        open={isAddingHOCVIEN || !!editingHOCVIEN}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setIsAddingHOCVIEN(false);
            setEditingHOCVIEN(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingHOCVIEN ? "Chỉnh sửa Học viên" : "Thêm Học viên Mới"}
            </DialogTitle>
            <DialogDescription>
              {editingHOCVIEN
                ? "Cập nhật thông tin chi tiết của học viên."
                : "Nhập thông tin chi tiết của học viên mới. Các trường có dấu * là bắt buộc."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            {/* Các trường form chung */}
            {(
              [
                "fullName",
                "employeeId",
                "idCard",
                "email",
                "phoneNumber",
                "department",
                "position",
                "manager",
                "joinDate",
              ] as const
            ).map((fieldKey) => {
              const isDateField = fieldKey === "joinDate";
              const currentData = editingHOCVIEN
                ? editTraineesData
                : newTraineesData;

              return (
                <div key={fieldKey} className="space-y-2">
                  <Label htmlFor={fieldKey}>
                    {fieldKey === "fullName" && "Họ và tên *"}
                    {fieldKey === "employeeId" && "Mã nhân viên *"}
                    {fieldKey === "idCard" && "CMND/CCCD *"}
                    {fieldKey === "email" && "Email công ty *"}
                    {fieldKey === "phoneNumber" && "Số điện thoại"}
                    {fieldKey === "department" && "Phòng ban"}
                    {fieldKey === "position" && "Chức vụ"}
                    {fieldKey === "manager" && "Quản lý trực tiếp"}
                    {fieldKey === "joinDate" && "Ngày vào công ty"}
                  </Label>
                  <Input
                    id={fieldKey}
                    type={isDateField ? "date" : "text"}
                    value={
                      isDateField
                        ? currentData[fieldKey]
                          ? new Date(currentData[fieldKey]!)
                              .toISOString()
                              .split("T")[0]
                          : ""
                        : (currentData[
                            fieldKey as keyof typeof currentData
                          ] as string) || ""
                    }
                    onChange={(e) =>
                      handleInputChange(
                        e,
                        fieldKey as KeysOfUser,
                        !!editingHOCVIEN
                      )
                    }
                    placeholder={
                      fieldKey === "fullName"
                        ? "Nguyễn Văn A"
                        : fieldKey === "employeeId"
                        ? "EMP001"
                        : fieldKey === "idCard"
                        ? "012345678910"
                        : fieldKey === "email"
                        ? "example@becamex.com"
                        : fieldKey === "phoneNumber"
                        ? "0901234567"
                        : fieldKey === "department"
                        ? "CNTT"
                        : fieldKey === "position"
                        ? "Developer"
                        : fieldKey === "manager"
                        ? "Nguyễn Văn B"
                        : ""
                    }
                  />
                </div>
              );
            })}

            {/* Trường mật khẩu - chỉ hiển thị khi thêm mới */}
            {!editingHOCVIEN && (
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu *</Label>
                <Input
                  id="password"
                  type="password"
                  value={newTraineesData.password || ""}
                  onChange={(e) =>
                    setNewTraineesData({
                      ...newTraineesData,
                      password: e.target.value,
                    })
                  }
                  placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                  minLength={6}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="level">Cấp bậc</Label>
              <Select
                value={
                  editingHOCVIEN
                    ? editTraineesData.level
                    : newTraineesData.level
                }
                onValueChange={(value: TraineeLevel) =>
                  handleSelectChange(
                    value,
                    "level" as KeysOfUser,
                    !!editingHOCVIEN
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn cấp bậc" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="intern">Thực tập</SelectItem>
                  <SelectItem value="probation">Thử việc</SelectItem>
                  <SelectItem value="employee">Nhân viên</SelectItem>
                  <SelectItem value="middle_manager">
                    Quản lý cấp trung
                  </SelectItem>
                  <SelectItem value="senior_manager">
                    Quản lý cấp cao
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={
                  editingHOCVIEN
                    ? editTraineesData.status
                    : newTraineesData.status
                }
                onValueChange={(value: WorkStatus) =>
                  handleSelectChange(
                    value,
                    "status" as KeysOfUser,
                    !!editingHOCVIEN
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="working">Đang làm việc</SelectItem>
                  <SelectItem value="resigned">Đã nghỉ việc</SelectItem>
                  <SelectItem value="suspended">Tạm nghỉ</SelectItem>
                  <SelectItem value="maternity_leave">Nghỉ thai sản</SelectItem>
                  <SelectItem value="sick_leave">Nghỉ bệnh dài hạn</SelectItem>
                  <SelectItem value="sabbatical">Nghỉ phép dài hạn</SelectItem>
                  <SelectItem value="terminated">Đã sa thải</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddingHOCVIEN(false);
                setEditingHOCVIEN(null);
              }}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              onClick={editingHOCVIEN ? handleUpdateHOCVIEN : handleAddTrainee}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Đang xử lý..."
                : editingHOCVIEN
                ? "Lưu thay đổi"
                : "Thêm Học viên"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View HOCVIEN Dialog */}
      <Dialog open={isViewingHOCVIEN} onOpenChange={setIsViewingHOCVIEN}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Chi tiết Học viên</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết và lịch sử học tập của học viên
            </DialogDescription>
          </DialogHeader>

          {selectedHOCVIEN && (
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

              <TabsContent value="info" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Thông tin cá nhân</h4>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <strong>Họ và tên:</strong> {selectedHOCVIEN.fullName}
                      </p>
                      <p className="text-sm">
                        <strong>Mã nhân viên:</strong>{" "}
                        {selectedHOCVIEN.employeeId}
                      </p>
                      <p className="text-sm">
                        <strong>CMND/CCCD:</strong> {selectedHOCVIEN.idCard}
                      </p>
                      <p className="text-sm">
                        <strong>Email:</strong> {selectedHOCVIEN.email}
                      </p>
                      <p className="text-sm">
                        <strong>Số điện thoại:</strong>{" "}
                        {selectedHOCVIEN.phoneNumber}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Thông tin công việc</h4>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <strong>Phòng ban:</strong> {selectedHOCVIEN.department}
                      </p>
                      <p className="text-sm">
                        <strong>Chức vụ:</strong>{" "}
                        {typeof selectedHOCVIEN.position === "string"
                          ? selectedHOCVIEN.position
                          : selectedHOCVIEN.position?.positionName || "N/A"}
                      </p>
                      <p className="text-sm">
                        <strong>Cấp bậc:</strong> {selectedHOCVIEN.level}
                      </p>
                      <p className="text-sm">
                        <strong>Quản lý:</strong> {selectedHOCVIEN.manager}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="department">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Cơ cấu phòng ban</h4>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Hiển thị cơ cấu phòng ban và vị trí của học viên trong
                        tổ chức
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="courses">
                <div className="space-y-4">
                  {(selectedHOCVIEN.completedCourses ?? []).length > 0 ? (
                    (selectedHOCVIEN.completedCourses ?? []).map((course) => (
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

              <TabsContent value="certificates">
                <div className="space-y-4">
                  {(selectedHOCVIEN.certificates ?? []).length > 0 ? (
                    (selectedHOCVIEN.certificates ?? []).map((cert) => (
                      <div key={cert.id} className="p-4 border rounded-lg">
                        <h4 className="font-medium">{cert.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Cấp bởi: {cert.issuingOrganization}
                        </p>
                        <p className="text-sm mt-2">
                          <strong>Ngày cấp:</strong>{" "}
                          {new Date(cert.issueDate).toLocaleDateString("vi-VN")}
                        </p>
                        {cert.credentialId && (
                          <p className="text-sm mt-1">
                            <strong>Mã chứng chỉ:</strong> {cert.credentialId}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      Chưa có chứng chỉ nào được cấp
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete HOCVIEN Confirmation Dialog */}
      <Dialog
        open={!!deletingHOCVIEN}
        onOpenChange={() => setDeletingHOCVIEN(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa học viên</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa học viên &quot;
              {deletingHOCVIEN?.fullName}&quot;? Hành động này không thể hoàn
              tác.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-4 py-4">
            <AlertCircle className="h-10 w-10 text-destructive flex-shrink-0" />
            <div>
              <p className="font-medium">{deletingHOCVIEN?.fullName}</p>
              <p className="text-sm text-muted-foreground">
                {deletingHOCVIEN?.email}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingHOCVIEN(null)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteHOCVIEN}>
              Xóa Học viên
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {filteredTrainees.length === 0 && !isAddingHOCVIEN && !editingHOCVIEN && (
        <div className="text-center py-12">
          <UserCheck className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-xl font-semibold">
            Không tìm thấy Học viên nào
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchQuery
              ? "Thử tìm kiếm với từ khóa khác"
              : 'Nhấn "Thêm Học viên" để bắt đầu.'}
          </p>
        </div>
      )}
    </div>
  );
}
