"use client";

import { Button } from "@/components/ui/button";

interface PdfLessonViewerProps {
  pdfUrl: string;
  onLessonComplete: () => void;
}

const PdfLessonViewer = ({
  pdfUrl,
  onLessonComplete,
}: PdfLessonViewerProps) => {
  return (
    <div className="w-full h-full flex flex-col">
      <iframe src={pdfUrl} className="w-full h-full flex-grow" />
      <div className="p-4 bg-gray-100 dark:bg-gray-900 flex justify-end">
        <Button onClick={onLessonComplete}>Đánh dấu là đã hoàn thành</Button>
      </div>
    </div>
  );
};

export default PdfLessonViewer;
