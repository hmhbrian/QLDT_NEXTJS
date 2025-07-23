"use client";

import { AdminSettings } from "@/components/settings/AdminSettings";
import { HRSettings } from "@/components/settings/HRSettings";
import { TraineeSettings } from "@/components/settings/TraineeSettings";
import { useAuth } from "@/hooks/useAuth";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    courseUpdates: true,
    deadlineReminders: true,
    evaluationResults: true,
  });

  if (!user) return null;

  const handleSaveSettings = async () => {
    try {
      // TODO: Triển khai lưu cài đặt thực tế
      toast({
        title: "Cài đặt đã được lưu",
        description: "Các thay đổi của bạn đã được cập nhật thành công.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể lưu cài đặt. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };

  const handleNotificationChange = (settingName, value) => {
    setNotifications((prev) => ({
      ...prev,
      [settingName]: value,
    }));
  };

  const renderSettings = () => {
    switch (user.role) {
      case "ADMIN":
        return <AdminSettings />;
      case "HR":
        return <HRSettings />;
      case "HOCVIEN":
        return (
          <TraineeSettings
            notifications={notifications}
            onNotificationChange={handleNotificationChange}
          />
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <Settings className="h-16 w-16 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">
              Không có quyền truy cập
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Bạn không có quyền truy cập vào trang cài đặt.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-headline font-semibold">
          Cài đặt hệ thống
        </h1>
        <Button onClick={handleSaveSettings}>
          <Settings className="mr-2 h-5 w-5" />
          Lưu thay đổi
        </Button>
      </div>
      {renderSettings()}
    </div>
  );
}
