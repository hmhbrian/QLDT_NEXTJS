'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCircle, Edit3, Save, XSquare, Image as ImageIcon, KeyRound, Award, Star, Calendar, TrendingUp, Upload } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from '@/components/ui/use-toast';
import { Badge } from "@/components/ui/badge";
import { useError } from '@/hooks/use-error';


export default function UserProfilePage() { 
  const { user, updateAvatar, changePassword } = useAuth();
  const { toast } = useToast();
  const { showError } = useError();

  const [isEditing, setIsEditing] = useState(false);
  
  const [dialogFullName, setDialogFullName] = useState(user?.fullName || '');
  const [dialogEmail, setDialogEmail] = useState(user?.email || '');
  const [dialogPhone, setDialogPhone] = useState(user?.phoneNumber || '');
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.urlAvatar || null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [profileData, setProfileData] = useState<User | null>(null); // Để lưu trữ chi tiết hồ sơ cụ thể

  useEffect(() => {
    if (user) {
      const detailedUser = mockUsers.find(u => u.id === user.id);
      setProfileData(detailedUser || user); // Dự phòng về người dùng cơ bản nếu không tìm thấy trong danh sách chi tiết giả lập
    }
  }, [user]);


  useEffect(() => {
    if (profileData) { // Sử dụng profileData có thể chi tiết hơn
      setDialogFullName(profileData.fullName || '');
      setDialogEmail(profileData.email || '');
      setDialogPhone(profileData.phoneNumber || '');
      setAvatarPreview(profileData.urlAvatar || null);
    } else if (user) { // Dự phòng về người dùng từ useAuth nếu profileData chưa được đặt
      setDialogFullName(user.fullName || '');
      setDialogEmail(user.email || '');
      setDialogPhone(user.phoneNumber || '');
      setAvatarPreview(user.urlAvatar || null);
    }
  }, [profileData, user, isEditing]); 

  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) { // Kiểm tra nếu avatarPreview là một blob URL
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);


  if (!user || !profileData) {
    return <p className="text-center text-muted-foreground">Đang tải hồ sơ...</p>;
  }
  
  const getInitials = (name?: string) => {
    if (!name) return user.email ? user.email[0].toUpperCase() : '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { 
        showError('FILE002'); 
        if (avatarInputRef.current) avatarInputRef.current.value = '';
        return;
      }
      if (!file.type.startsWith('image/')) {
        showError('FILE001'); 
        if (avatarInputRef.current) avatarInputRef.current.value = '';
        return;
      }
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
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
      if (avatarFile && avatarPreview && avatarPreview !== user.urlAvatar) {
        await updateAvatar(avatarPreview); 
        avatarUpdated = true;
      }

      if (newPassword) {
        if (newPassword !== confirmNewPassword) {
          showError('PASSWORD003'); 
          setIsSubmitting(false);
          return;
        }
        await changePassword(currentPassword, newPassword); 
        passwordChanged = true;
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
      
      if (avatarUpdated || passwordChanged) {
         toast({
          title: 'Thành công',
          description: 'Thông tin hồ sơ đã được cập nhật.',
          variant: "success",
        });
      } else if (!avatarFile && !newPassword && 
                 (dialogFullName !== user.fullName || dialogEmail !== user.email || dialogPhone !== user.phoneNumber)) {
        toast({
          title: 'Thông tin hiển thị đã thay đổi',
          description: 'Các thay đổi thông tin cá nhân (tên, email, SĐT) chỉ là giả lập và chưa được lưu trữ.',
          variant: 'default'
        });
      }

      setIsEditing(false); 
      setAvatarFile(null); // Xóa file avatar đã chọn
      if (avatarInputRef.current) avatarInputRef.current.value = ''; // Đặt lại input file avatar

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '';
      if (!(errorMessage.startsWith('AUTH') || errorMessage.startsWith('PASSWORD') || errorMessage.startsWith('FILE'))) {
        toast({
            title: 'Lỗi',
            description: 'Không thể cập nhật thông tin hồ sơ. Vui lòng thử lại.',
            variant: 'destructive',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLevelBadgeColor = (level?: string) => {
    if (!level) return 'bg-gray-100 text-gray-800';
    const colors: Record<string, string> = {
      beginner: 'bg-blue-100 text-blue-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-green-100 text-green-800',
      expert: 'bg-purple-100 text-purple-800',
      intern: 'bg-blue-100 text-blue-800', // Thực tập sinh
      probation: 'bg-yellow-100 text-yellow-800', // Thử việc
      employee: 'bg-green-100 text-green-800', // Nhân viên
      middle_manager: 'bg-purple-100 text-purple-800', // Quản lý cấp trung
      senior_manager: 'bg-red-100 text-red-800' // Quản lý cấp cao
    };
    return colors[level.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    const colors: Record<string, string> = {
      working: 'bg-green-100 text-green-800',
      resigned: 'bg-red-100 text-red-800',
      suspended: 'bg-yellow-100 text-yellow-800',
      maternity_leave: 'bg-purple-100 text-purple-800',
      sick_leave: 'bg-orange-100 text-orange-800',
      sabbatical: 'bg-blue-100 text-blue-800',
      terminated: 'bg-destructive text-destructive-foreground',
      active: 'bg-green-100 text-green-800', // Hoạt động
      inactive: 'bg-gray-100 text-gray-800' // Không hoạt động
    };
    return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status?: string) => {
    if (!status) return 'Không xác định';
    const texts: Record<string, string> = {
      working: 'Đang làm việc',
      resigned: 'Đã nghỉ việc',
      suspended: 'Tạm ngưng',
      maternity_leave: 'Nghỉ thai sản',
      sick_leave: 'Nghỉ bệnh',
      sabbatical: 'Nghỉ phép dài hạn',
      terminated: 'Đã cho thôi việc',
      active: 'Đang hoạt động', // Hoạt động
      inactive: 'Không hoạt động' // Không hoạt động
    };
    return texts[status.toLowerCase()] || status;
  };
  

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-headline font-semibold">Hồ sơ của tôi</h1>
        <Button variant="outline" onClick={() => setIsEditing(true)} className="w-full md:w-auto">
          <Edit3 className="mr-2 h-5 w-5" /> Chỉnh sửa Hồ sơ
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          {user.role === 'Trainee' && (
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
                <AvatarImage src={profileData.urlAvatar} alt={profileData.fullName} />
                <AvatarFallback>{getInitials(profileData.fullName)}</AvatarFallback>
              </Avatar>
              <CardTitle className="font-headline text-2xl">{profileData.fullName}</CardTitle>
              <CardDescription className="space-x-2">
                <span>{profileData.email}</span>
                {profileData.role === 'Trainee' && profileData.level && (
                    <Badge variant="outline" className={getLevelBadgeColor(profileData.level)}>
                        {profileData.level.replace('_', ' ').toUpperCase()}
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
                    <p className="text-sm"><strong>Họ và tên:</strong> {profileData.fullName}</p>
                    <p className="text-sm"><strong>Email công ty:</strong> {profileData.email}</p>
                    <p className="text-sm"><strong>Số điện thoại:</strong> {profileData.phoneNumber || 'N/A'}</p>
                    <p className="text-sm"><strong>CMND/CCCD:</strong> {profileData.idCard || 'N/A'}</p>
                  </div>
                </div>
                {profileData.role === 'Trainee' && (
                  <div>
                    <h3 className="font-semibold mb-2">Thông tin Công việc (Học viên)</h3>
                    <div className="space-y-2">
                      <p className="text-sm"><strong>Mã nhân viên:</strong> {profileData.employeeId || 'N/A'}</p>
                      <p className="text-sm"><strong>Phòng ban:</strong> {profileData.department || 'N/A'}</p>
                      <p className="text-sm"><strong>Chức vụ:</strong> {profileData.position || 'N/A'}</p>
                      <p className="text-sm"><strong>Cấp bậc:</strong> {profileData.level?.replace('_', ' ') || 'N/A'}</p>
                      <p className="text-sm"><strong>Ngày vào công ty:</strong> {profileData.startWork ? new Date(profileData.startWork).toLocaleDateString('vi-VN') : 'N/A'}</p>
                      <p className="text-sm"><strong>Quản lý trực tiếp:</strong> {profileData.manager || 'N/A'}</p>
                       {profileData.status && (
                          <p className="text-sm"><strong>Trạng thái:</strong> 
                          <Badge variant="outline" className={`ml-2 ${getStatusColor(profileData.status)}`}>
                              {getStatusText(profileData.status)}
                          </Badge>
                          </p>
                      )}
                    </div>
                  </div>
                )}
                {(profileData.role === 'Admin' || profileData.role === 'HR') && (
                    <div>
                        <h3 className="font-semibold mb-2">Thông tin Vai trò</h3>
                        <div className="space-y-2">
                            <p className="text-sm"><strong>Vai trò:</strong> {profileData.role}</p>
                            {/* Thêm các trường liên quan khác cho Admin/HR nếu có trong kiểu User */}
                             <p className="text-sm"><strong>Ngày bắt đầu:</strong> {profileData.startWork ? new Date(profileData.startWork).toLocaleDateString('vi-VN') : 'N/A'}</p>
                             {profileData.status && (
                                <p className="text-sm"><strong>Trạng thái:</strong> 
                                <Badge variant="outline" className={`ml-2 ${getStatusColor(profileData.status)}`}>
                                    {getStatusText(profileData.status)}
                                </Badge>
                                </p>
                            )}
                        </div>
                    </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {user.role === 'Trainee' && profileData.completedCourses && (
          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <CardTitle>Khóa học đã hoàn thành</CardTitle>
                <CardDescription>Danh sách các khóa học đã hoàn thành và kết quả</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {profileData.completedCourses.length ? profileData.completedCourses.map((course) => (
                    <div key={course.courseId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{course.courseName}</h4>
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          Hoàn thành
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{new Date(course.completionDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Điểm số: {course.grade}/100</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{course.feedback}</span>
                        </div>
                      </div>
                    </div>
                  )) : <p className="text-muted-foreground">Chưa có khóa học nào hoàn thành.</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {user.role === 'Trainee' && profileData.certificates && (
          <TabsContent value="certificates">
            <Card>
              <CardHeader>
                <CardTitle>Chứng chỉ đã đạt được</CardTitle>
                <CardDescription>Danh sách các chứng chỉ và thành tích</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {profileData.certificates.length ? profileData.certificates.map((cert) => (
                    <div key={cert.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{cert.name}</h4>
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                          {cert.issuingOrganization}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Ngày cấp: {new Date(cert.issueDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">ID: {cert.credentialId}</span>
                        </div>
                      </div>
                    </div>
                  )) : <p className="text-muted-foreground">Chưa có chứng chỉ nào.</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {user.role === 'Trainee' && profileData.evaluations && (
          <TabsContent value="evaluations">
            <Card>
              <CardHeader>
                <CardTitle>Đánh giá năng lực</CardTitle>
                <CardDescription>Lịch sử đánh giá và phát triển</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {profileData.evaluations.length ? profileData.evaluations.map((evaluation) => (
                    <div key={evaluation.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold">Đánh giá ngày {new Date(evaluation.evaluationDate).toLocaleDateString('vi-VN')}</h4>
                        <Badge variant="outline" className="bg-purple-100 text-purple-800">
                          Điểm: {evaluation.overallScore}/5
                        </Badge>
                      </div>
                    </div>
                  )) : <p className="text-muted-foreground">Chưa có đánh giá nào.</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={isEditing} onOpenChange={(open) => {
        setIsEditing(open);
        if (!open) { 
            setAvatarFile(null);
            // Đặt lại xem trước avatar về cái từ profileData hoặc ngữ cảnh người dùng
            setAvatarPreview(profileData?.urlAvatar || user.urlAvatar || null); 
            if (avatarInputRef.current) avatarInputRef.current.value = '';
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        }
      }}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle className="flex items-center"><Edit3 className="mr-2 h-5 w-5" /> Chỉnh sửa Hồ sơ</DialogTitle>
            <DialogDescription>
              Cập nhật ảnh đại diện hoặc mật khẩu của bạn. Nhấn Lưu khi hoàn tất.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
                <Label htmlFor="avatar-upload" className="flex items-center">
                    <ImageIcon className="mr-2 h-4 w-4 text-muted-foreground" />Ảnh đại diện
                </Label>
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={avatarPreview || profileData.urlAvatar} alt={profileData.fullName} />
                        <AvatarFallback>{getInitials(profileData.fullName)}</AvatarFallback>
                    </Avatar>
                    <Button type="button" variant="outline" onClick={() => avatarInputRef.current?.click()}>
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
                 <p className="text-xs text-muted-foreground">PNG, JPG, GIF tối đa 2MB.</p>
            </div>
            <hr />
            <h4 className="text-md font-medium flex items-center">
              <KeyRound className="mr-2 h-4 w-4 text-muted-foreground" /> Thay đổi mật khẩu
            </h4>
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mật khẩu hiện tại (Để trống nếu không đổi)</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại"
              />
            </div>
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

