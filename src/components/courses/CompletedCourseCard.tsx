"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Award,
  Download,
  Clock,
  BookOpen,
  CheckCircle,
  FileText,
  Loader2,
  Eye,
} from "lucide-react";
import { Course } from "@/lib/types/course.types";
import { CompletedCourse } from "@/hooks/use-courses";
import { useCreateCertificate, useCertificateByCourse, useDownloadCertificate } from "@/hooks/use-certificates";
import { formatDistanceToNow, format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CompletedCourseCardProps {
  course: CompletedCourse;
  onViewCertificates?: () => void;
}

export function CompletedCourseCard({ course, onViewCertificates }: CompletedCourseCardProps) {
  const [createProgress, setCreateProgress] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  
  const createCertificateMutation = useCreateCertificate();
  const { data: existingCertificate, isLoading: isLoadingCertificate } = useCertificateByCourse(course.id);
  const { downloadCertificate } = useDownloadCertificate();

  const handleCreateCertificate = async () => {
    if (isCreating || existingCertificate) return;
    
    setIsCreating(true);
    setCreateProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setCreateProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const certificate = await createCertificateMutation.mutateAsync(course.id);
      setCreateProgress(100);
      
      // Auto download certificate after creation
      setTimeout(() => {
        if (certificate?.certificateUrl) {
          downloadCertificate(certificate.certificateUrl);
        }
        setIsCreating(false);
        setCreateProgress(0);
      }, 1000);
    } catch (error) {
      clearInterval(progressInterval);
      setIsCreating(false);
      setCreateProgress(0);
    }
  };

  const handleDownloadCertificate = () => {
    if (existingCertificate?.certificateUrl) {
      downloadCertificate(existingCertificate.certificateUrl);
    }
  };

  const getCompletionText = () => {
    // Use certificate creation date if available, otherwise use course completion date
    if (existingCertificate?.createdAt) {
      try {
        const date = new Date(existingCertificate.createdAt);
        return formatDistanceToNow(date, { addSuffix: true, locale: vi });
      } catch {
        return "Gần đây";
      }
    }
    if (course.completedAt) {
      try {
        const date = new Date(course.completedAt);
        return formatDistanceToNow(date, { addSuffix: true, locale: vi });
      } catch {
        return "Gần đây";
      }
    }
    return "Đã hoàn thành";
  };

  const getDetailedTime = () => {
    // Use certificate creation date if available, otherwise use course completion date
    const dateString = existingCertificate?.createdAt || course.completedAt;
    if (dateString) {
      try {
        return format(new Date(dateString), "dd/MM/yyyy 'lúc' HH:mm", { locale: vi });
      } catch {
        return "Thời gian không xác định";
      }
    }
    return "Thời gian không xác định";
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-200 border-l-4 border-l-green-500 bg-gradient-to-r from-green-50/50 to-white">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Course Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {course.description || "Mô tả khóa học"}
                </p>
                
                {/* Completion Info */}
                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help">
                            {existingCertificate ? "Chứng chỉ đã tạo" : "Đã hoàn thành"} {getCompletionText()}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{getDetailedTime()}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Certificate Section */}
          <div className="flex-shrink-0 lg:min-w-[280px] w-full lg:w-auto">
            <div className="bg-gray-50 rounded-lg p-4 border">
              <div className="flex items-center gap-2 mb-3">
                <Award className="h-5 w-5 text-primary" />
                <span className="font-medium text-gray-900">Chứng chỉ</span>
              </div>
              
              {isLoadingCertificate ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Đang kiểm tra...</span>
                </div>
              ) : existingCertificate ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span>Đã có chứng chỉ</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      onClick={() => window.open(existingCertificate.certificateUrl, '_blank')}
                      className="w-full sm:flex-1 h-9 border border-gray-200 bg-white text-gray hover:bg-primary"
                      size="sm"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Xem trước
                    </Button>
                    <Button 
                      onClick={handleDownloadCertificate}
                      className="w-full sm:flex-1 h-9 bg-primary hover:bg-primary/90"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Tải xuống
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {isCreating && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Đang tạo chứng chỉ...</span>
                        <span>{createProgress}%</span>
                      </div>
                      <Progress value={createProgress} className="h-2" />
                    </div>
                  )}
                  <Button 
                    onClick={handleCreateCertificate}
                    disabled={isCreating || createCertificateMutation.isPending}
                    className="w-full h-9 bg-primary hover:bg-primary/90"
                    size="sm"
                  >
                    {(isCreating || createCertificateMutation.isPending) ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang tạo...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Tạo chứng chỉ
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
