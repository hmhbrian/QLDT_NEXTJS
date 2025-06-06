'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCircle, Edit3, Save, XSquare, Image as ImageIcon, KeyRound, Award, BookOpen, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useToast } from '@/components/ui/use-toast';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trainee, TraineeLevel, WorkStatus } from '@/lib/types';

const mockTrainee: Trainee = {
  id: '1',
  employeeId: 'EMP001',
  name: 'Nguyễn Văn A',
  email: 'nva@example.com',
  phone: '0901234567',
  department: 'CNTT',
  position: 'Developer',
  level: 'intern',
  joinDate: '2024-01-01',
  manager: 'Trần Văn B',
  status: 'active',
  avatar: 'https://placehold.co/100x100.png',
  completedCourses: [
    {
      courseId: 'C1',
      courseName: 'JavaScript Fundamentals',
      completionDate: '2024-02-15',
      grade: 85,
      feedback: 'Good understanding of core concepts',
    },
    {
      courseId: 'C2',
      courseName: 'React Basics',
      completionDate: '2024-03-01',
      grade: 90,
      feedback: 'Excellent project work',
    }
  ],
  certificates: [
    {
      id: 'CERT1',
      name: 'JavaScript Developer',
      issueDate: '2024-02-20',
      issuingOrganization: 'Tech Academy',
      credentialId: 'JS-2024-001',
    }
  ],
  evaluations: [
    {
      id: 'E1',
      traineeId: '1',
      evaluatorId: 'M1',
      date: '2024-03-15',
      skillAssessments: [
        { skillName: 'Technical Skills', rating: 4, comments: 'Good technical foundation' },
        { skillName: 'Communication', rating: 4, comments: 'Clear and effective communication' },
        { skillName: 'Problem Solving', rating: 3, comments: 'Shows potential, needs more practice' }
      ],
      overallRating: 4,
      strengths: ['Quick learner', 'Team player'],
      areasForImprovement: ['Complex problem solving'],
      recommendations: 'Focus on advanced problem-solving scenarios'
    }
  ]
};

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

  const getLevelBadgeColor = (level: TraineeLevel) => {
    switch (level) {
      case 'intern': return 'bg-blue-100 text-blue-800';
      case 'probation': return 'bg-yellow-100 text-yellow-800';
      case 'employee': return 'bg-green-100 text-green-800';
      case 'middle_manager': return 'bg-purple-100 text-purple-800';
      case 'senior_manager': return 'bg-red-100 text-red-800';
    }
  };

  const getStatusColor = (status: WorkStatus) => {
    switch (status) {
      case 'working': return 'bg-green-100 text-green-800';
      case 'resigned': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      case 'maternity_leave': return 'bg-purple-100 text-purple-800';
      case 'sick_leave': return 'bg-orange-100 text-orange-800';
      case 'sabbatical': return 'bg-blue-100 text-blue-800';
      case 'terminated': return 'bg-destructive text-destructive-foreground';
    }
  };

  const getStatusText = (status: WorkStatus) => {
    switch (status) {
      case 'working': return 'Đang làm việc';
      case 'resigned': return 'Đã nghỉ việc';
      case 'suspended': return 'Tạm nghỉ';
      case 'maternity_leave': return 'Nghỉ thai sản';
      case 'sick_leave': return 'Nghỉ bệnh dài hạn';
      case 'sabbatical': return 'Nghỉ phép dài hạn';
      case 'terminated': return 'Đã sa thải';
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

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList>
          <TabsTrigger value="info">Thông tin cơ bản</TabsTrigger>
          <TabsTrigger value="courses">Khóa học</TabsTrigger>
          <TabsTrigger value="evaluations">Đánh giá</TabsTrigger>
          <TabsTrigger value="certificates">Chứng chỉ</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
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
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Khóa học đã hoàn thành
              </CardTitle>
              <CardDescription>
                Danh sách các khóa học và kết quả học tập
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockTrainee.completedCourses.map((course) => (
                  <div key={course.courseId} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{course.courseName}</h4>
                        <p className="text-sm text-muted-foreground">
                          Hoàn thành: {new Date(course.completionDate).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <Badge variant="secondary">Điểm: {course.grade}/100</Badge>
                    </div>
                    {course.feedback && (
                      <p className="text-sm mt-2 text-muted-foreground">
                        <strong>Nhận xét:</strong> {course.feedback}
                      </p>
                    )}
                    <Progress value={course.grade} className="mt-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluations">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Đánh giá Học viên
              </CardTitle>
              <CardDescription>
                Kết quả đánh giá và phản hồi từ quản lý
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mockTrainee.evaluations.map((evaluation) => (
                <div key={evaluation.id} className="space-y-6">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold">Đánh giá ngày {new Date(evaluation.date).toLocaleDateString('vi-VN')}</h4>
                        <p className="text-sm text-muted-foreground">Đánh giá tổng thể: {evaluation.overallRating}/5</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium mb-2">Đánh giá kỹ năng</h5>
                        <div className="grid gap-2">
                          {evaluation.skillAssessments.map((skill, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <span className="text-sm">{skill.skillName}</span>
                              <div className="flex items-center gap-2">
                                <Progress value={skill.rating * 20} className="w-24" />
                                <span className="text-sm font-medium">{skill.rating}/5</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium mb-2">Điểm mạnh</h5>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            {evaluation.strengths.map((strength, index) => (
                              <li key={index}>{strength}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium mb-2">Cần cải thiện</h5>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            {evaluation.areasForImprovement.map((area, index) => (
                              <li key={index}>{area}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium mb-2">Khuyến nghị</h5>
                        <p className="text-sm">{evaluation.recommendations}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Chứng chỉ
              </CardTitle>
              <CardDescription>
                Các chứng chỉ và bằng cấp đã đạt được
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockTrainee.certificates.map((certificate) => (
                  <Card key={certificate.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{certificate.name}</CardTitle>
                      <CardDescription>{certificate.issuingOrganization}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <p><strong>Ngày cấp:</strong> {new Date(certificate.issueDate).toLocaleDateString('vi-VN')}</p>
                        {certificate.expiryDate && (
                          <p><strong>Ngày hết hạn:</strong> {new Date(certificate.expiryDate).toLocaleDateString('vi-VN')}</p>
                        )}
                        {certificate.credentialId && (
                          <p><strong>Mã chứng chỉ:</strong> {certificate.credentialId}</p>
                        )}
                      </div>
                    </CardContent>
                    {certificate.url && (
                      <CardFooter>
                        <Button variant="link" className="px-0" asChild>
                          <a href={certificate.url} target="_blank" rel="noopener noreferrer">
                            Xem chứng chỉ
                          </a>
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
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
