'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export function AdminSettings() {
  // Use local state, load initial value from a settings service or local storage in a real app
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [siteName, setSiteName] = useState('QLDT - Quản lý đào tạo');
  const [adminEmail, setAdminEmail] = useState('admin@example.com');
  const [autoApprove, setAutoApprove] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  // Note: For a real app, these settings would be saved to a backend via a "Save" button.

  return (
    <Tabs defaultValue="general" className="space-y-4">
      <TabsList>
        <TabsTrigger value="general">Cấu hình chung</TabsTrigger>
        <TabsTrigger value="users">Quản lý người dùng</TabsTrigger>
        <TabsTrigger value="security">Bảo mật</TabsTrigger>
        <TabsTrigger value="system">Hệ thống</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin hệ thống</CardTitle>
            <CardDescription>
              Cấu hình thông tin cơ bản của hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Tên trang web</Label>
              <Input 
                id="siteName" 
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="QLDT - Quản lý đào tạo" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminEmail">Email quản trị</Label>
              <Input 
                id="adminEmail" 
                type="email" 
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@example.com" 
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="users" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Cài đặt người dùng</CardTitle>
            <CardDescription>
              Quản lý cấu hình người dùng hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Tự động phê duyệt người dùng mới</Label>
                <p className="text-sm text-muted-foreground">
                  Tự động chấp nhận người dùng đăng ký mới
                </p>
              </div>
              <Switch
                checked={autoApprove}
                onCheckedChange={setAutoApprove}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="security" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Cài đặt bảo mật</CardTitle>
            <CardDescription>
              Quản lý các cài đặt bảo mật hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Xác thực hai yếu tố</Label>
                <p className="text-sm text-muted-foreground">
                  Yêu cầu xác thực hai yếu tố cho tất cả người dùng
                </p>
              </div>
              <Switch
                checked={twoFactorAuth}
                onCheckedChange={setTwoFactorAuth}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="system" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Cài đặt hệ thống</CardTitle>
            <CardDescription>
              Quản lý cài đặt hệ thống nâng cao
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Chế độ bảo trì</Label>
                <p className="text-sm text-muted-foreground">
                  Kích hoạt chế độ bảo trì hệ thống
                </p>
              </div>
              <Switch
                checked={maintenanceMode}
                onCheckedChange={setMaintenanceMode}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
