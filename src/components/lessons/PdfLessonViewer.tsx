
"use client";

import React, { useState, useCallback, useRef, useEffect, memo } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

import { useInView } from "react-intersection-observer";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  Loader2,
  AlertTriangle,
  PanelLeft,
  Printer,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfLessonViewerProps {
  pdfUrl: string;
  initialPage?: number;
  onVisiblePageChange: (page: number) => void;
}

const MemoizedPage = memo(Page);

function PageWithObserver({
  pageNumber,
  scale,
  onInView,
  setRef,
}: {
  pageNumber: number;
  scale: number;
  onInView: () => void;
  setRef: (el: HTMLDivElement | null) => void;
}) {
  const { ref } = useInView({
    threshold: 0.2,
    onChange: (inView) => {
      if (inView) {
        onInView();
      }
    },
  });

  const combinedRef = useCallback(
    (node: HTMLDivElement | null) => {
      setRef(node);
      ref(node);
    },
    [setRef, ref]
  );

  return (
    <div ref={combinedRef} className="mb-4 shadow-lg flex justify-center">
      <MemoizedPage
        pageNumber={pageNumber}
        scale={scale}
        renderAnnotationLayer={false}
        renderTextLayer={false}
        loading={
          <Skeleton
            className="w-full aspect-[891/1260] max-w-none"
            style={{
              width: `${891 * scale}px`,
              height: `${1260 * scale}px`,
              minWidth: `${891 * scale}px`,
              minHeight: `${1260 * scale}px`,
            }}
          />
        }
      />
    </div>
  );
}

