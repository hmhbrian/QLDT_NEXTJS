import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Award,
  Calendar,
  TrendingUp,
  GraduationCap,
  Shield,
  Star,
} from "lucide-react";
import { Certificate } from "@/lib/services/modern/certificates.service";
import { CertificateCard } from "./CertificateCard";

interface CertificatesListProps {
  certificates: Certificate[];
  isLoading?: boolean;
}

export function CertificatesList({
  certificates,
  isLoading,
}: CertificatesListProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Award className="h-5 w-5" />
              <span>Đang tải danh sách chứng chỉ...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="text-center py-16">
          <div className="mx-auto w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mb-6">
            <GraduationCap className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-3 text-foreground">
            Chưa có chứng chỉ
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
            Hoàn thành các khóa học để nhận chứng chỉ xác nhận năng lực chuyên
            môn của bạn
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Statistics */}
      <Card className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border-blue-200/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-semibold text-foreground">
                  Chứng chỉ đã đạt được
                </h2>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-700 hover:bg-blue-200"
                >
                  {certificates.length}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Thành tích học tập và phát triển chuyên môn
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certificates List */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-lg font-medium text-foreground">
            Danh sách chứng chỉ
          </h3>
          <Separator className="flex-1" />
        </div>
        <div className="grid gap-4">
          {certificates.map((certificate, index) => (
            <CertificateCard
              key={certificate.id || index}
              certificate={certificate}
              courseName={`Chứng chỉ hoàn thành khóa học #${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      {/* <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Tổng quan thành tích
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-2 mx-auto">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-foreground">
                {certificates.length}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                Chứng chỉ
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-2 mx-auto">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-foreground">
                {new Date().getFullYear()}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                Năm hiện tại
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-2 mx-auto">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-foreground">100%</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                Tỷ lệ hoàn thành
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-2 mx-auto">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-foreground">
                {Math.min(Math.ceil((certificates.length / 12) * 100), 100)}%
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                Mục tiêu năm
              </div>
            </div>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}
