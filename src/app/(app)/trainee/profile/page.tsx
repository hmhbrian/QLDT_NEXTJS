'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCircle, Edit3, Save, XSquare, Image as ImageIcon, KeyRound, Award, BookOpen, Star, Calendar, Clock, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useToast } from '@/components/ui/use-toast';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trainee, TraineeLevel, WorkStatus } from '@/lib/types';
import { mockTrainee } from '@/lib/mock';

export default function TraineeProfilePage() {
  const { user, updateAvatar, changePassword } = useAuth();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [newAvatarUrl, setNewAvatarUrl] = useState(user?.avatar || '');
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
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const handleSaveChanges = async () => {
    setIsSubmitting(true);
    try {
      if (newAvatarUrl !== user.avatar) {
        await updateAvatar(newAvatarUrl);
      }
      if (newPassword) {
        if (newPassword !== confirmNewPassword) {
          throw new Error('Mật khẩu không khớp');
        }
        await changePassword(newPassword, confirmNewPassword);
      }
         toast({
        title: 'Thành công',
        description: 'Thông tin đã được cập nhật',
        });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể cập nhật thông tin',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLevelBadgeColor = (level: string) => {
    const colors: Record<string, string> = {
      intern: 'bg-blue-100 text-blue-800',
      probation: 'bg-yellow-100 text-yellow-800',
      employee: 'bg-green-100 text-green-800',
      middle_manager: 'bg-purple-100 text-purple-800',
      senior_manager: 'bg-red-100 text-red-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      active: 'Đang làm việc',
      inactive: 'Đã nghỉ việc',
      suspended: 'Tạm ngưng'
    };
    return texts[status] || status;
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
          <TabsTrigger value="courses">Khóa học</TabsTrigger>
          <TabsTrigger value="certificates">Chứng chỉ</TabsTrigger>
          <TabsTrigger value="evaluations">Đánh giá</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="shadow-lg">
            <CardHeader className="items-center text-center border-b pb-6">
              <Avatar className="h-24 w-24 mb-4 ring-4 ring-primary ring-offset-2 ring-offset-background">
                <AvatarImage src={mockTrainee.avatar} alt={mockTrainee.name} />
                <AvatarFallback>{getInitials(mockTrainee.name)}</AvatarFallback>
              </Avatar>
              <CardTitle className="font-headline text-2xl">{mockTrainee.name}</CardTitle>
              <CardDescription className="space-x-2">
                <span>{mockTrainee.email}</span>
                <Badge variant="outline" className={getLevelBadgeColor(mockTrainee.level)}>
                  {mockTrainee.level.replace('_', ' ').toUpperCase()}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Thông tin Cá nhân</h3>
                  <div className="space-y-2">
                    <p className="text-sm"><strong>Họ và tên:</strong> {mockTrainee.name}</p>
                    <p className="text-sm"><strong>Mã nhân viên:</strong> {mockTrainee.employeeId}</p>
                    <p className="text-sm"><strong>Phòng ban:</strong> {mockTrainee.department}</p>
                    <p className="text-sm"><strong>Chức vụ:</strong> {mockTrainee.position}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Thông tin Liên hệ</h3>
                  <div className="space-y-2">
                    <p className="text-sm"><strong>Email công ty:</strong> {mockTrainee.email}</p>
                    <p className="text-sm"><strong>Số điện thoại:</strong> {mockTrainee.phone}</p>
                    <p className="text-sm"><strong>Ngày vào công ty:</strong> {new Date(mockTrainee.joinDate).toLocaleDateString('vi-VN')}</p>
                    <p className="text-sm"><strong>Quản lý trực tiếp:</strong> {mockTrainee.manager}</p>
                    <p className="text-sm"><strong>Trạng thái:</strong> 
                      <Badge variant="outline" className={`ml-2 ${getStatusColor(mockTrainee.status)}`}>
                        {getStatusText(mockTrainee.status)}
                      </Badge>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>Khóa học đã hoàn thành</CardTitle>
              <CardDescription>Danh sách các khóa học đã hoàn thành và kết quả</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockTrainee.completedCourses.map((course) => (
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
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates">
          <Card>
            <CardHeader>
              <CardTitle>Chứng chỉ đã đạt được</CardTitle>
              <CardDescription>Danh sách các chứng chỉ và thành tích</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockTrainee.certificates.map((cert) => (
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
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluations">
          <Card>
            <CardHeader>
              <CardTitle>Đánh giá năng lực</CardTitle>
              <CardDescription>Lịch sử đánh giá và phát triển</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockTrainee.evaluations.map((eval) => (
                  <div key={eval.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold">Đánh giá ngày {new Date(eval.date).toLocaleDateString('vi-VN')}</h4>
                      <Badge variant="outline" className="bg-purple-100 text-purple-800">
                        Điểm: {eval.overallRating}/5
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium mb-2">Đánh giá kỹ năng</h5>
                        <div className="space-y-2">
                          {eval.skillAssessments.map((skill, index) => (
                            <div key={index}>
                              <div className="flex justify-between text-sm mb-1">
                                <span>{skill.skillName}</span>
                                <span>{skill.rating}/5</span>
                              </div>
                              <Progress value={skill.rating * 20} className="h-2" />
                              <p className="text-sm text-muted-foreground mt-1">{skill.comments}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium mb-2">Điểm mạnh</h5>
                        <div className="flex flex-wrap gap-2">
                          {eval.strengths.map((strength, index) => (
                            <Badge key={index} variant="outline" className="bg-green-100 text-green-800">
                              {strength}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium mb-2">Cần cải thiện</h5>
                        <div className="flex flex-wrap gap-2">
                          {eval.areasForImprovement.map((area, index) => (
                            <Badge key={index} variant="outline" className="bg-yellow-100 text-yellow-800">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium mb-2">Khuyến nghị</h5>
                        <p className="text-sm">{eval.recommendations}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
              <Label htmlFor="avatarUrl" className="flex items-center">
                <ImageIcon className="mr-2 h-4 w-4 text-muted-foreground" />URL Ảnh đại diện
              </Label>
              <Input
                id="avatarUrl"
                value={newAvatarUrl}
                onChange={(e) => setNewAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.png"
              />
            </div>
            <hr />
            <h4 className="text-md font-medium flex items-center">
              <KeyRound className="mr-2 h-4 w-4 text-muted-foreground" /> Thay đổi mật khẩu
            </h4>
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
