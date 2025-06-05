
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCircle, Edit3, Save, XSquare, Image as ImageIcon, KeyRound } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useToast } from '@/components/ui/use-toast';

export default function TraineeProfilePage() {
  const { user, updateAvatar, changePassword } = useAuth();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [newAvatarUrl, setNewAvatarUrl] = useState(user?.avatar || '');
  // const [currentPassword, setCurrentPassword] = useState(''); // Not used in mock
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.avatar) {
      setNewAvatarUrl(user.avatar);
    }
  }, [user?.avatar]);

  if (!user) {
    return <p className="text-center text-muted-foreground">Đang tải hồ sơ...</p>;
  }
  
  const getInitials = (name?: string) => {
    if (!name) return user.email[0].toUpperCase();
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleSaveChanges = async () => {
    setIsSubmitting(true);
    let avatarChanged = false;
    let passwordChanged = false;

    try {
      if (newAvatarUrl && newAvatarUrl !== user.avatar) {
        await updateAvatar(newAvatarUrl);
        avatarChanged = true;
      }

      if (newPassword) {
        await changePassword(newPassword, confirmNewPassword);
        passwordChanged = true;
      }

      if (avatarChanged || passwordChanged) {
        // Toast for overall success if anything changed, specific toasts handled in auth hook
      } else if (!avatarChanged && !passwordChanged) {
         toast({
          title: "Không có thay đổi",
          description: "Không có thông tin nào được cập nhật.",
        });
      }
      setIsEditing(false);
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      // Errors are toasted in useAuth, but can add a general one here if needed
      console.error("Lỗi khi lưu thay đổi:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-headline font-semibold">Hồ sơ của tôi</h1>
        <Button variant="outline" onClick={() => setIsEditing(true)} className="w-full md:w-auto">
          <Edit3 className="mr-2 h-5 w-5" /> Chỉnh sửa Hồ sơ
        </Button>
      </div>
      <Card className="shadow-lg">
        <CardHeader className="items-center text-center border-b pb-6">
          <Avatar className="h-24 w-24 mb-4 ring-4 ring-primary ring-offset-2 ring-offset-background">
            <AvatarImage src={user.avatar} alt={user.name || user.email} data-ai-hint="person profile" />
            <AvatarFallback className="text-3xl">{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <CardTitle className="font-headline text-2xl">{user.name || "Tên người dùng"}</CardTitle>
          <CardDescription>{user.email} - ({user.role})</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Thông tin Cá nhân</h3>
              <p className="text-sm"><strong>Phòng ban:</strong> CNTT (Mẫu)</p>
              <p className="text-sm"><strong>Mã nhân viên:</strong> BEX12345 (Mẫu)</p>
              <p className="text-sm"><strong>Ngày tham gia:</strong> 15 Tháng 1, 2023 (Mẫu)</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Lịch sử Học tập</h3>
               <p className="text-sm text-muted-foreground">
                Phần này sẽ hiển thị các khóa học và chứng chỉ đã hoàn thành của bạn.
              </p>
              <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-md mt-2 text-center p-4">
                <UserCircle className="h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Lịch sử Học tập Sắp ra mắt
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle className="flex items-center"><Edit3 className="mr-2 h-5 w-5" /> Chỉnh sửa Hồ sơ</DialogTitle>
            <DialogDescription>
              Cập nhật ảnh đại diện hoặc mật khẩu của bạn. Nhấn Lưu khi hoàn tất.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="avatarUrl" className="flex items-center"><ImageIcon className="mr-2 h-4 w-4 text-muted-foreground" />URL Ảnh đại diện</Label>
              <Input
                id="avatarUrl"
                value={newAvatarUrl}
                onChange={(e) => setNewAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.png"
              />
            </div>
            <hr />
             <h4 className="text-md font-medium flex items-center"><KeyRound className="mr-2 h-4 w-4 text-muted-foreground" /> Thay đổi mật khẩu</h4>
            {/* <div className="space-y-2">
              <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Để trống nếu không đổi"
              />
            </div> */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Xác nhận mật khẩu mới</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSubmitting}>
              <XSquare className="mr-2 h-4 w-4" /> Hủy
            </Button>
            <Button onClick={handleSaveChanges} disabled={isSubmitting}>
              {isSubmitting ? <UserCircle className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
