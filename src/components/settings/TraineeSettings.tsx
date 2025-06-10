
'use client';

import React from 'react'; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


import { Bell } from "lucide-react"; 
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Định nghĩa cấu trúc cho props cài đặt thông báo
interface NotificationSettingsData {
  emailNotifications: boolean;
  courseUpdates: boolean;
  deadlineReminders: boolean;
  evaluationResults: boolean;
}

interface TraineeSettingsProps {
  notifications: NotificationSettingsData;
  onNotificationChange: (settingName: keyof NotificationSettingsData, value: boolean) => void;
}

export function TraineeSettings({ notifications, onNotificationChange }: TraineeSettingsProps) {
  


  // Trạng thái cài đặt thông báo và các hàm liên quan được chuyển đến component cha

  return (
    <div className="space-y-6">
      <Tabs defaultValue="notifications">
        <TabsList>
          <TabsTrigger value="notifications">Thông báo</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"> 
                <Bell className="mr-2 h-5 w-5 text-primary" /> {/* Đã thêm icon và styling */}
                Cài đặt thông báo
              </CardTitle>
              <CardDescription>
                Tùy chỉnh cách bạn nhận thông báo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6"> {/* Đã thêm pt-6 cho khoảng cách */}
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotificationsSwitch" className="font-medium cursor-pointer">Thông báo qua email</Label>
                  <p className="text-sm text-muted-foreground">
                    Nhận các thông báo quan trọng và cập nhật qua email.
                  </p>
                </div>
                <Switch
                  id="emailNotificationsSwitch"
                  checked={notifications.emailNotifications}
                  onCheckedChange={(checked) =>
                    onNotificationChange('emailNotifications', checked)
                  }
                  aria-label="Thông báo qua email"
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="space-y-0.5">
                  <Label htmlFor="courseUpdatesSwitch" className="font-medium cursor-pointer">Cập nhật khóa học</Label>
                  <p className="text-sm text-muted-foreground">
                    Nhận thông báo về bài giảng mới, tài liệu hoặc thay đổi lịch học.
                  </p>
                </div>
                <Switch
                  id="courseUpdatesSwitch"
                  checked={notifications.courseUpdates}
                  onCheckedChange={(checked) =>
                    onNotificationChange('courseUpdates', checked)
                  }
                  aria-label="Cập nhật khóa học"
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="space-y-0.5">
                  <Label htmlFor="deadlineRemindersSwitch" className="font-medium cursor-pointer">Nhắc nhở hạn chót</Label>
                  <p className="text-sm text-muted-foreground">
                    Nhận nhắc nhở về các bài tập hoặc nhiệm vụ sắp đến hạn.
                  </p>
                </div>
                <Switch
                  id="deadlineRemindersSwitch"
                  checked={notifications.deadlineReminders}
                  onCheckedChange={(checked) =>
                    onNotificationChange('deadlineReminders', checked)
                  }
                  aria-label="Nhắc nhở hạn chót"
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="space-y-0.5">
                  <Label htmlFor="evaluationResultsSwitch" className="font-medium cursor-pointer">Kết quả đánh giá</Label>
                  <p className="text-sm text-muted-foreground">
                    Thông báo khi có kết quả đánh giá hoặc phản hồi mới.
                  </p>
                </div>
                <Switch
                  id="evaluationResultsSwitch"
                  checked={notifications.evaluationResults}
                  onCheckedChange={(checked) =>
                    onNotificationChange('evaluationResults', checked)
                  }
                  aria-label="Kết quả đánh giá"
                />
              </div>
              
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

