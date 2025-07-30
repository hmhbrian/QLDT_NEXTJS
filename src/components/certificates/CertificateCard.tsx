import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  FileText,
  Calendar,
  ExternalLink,
  Award,
  Eye,
  CheckCircle,
} from "lucide-react";
import { Certificate } from "@/lib/services/modern/certificates.service";
import { useDownloadCertificate } from "@/hooks/use-certificates";
import { useToast } from "@/components/ui/use-toast";
import { CertificatePreview } from "./CertificatePreview"; // Import CertificatePreview

interface CertificateCardProps {
  certificate: Certificate;
  courseName?: string;
}

export function CertificateCard({
  certificate,
  courseName,
}: CertificateCardProps) {
  const { downloadCertificate } = useDownloadCertificate();
  const { toast } = useToast();
  const [showPreview, setShowPreview] = useState(false); // Add this state

  const handleDownload = async () => {
    try {
      await downloadCertificate(certificate.certificateUrl);
      toast({
        title: "Thành công",
        description: "Chứng chỉ đang được tải xuống...",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải xuống chứng chỉ. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <Card className="border border-border/50 hover:border-border transition-colors duration-200">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="flex-shrink-0 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <Award className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-foreground leading-tight mb-2">
                  {courseName || "Chứng chỉ hoàn thành"}
                </h3>
                <div className="flex items-center gap-2 mb-3">
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Đã hoàn thành
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <FileText className="h-3 w-3 mr-1" />
                    PDF
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Ngày cấp: {formatDate(certificate.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(true)}
              className="flex-1 sm:flex-none"
            >
              <Eye className="h-4 w-4 mr-2" />
              Xem trước
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={handleDownload}
              className="flex-1 sm:flex-none"
            >
              <Download className="h-4 w-4 mr-2" />
              Tải xuống
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(certificate.certificateUrl, "_blank")}
              className="sm:w-auto"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="sr-only">Mở trong tab mới</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <CertificatePreview
        certificate={certificate}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        courseName={courseName}
      />
    </>
  );
}
