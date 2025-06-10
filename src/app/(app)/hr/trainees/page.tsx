
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
import { UserCheck, PlusCircle, MoreHorizontal, Search, Mail, Phone, Building2, UserCircle2, Calendar, Award, Edit, Trash2, AlertCircle, BookOpen } from "lucide-react"; // Đã thêm BookOpen
import { useState, useEffect } from "react";
import type { User, TraineeLevel, WorkStatus } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { useUserStore } from "@/stores/user-store";
import { useError } from "@/hooks/use-error";


const initialNewTraineeState = {
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
  urlAvatar: 'https://placehold.co/40x40.png',
};


export default function TraineesPage() {
  const { toast } = useToast();
  const { showError } = useError();
  const { users, addUser, updateUser, deleteUser } = useUserStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrainee, setSelectedTrainee] = useState<User | null>(null);
  const [isAddingTrainee, setIsAddingTrainee] = useState(false);
  const [isViewingTrainee, setIsViewingTrainee] = useState(false);
  const [editingTrainee, setEditingTrainee] = useState<User | null>(null);
  const [deletingTrainee, setDeletingTrainee] = useState<User | null>(null);


  // Trạng thái form cho học viên mới
  const [newTraineeData, setNewTraineeData] = useState<Omit<User, 'id' | 'role' | 'completedCourses' | 'certificates' | 'evaluations' | 'createdAt' | 'modifiedAt' | 'startWork' | 'endWork'>>(initialNewTraineeState);
  const [editTraineeData, setEditTraineeData] = useState<Partial<User>>({});


  useEffect(() => {
    if (editingTrainee) {
      setEditTraineeData({ ...editingTrainee });
    } else {
      setEditTraineeData({});
    }
  }, [editingTrainee]);

  const trainees = users.filter((user: User) => user.role === 'Trainee');
  
  const filteredTrainees = trainees.filter((trainee: User) => 
    (trainee.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (trainee.employeeId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (trainee.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (trainee.department || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddTrainee = () => {
    if (!newTraineeData.fullName || !newTraineeData.employeeId || !newTraineeData.email || !newTraineeData.idCard) {
      showError('FORM001');
      return;
    }

    const traineeToAdd: User = {
      id: crypto.randomUUID(),
      ...newTraineeData,
      role: 'Trainee',
      createdAt: new Date(),
      modifiedAt: new Date(),
    };

    addUser(traineeToAdd);
    setIsAddingTrainee(false);
    setNewTraineeData(initialNewTraineeState); // Đặt lại form
    toast({ title: "Thành công", description: "Đã thêm học viên mới.", variant: "success" });
  };

  const handleUpdateTrainee = () => {
    if (!editingTrainee || !editTraineeData.id) return;
    if (!editTraineeData.fullName || !editTraineeData.employeeId || !editTraineeData.email || !editTraineeData.idCard) {
      showError('FORM001');
      return;
    }
    
    updateUser(editingTrainee.id, { ...editTraineeData, modifiedAt: new Date() });
    setEditingTrainee(null);
    toast({ title: "Thành công", description: "Thông tin học viên đã được cập nhật.", variant: "success" });
  };

  const handleDeleteTrainee = () => {
    if (!deletingTrainee) return;
    deleteUser(deletingTrainee.id);
    setDeletingTrainee(null);
    toast({ title: "Thành công", description: "Đã xóa học viên.", variant: "success" });
  };


  const getLevelBadgeColor = (level?: TraineeLevel) => {
    if (!level) return 'bg-gray-100 text-gray-800';
    switch (level) {
      case 'intern': return 'bg-blue-100 text-blue-800';
      case 'probation': return 'bg-yellow-100 text-yellow-800';
      case 'employee': return 'bg-green-100 text-green-800';
      case 'middle_manager': return 'bg-purple-100 text-purple-800';
      case 'senior_manager': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status?: WorkStatus) => {
    if (!status) return 'bg-gray-100 text-gray-800';
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

  const getStatusText = (status?: WorkStatus) => {
    if (!status) return 'Không xác định';
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
  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, 
    field: keyof Omit<User, 'id' | 'role' | 'completedCourses' | 'certificates' | 'evaluations' | 'createdAt' | 'modifiedAt' | 'startWork' | 'endWork'>, 
    isEdit: boolean
  ) => {
    const value = e.target.value;
    if (isEdit) {
      setEditTraineeData(prev => ({ ...prev, [field]: value }));
    } else {
      setNewTraineeData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSelectChange = (
    value: string, 
    field: keyof Omit<User, 'id' | 'role' | 'completedCourses' | 'certificates' | 'evaluations' | 'createdAt' | 'modifiedAt' | 'startWork' | 'endWork'>, 
    isEdit: boolean
  ) => {
    if (isEdit) {
      setEditTraineeData(prev => ({ ...prev, [field]: value as TraineeLevel | WorkStatus }));
    } else {
      setNewTraineeData(prev => ({ ...prev, [field]: value as TraineeLevel | WorkStatus }));
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
          <Button onClick={() => { setNewTraineeData(initialNewTraineeState); setIsAddingTrainee(true); }} className="w-full sm:w-auto">
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
                          <AvatarImage src={trainee.urlAvatar} alt={trainee.fullName} data-ai-hint="avatar person" />
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
                      {trainee.level && (
                        <Badge variant="outline" className={getLevelBadgeColor(trainee.level)}>
                          {trainee.level.replace('_', ' ').toUpperCase()}
                        </Badge>
                      )}
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
                            <UserCircle2 className="mr-2 h-4 w-4" /> Xem Chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditingTrainee(trainee)}>
                            <Edit className="mr-2 h-4 w-4" /> Sửa Thông tin
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast({ title: "Thông báo", description: "Chức năng quản lý khóa học cho học viên đang được phát triển.", variant: "default" })}>
                            <BookOpen className="mr-2 h-4 w-4" /> Quản lý Khóa học
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeletingTrainee(trainee)}>
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

      {/* Add or Edit Trainee Dialog */}
      <Dialog open={isAddingTrainee || !!editingTrainee} onOpenChange={(isOpen) => {
        if (!isOpen) {
          setIsAddingTrainee(false);
          setEditingTrainee(null);
        }
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingTrainee ? 'Chỉnh sửa Học viên' : 'Thêm Học viên Mới'}</DialogTitle>
            <DialogDescription>
              {editingTrainee ? 'Cập nhật thông tin chi tiết của học viên.' : 'Nhập thông tin chi tiết của học viên mới. Các trường có dấu * là bắt buộc.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            {/* Các trường form chung */}
            {(['fullName', 'employeeId', 'idCard', 'email', 'phoneNumber', 'department', 'position', 'manager', 'joinDate'] as const).map(fieldKey => {
              const isDateField = fieldKey === 'joinDate';
              const currentData = editingTrainee ? editTraineeData : newTraineeData;
              
              return (
                <div key={fieldKey} className="space-y-2">
                  <Label htmlFor={fieldKey}>
                    {fieldKey === 'fullName' && 'Họ và tên *'}
                    {fieldKey === 'employeeId' && 'Mã nhân viên *'}
                    {fieldKey === 'idCard' && 'CMND/CCCD *'}
                    {fieldKey === 'email' && 'Email công ty *'}
                    {fieldKey === 'phoneNumber' && 'Số điện thoại'}
                    {fieldKey === 'department' && 'Phòng ban'}
                    {fieldKey === 'position' && 'Chức vụ'}
                    {fieldKey === 'manager' && 'Quản lý trực tiếp'}
                    {fieldKey === 'joinDate' && 'Ngày vào công ty'}
                  </Label>
                  <Input
                    id={fieldKey}
                    type={isDateField ? 'date' : 'text'}
                    value={
                        isDateField 
                        ? (currentData[fieldKey] ? new Date(currentData[fieldKey]!).toISOString().split('T')[0] : '') 
                        : (currentData[fieldKey as keyof typeof currentData] as string || '')
                    }
                    onChange={(e) => handleInputChange(e, fieldKey as any, !!editingTrainee)}
                    placeholder={
                        fieldKey === 'fullName' ? 'Nguyễn Văn A' :
                        fieldKey === 'employeeId' ? 'EMP001' :
                        fieldKey === 'idCard' ? '012345678910' :
                        fieldKey === 'email' ? 'example@company.com' :
                        fieldKey === 'phoneNumber' ? '0901234567' :
                        fieldKey === 'department' ? 'CNTT' :
                        fieldKey === 'position' ? 'Developer' :
                        fieldKey === 'manager' ? 'Nguyễn Văn B' : ''
                    }
                  />
                </div>
              );
            })}
            <div className="space-y-2">
                <Label htmlFor="level">Cấp bậc</Label>
                <Select
                  value={editingTrainee ? editTraineeData.level : newTraineeData.level}
                  onValueChange={(value: TraineeLevel) => handleSelectChange(value, 'level' as any, !!editingTrainee)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn cấp bậc" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="intern">Thực tập</SelectItem>
                    <SelectItem value="probation">Thử việc</SelectItem>
                    <SelectItem value="employee">Nhân viên</SelectItem>
                    <SelectItem value="middle_manager">Quản lý cấp trung</SelectItem>
                    <SelectItem value="senior_manager">Quản lý cấp cao</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  value={editingTrainee ? editTraineeData.status : newTraineeData.status}
                  onValueChange={(value: WorkStatus) => handleSelectChange(value, 'status' as any, !!editingTrainee)}
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
            <Button variant="outline" onClick={() => { setIsAddingTrainee(false); setEditingTrainee(null); }}>Hủy</Button>
            <Button onClick={editingTrainee ? handleUpdateTrainee : handleAddTrainee}>
              {editingTrainee ? 'Lưu thay đổi' : 'Thêm Học viên'}
            </Button>
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

      {/* Delete Trainee Confirmation Dialog */}
      <Dialog open={!!deletingTrainee} onOpenChange={() => setDeletingTrainee(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa học viên</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa học viên "{deletingTrainee?.fullName}"? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-4 py-4">
            <AlertCircle className="h-10 w-10 text-destructive flex-shrink-0" />
            <div>
              <p className="font-medium">{deletingTrainee?.fullName}</p>
              <p className="text-sm text-muted-foreground">{deletingTrainee?.email}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingTrainee(null)}>Hủy</Button>
            <Button variant="destructive" onClick={handleDeleteTrainee}>Xóa Học viên</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {filteredTrainees.length === 0 && !isAddingTrainee && !editingTrainee && (
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


    

    
