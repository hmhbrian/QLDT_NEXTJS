'use client';

import { AdminSettings } from "@/components/settings/AdminSettings";
import { HRSettings } from "@/components/settings/HRSettings";
import { TraineeSettings } from "@/components/settings/TraineeSettings";
import { useAuth } from "@/hooks/useAuth";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export default function SettingsPage() {
  const { user } = useAuth();

  if (!user) return null;

  const handleSaveSettings = async () => {
    try {
      // TODO: Implement actual settings save
      toast({
        title: "Cài đặt đã được lưu",
        description: "Các thay đổi của bạn đã được cập nhật thành công.",
        className: "bg-green-500 text-white border-none",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể lưu cài đặt. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };

  const renderSettings = () => {
    switch (user.role) {
      case 'Admin':
        return <AdminSettings />;
      case 'HR':
        return <HRSettings />;
      case 'Trainee':
        return <TraineeSettings />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <Settings className="h-16 w-16 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">Không có quyền truy cập</h2>
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
        <h1 className="text-2xl md:text-3xl font-headline font-semibold">Cài đặt hệ thống</h1>
        <Button onClick={handleSaveSettings}>
          <Settings className="mr-2 h-5 w-5" />
          Lưu thay đổi
        </Button>
      </div>
      {renderSettings()}
    </div>
  );
}
