"use client";

import React, { useState, useEffect } from "react"; // Đã thêm useEffect và useState
import { TraineeSettings } from "@/components/settings/TraineeSettings";
import { useAuth } from "@/hooks/useAuth";
import { Settings, Save } from "lucide-react"; // Đã thêm icon Save
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

// Định nghĩa cấu trúc cho cài đặt thông báo
interface NotificationSettings {
  emailNotifications: boolean;
  courseUpdates: boolean;
  deadlineReminders: boolean;
  evaluationResults: boolean;
}

export default function TraineeSettingsPage() {
  const { user } = useAuth();

  // State for notification settings, moved from TraineeSettings component
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    courseUpdates: true,
    deadlineReminders: true,
    evaluationResults: true,
  });

  // Effect để tải cài đặt thông báo từ localStorage
  useEffect(() => {
    if (user) {
      const savedNotifSettings = localStorage.getItem(
        `notifications_${user.id}`
      );
      if (savedNotifSettings) {
        try {
          setNotifications(JSON.parse(savedNotifSettings));
        } catch (e) {
          console.error(
            "Failed to parse notification settings from localStorage",
            e
          );
          // Khởi tạo với giá trị mặc định nếu phân tích cú pháp thất bại
          localStorage.setItem(
            `notifications_${user.id}`,
            JSON.stringify(notifications)
          );
        }
      } else {
        // Nếu không tìm thấy cài đặt nào, lưu các cài đặt mặc định
        localStorage.setItem(
          `notifications_${user.id}`,
          JSON.stringify(notifications)
        );
      }
    }
  }, [user, notifications]); // Phụ thuộc vào người dùng để tải/lưu cài đặt cho mỗi người dùng

  const handleNotificationChange = (
    settingName: keyof NotificationSettings,
    value: boolean
  ) => {
    setNotifications((prevSettings) => ({
      ...prevSettings,
      [settingName]: value,
    }));
  };

  const handleSaveSettings = async () => {
    try {
      if (user) {
        localStorage.setItem(
          `notifications_${user.id}`,
          JSON.stringify(notifications)
        );
      }
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

  if (!user) return null;

  if (user.role !== "HOCVIEN") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Settings className="h-16 w-16 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-semibold">Không có quyền truy cập</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Bạn không có quyền truy cập vào trang cài đặt học viên.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-headline font-semibold">
          Cài đặt cá nhân
        </h1>
        <Button onClick={handleSaveSettings}>
          <Save className="mr-2 h-5 w-5" /> {/* Đã thay đổi icon thành Save */}
          Lưu thay đổi
        </Button>
      </div>
      <TraineeSettings
        notifications={notifications} // truyền notifications
        onNotificationChange={handleNotificationChange} // truyền onNotificationChange
      />
    </div>
  );
}
