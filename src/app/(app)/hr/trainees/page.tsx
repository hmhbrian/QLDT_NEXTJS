'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCheck, PlusCircle, MoreHorizontal, Search, Mail, Phone, Building2, UserCircle2, Calendar, Award } from "lucide-react";
import { useState } from "react";
import { User, TraineeLevel, WorkStatus } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { useUserStore } from "@/stores/user-store";

export default function TraineesPage() {
  const { toast } = useToast();
  const { users, addUser, updateUser, deleteUser } = useUserStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrainee, setSelectedTrainee] = useState<User | null>(null);
  const [isAddingTrainee, setIsAddingTrainee] = useState(false);
  const [isViewingTrainee, setIsViewingTrainee] = useState(false);

  // New trainee form state
  const [newTrainee, setNewTrainee] = useState({
    fullName: '',
    employeeId: '',
    email: '',
    phoneNumber: '',
    department: '',
    position: '',
    level: 'beginner' as TraineeLevel,
    joinDate: '',
    manager: '',
    status: 'working' as WorkStatus,
    idCard: '',
  });

  const trainees = users.filter((user: User) => user.role === 'Trainee');
  
  const filteredTrainees = trainees.filter((trainee: User) => 
    (trainee.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (trainee.employeeId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (trainee.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (trainee.department || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddTrainee = () => {
    // Validate required fields
    if (!newTrainee.fullName || !newTrainee.employeeId || !newTrainee.email || !newTrainee.idCard) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        variant: "destructive",
      });
      return;
    }

    const trainee: User = {
      id: crypto.randomUUID(),
      ...newTrainee,
      role: 'Trainee',
      urlAvatar: 'https://placehold.co/40x40.png',
      completedCourses: [],
      certificates: [],
      evaluations: [],
    };

    addUser(trainee);
    setIsAddingTrainee(false);
    toast({
      title: "Thành công",
      description: "Đã thêm học viên mới",
    });
    setIsAddingTrainee(false);
  };

  const getLevelBadgeColor = (level: TraineeLevel) => {
    switch (level) {
      case 'beginner': return 'bg-blue-100 text-blue-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-green-100 text-green-800';
      case 'expert': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
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
        <h1 className="text-2xl md:text-3xl font-headline font-semibold">Quản lý Học viên</h1>
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
          <Button onClick={() => setIsAddingTrainee(true)} className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-5 w-5" /> Thêm Học viên
          </Button>
        </div>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Tất cả Học viên</CardTitle>
          <CardDescription>Quản lý thông tin học viên, ghi danh và phân công khóa học.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên & Mã NV</TableHead>
                  <TableHead className="hidden md:table-cell">Liên hệ</TableHead>
                  <TableHead className="hidden lg:table-cell">Phòng ban</TableHead>
                  <TableHead className="hidden lg:table-cell">Cấp bậc</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrainees.map((trainee) => (
                  <TableRow key={trainee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={trainee.urlAvatar} alt={trainee.fullName} />
                          <AvatarFallback>{trainee.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{trainee.fullName}</div>
                          <div className="text-xs text-muted-foreground">{trainee.employeeId}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" /> {trainee.email}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" /> {trainee.phoneNumber}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{trainee.department}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant="outline" className={getLevelBadgeColor(trainee.level ?? 'beginner')}>
                        {trainee.level?.toUpperCase() ?? 'BEGINNER'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(trainee.status ?? 'working')}>
                        {getStatusText(trainee.status ?? 'working')}
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
                          <DropdownMenuItem onClick={() => {
                            setSelectedTrainee(trainee);
                            setIsViewingTrainee(true);
                          }}>
                            Xem Chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem>Sửa Thông tin</DropdownMenuItem>
                          <DropdownMenuItem>Quản lý Khóa học</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            Xóa Học viên
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

      {/* Add Trainee Dialog */}
      <Dialog open={isAddingTrainee} onOpenChange={setIsAddingTrainee}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Thêm Học viên Mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin chi tiết của học viên mới. Các trường có dấu * là bắt buộc.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên *</Label>
                <Input
                  id="fullName"
                  value={newTrainee.fullName}
                  onChange={(e) => setNewTrainee({...newTrainee, fullName: e.target.value})}
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeeId">Mã nhân viên *</Label>
                <Input
                  id="employeeId"
                  value={newTrainee.employeeId}
                  onChange={(e) => setNewTrainee({...newTrainee, employeeId: e.target.value})}
                  placeholder="EMP001"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="idCard">CMND/CCCD *</Label>
                <Input
                  id="idCard"
                  value={newTrainee.idCard}
                  onChange={(e) => setNewTrainee({...newTrainee, idCard: e.target.value})}
                  placeholder="012345678910"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email công ty *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newTrainee.email}
                  onChange={(e) => setNewTrainee({...newTrainee, email: e.target.value})}
                  placeholder="example@company.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Số điện thoại</Label>
                <Input
                  id="phoneNumber"
                  value={newTrainee.phoneNumber}
                  onChange={(e) => setNewTrainee({...newTrainee, phoneNumber: e.target.value})}
                  placeholder="0901234567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Phòng ban</Label>
                <Input
                  id="department"
                  value={newTrainee.department}
                  onChange={(e) => setNewTrainee({...newTrainee, department: e.target.value})}
                  placeholder="CNTT"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Chức vụ</Label>
                <Input
                  id="position"
                  value={newTrainee.position}
                  onChange={(e) => setNewTrainee({...newTrainee, position: e.target.value})}
                  placeholder="Developer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Cấp bậc</Label>
                <Select
                  value={newTrainee.level}
                  onValueChange={(value: TraineeLevel) => setNewTrainee({...newTrainee, level: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn cấp bậc" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Sơ cấp</SelectItem>
                    <SelectItem value="intermediate">Trung cấp</SelectItem>
                    <SelectItem value="advanced">Nâng cao</SelectItem>
                    <SelectItem value="expert">Chuyên gia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  value={newTrainee.status}
                  onValueChange={(value: WorkStatus) => setNewTrainee({...newTrainee, status: value})}
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
              <div className="space-y-2">
                <Label htmlFor="joinDate">Ngày vào công ty</Label>
                <Input
                  id="joinDate"
                  type="date"
                  value={newTrainee.joinDate}
                  onChange={(e) => setNewTrainee({...newTrainee, joinDate: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="manager">Quản lý trực tiếp</Label>
              <Input
                id="manager"
                value={newTrainee.manager}
                onChange={(e) => setNewTrainee({...newTrainee, manager: e.target.value})}
                placeholder="Nguyễn Văn B"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingTrainee(false)}>Hủy</Button>
            <Button onClick={handleAddTrainee}>Thêm Học viên</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Trainee Dialog */}
      <Dialog open={isViewingTrainee} onOpenChange={setIsViewingTrainee}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Chi tiết Học viên</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết và lịch sử học tập của học viên
            </DialogDescription>
          </DialogHeader>
          
          {selectedTrainee && (
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
                      <p className="text-sm"><strong>Họ và tên:</strong> {selectedTrainee.fullName}</p>
                      <p className="text-sm"><strong>Mã nhân viên:</strong> {selectedTrainee.employeeId}</p>
                      <p className="text-sm"><strong>CMND/CCCD:</strong> {selectedTrainee.idCard}</p>
                      <p className="text-sm"><strong>Email:</strong> {selectedTrainee.email}</p>
                      <p className="text-sm"><strong>Số điện thoại:</strong> {selectedTrainee.phoneNumber}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Thông tin công việc</h4>
                    <div className="space-y-1">
                      <p className="text-sm"><strong>Phòng ban:</strong> {selectedTrainee.department}</p>
                      <p className="text-sm"><strong>Chức vụ:</strong> {selectedTrainee.position}</p>
                      <p className="text-sm"><strong>Cấp bậc:</strong> {selectedTrainee.level}</p>
                      <p className="text-sm"><strong>Quản lý:</strong> {selectedTrainee.manager}</p>
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
                        Hiển thị cơ cấu phòng ban và vị trí của học viên trong tổ chức
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="courses">
                <div className="space-y-4">
                  {(selectedTrainee.completedCourses ?? []).length > 0 ? (
                    (selectedTrainee.completedCourses ?? []).map(course => (
                      <div key={course.courseId} className="p-4 border rounded-lg">
                        <h4 className="font-medium">{course.courseName}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Hoàn thành: {new Date(course.completionDate).toLocaleDateString('vi-VN')}
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
                  {(selectedTrainee.certificates ?? []).length > 0 ? (
                    (selectedTrainee.certificates ?? []).map(cert => (
                      <div key={cert.id} className="p-4 border rounded-lg">
                        <h4 className="font-medium">{cert.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Cấp bởi: {cert.issuingOrganization}
                        </p>
                        <p className="text-sm mt-2">
                          <strong>Ngày cấp:</strong> {new Date(cert.issueDate).toLocaleDateString('vi-VN')}
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

      {filteredTrainees.length === 0 && (
        <div className="text-center py-12">
          <UserCheck className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-xl font-semibold">Không tìm thấy Học viên nào</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'Nhấn "Thêm Học viên" để bắt đầu.'}
          </p>
        </div>
      )}
    </div>
  );
}
