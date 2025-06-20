"use client";

import { useState, useEffect, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Cấu hình PDF.js worker - đảm bảo chỉ chạy trong trình duyệt
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
}

interface PdfLessonViewerProps {
  pdfUrl: string;
  onLessonComplete?: () => void; // Callback khi xem trang cuối cùng
}

export function PdfLessonViewer({
  pdfUrl,
  onLessonComplete,
}: PdfLessonViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const { toast } = useToast();

  const onDocumentLoadSuccess = useCallback(
    ({ numPages: nextNumPages }: { numPages: number }) => {
      setNumPages(nextNumPages);
      setCurrentPage(1); // Đặt lại về trang đầu tiên khi có tài liệu mới
      setIsLoading(false);
      setPdfError(null);
    },
    []
  );

  const onDocumentLoadError = useCallback(
    (error: Error) => {
      console.error("Lỗi khi tải PDF cho bài học:", error);
      setPdfError(
        `Không thể tải tài liệu PDF. Lỗi: ${error.message}. Vui lòng thử lại.`
      );
      setNumPages(null);
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Lỗi tải PDF",
        description: `Không thể tải tài liệu PDF. Lỗi: ${error.message}`,
      });
    },
    [toast]
  );

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleNextPage = () => {
    if (numPages && currentPage < numPages) {
      setCurrentPage((prev) => prev + 1);
    } else if (numPages && currentPage === numPages) {
      // Đã đến trang cuối cùng
      if (onLessonComplete) {
        onLessonComplete();
      }
      // Tùy chọn, bạn có thể vô hiệu hóa nút "Tiếp theo" hoặc hiển thị thông báo hoàn thành ở đây.
      // Hiện tại, nó chỉ gọi callback.
    }
  };

  useEffect(() => {
    setIsLoading(true);
    setNumPages(null);
    setCurrentPage(1);
    setPdfError(null);
  }, [pdfUrl]);

  if (isLoading && !pdfError) {
    return (
      <div className="flex flex-col items-center justify-center p-6 min-h-[300px] border rounded-md bg-muted/30">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">
          Đang tải nội dung PDF...
        </p>
      </div>
    );
  }

  if (pdfError) {
    return (
      <div className="p-6 text-center text-destructive space-y-3 border border-destructive/50 bg-destructive/10 rounded-md min-h-[300px] flex flex-col items-center justify-center">
        <AlertTriangle className="mx-auto h-10 w-10" />
        <p className="font-semibold">Lỗi tải PDF</p>
        <p className="text-sm">{pdfError}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setPdfError(null);
            setIsLoading(true);
            // Cố gắng kích hoạt lại việc tải, mặc dù react-pdf chủ yếu xử lý logic thử lại của riêng nó.
            // Điều này có thể liên quan đến việc đặt lại key trên Document component nếu cần thử lại trực tiếp.
            // Hiện tại, chỉ xóa lỗi và đặt trạng thái đang tải.
          }}
        >
          <RefreshCw className="mr-2 h-4 w-4" /> Thử lại
        </Button>
      </div>
    );
  }

  if (!numPages) {
    return (
      <div className="flex flex-col items-center justify-center p-6 min-h-[300px] border rounded-md bg-muted/30">
        <BookOpen className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">
          Không có nội dung PDF để hiển thị.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 border rounded-lg overflow-hidden shadow-sm">
      <div className="p-2 bg-background border-b sticky top-0 z-10">
        {" "}
        {/* Đã thêm header cố định cho các nút điều khiển */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Trang trước
          </Button>
          <span className="text-sm font-medium text-muted-foreground">
            Trang {currentPage} / {numPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage >= numPages}
          >
            {currentPage === numPages ? "Hoàn thành" : "Trang sau"}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
      <div className="min-h-[400px] md:min-h-[500px] lg:min-h-[600px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 p-1">
        {/* Component Document của react-pdf */}
        <Document
          file={pdfUrl} // URL của file PDF
          onLoadSuccess={onDocumentLoadSuccess} // Callback khi tải thành công
          onLoadError={onDocumentLoadError} // Callback khi tải lỗi
          loading={<Skeleton className="w-full h-[500px]" />} // Hiển thị skeleton khi đang tải
          options={{
            StandardFontDataFactory: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/standard_fonts/`,
          }} // Tùy chọn cho react-pdf
        >
          {/* Component Page của react-pdf */}
          <Page
            pageNumber={currentPage} // Số trang hiện tại để hiển thị
            renderTextLayer={true} // Cho phép chọn văn bản
            renderAnnotationLayer={false}
            className="flex justify-center items-center"
            width={Math.min(800, window.innerWidth - 40)} // Chiều rộng đáp ứng
            loading={<Skeleton className="w-full h-[500px]" />} // Hiển thị skeleton khi trang đang tải
          />
        </Document>
      </div>
    </div>
  );
}

// Icon trợ giúp khi không có nội dung, không được sử dụng ở đây nhưng hữu ích nếu cần
function BookOpen({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
