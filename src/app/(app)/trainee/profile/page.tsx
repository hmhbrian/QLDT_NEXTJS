"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  UserCircle,
  Edit3,
  Save,
  XSquare,
  Image as ImageIcon,
  KeyRound,
  Award,
  Star,
  Calendar,
  TrendingUp,
  Upload,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { useError } from "@/hooks/use-error";
import type { User, Position } from "@/lib/types/user.types";
import type { DepartmentInfo } from "@/lib/types/department.types";
import type { Course } from "@/lib/types/course.types";
import { Checkbox } from "@/components/ui/checkbox";
import { getLevelBadgeColor, getStatusColor } from "@/lib/helpers";
import { useCompletedCoursesCount } from "@/hooks/use-courses";
import { CourseCard } from "@/components/courses/CourseCard";

export default function UserProfilePage() {
  const { user, updateAvatar, changePassword } = useAuth();
  const { toast } = useToast();
  const { showError } = useError();
  const { data: completedCoursesData, isLoading: isLoadingCompletedCourses } =
    useCompletedCoursesCount();

  const [isEditing, setIsEditing] = useState(false);

  const [dialogFullName, setDialogFullName] = useState(user?.fullName || "");
  const [dialogEmail, setDialogEmail] = useState(user?.email || "");
  const [dialogPhone, setDialogPhone] = useState(user?.phoneNumber || "");

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user?.urlAvatar || null
  );
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [profileData, setProfileData] = useState<User | null>(null); // Để lưu trữ chi tiết hồ sơ cụ thể

  useEffect(() => {
    if (user) {
      setProfileData(user); // Luôn sử dụng dữ liệu người dùng từ useAuth
    }
  }, [user]);

  useEffect(() => {
    if (profileData) {
      setDialogFullName(profileData.fullName || "");
      setDialogEmail(profileData.email || "");
      setDialogPhone(profileData.phoneNumber || "");
    } else if (user) {
      setDialogFullName(user.fullName || "");
      setDialogEmail(user.email || "");
      setDialogPhone(user.phoneNumber || "");
    }
  }, [profileData, user, isEditing]);

  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  if (!user || !profileData) {
    return (
      <p className="text-center text-muted-foreground">Đang tải hồ sơ...</p>
    );
  }

  const getPositionName = (user: User): string => {
    if (user.position && typeof user.position === "object") {
      return user.position.positionName;
    }
    return "Chưa có";
  };

  const getInitials = (name?: string) => {
    if (!name) return user.email ? user.email[0].toUpperCase() : "?";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showError("FILE002");
        if (avatarInputRef.current) avatarInputRef.current.value = "";
        return;
      }
      if (!file.type.startsWith("image/")) {
        showError("FILE001");
        if (avatarInputRef.current) avatarInputRef.current.value = "";
        return;
      }
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
      const previewUrl = URL.createObjectURL(file);
      setAvatarFile(file);
      setAvatarPreview(previewUrl);
    }
  };

  const handleSaveChanges = async () => {
    setIsSubmitting(true);
    let avatarUpdated = false;
    let passwordChanged = false;

    try {
      if (avatarFile) {
        await updateAvatar(avatarFile);
        avatarUpdated = true;
      }

      if (showPasswordChange) {
        if (!currentPassword || !newPassword || !confirmNewPassword) {
          toast({
            title: "Lỗi",
            description: "Vui lòng điền đầy đủ các trường mật khẩu.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
        if (newPassword !== confirmNewPassword) {
          showError("PASSWORD003");
          setIsSubmitting(false);
          return;
        }
        await changePassword(currentPassword, newPassword);
        passwordChanged = true;
      }

      if (avatarUpdated || passwordChanged) {
        toast({
          title: "Thành công",
          description: "Thông tin hồ sơ đã được cập nhật.",
          variant: "success",
        });
      } else if (
        !avatarFile &&
        !showPasswordChange &&
        (dialogFullName !== user.fullName ||
          dialogEmail !== user.email ||
          dialogPhone !== user.phoneNumber)
      ) {
        toast({
          title: "Thông tin hiển thị đã thay đổi",
          description:
            "Các thay đổi thông tin cá nhân (tên, email, SĐT) chỉ là giả lập và chưa được lưu trữ.",
          variant: "default",
        });
      }

      setIsEditing(false);
      setAvatarFile(null); // Xóa file avatar đã chọn
      if (avatarInputRef.current) avatarInputRef.current.value = ""; // Đặt lại input file avatar
    } catch (error: unknown) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDepartment = (department: DepartmentInfo | undefined) => {
    if (!department) return "N/A";
    return department.name;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-headline font-semibold">
          Hồ sơ của tôi
        </h1>
        <Button
          variant="outline"
          onClick={() => setIsEditing(true)}
          className="w-full md:w-auto"
        >
          <Edit3 className="mr-2 h-5 w-5" /> Chỉnh sửa Hồ sơ
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          {user.role === "HOCVIEN" && (
            <>
              <TabsTrigger value="courses">Khóa học</TabsTrigger>
              <TabsTrigger value="certificates">Chứng chỉ</TabsTrigger>
              <TabsTrigger value="evaluations">Đánh giá</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="overview">
          <Card className="shadow-lg">
            <CardHeader className="items-center text-center border-b pb-6">
              <Avatar className="h-24 w-24 mb-4 ring-4 ring-primary ring-offset-2 ring-offset-background">
                <AvatarImage
                  src={profileData.urlAvatar || undefined}
                  alt={profileData.fullName}
                />
                <AvatarFallback>
                  {getInitials(profileData.fullName)}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="font-headline text-2xl">
                {profileData.fullName}
              </CardTitle>
              <CardDescription className="space-x-2">
                <span>{profileData.email}</span>
                {profileData.role === "HOCVIEN" && profileData.position && (
                  <Badge
                    className={getLevelBadgeColor(
                      (profileData.position as Position).positionName
                    )}
                  >
                    {getPositionName(profileData)}
                  </Badge>
                )}
                <Badge variant="secondary">{profileData.role}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Thông tin Cá nhân</h3>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <strong>Họ và tên:</strong> {profileData.fullName}
                    </p>
                    <p className="text-sm">
                      <strong>Email công ty:</strong> {profileData.email}
                    </p>
                    <p className="text-sm">
                      <strong>Số điện thoại:</strong>{" "}
                      {profileData.phoneNumber || "N/A"}
                    </p>
                    <p className="text-sm">
                      <strong>CMND/CCCD:</strong> {profileData.idCard || "N/A"}
                    </p>
                  </div>
                </div>
                {profileData.role === "HOCVIEN" && (
                  <div>
                    <h3 className="font-semibold mb-2">
                      Thông tin Công việc (Học viên)
                    </h3>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <strong>Mã nhân viên:</strong>{" "}
                        {profileData.employeeId || "N/A"}
                      </p>
                      <p className="text-sm">
                        <strong>Phòng ban:</strong>{" "}
                        {renderDepartment(profileData.department)}
                      </p>
                      <p className="text-sm">
                        <strong>Chức vụ:</strong> Chưa có
                      </p>
                      <p className="text-sm">
                        <strong>Cấp bậc:</strong> {getPositionName(profileData)}
                      </p>
                      <p className="text-sm">
                        <strong>Ngày vào công ty:</strong>{" "}
                        {profileData.startWork
                          ? new Date(profileData.startWork).toLocaleDateString(
                              "vi-VN"
                            )
                          : "N/A"}
                      </p>
                      <p className="text-sm">
                        <strong>Quản lý trực tiếp:</strong>{" "}
                        {profileData.manager || "N/A"}
                      </p>
                      {profileData.userStatus && (
                        <div className="text-sm">
                          <strong>Trạng thái:</strong>
                          <Badge
                            variant="outline"
                            className={`ml-2 ${getStatusColor(
                              profileData.userStatus.name
                            )}`}
                          >
                            {profileData.userStatus.name}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {(profileData.role === "ADMIN" ||
                  profileData.role === "HR") && (
                  <div>
                    <h3 className="font-semibold mb-2">Thông tin Vai trò</h3>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <strong>Vai trò:</strong> {profileData.role}
                      </p>
                      <p className="text-sm">
                        <strong>Ngày bắt đầu:</strong>{" "}
                        {profileData.startWork
                          ? new Date(profileData.startWork).toLocaleDateString(
                              "vi-VN"
                            )
                          : "N/A"}
                      </p>
                      {profileData.userStatus && (
                        <div className="text-sm">
                          <strong>Trạng thái:</strong>
                          <Badge
                            variant="outline"
                            className={`ml-2 ${getStatusColor(
                              profileData.userStatus.name
                            )}`}
                          >
                            {profileData.userStatus.name}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {user.role === "HOCVIEN" && (
          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <CardTitle>Khóa học đã hoàn thành</CardTitle>
                <CardDescription>
                  Danh sách các khóa học đã hoàn thành và kết quả
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingCompletedCourses ? (
                  <p className="text-muted-foreground">Đang tải...</p>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      <p className="text-sm">
                        <strong>Số khóa học đã hoàn thành:</strong>{" "}
                        <span className="text-lg font-semibold text-primary">
                          {completedCoursesData?.count || 0}
                        </span>{" "}
                        khóa học
                      </p>
                    </div>

                    {(completedCoursesData?.count || 0) === 0 ? (
                      <p className="text-muted-foreground text-sm">
                        Bạn chưa hoàn thành khóa học nào. Hãy tham gia học tập
                        để tích lũy kiến thức!
                      </p>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-muted-foreground text-sm">
                          Chúc mừng bạn đã hoàn thành{" "}
                          {completedCoursesData?.count} khóa học. Tiếp tục phát
                          triển bản thân!
                        </p>

                        {/* Always show the courses list if we have any data */}
                        {completedCoursesData?.courses && (
                          <div className="grid gap-2 max-h-60 overflow-y-auto">
                            {completedCoursesData.courses.map(
                              (course, index) => (
                                <CourseCard
                                  key={course.id || index}
                                  course={course}
                                />
                              )
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {user.role === "HOCVIEN" && (
          <TabsContent value="certificates">
            <Card>
              <CardHeader>
                <CardTitle>Chứng chỉ đã đạt được</CardTitle>
                <CardDescription>
                  Danh sách các chứng chỉ và thành tích
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Chưa có chứng chỉ nào.</p>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {user.role === "HOCVIEN" && (
          <TabsContent value="evaluations">
            <Card>
              <CardHeader>
                <CardTitle>Đánh giá năng lực</CardTitle>
                <CardDescription>
                  Lịch sử đánh giá và phát triển
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Chưa có đánh giá nào.</p>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <Dialog
        open={isEditing}
        onOpenChange={(open) => {
          setIsEditing(open);
          if (!open) {
            setAvatarFile(null);
            setAvatarPreview(profileData?.urlAvatar || user.urlAvatar || null);
            if (avatarInputRef.current) avatarInputRef.current.value = "";
            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
            setShowPasswordChange(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Edit3 className="mr-2 h-5 w-5" /> Chỉnh sửa Hồ sơ
            </DialogTitle>
            <DialogDescription>
              Cập nhật ảnh đại diện hoặc mật khẩu của bạn. Nhấn Lưu khi hoàn
              tất.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="avatar-upload" className="flex items-center">
                <ImageIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                Ảnh đại diện
              </Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={avatarPreview || profileData.urlAvatar || undefined}
                    alt={profileData.fullName}
                  />
                  <AvatarFallback>
                    {getInitials(profileData.fullName)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" /> Tải ảnh mới
                </Button>
                <input
                  id="avatar-upload"
                  type="file"
                  ref={avatarInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, GIF tối đa 2MB.
              </p>
            </div>
            <hr />
            <div className="flex items-center space-x-2">
              <Checkbox
                id="change-password-checkbox"
                checked={showPasswordChange}
                onCheckedChange={(checked) => {
                  setShowPasswordChange(checked as boolean);
                  if (!checked) {
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmNewPassword("");
                  }
                }}
              />
              <Label
                htmlFor="change-password-checkbox"
                className="flex items-center cursor-pointer font-medium"
              >
                <KeyRound className="mr-2 h-4 w-4 text-muted-foreground" />
                Thay đổi mật khẩu
              </Label>
            </div>

            {showPasswordChange && (
              <div className="grid gap-4 pl-6 border-l ml-3 animate-accordion-down">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">
                    Mật khẩu hiện tại{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Nhập mật khẩu hiện tại"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">
                    Mật khẩu mới <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword">
                    Xác nhận mật khẩu mới{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="confirmNewPassword"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    required
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              disabled={isSubmitting}
            >
              <XSquare className="mr-2 h-4 w-4" /> Hủy
            </Button>
            <Button onClick={handleSaveChanges} disabled={isSubmitting}>
              {isSubmitting ? (
                <UserCircle className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
