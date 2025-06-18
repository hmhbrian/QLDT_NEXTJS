"use client";

import { useEffect, useState } from "react";
import { fetchUsers } from "@/lib/api/users";
import { fetchRoles, Role as ApiRole } from "@/lib/api/services/roles";
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
import { useDebounce } from "@/hooks/use-debounce";
import type {
  User,
  Role,
  TraineeLevel,
  WorkStatus,
  RegisterDTO,
  CreateUserRequest,
} from "@/lib/types";
import UserApiService from "@/lib/services/user-api.service";
import { useToast } from "@/components/ui/use-toast";
import { API_CONFIG } from "@/lib/api/config";

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
  ADMIN: "default",
  HR: "secondary",
  HOCVIEN: "outline",
};

const roleTranslations: Record<Role, string> = {
  ADMIN: "Quản trị viên",
  HR: "Nhân sự",
  HOCVIEN: "Học viên",
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
  const { toast } = useToast();
  const { activeDepartments, isLoading: isDepartmentsLoading } =
    useDepartments();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [confirmPassword, setConfirmPassword] = useState(""); // Add separate state for confirm password
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewingUser, setIsViewingUser] = useState(false);
  const [roles, setRoles] = useState<ApiRole[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [newUser, setNewUser] = useState<RegisterDTO>({
    fullName: "",
    idCard: "",
    role: "HOCVIEN",
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Debounce search term để tránh gọi API quá nhiều
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setApiError("");
      const res = await fetchUsers({
        Page: 1,
        Limit: 20, // Backend chỉ cho phép 1-24
        SortField: "created.at",
        SortType: "desc",
      });

      console.log("API response:", res);
      // Xử lý response dựa trên cấu trúc backend trả về
      if (res && res.data && res.data.items) {
        // Backend trả về: { data: { items: [...], pagination: {...} } }
        setUsers(Array.isArray(res.data.items) ? res.data.items : []);
      } else {
        setUsers([]);
        setApiError("Không tìm thấy dữ liệu người dùng");
      }
    } catch (err: any) {
      console.error("Error loading users:", err);
      setApiError(
        err.message || "Lỗi kết nối đến máy chủ. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    if (!API_CONFIG.useApi) return;

    try {
      setLoadingRoles(true);
      const response = await fetchRoles();
      console.log("Loaded roles data:", response); // Debug roles data
      if (response && response.data) {
        console.log("Available roles:", response.data); // Debug roles
        setRoles(response.data);
      }
    } catch (error) {
      console.error("Error loading roles:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách vai trò từ server.",
        variant: "destructive",
      });
    } finally {
      setLoadingRoles(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  // Effect để handle search
  useEffect(() => {
    const handleSearch = async () => {
      if (!debouncedSearchTerm.trim()) {
        // Nếu không có search term, load lại toàn bộ users
        loadUsers();
        return;
      }

      try {
        setIsSearching(true);
        setApiError("");

        if (API_CONFIG.useApi) {
          const response = await UserApiService.searchUsers(
            debouncedSearchTerm
          );

          // Backend trả về: { data: { items: [...], pagination: {...} } }
          if (response.data && response.data.items) {
            setUsers(
              Array.isArray(response.data.items) ? response.data.items : []
            );
          } else {
            setUsers([]);
          }
        } else {
          // Fallback to client-side filtering khi API tắt
          const allUsers = await fetchUsers({
            Page: 1,
            Limit: 20,
            SortField: "created.at",
            SortType: "desc",
          });

          if (allUsers?.data?.items) {
            const filtered = allUsers.data.items.filter(
              (user: User) =>
                (user.fullName || "")
                  .toLowerCase()
                  .includes(debouncedSearchTerm.toLowerCase()) ||
                (user.email || "")
                  .toLowerCase()
                  .includes(debouncedSearchTerm.toLowerCase()) ||
                (user.employeeId || "")
                  .toLowerCase()
                  .includes(debouncedSearchTerm.toLowerCase())
            );
            setUsers(filtered);
          }
        }
      } catch (error: any) {
        console.error("Error searching users:", error);
        setApiError(error.message || "Lỗi khi tìm kiếm người dùng");
      } finally {
        setIsSearching(false);
      }
    };

    handleSearch();
  }, [debouncedSearchTerm]);

  // Sắp xếp users với user hiện tại lên đầu (không mutate original array)
  const sortedUsers = [...users].sort((a, b) => {
    // Đưa user hiện tại lên đầu danh sách
    if (a.email === currentUser?.email) return -1;
    if (b.email === currentUser?.email) return 1;
    // Sắp xếp theo tên cho các user khác
    return (a.fullName || "").localeCompare(b.fullName || "");
  });

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

  const handleAddUser = async () => {
    if (!validateForm()) {
      showError("FORM001");
      return;
    }

    // Kiểm tra API có được bật không
    if (!API_CONFIG.useApi) {
      toast({
        title: "API đã được tắt",
        description:
          "Vui lòng bật API trong file .env để sử dụng chức năng này.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Tạo payload phù hợp với API backend

      // Tìm roleId từ danh sách roles theo tên vai trò
      let roleIdValue: string | undefined;

      console.log("Current role selection:", newUser.role);
      console.log("Available roles:", roles);

      if (roles.length > 0) {
        // Tìm role từ danh sách đã tải từ API
        const selectedRole = roles.find(
          (role) => role.name && role.name.toUpperCase() === newUser.role
        );

        console.log("Selected role:", selectedRole);

        if (selectedRole) {
          roleIdValue = selectedRole.id;
        } else {
          // Không tìm thấy role - hiển thị lỗi
          toast({
            title: "Lỗi",
            description: `Không tìm thấy vai trò ${newUser.role} trong hệ thống.`,
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      } else {
        // Không có dữ liệu roles - hiển thị lỗi
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách vai trò từ server.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Kiểm tra xem đã có roleId chưa
      if (!roleIdValue) {
        toast({
          title: "Lỗi",
          description:
            "Không thể xác định vai trò người dùng. Vui lòng thử lại.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const createUserPayload: CreateUserRequest = {
        fullName: newUser.fullName,
        email: newUser.email,
        password: newUser.password,
        confirmPassword: newUser.confirmPassword,
        idCard: newUser.idCard,
        numberPhone: newUser.numberPhone,
        roleId: roleIdValue,
        startWork: newUser.startWork
          ? new Date(newUser.startWork).toISOString()
          : new Date().toISOString(),
        // Thêm các thông tin bổ sung cho Trainee
        departmentId: newUser.role === "HOCVIEN" ? 1 : undefined, // Default department
        statusId: newUser.role === "HOCVIEN" ? 1 : undefined, // Default status (working)
        positionId: newUser.role === "HOCVIEN" ? 1 : undefined, // Default position
        code:
          newUser.role === "HOCVIEN"
            ? `EMP${Math.floor(Math.random() * 1000000000)
                .toString()
                .padStart(4, "0")}`
            : undefined,
      };

      console.log("Final payload for user creation:", createUserPayload);

      const response = await UserApiService.createUser(createUserPayload);

      if (response.statusCode === 200 || response.statusCode === 201) {
        // Refresh danh sách users
        await loadUsers();

        setIsAddingUser(false);
        setNewUser({
          fullName: "",
          idCard: "",
          role: "HOCVIEN",
          numberPhone: "",
          email: "",
          password: "",
          confirmPassword: "",
          department: "",
          position: "",
          level: "intern",
          status: "working",
        });
        setErrors({});

        toast({
          title: "Thành công",
          description: "Đã thêm người dùng mới thành công.",
          variant: "success",
        });
      } else {
        throw new Error(response.message || "Failed to create user");
      }
    } catch (error: any) {
      console.error("Error creating user:", error);

      let errorMessage = "Đã xảy ra lỗi khi thêm người dùng.";

      // Xử lý validation errors
      if (error.errors && Array.isArray(error.errors)) {
        errorMessage = error.errors.join("\n");
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async () => {
    if (!editingUser) return;

    // Check if password field is filled and if so, confirm it matches
    if (editingUser.password && editingUser.password !== confirmPassword) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu và xác nhận mật khẩu không khớp!",
        variant: "destructive",
      });
      return;
    }

    if (!API_CONFIG.useApi) {
      toast({
        title: "API đã được tắt",
        description:
          "Vui lòng bật API trong file .env để sử dụng chức năng này.",
        variant: "destructive",
      });
      return;
    }

    setIsEditing(true);

    try {
      // Tạo payload update
      const updatePayload: Partial<CreateUserRequest> = {
        fullName: editingUser.fullName,
        email: editingUser.email,
        idCard: editingUser.idCard,
        numberPhone: editingUser.phoneNumber, // User có phoneNumber, API expect numberPhone
      };

      // Chỉ thêm password nếu có thay đổi
      if (editingUser.password && editingUser.password.trim()) {
        updatePayload.password = editingUser.password;
        updatePayload.confirmPassword = confirmPassword;
      }

      // Thêm thông tin role nếu có thay đổi
      if (editingUser.role) {
        const selectedRole = roles.find(
          (role) => role.name.toUpperCase() === editingUser.role
        );
        if (selectedRole) {
          updatePayload.roleId = selectedRole.id;
        }
      }

      console.log("Update payload:", updatePayload);
      console.log("EditingUser:", editingUser);

      const response = await UserApiService.updateUserByAdmin(
        editingUser.id,
        updatePayload
      );

      if (response.statusCode === 200) {
        toast({
          title: "Thành công",
          description: "Thông tin người dùng đã được cập nhật.",
          variant: "success",
        });

        // Refresh danh sách users
        await loadUsers();

        setEditingUser(null);
        setConfirmPassword("");
      } else {
        throw new Error(response.message || "Cập nhật thất bại");
      }
    } catch (error: any) {
      console.error("Error updating user:", error);

      let errorMessage = "Đã xảy ra lỗi khi cập nhật người dùng.";

      // Xử lý lỗi validation từ backend
      if (error.errors && typeof error.errors === "object") {
        const validationErrors = Object.entries(error.errors)
          .map(([field, messages]: [string, any]) => {
            if (Array.isArray(messages)) {
              return `${field}: ${messages.join(", ")}`;
            }
            return `${field}: ${messages}`;
          })
          .join("\n");
        errorMessage = `Lỗi validation:\n${validationErrors}`;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.title) {
        errorMessage = error.title;
      }

      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    if (deletingUser.email === currentUser?.email) {
      toast({
        title: "Lỗi",
        description: "Bạn không thể xóa tài khoản của chính mình!",
        variant: "destructive",
      });
      return;
    }

    if (!API_CONFIG.useApi) {
      toast({
        title: "API đã được tắt",
        description:
          "Vui lòng bật API trong file .env để sử dụng chức năng này.",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);

    try {
      const response = await UserApiService.softDeleteUser(deletingUser.id);

      if (response.statusCode === 200) {
        toast({
          title: "Thành công",
          description: `Đã xóa người dùng "${deletingUser.fullName}" thành công.`,
          variant: "success",
        });

        // Refresh danh sách users
        await loadUsers();

        setDeletingUser(null);
      } else {
        throw new Error(response.message || "Xóa người dùng thất bại");
      }
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Đã xảy ra lỗi khi xóa người dùng.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
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
            <Button
              onClick={() => setIsAddingUser(true)}
              disabled={!API_CONFIG.useApi}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm người dùng
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Thông báo trạng thái API */}
          {!API_CONFIG.useApi && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">
                    Chế độ Mock Data
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    API đang bị tắt. Hiện tại đang sử dụng dữ liệu mô phỏng. Để
                    sử dụng API thực tế, vui lòng cài đặt{" "}
                    <code>NEXT_PUBLIC_USE_API=true</code> trong file .env
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <div className="relative max-w-sm">
              <Input
                placeholder="Tìm kiếm theo tên, email, vai trò hoặc phòng ban..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-8"
              />
              {isSearching && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <Spinner size="sm" />
                </div>
              )}
            </div>
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
                ) : sortedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>Không có người dùng nào.</TableCell>
                  </TableRow>
                ) : (
                  sortedUsers.map((user) => (
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
                          {user.level && user.role === "HOCVIEN" && (
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
                            {user.role === "HOCVIEN" && (
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

          {selectedUser && selectedUser.role === "HOCVIEN" && (
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm người dùng mới</DialogTitle>
            <DialogDescription>
              Điền thông tin để tạo tài khoản mới cho người dùng.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Họ và tên</Label>
              <Input
                id="fullName"
                placeholder="Nguyễn Văn A"
                value={newUser.fullName}
                onChange={(e) =>
                  setNewUser({ ...newUser, fullName: e.target.value })
                }
                autoComplete="name"
              />
              {errors.fullName && (
                <p className="text-xs text-red-500">{errors.fullName}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">Vai trò</Label>
              <Select
                value={newUser.role}
                onValueChange={(value) =>
                  setNewUser({ ...newUser, role: value as Role })
                }
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  {loadingRoles ? (
                    <div className="flex items-center justify-center p-2">
                      <Spinner size="sm" />{" "}
                      <span className="ml-2">Đang tải...</span>
                    </div>
                  ) : roles.length > 0 ? (
                    // Hiển thị danh sách roles từ API
                    roles.map((role) => (
                      <SelectItem key={role.id} value={role.name.toUpperCase()}>
                        {role.name}
                      </SelectItem>
                    ))
                  ) : (
                    // Fallback khi không có dữ liệu từ API
                    <>
                      <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                      <SelectItem value="HR">Nhân sự</SelectItem>
                      <SelectItem value="HOCVIEN">Học viên</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
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

            {newUser.role === "HOCVIEN" && (
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
            <Button
              variant="outline"
              onClick={() => setIsAddingUser(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button onClick={handleAddUser} disabled={isSubmitting}>
              {isSubmitting ? "Đang xử lý..." : "Thêm người dùng"}
            </Button>
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
                    {currentUser?.role === "ADMIN" && (
                      <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                    )}
                    <SelectItem value="HR">Nhân sự</SelectItem>
                    <SelectItem value="HOCVIEN">Học viên</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editingUser.role === "HOCVIEN" && (
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
