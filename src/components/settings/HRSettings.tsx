'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export function HRSettings() {
  const [autoAssign, setAutoAssign] = useState(true);
  const [notifyTrainees, setNotifyTrainees] = useState(true); 
  const [departmentName, setDepartmentName] = useState('Phòng Nhân sự');
  const [hrEmail, setHrEmail] = useState('hr@example.com');
  const [maxStudents, setMaxStudents] = useState('30');

  // Note: For a real app, these settings would be saved to a backend via a "Save" button.

  return (
    <Tabs defaultValue="general" className="space-y-4">
      <TabsList>
        <TabsTrigger value="general">Cấu hình chung</TabsTrigger>
        <TabsTrigger value="trainees">Quản lý học viên</TabsTrigger>
        <TabsTrigger value="courses">Khóa học</TabsTrigger>
        <TabsTrigger value="notifications">Thông báo</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin HR</CardTitle>
            <CardDescription>
              Cấu hình thông tin cơ bản của phòng HR
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="departmentName">Tên phòng ban</Label>
              <Input 
                id="departmentName" 
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                placeholder="Phòng Nhân sự" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hrEmail">Email phòng HR</Label>
              <Input 
                id="hrEmail" 
                type="email" 
                value={hrEmail}
                onChange={(e) => setHrEmail(e.target.value)}
                placeholder="hr@example.com" 
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="trainees" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Cài đặt học viên</CardTitle>
            <CardDescription>
              Quản lý cấu hình cho học viên
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Tự động phân công khóa học</Label>
                <p className="text-sm text-muted-foreground">
                  Tự động phân công khóa học cho học viên mới
                </p>
              </div>
              <Switch
                checked={autoAssign}
                onCheckedChange={setAutoAssign}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="courses" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Cài đặt khóa học</CardTitle>
            <CardDescription>
              Quản lý cấu hình khóa học
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="maxStudents">Số học viên tối đa/khóa</Label>
              <Input 
                id="maxStudents" 
                type="number" 
                value={maxStudents}
                onChange={(e) => setMaxStudents(e.target.value)}
                placeholder="30" 
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
              Quản lý thông báo cho học viên
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Thông báo cho học viên</Label>
                <p className="text-sm text-muted-foreground">
                  Gửi thông báo khi có cập nhật khóa học
                </p>
              </div>
              <Switch
                checked={notifyTrainees}
                onCheckedChange={setNotifyTrainees}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
