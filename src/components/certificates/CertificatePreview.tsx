import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, ExternalLink, X, FileText, Calendar } from "lucide-react";
import { Certificate } from "@/lib/services/modern/certificates.service";
import { useDownloadCertificate } from "@/hooks/use-certificates";
import { useToast } from "@/components/ui/use-toast";

interface CertificatePreviewProps {
  certificate: Certificate | null;
  isOpen: boolean;
  onClose: () => void;
  courseName?: string;
}

export function CertificatePreview({
  certificate,
  isOpen,
  onClose,
  courseName,
}: CertificatePreviewProps) {
  const { downloadCertificate } = useDownloadCertificate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    if (!certificate) return;

    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenInNewTab = () => {
    if (certificate) {
      window.open(certificate.certificateUrl, "_blank");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!certificate) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold mb-2">
                {courseName || "Xem trước chứng chỉ"}
              </DialogTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Ngày cấp: {formatDate(certificate.createdAt)}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  <FileText className="h-3 w-3 mr-1" />
                  PDF
                </Badge>
              </div>
            </div>
            {/* Removed duplicate close button, relying on Dialog's default or ensuring only one exists */}
          </div>
        </DialogHeader>

        <div className="flex-1 p-6">
          <div className="bg-muted/20 rounded-lg border border-muted-foreground/10 overflow-hidden">
            {" "}
            {/* Adjusted border and removed dashed */}
            <iframe
              src={`${certificate.certificateUrl}#toolbar=0&navpanes=0&scrollbar=0`}
              className="w-full h-[500px] border-0" /* Removed rounded here as parent div handles it */
              title={`Chứng chỉ - ${courseName || "Certificate"}`}
            />
          </div>

          <Separator className="my-6" />

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button
              variant="default"
              onClick={handleDownload}
              disabled={isLoading}
              className="sm:min-w-[140px]"
            >
              <Download className="h-4 w-4 mr-2" />
              {isLoading ? "Đang tải..." : "Tải xuống"}
            </Button>

            <Button
              variant="outline"
              onClick={handleOpenInNewTab}
              className="sm:min-w-[140px]"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Mở tab mới
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
