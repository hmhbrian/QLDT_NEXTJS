'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCookie } from "@/hooks/use-cookie";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

export function TraineeSettings() {
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = useCookie('trainee_email_notifications', true);
  const [progressTracking, setProgressTracking] = useCookie('trainee_progress_tracking', true);
  const [showProgress, setShowProgress] = useCookie('trainee_show_progress', false);

  // Thông tin cá nhân
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');
  const [manager, setManager] = useState('');
  const [status, setStatus] = useState('active');

  const handleSaveProfile = () => {
    // TODO: Implement API call to save profile
    toast({
      title: "Thành công",
      description: "Thông tin cá nhân đã được cập nhật",
    });
  };

  return (
    <Tabs defaultValue="profile" className="space-y-4">
      <TabsList>
        <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
        <TabsTrigger value="notifications">Thông báo</TabsTrigger>
        <TabsTrigger value="privacy">Quyền riêng tư</TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
            <CardDescription>
              Cập nhật thông tin cá nhân của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input 
                  id="phone" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0901234567" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Chức vụ</Label>
                <Input 
                  id="position" 
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Nhân viên" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Phòng ban</Label>
                <Input 
                  id="department" 
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="CNTT" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manager">Quản lý trực tiếp</Label>
                <Input 
                  id="manager" 
                  value={manager}
                  onChange={(e) => setManager(e.target.value)}
                  placeholder="Nguyễn Văn A" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Đang làm việc</SelectItem>
                    <SelectItem value="leave">Tạm nghỉ</SelectItem>
                    <SelectItem value="inactive">Nghỉ việc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSaveProfile}>
                Lưu thay đổi
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notifications" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Cài đặt thông báo</CardTitle>
            <CardDescription>
              Quản lý thông báo từ hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Thông báo qua email</Label>
                <p className="text-sm text-muted-foreground">
                  Nhận thông báo về khóa học qua email
                </p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="privacy" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Quyền riêng tư</CardTitle>
            <CardDescription>
              Quản lý cài đặt quyền riêng tư của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Hiển thị tiến độ học tập</Label>
                <p className="text-sm text-muted-foreground">
                  Cho phép người khác xem tiến độ học tập của bạn
                </p>
              </div>
              <Switch
                checked={showProgress}
                onCheckedChange={setShowProgress}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
} 