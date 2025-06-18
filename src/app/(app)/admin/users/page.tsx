"use client";

import { useEffect, useState } from "react";
import { fetchUsers } from "@/lib/api/users";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useError } from "@/hooks/use-error";
import { useDepartments } from "@/hooks/use-departments";
import type {
  User,
  Role,
  TraineeLevel,
  WorkStatus,
  RegisterDTO,
} from "@/lib/types";
import {
  PlusCircle,
  Search,
  MoreHorizontal,
  UserCircle2,
  Pencil,
  Trash2,
  Building2,
  Calendar,
  Award,
  AlertCircle,
} from "lucide-react";

const roleBadgeVariant: Record<Role, "default" | "secondary" | "outline"> = {
  Admin: "default",
  HR: "secondary",
  Trainee: "outline",
};

const roleTranslations: Record<Role, string> = {
  Admin: "Quản trị viên",
  HR: "Nhân sự",
  Trainee: "Học viên",
};

// Danh sách cấp bậc
const levelOptions = [
  { value: "intern", label: "Thực tập" },
  { value: "probation", label: "Thử việc" },
  { value: "employee", label: "Nhân viên" },
  { value: "middle_manager", label: "Quản lý cấp trung" },
  { value: "senior_manager", label: "Quản lý cấp cao" },
];

