'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Save, ChevronDown, AlertCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function SystemSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-headline font-semibold">Cài đặt Hệ thống</h1>
        <div className="flex gap-2 w-full md:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto">
                <Settings className="mr-2 h-5 w-5" />
                Tùy chọn cài đặt
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Cài đặt hệ thống</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Cấu hình chung
              </DropdownMenuItem>
              <DropdownMenuItem disabled className="text-muted-foreground">
                <span>Quản lý người dùng</span>
                <AlertCircle className="ml-auto h-4 w-4" />
              </DropdownMenuItem>
              <DropdownMenuItem disabled className="text-muted-foreground">
                <span>Bảo mật</span>
                <AlertCircle className="ml-auto h-4 w-4" />
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled className="text-muted-foreground">
                <span>Sao lưu & Phục hồi</span>
                <AlertCircle className="ml-auto h-4 w-4" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button disabled className="w-full md:w-auto">
            <Save className="mr-2 h-5 w-5" /> Lưu thay đổi 
          </Button>
        </div>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Cấu hình Thông số Hệ thống</CardTitle>
          <CardDescription>
            Tính năng này hiện đang được phát triển. Vui lòng quay lại sau.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-md text-center p-4">
          <Settings className="h-16 w-16 text-muted-foreground" />
          <p className="mt-4 text-lg font-medium text-muted-foreground">
            Bảng Cấu hình Hệ thống Sắp ra mắt
          </p>
          <p className="text-sm text-muted-foreground">
            Quản lý cài đặt toàn ứng dụng, tích hợp và nhiều hơn nữa.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
