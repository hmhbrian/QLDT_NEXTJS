"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  Building2,
  Calendar,
  Award,
  UserCircle2,
  MapPin,
  Clock,
  Shield,
  CreditCard,
  Briefcase,
  Users,
} from "lucide-react";
import type { User as UserType } from "@/lib/types/user.types";

interface UserDetailDialogProps {
  user: UserType | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const getRoleColor = (role: string) => {
  switch (role) {
    case "ADMIN":
      return "bg-orange-500 text-white";
    case "HR":
      return "bg-orange-400 text-white";
    case "HOCVIEN":
      return "bg-orange-100 text-orange-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case "ADMIN":
      return "Quản trị viên";
    case "HR":
      return "Nhân sự";
    case "HOCVIEN":
      return "Học viên";
    default:
      return role;
  }
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "Chưa cập nhật";
  try {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "Ngày không hợp lệ";
  }
};

export default function UserDetailDialog({
  user,
  isOpen,
  onOpenChange,
}: UserDetailDialogProps) {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-orange-50 to-orange-50">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16 border-2 border-orange-200">
              <AvatarImage
                src={user.urlAvatar || undefined}
                alt={user.fullName}
              />
              <AvatarFallback className="bg-orange-500 text-white text-lg font-semibold">
                {getInitials(user.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                {user.fullName}
              </DialogTitle>
              <div className="flex items-center space-x-3">
                <Badge className={`${getRoleColor(user.role)} font-medium`}>
                  <Shield className="h-3 w-3 mr-1" />
                  {getRoleLabel(user.role)}
                </Badge>
                {user.employeeId && (
                  <Badge variant="outline" className="bg-white text-gray-700">
                    <CreditCard className="h-3 w-3 mr-1" />
                    {user.employeeId}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto bg-gray-50">
          <Tabs defaultValue="personal" className="h-full">
            <TabsList className="grid w-full grid-cols-3 mx-6 mt-4 bg-white border border-gray-200">
              <TabsTrigger
                value="personal"
                className="flex items-center space-x-2"
              >
                <UserCircle2 className="h-4 w-4" />
                <span>Thông tin cá nhân</span>
              </TabsTrigger>
              <TabsTrigger value="work" className="flex items-center space-x-2">
                <Briefcase className="h-4 w-4" />
                <span>Công việc</span>
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="flex items-center space-x-2"
              >
                <Calendar className="h-4 w-4" />
                <span>Hoạt động</span>
              </TabsTrigger>
            </TabsList>

            <div className="p-6 space-y-6">
              {/* Personal Information Tab */}
              <TabsContent value="personal" className="space-y-6 m-0">
                <Card className="border border-gray-200 bg-white">
                  <CardHeader className="pb-3 border-b border-gray-100">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <User className="h-5 w-5 text-orange-500" />
                      <span className="text-gray-900">Thông tin liên hệ</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Mail className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium text-gray-900">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Phone className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="text-sm text-gray-600">Số điện thoại</p>
                          <p className="font-medium text-gray-900">
                            {user.phoneNumber || "Chưa cập nhật"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-gray-200" />

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <CreditCard className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="text-sm text-gray-600">CMND/CCCD</p>
                        <p className="font-medium text-gray-900">
                          {user.idCard}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Work Information Tab */}
              <TabsContent value="work" className="space-y-6 m-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border border-gray-200 bg-white">
                    <CardHeader className="pb-3 border-b border-gray-100">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <Building2 className="h-5 w-5 text-orange-500" />
                        <span className="text-gray-900">Tổ chức</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            Phòng ban
                          </p>
                          <p className="font-medium text-gray-900">
                            {user.department?.departmentName ||
                              "Chưa có phòng ban"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Cấp bậc</p>
                          <p className="font-medium text-gray-900">
                            {user.employeeLevel?.eLevelName ||
                              "Chưa có cấp bậc"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            Quản lý trực tiếp
                          </p>
                          <p className="font-medium text-gray-900">
                            {user.manager || "Không có"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200 bg-white">
                    <CardHeader className="pb-3 border-b border-gray-100">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-orange-500" />
                        <span className="text-gray-900">Thời gian</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            Ngày bắt đầu làm việc
                          </p>
                          <p className="font-medium text-gray-900">
                            {formatDate(user.startWork)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            Ngày kết thúc
                          </p>
                          <p className="font-medium text-gray-900">
                            {formatDate(user.endWork)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            Trạng thái
                          </p>
                          <Badge
                            className={
                              user.userStatus?.name === "Đang làm việc"
                                ? "bg-green-100 text-green-800"
                                : "secondary"
                            }
                          >
                            {user.userStatus?.name || "Không xác định"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="space-y-6 m-0">
                <Card className="border border-gray-200 bg-white">
                  <CardHeader className="pb-3 border-b border-gray-100">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-orange-500" />
                      <span className="text-gray-900">Lịch sử tài khoản</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                        <Calendar className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="text-sm text-gray-600">
                            Ngày tạo tài khoản
                          </p>
                          <p className="font-medium text-gray-900">
                            {formatDate(user.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                        <Clock className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-sm text-gray-600">
                            Cập nhật lần cuối
                          </p>
                          <p className="font-medium text-gray-900">
                            {formatDate(user.modifiedAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-gray-200" />

                    {/* Placeholder for courses and certificates */}
                    <div className="space-y-4">
                      <div className="text-center py-8 text-gray-500">
                        <Award className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <h3 className="font-medium mb-2 text-gray-700">
                          Khóa học & Chứng chỉ
                        </h3>
                        <p className="text-sm text-gray-500">
                          Chức năng đang được phát triển
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
