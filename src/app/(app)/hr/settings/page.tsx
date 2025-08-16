'use client';

import { HRSettings } from "@/components/settings/HRSettings";
import { useAuth } from "@/hooks/useAuth";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export default function HRSettingsPage() {
  const { user } = useAuth();

  if (!user) return null;

  const handleSaveSettings = async () => {
    try {
      // TODO: Implement actual settings save
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

  if (user.role !== 'HR') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Settings className="h-16 w-16 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-semibold">Không có quyền truy cập</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Bạn không có quyền truy cập vào trang cài đặt HR.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-headline font-semibold">Cài đặt HR</h1>
        <Button onClick={handleSaveSettings} className="w-full sm:w-auto h-9 sm:h-10">
          <Settings className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          <span className="text-sm">Lưu thay đổi</span>
        </Button>
      </div>
      <HRSettings />
    </div>
  );
}
