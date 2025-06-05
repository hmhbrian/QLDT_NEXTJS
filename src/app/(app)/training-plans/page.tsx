'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, PlusCircle } from "lucide-react";

export default function TrainingPlansPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-headline font-semibold">Kế hoạch Đào tạo</h1>
        <Button disabled className="w-full md:w-auto">
          <PlusCircle className="mr-2 h-5 w-5" /> Tạo Kế hoạch Mới
        </Button>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Quản lý Kế hoạch Đào tạo</CardTitle>
          <CardDescription>
            Tính năng này hiện đang được phát triển. Vui lòng quay lại sau.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-md text-center p-4">
          <ClipboardList className="h-16 w-16 text-muted-foreground" />
          <p className="mt-4 text-lg font-medium text-muted-foreground">
            Quản lý Kế hoạch Đào tạo Sắp ra mắt
          </p>
          <p className="text-sm text-muted-foreground">
            Tạo và quản lý các chương trình đào tạo có cấu trúc cho cá nhân hoặc nhóm.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