export function PdfLessonViewer({
  pdfUrl,
  initialPage = 1,
  onVisiblePageChange,
}: PdfLessonViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [scale, setScale] = useState(1.5);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isThumbnailsOpen, setIsThumbnailsOpen] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Thêm state để track initial load

  const mainContainerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);


  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPdfError(null);
    pageRefs.current = Array(numPages).fill(null);

    // Defer scrolling to allow DOM to update và đợi 1 chút để tải trang trước
    setTimeout(() => {
      const pageRef = pageRefs.current[initialPage - 1];
      if (pageRef) {
        pageRef.scrollIntoView({ behavior: "auto", block: "start" });
        // Đảm bảo currentPage được set đúng NGAY khi scroll
        setCurrentPage(initialPage);
      } else {
        setCurrentPage(1); // Fallback to page 1
      }

      // Đặt thêm timeout để đảm bảo đã scroll xong rồi mới cho phép lưu tiến trình
      setTimeout(() => {
        setIsInitialLoad(false); // Bây giờ mới cho phép lưu tiến trình
      }, 500); // Giảm thời gian xuống 500ms
    }, 300);
  };

  const onDocumentLoadError = (error: Error) => {
    setPdfError(
      `Không thể tải tài liệu. Lỗi: ${
        error.message || "Unknown error"
      }. Vui lòng kiểm tra lại đường dẫn hoặc thử tải lại trang.`
    );
  };

  const goToPage = (pageNumber: number) => {
    const page = Math.max(1, Math.min(pageNumber, numPages));
    const pageRef = pageRefs.current[page - 1];
    if (pageRef) {
      pageRef.scrollIntoView({ behavior: "smooth", block: "start" });
      setCurrentPage(page);
      // Khi user chủ động chuyển trang thì luôn lưu tiến trình
      onVisiblePageChange(page);
    }
  };

  const handlePageInView = useCallback(
    (page: number) => {
      // Chỉ update currentPage khi KHÔNG phải initial load
      // Hoặc khi user đã scroll xong trang initial
      if (!isInitialLoad) {
        setCurrentPage(page);
        onVisiblePageChange(page);
      }
    },
    [onVisiblePageChange, isInitialLoad, currentPage]
  );

  useEffect(() => {
    setCurrentPage(initialPage);
    setIsInitialLoad(true); // Reset initial load khi initialPage thay đổi
  }, [initialPage]);

  // Reset state when the PDF URL changes
  useEffect(() => {
    setNumPages(0);
    setCurrentPage(initialPage);
    setScale(1.5);
    setPdfError(null);
    setIsInitialLoad(true); // Reset initial load state
    pageRefs.current = [];
  }, [pdfUrl, initialPage]);

  return (
    <div className="w-full h-[85vh] flex flex-col bg-background dark:bg-zinc-900 rounded-lg shadow-lg border">
      <div className="flex-shrink-0 h-auto bg-card border-b flex flex-wrap items-center justify-between gap-2 px-2 sm:px-4 py-2 sticky top-0 z-20">
        <div className="flex items-center gap-2 min-w-[120px]">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsThumbnailsOpen((prev) => !prev)}
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-center gap-1.5 order-3 w-full justify-center sm:order-none sm:w-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Input
            value={currentPage > 0 ? currentPage : ""}
            onChange={(e) => {
              const newPage = parseInt(e.target.value, 10);
              if (!isNaN(newPage) && newPage >= 1 && newPage <= numPages) {
                goToPage(newPage);
              } else if (e.target.value === "") {
                goToPage(1);
              }
            }}
            className="w-16 sm:w-20 h-8 text-center"
          />
          <span className="text-sm text-muted-foreground">
            / {numPages || "..."}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= numPages}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-center gap-2 order-2">
          <div className="h-6 w-px bg-border mx-2 hidden sm:block"></div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setScale((s) => Math.max(0.5, s - 0.2))}
          >
            <ZoomOut className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setScale((s) => Math.min(3, s + 0.2))}
          >
            <ZoomIn className="h-5 w-5" />
          </Button>
          <div className="h-6 w-px bg-border mx-2 hidden sm:block"></div>
          <a href={pdfUrl} download target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon">
              <Download className="h-5 w-5" />
            </Button>
          </a>
          <Button variant="ghost" size="icon" onClick={() => window.print()}>
            <Printer className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex-grow flex overflow-hidden">
        <Document
          key={pdfUrl}
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="flex flex-col items-center justify-center w-full h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-2 text-muted-foreground">Đang tải tài liệu...</p>
            </div>
          }
          error={
            <div className="flex flex-col items-center justify-center w-full h-full text-destructive p-4">
              <AlertTriangle className="h-8 w-8 mb-2" />
              <p className="font-semibold">Lỗi tải PDF</p>
              <p className="text-sm text-center">{pdfError}</p>
            </div>
          }
          className="flex-grow flex overflow-hidden"
        >
          {isThumbnailsOpen && numPages > 0 && (
            <div className="hidden md:block w-48 bg-muted/40 border-r overflow-y-auto p-2 space-y-2">
              {Array.from(new Array(numPages), (_, index) => (
                <div
                  key={`thumb-${index + 1}`}
                  onClick={() => goToPage(index + 1)}
                  className={cn(
                    "cursor-pointer border-2 p-1 rounded-sm transition-all",
                    currentPage === index + 1
                      ? "border-primary"
                      : "border-transparent hover:border-muted-foreground/50"
                  )}
                >
                  <MemoizedPage
                    pageNumber={index + 1}
                    width={150}
                    renderAnnotationLayer={false}
                    renderTextLayer={false}
                    loading={
                      <Skeleton
                        className="w-full aspect-[891/1260]"
                        style={{ height: "212px" }}
                      />
                    }
                  />
                  <p className="text-center text-xs mt-1">{index + 1}</p>
                </div>
              ))}
            </div>
          )}

          <div
            ref={mainContainerRef}
            className="flex-grow overflow-auto p-4 bg-muted/20"
          >
            {numPages > 0 && (
              <div className="flex flex-col items-center">
                {Array.from({ length: numPages }, (_, index) => (
                  <PageWithObserver
                    key={`page-${index + 1}`}
                    pageNumber={index + 1}
                    scale={scale}
                    onInView={() => handlePageInView(index + 1)}
                    setRef={(el) => (pageRefs.current[index] = el)}
                  />
                ))}
              </div>
            )}
          </div>
        </Document>
      </div>
    </div>
  );
}

export default PdfLessonViewer;
