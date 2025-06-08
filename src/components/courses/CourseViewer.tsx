'use client';

import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, Download, Maximize2, Minimize2 } from 'lucide-react';
import Image from 'next/image';
import type { Course } from '@/lib/types';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface CourseViewerProps {
  course: Course;
}

export function CourseViewer({ course }: CourseViewerProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('slides');

  const currentSlide = course.slides?.[currentSlideIndex];

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : prev));
    setPageNumber(1); // Reset PDF page when changing slides
  };

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => 
      prev < (course.slides?.length ?? 0) - 1 ? prev + 1 : prev
    );
    setPageNumber(1); // Reset PDF page when changing slides
  };

  const handlePrevPage = () => {
    setPageNumber((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleNextPage = () => {
    setPageNumber((prev) => (prev < (numPages ?? 0) ? prev + 1 : prev));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  if (!course.slides?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Không có tài liệu để hiển thị.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="slides">Bài giảng</TabsTrigger>
          <TabsTrigger value="materials">Tài liệu</TabsTrigger>
        </TabsList>

        <TabsContent value="slides" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium">
                {currentSlide?.title || 'Bài giảng'}
              </CardTitle>
              <div className="flex items-center gap-2">
                {currentSlide?.url && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(currentSlide.url, '_blank')}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className={`relative ${isFullscreen ? 'h-screen' : 'h-[600px]'} w-full`}>
                {currentSlide?.type === 'pdf' ? (
                  <div className="h-full flex flex-col">
                    <div className="flex-grow relative">
                      <Document
                        file={currentSlide.url}
                        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                        className="absolute inset-0"
                      >
                        <Page
                          pageNumber={pageNumber}
                          width={isFullscreen ? window.innerWidth : undefined}
                          height={isFullscreen ? window.innerHeight - 100 : undefined}
                        />
                      </Document>
                    </div>
                    <div className="flex items-center justify-between p-4 border-t">
                      <Button
                        variant="outline"
                        onClick={handlePrevPage}
                        disabled={pageNumber <= 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Trang trước
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Trang {pageNumber} / {numPages}
                      </span>
                      <Button
                        variant="outline"
                        onClick={handleNextPage}
                        disabled={pageNumber >= (numPages ?? 0)}
                      >
                        Trang sau
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative h-full">
                    <Image
                      src={currentSlide?.url || ''}
                      alt={currentSlide?.title || ''}
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between mt-4">
                <Button
                  variant="outline"
                  onClick={handlePrevSlide}
                  disabled={currentSlideIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Slide trước
                </Button>
                <span className="text-sm text-muted-foreground">
                  Slide {currentSlideIndex + 1} / {course.slides.length}
                </span>
                <Button
                  variant="outline"
                  onClick={handleNextSlide}
                  disabled={currentSlideIndex === course.slides.length - 1}
                >
                  Slide sau
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials" className="space-y-4">
          {course.materials?.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {course.materials.map((material, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{material.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {material.description}
                    </p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(material.url, '_blank')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Tải xuống
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Không có tài liệu bổ sung.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 