const getLevelBadgeColor = (level: TraineeLevel) => {
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

const getStatusColor = (status: WorkStatus) => {
  switch (status) {
    case "working":
      return "bg-green-100 text-green-800 hover:bg-green-50 transition-colors";
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

const getStatusText = (status: WorkStatus) => {
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

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const { showError } = useError();
  const { activeDepartments, isLoading: isDepartmentsLoading } =
    useDepartments();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [confirmPassword, setConfirmPassword] = useState(""); // Add separate state for confirm password
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewingUser, setIsViewingUser] = useState(false);
  const [newUser, setNewUser] = useState<RegisterDTO>({
    fullName: "",
    idCard: "",
    role: "Trainee",
    numberPhone: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    position: "",
    level: "intern",
    status: "working",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof RegisterDTO, string>>
  >({});
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    setLoading(true);
    setApiError("");
    fetchUsers({
      Page: 1,
      Limit: 20, // Backend chỉ cho phép 1-24
      SortField: "created.at",
      SortType: "desc",
    })
      .then((res) => {
        console.log("API response:", res);
        // Xử lý response dựa trên cấu trúc backend trả về
        if (res && res.data && res.data.items) {
          // Backend trả về: { data: { items: [...], pagination: {...} } }
          setUsers(Array.isArray(res.data.items) ? res.data.items : []);
        } else {
          setUsers([]);
          setApiError("Không tìm thấy dữ liệu người dùng");
        }
      })
      .catch((err) => {
        console.error("Error loading users:", err);
        setApiError(
          err.message || "Lỗi kết nối đến máy chủ. Vui lòng thử lại sau."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      (user.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (roleTranslations[user.role] || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (user.employeeId || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (user.department || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validateForm = () => {
    const newErrors: Partial<Record<keyof RegisterDTO, string>> = {};

    // Validate fullName
    if (!newUser.fullName) {
      newErrors.fullName = "FULLNAME IS REQUIRE!";
    } else if (newUser.fullName.length > 50) {
      newErrors.fullName = "FULLNAME cannot exceed 50 characters.";
    }

    // Validate idCard
    if (!newUser.idCard) {
      newErrors.idCard = "IDCard IS REQUIRE!";
    } else if (newUser.idCard.length < 10) {
      newErrors.idCard = "IDCard must be at least 10 characters.";
    } else if (newUser.idCard.length > 50) {
      newErrors.idCard = "IDCard cannot exceed 50 characters.";
    }

    // Validate role
    if (!newUser.role) {
      newErrors.role = "Role IS REQUIRE!";
    }

    // Validate numberPhone
    if (!newUser.numberPhone) {
      newErrors.numberPhone = "NUMBER PHONE IS REQUIRE!";
    } else if (newUser.numberPhone.length < 10) {
      newErrors.numberPhone = "PHONE number must be at least 10 characters.";
    } else if (newUser.numberPhone.length > 50) {
      newErrors.numberPhone = "PHONE number cannot exceed 50 characters.";
    }

    // Validate email
    if (!newUser.email) {
      newErrors.email = "EMAIL IS REQUIRE!";
    } else if (
      !/^[a-zA-Z0-9._%+-]+@(becamex\.com|becamex\.com\.vn)$/.test(newUser.email)
    ) {
      newErrors.email =
        "Email must be from becamex.com or becamex.com.vn domain.";
    } else if (newUser.email.length > 100) {
      newErrors.email = "EMAIL cannot exceed 100 characters.";
    }

    // Validate password
    if (!newUser.password) {
      newErrors.password = "PASSWORD IS REQUIRE!";
    } else if (newUser.password.length < 6 || newUser.password.length > 100) {
      newErrors.password =
        "The password must be at least 6 and at max 100 characters long.";
    }

    // Validate confirmPassword
    if (!newUser.confirmPassword) {
      newErrors.confirmPassword = "CONFIRM PASSWORD IS REQUIRE!";
    } else if (newUser.confirmPassword !== newUser.password) {
      newErrors.confirmPassword =
        "The password and confirmation password do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddUser = () => {
    if (!validateForm()) {
      showError("FORM001");
      return;
    }

    const user: User = {
      id: crypto.randomUUID(),
      fullName: newUser.fullName,
      idCard: newUser.idCard,
      email: newUser.email,
      phoneNumber: newUser.numberPhone,
      role: newUser.role,
      password: newUser.password, // Lưu mật khẩu khi tạo người dùng mới
      startWork: newUser.startWork,
      endWork: newUser.endWork,
      urlAvatar: "https://placehold.co/40x40.png",
      createdAt: new Date(),
      modifiedAt: new Date(),
    };

    // Thêm các thông tin bổ sung cho Trainee
    if (newUser.role === "Trainee") {
      user.department = newUser.department;
      user.position = newUser.position;
      user.level = newUser.level;
      user.status = newUser.status || "working";
      // Tạo mã nhân viên tự động
      user.employeeId = `EMP${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`;
    }

    setIsAddingUser(false);
    setNewUser({
      fullName: "",
      idCard: "",
      role: "Trainee",
      numberPhone: "",
      email: "",
      password: "",
      confirmPassword: "",
      department: "",
      position: "",
      level: "intern",
      status: "working",
    });
    showError("SUCCESS001");
  };

  const handleEditUser = () => {
    if (!editingUser) return;

    // Check if password field is filled and if so, confirm it matches
    if (editingUser.password && editingUser.password !== confirmPassword) {
      showError("Mật khẩu và xác nhận mật khẩu không khớp!");
      return;
    }

    // Here you would typically call your API to update the user
    // const updatedUser = { ...editingUser };
    // Call API with updatedUser

    setEditingUser(null);
    setConfirmPassword("");
    showError("SUCCESS002");
  };

  const handleDeleteUser = () => {
    if (!deletingUser) return;
    if (deletingUser.email === currentUser?.email) {
      showError("USER002");
      return;
    }
    setDeletingUser(null);
    showError("SUCCESS003");
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
            <Button onClick={() => setIsAddingUser(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm người dùng
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên, email, vai trò hoặc phòng ban..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-[100px]">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Spinner size="lg" />
                        <span className="text-sm text-muted-foreground">
                          Đang tải dữ liệu...
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : apiError ? (
                  <TableRow>
                    <TableCell colSpan={5}>{apiError}</TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>Không có người dùng nào.</TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {user.fullName}
                          {user.email === currentUser?.email && (
                            <Badge variant="outline" className="ml-2">
                              Bạn
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={roleBadgeVariant[user.role]}>
                            {roleTranslations[user.role]}
                          </Badge>
                          {user.level && user.role === "Trainee" && (
                            <Badge
                              variant="outline"
                              className={`ml-2 ${getLevelBadgeColor(
                                user.level
                              )}`}
                            >
                              {user.level.replace("_", " ").toUpperCase()}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getStatusColor(user.status || "working")}
                        >
                          {getStatusText(user.status || "working")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Mở menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {user.role === "Trainee" && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsViewingUser(true);
                                }}
                              >
                                <UserCircle2 className="mr-2 h-4 w-4" />
                                Xem chi tiết
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingUser(user);
                                setConfirmPassword("");
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeletingUser(user)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View User Dialog */}
      <Dialog open={isViewingUser} onOpenChange={setIsViewingUser}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Chi tiết Học viên</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết và lịch sử học tập của học viên
            </DialogDescription>
          </DialogHeader>

          {selectedUser && selectedUser.role === "Trainee" && (
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
                        <strong>Họ và tên:</strong> {selectedUser.fullName}
                      </p>
                      <p className="text-sm">
                        <strong>Mã nhân viên:</strong> {selectedUser.employeeId}
                      </p>
                      <p className="text-sm">
                        <strong>Email:</strong> {selectedUser.email}
                      </p>
                      <p className="text-sm">
                        <strong>Số điện thoại:</strong>{" "}
                        {selectedUser.phoneNumber}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Thông tin công việc</h4>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <strong>Phòng ban:</strong> {selectedUser.department}
                      </p>
                      <p className="text-sm">
                        <strong>Chức vụ:</strong> {selectedUser.position}
                      </p>
                      <p className="text-sm">
                        <strong>Cấp bậc:</strong>{" "}
                        {selectedUser.level?.replace("_", " ")}
                      </p>
                      <p className="text-sm">
                        <strong>Quản lý:</strong> {selectedUser.manager}
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
                  {selectedUser.completedCourses?.length ? (
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

              <TabsContent value="certificates">
                <div className="space-y-4">
                  {selectedUser.certificates?.length ? (
                    selectedUser.certificates.map((cert) => (
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

      {/* Add User Dialog */}
      <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm người dùng mới</DialogTitle>
            <DialogDescription>
              Điền thông tin để tạo tài khoản người dùng mới. Các trường có dấu
              * là bắt buộc.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
              <Label htmlFor="role">Vai trò *</Label>
              <Select
                value={newUser.role}
                onValueChange={(value: Role) =>
                  setNewUser({ ...newUser, role: value })
                }
              >
                <SelectTrigger
                  className={errors.role ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  {currentUser?.role === "Admin" && (
                    <SelectItem value="Admin">Quản trị viên</SelectItem>
                  )}
                  <SelectItem value="HR">Nhân sự</SelectItem>
                  <SelectItem value="Trainee">Học viên</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-destructive">{errors.role}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="numberPhone">Số điện thoại *</Label>
              <Input
                id="numberPhone"
                type="tel"
                value={newUser.numberPhone}
                onChange={(e) =>
                  setNewUser({ ...newUser, numberPhone: e.target.value })
                }
                className={errors.numberPhone ? "border-destructive" : ""}
              />
              {errors.numberPhone && (
                <p className="text-sm text-destructive">{errors.numberPhone}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email công ty *</Label>
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
              <Label htmlFor="startWork">Ngày bắt đầu làm việc</Label>
              <Input
                id="startWork"
                type="date"
                value={newUser.startWork?.toISOString().split("T")[0] || ""}
                onChange={(e) =>
                  setNewUser({
                    ...newUser,
                    startWork: new Date(e.target.value),
                  })
                }
              />
            </div>

            {newUser.role === "Trainee" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="department">Phòng ban</Label>
                  <Select
                    onValueChange={(value) =>
                      setNewUser({ ...newUser, department: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn phòng ban" />
                    </SelectTrigger>
                    <SelectContent>
                      {isDepartmentsLoading ? (
                        <SelectItem value="" disabled>
                          <div className="flex items-center gap-2">
                            <Spinner size="sm" />
                            <span>Đang tải...</span>
                          </div>
                        </SelectItem>
                      ) : activeDepartments.length > 0 ? (
                        activeDepartments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          Không có phòng ban nào
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
                    value={newUser.position || ""}
                    onChange={(e) =>
                      setNewUser({ ...newUser, position: e.target.value })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="level">Cấp bậc</Label>
                  <Select
                    onValueChange={(value: TraineeLevel) =>
                      setNewUser({ ...newUser, level: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn cấp bậc" />
                    </SelectTrigger>
                    <SelectContent>
                      {levelOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="status">Trạng thái</Label>
                  <Select
                    defaultValue="working"
                    onValueChange={(value: WorkStatus) =>
                      setNewUser({ ...newUser, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="working">Đang làm việc</SelectItem>
                      <SelectItem value="resigned">Đã nghỉ việc</SelectItem>
                      <SelectItem value="suspended">Tạm nghỉ</SelectItem>
                      <SelectItem value="maternity_leave">
                        Nghỉ thai sản
                      </SelectItem>
                      <SelectItem value="sick_leave">
                        Nghỉ bệnh dài hạn
                      </SelectItem>
                      <SelectItem value="sabbatical">
                        Nghỉ phép dài hạn
                      </SelectItem>
                      <SelectItem value="terminated">Đã sa thải</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="grid gap-2">
              <Label htmlFor="password">Mật khẩu *</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                className={errors.password ? "border-destructive" : ""}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={newUser.confirmPassword}
                onChange={(e) =>
                  setNewUser({ ...newUser, confirmPassword: e.target.value })
                }
                className={errors.confirmPassword ? "border-destructive" : ""}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingUser(false)}>
              Hủy
            </Button>
            <Button onClick={handleAddUser}>Thêm người dùng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog
        open={!!editingUser}
        onOpenChange={() => {
          setEditingUser(null);
          setConfirmPassword("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin người dùng. Các trường có dấu * là bắt buộc.
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-fullName">Họ và tên</Label>
                <Input
                  id="edit-fullName"
                  value={editingUser.fullName}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, fullName: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-role">Vai trò</Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(value: Role) =>
                    setEditingUser({ ...editingUser, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentUser?.role === "Admin" && (
                      <SelectItem value="Admin">Quản trị viên</SelectItem>
                    )}
                    <SelectItem value="HR">Nhân sự</SelectItem>
                    <SelectItem value="Trainee">Học viên</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editingUser.role === "Trainee" && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-employeeId">Mã nhân viên</Label>
                    <Input
                      id="edit-employeeId"
                      value={editingUser.employeeId}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          employeeId: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-phone">Số điện thoại</Label>
                    <Input
                      id="edit-phone"
                      type="tel"
                      value={editingUser.phoneNumber}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          phoneNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-department">Phòng ban</Label>
                    <Select
                      value={editingUser.department}
                      onValueChange={(value) =>
                        setEditingUser({ ...editingUser, department: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn phòng ban" />
                      </SelectTrigger>
                      <SelectContent>
                        {isDepartmentsLoading ? (
                          <SelectItem value="" disabled>
                            <div className="flex items-center gap-2">
                              <Spinner size="sm" />
                              <span>Đang tải...</span>
                            </div>
                          </SelectItem>
                        ) : activeDepartments.length > 0 ? (
                          activeDepartments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled>
                            Không có phòng ban nào
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="edit-position">Chức vụ</Label>
                    <Input
                      id="edit-position"
                      placeholder="Nhập chức vụ"
                      value={editingUser.position || ""}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          position: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-level">Cấp bậc</Label>
                    <Select
                      value={editingUser.level}
                      onValueChange={(value: TraineeLevel) => {
                        setEditingUser({ ...editingUser, level: value });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn cấp bậc" />
                      </SelectTrigger>
                      <SelectContent>
                        {levelOptions.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-status">Trạng thái</Label>
                    <Select
                      value={editingUser.status}
                      onValueChange={(value: WorkStatus) => {
                        setEditingUser({ ...editingUser, status: value });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="working">Đang làm việc</SelectItem>
                        <SelectItem value="resigned">Đã nghỉ việc</SelectItem>
                        <SelectItem value="suspended">Tạm nghỉ</SelectItem>
                        <SelectItem value="maternity_leave">
                          Nghỉ thai sản
                        </SelectItem>
                        <SelectItem value="sick_leave">
                          Nghỉ bệnh dài hạn
                        </SelectItem>
                        <SelectItem value="sabbatical">
                          Nghỉ phép dài hạn
                        </SelectItem>
                        <SelectItem value="terminated">Đã sa thải</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div className="grid gap-2">
                <Label htmlFor="edit-password">Mật khẩu mới</Label>
                <Input
                  id="edit-password"
                  type="password"
                  placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                  value={editingUser.password}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, password: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-confirmPassword">
                  Xác nhận mật khẩu mới
                </Label>
                <Input
                  id="edit-confirmPassword"
                  type="password"
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingUser(null);
                setConfirmPassword("");
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleEditUser}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={!!deletingUser} onOpenChange={() => setDeletingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa người dùng</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể
              hoàn tác.
            </DialogDescription>
          </DialogHeader>
          {deletingUser && (
            <div className="flex items-center gap-4 py-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <div>
                <p className="font-medium">{deletingUser.fullName}</p>
                <p className="text-sm text-muted-foreground">
                  {deletingUser.email}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingUser(null)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Xóa người dùng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
