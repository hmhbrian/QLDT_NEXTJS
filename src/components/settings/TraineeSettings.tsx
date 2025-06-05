'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCookie } from "@/hooks/use-cookie";

export function TraineeSettings() {
  const [emailNotifications, setEmailNotifications] = useCookie('trainee_email_notifications', true);
  const [progressTracking, setProgressTracking] = useCookie('trainee_progress_tracking', true);
  const [displayName, setDisplayName] = useCookie('trainee_display_name', '');
  const [bio, setBio] = useCookie('trainee_bio', '');
  const [showProgress, setShowProgress] = useCookie('trainee_show_progress', false);

  return (
    <Tabs defaultValue="profile" className="space-y-4">
      <TabsList>
        <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
        <TabsTrigger value="learning">Học tập</TabsTrigger>
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
            <div className="space-y-2">
              <Label htmlFor="displayName">Tên hiển thị</Label>
              <Input 
                id="displayName" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Nguyễn Văn A" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Giới thiệu</Label>
              <Input 
                id="bio" 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Một vài dòng về bản thân..." 
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="learning" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Cài đặt học tập</CardTitle>
            <CardDescription>
              Tùy chỉnh trải nghiệm học tập của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Theo dõi tiến độ</Label>
                <p className="text-sm text-muted-foreground">
                  Cho phép theo dõi tiến độ học tập
                </p>
              </div>
              <Switch
                checked={progressTracking}
                onCheckedChange={setProgressTracking}
              />
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