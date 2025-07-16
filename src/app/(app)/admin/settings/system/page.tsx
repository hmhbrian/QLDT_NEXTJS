"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

export default function SystemSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    siteName: "QLDT System",
    maintenanceMode: false,
    debugMode: false,
    maxUploadSize: "5",
    allowedFileTypes: ".pdf,.doc,.docx,.xls,.xlsx",
    backupEnabled: true,
    backupFrequency: "daily",
    logRetentionDays: "30",
  });

  const handleSave = () => {
    // TODO: Triển khai lưu cài đặt
    toast({
      title: "Cài đặt đã được lưu",
      description: "Các thay đổi của bạn đã được áp dụng thành công.",
      variant: "success",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Cài đặt hệ thống</h1>
        <p className="text-muted-foreground">
          Quản lý các cài đặt cơ bản của hệ thống
        </p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">Chung</TabsTrigger>
          <TabsTrigger value="security">Bảo mật</TabsTrigger>
          <TabsTrigger value="backup">Sao lưu</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt chung</CardTitle>
              <CardDescription>
                Cấu hình các thông số cơ bản của hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Tên hệ thống</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) =>
                    setSettings({ ...settings, siteName: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, maintenanceMode: checked })
                  }
                />
                <Label>Chế độ bảo trì</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Bảo mật</CardTitle>
              <CardDescription>Cấu hình các thông số bảo mật</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.debugMode}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, debugMode: checked })
                  }
                />
                <Label>Chế độ debug</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="allowedFileTypes">
                  Định dạng file cho phép
                </Label>
                <Input
                  id="allowedFileTypes"
                  value={settings.allowedFileTypes}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      allowedFileTypes: e.target.value,
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle>Sao lưu dữ liệu</CardTitle>
              <CardDescription>Cấu hình sao lưu tự động</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.backupEnabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, backupEnabled: checked })
                  }
                />
                <Label>Bật sao lưu tự động</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="backupFrequency">Tần suất sao lưu</Label>
                <Input
                  id="backupFrequency"
                  value={settings.backupFrequency}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      backupFrequency: e.target.value,
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex flex-col justify-center">
        <Button onClick={handleSave}>Lưu thay đổi</Button>
      </div>
    </div>
  );
}
