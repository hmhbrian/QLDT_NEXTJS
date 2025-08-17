
"use client";

import { useState, useEffect, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
  Minimize2,
  AlertTriangle,
  RefreshCw,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import type { Course, Lesson } from "@/lib/types/course.types";

// Cấu hình PDF.js worker
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
}

interface CourseViewerProps {
  course: Course;
}

function CourseViewer({ course }: CourseViewerProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);

  const lessons = course.lessons || [];
  const currentSlide: Lesson | undefined = lessons[currentSlideIndex];

  const onDocumentLoadSuccess = useCallback(
    ({ numPages: nextNumPages }: { numPages: number }) => {
      setNumPages(nextNumPages);
      setPageNumber(1); 
      setPdfError(null);
      setIsLoadingPdf(false);
    },
    []
  );

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error("Lỗi khi tải PDF:", error);
    setPdfError(
      `Không thể tải tài liệu PDF. Lỗi: ${error.message}. Vui lòng thử lại hoặc kiểm tra đường dẫn.`
    );
    setNumPages(null);
    setIsLoadingPdf(false);
  }, []);

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : prev));
    setPageNumber(1);
    setPdfError(null);
    if (lessons[currentSlideIndex - 1]?.type === "pdf_url") setIsLoadingPdf(true);
  };

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) =>
      prev < lessons.length - 1 ? prev + 1 : prev
    );
    setPageNumber(1);
    setPdfError(null);
    if (lessons[currentSlideIndex + 1]?.type === "pdf_url") setIsLoadingPdf(true);
  };

  const handlePrevPage = () => {
    setPageNumber((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleNextPage = () => {
    setPageNumber((prev) => (prev < (numPages ?? 0) ? prev + 1 : prev));
  };

  const toggleFullscreen = useCallback(() => {
    const viewerElement = document.getElementById("course-viewer-content"); 
    if (!viewerElement) return;

    if (!document.fullscreenElement) {
      viewerElement.requestFullscreen().catch((err) => {
        console.error(
          `Lỗi khi cố gắng bật chế độ toàn màn hình: ${err.message} (${err.name})`
        ); 
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (currentSlide?.type === "pdf_url") {
      setIsLoadingPdf(true);
    }
  }, [currentSlide]);

  if (!lessons.length) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-6 text-center text-muted-foreground">
          <ImageIcon className="mx-auto h-12 w-12 mb-4 text-gray-400" />
          Không có nội dung bài giảng để hiển thị.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b">
        <CardTitle className="text-lg font-semibold text-foreground">
          {currentSlide?.title || `Bài giảng ${course.title}`}
        </CardTitle>
        <div className="flex items-center gap-2 self-end sm:self-center">
          {currentSlide?.fileUrl && (
            <Button
              variant="outline"
              size="icon"
              title="Tải xuống slide hiện tại"
              onClick={() => window.open(currentSlide.fileUrl!, "_blank")}
              className="h-9 w-9"
            >
              <Download className="h-4 w-4" />
              <span className="sr-only">Tải xuống</span>
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            title={isFullscreen ? "Thoát toàn màn hình" : "Xem toàn màn hình"}
            onClick={toggleFullscreen}
            className="h-9 w-9"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
            <span className="sr-only">
              {isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
            </span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0" id="course-viewer-content">
        <div
          className={`relative ${
            isFullscreen
              ? "h-screen bg-background"
              : "min-h-[400px] md:min-h-[500px] lg:min-h-[800px]"
          } w-full flex flex-col items-center justify-center bg-muted/30`}
        >
          {currentSlide?.type === "pdf_url" ? (
            <>
              {isLoadingPdf && !pdfError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Đang tải PDF...</p>
                </div>
              )}
              {pdfError && !isLoadingPdf && (
                <div className="p-6 text-center text-destructive space-y-3">
                  <AlertTriangle className="mx-auto h-12 w-12" />
                  <p className="font-semibold">Lỗi tải PDF</p>
                  <p className="text-sm">{pdfError}</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPdfError(null);
                      setIsLoadingPdf(true);
                      setPageNumber(1);
                    }}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" /> Thử lại
                  </Button>
                </div>
              )}
              {!pdfError && (
                <Document
                  file={currentSlide.fileUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading={
                    <Skeleton
                      className={`w-full ${
                        isFullscreen ? "h-screen" : "h-[800px]"
                      }`}
                    />
                  } 
                  className={`flex-grow w-full overflow-hidden ${
                    isLoadingPdf ? "opacity-0" : "opacity-100"
                  }`}
                  options={{
                    standardFontDataUrl: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/standard_fonts/`,
                  }} 
                >
                  
                  <Page
                    pageNumber={pageNumber} 
                    width={isFullscreen ? window.innerWidth - 40 : undefined}
                    height={
                      isFullscreen
                        ? window.innerHeight -
                          (lessons.length > 1 || (numPages && numPages > 1) ? 120 : 60)
                        : undefined
                    }
                    renderTextLayer={true} 
                    renderAnnotationLayer={true}
                    className="flex justify-center items-center"
                    loading={
                      <Skeleton
                        className={`w-full ${
                          isFullscreen ? "h-screen" : "h-[800px]"
                        }`}
                      />
                    }
                  />
                </Document>
              )}
            </>
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              <ImageIcon className="mx-auto h-12 w-12 mb-4 text-gray-400" />
              Định dạng slide không được hỗ trợ hoặc không có nội dung.
            </div>
          )}
        </div>
        {(lessons.length > 1 ||
          (currentSlide?.type === "pdf_url" && numPages && numPages > 1)) && (
          <div className="flex items-center justify-between p-3 border-t bg-background">
            <Button
              variant="outline"
              onClick={
                currentSlide?.type === "pdf_url" ? handlePrevPage : handlePrevSlide
              }
              disabled={
                (currentSlide?.type === "pdf_url"
                  ? pageNumber <= 1
                  : currentSlideIndex === 0) || isLoadingPdf
              }
              className="h-9"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="ml-1.5">
                {currentSlide?.type === "pdf_url" ? "Trang trước" : "Slide trước"}
              </span>
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentSlide?.type === "pdf_url"
                ? `Trang ${pageNumber} / ${numPages || "..."}`
                : `Slide ${currentSlideIndex + 1} / ${lessons.length}`}
            </span>
            <Button
              variant="outline"
              onClick={
                currentSlide?.type === "pdf_url" ? handleNextPage : handleNextSlide
              }
              disabled={
                (currentSlide?.type === "pdf_url"
                  ? pageNumber >= (numPages ?? 0)
                  : currentSlideIndex === lessons.length - 1) || isLoadingPdf
              }
              className="h-9"
            >
              <span className="mr-1.5">
                {currentSlide?.type === "pdf_url" ? "Trang sau" : "Slide sau"}
              </span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CourseViewer;
