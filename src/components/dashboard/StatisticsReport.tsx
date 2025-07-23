"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Users,
  CheckCircle,
  Clock,
  ThumbsUp,
  FileText,
  RefreshCw,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useAvgFeedbackReport, useMonthlyReport } from "@/hooks/use-reports";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  bgColor,
}: StatCardProps) {
  return (
    <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={cn("h-5 w-5", iconColor)} />
              <p className="text-sm font-medium text-gray-600">{title}</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
            </div>
          </div>
          <div className={cn("p-3 rounded-lg", bgColor)}>
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface FeedbackCardProps {
  title: string;
  score: number;
  maxScore?: number;
}

function FeedbackCard({ title, score, maxScore = 5 }: FeedbackCardProps) {
  const percentage = (score / maxScore) * 100;
  const getScoreColor = (score: number) => {
    if (score >= 4.5) return "text-green-600";
    if (score >= 3.5) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 4.5) return "bg-green-100";
    if (score >= 3.5) return "bg-yellow-100";
    return "bg-red-100";
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-700">{title}</h4>
        <Badge
          className={cn(
            "text-xs font-semibold",
            getScoreBg(score),
            getScoreColor(score)
          )}
        >
          {score.toFixed(1)}/5
        </Badge>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            score >= 4.5
              ? "bg-green-500"
              : score >= 3.5
              ? "bg-yellow-500"
              : "bg-red-500"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function StatisticsReport() {
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1
  );

  // Sử dụng hooks mới
  const {
    data: avgFeedback,
    isLoading: isLoadingFeedback,
    error: errorFeedback,
    refetch: refetchFeedback,
  } = useAvgFeedbackReport();

  const {
    data: monthlyReport,
    isLoading: isLoadingMonthly,
    error: errorMonthly,
    refetch: refetchMonthly,
  } = useMonthlyReport(selectedMonth);

  // Debug logging
  console.log("✅ API Data Debug:", {
    avgFeedback,
    monthlyReport,
    isLoadingFeedback,
    isLoadingMonthly,
    errorFeedback: errorFeedback?.message,
    errorMonthly: errorMonthly?.message,
    selectedMonth,
  });

  const refetchAll = () => {
    refetchFeedback();
    refetchMonthly();
  };

  const months = [
    { value: 1, label: "Tháng 1" },
    { value: 2, label: "Tháng 2" },
    { value: 3, label: "Tháng 3" },
    { value: 4, label: "Tháng 4" },
    { value: 5, label: "Tháng 5" },
    { value: 6, label: "Tháng 6" },
    { value: 7, label: "Tháng 7" },
    { value: 8, label: "Tháng 8" },
    { value: 9, label: "Tháng 9" },
    { value: 10, label: "Tháng 10" },
    { value: 11, label: "Tháng 11" },
    { value: 12, label: "Tháng 12" },
  ];

  const formatTime = (hours: number): string => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} phút`;
    }
    return `${hours.toFixed(1)} giờ`;
  };

  // Debug information
  console.log("🔍 Component State:", {
    selectedMonth,
    avgFeedback,
    monthlyReport,
    isLoadingFeedback,
    isLoadingMonthly,
    errorFeedback,
    errorMonthly,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Báo cáo Tổng quan & Đánh giá Đào tạo
          </h1>
          <p className="text-gray-600 mt-1">
            Cung cấp cái nhìn tổng thể về hiệu quả, tình hình và chất lượng đào
            tạo.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={selectedMonth.toString()}
            onValueChange={(value) => setSelectedMonth(parseInt(value))}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Chọn tháng" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value.toString()}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={refetchAll}
            disabled={isLoadingFeedback || isLoadingMonthly}
          >
            <RefreshCw
              className={cn(
                "h-4 w-4 mr-2",
                (isLoadingFeedback || isLoadingMonthly) && "animate-spin"
              )}
            />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Số Khóa học Đã Tổ chức"
          value={isLoadingMonthly ? "..." : monthlyReport?.numberOfCourses || 0}
          subtitle="khóa học"
          icon={BookOpen}
          iconColor="text-orange-600"
          bgColor="bg-orange-100"
        />
        <StatCard
          title="Tổng Số Học viên"
          value={
            isLoadingMonthly ? "..." : monthlyReport?.numberOfStudents || 0
          }
          subtitle="học viên"
          icon={Users}
          iconColor="text-blue-600"
          bgColor="bg-blue-100"
        />
        <StatCard
          title="Tỷ lệ Hoàn thành"
          value={
            isLoadingMonthly
              ? "..."
              : `${monthlyReport?.averangeCompletedPercentage || 0}%`
          }
          subtitle={`(${
            monthlyReport?.averangeCompletedPercentage || 0
          } lượt ghi danh)`}
          icon={CheckCircle}
          iconColor="text-green-600"
          bgColor="bg-green-100"
        />
        <StatCard
          title="Số Giờ Đào tạo TB/Người"
          value={
            isLoadingMonthly
              ? "..."
              : monthlyReport
              ? formatTime(monthlyReport.averangeTime)
              : "0 giờ"
          }
          subtitle="(dựa trên giờ học cung cấp)"
          icon={Clock}
          iconColor="text-purple-600"
          bgColor="bg-purple-100"
        />
        <StatCard
          title="Tỷ lệ Đánh giá Tích cực"
          value={
            isLoadingMonthly
              ? "..."
              : `${monthlyReport?.averagePositiveFeedback || 0}%`
          }
          subtitle="(0 đánh giá)"
          icon={ThumbsUp}
          iconColor="text-pink-600"
          bgColor="bg-pink-100"
        />
      </div>

      {/* Error Messages */}
      {(errorFeedback || errorMonthly) && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <FileText className="h-5 w-5" />
              <p className="font-medium">Lỗi khi tải dữ liệu báo cáo</p>
            </div>
            {errorMonthly && (
              <p className="text-sm text-red-600 mt-2">
                Báo cáo tháng: {errorMonthly.message}
              </p>
            )}
            {errorFeedback && (
              <p className="text-sm text-red-600 mt-1">
                Đánh giá: {errorFeedback.message}
              </p>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={refetchAll}
              className="mt-3 border-red-300 text-red-700 hover:bg-red-100"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Thử lại tất cả
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Feedback Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-600" />
              <CardTitle>Điểm Đánh giá Bình quân Chung</CardTitle>
            </div>
            {(errorFeedback || errorMonthly) && (
              <Badge variant="destructive" className="text-xs">
                Lỗi tải dữ liệu
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600">
            Điểm trung bình cho từng tiêu chí trên tất cả các khóa học trong
            tháng {selectedMonth}.
          </p>
        </CardHeader>
        <CardContent>
          {isLoadingFeedback ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 mx-auto animate-spin text-blue-500 mb-4" />
              <p className="text-gray-500">Đang tải dữ liệu đánh giá...</p>
            </div>
          ) : errorFeedback ? (
            <div className="text-center py-8 text-red-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Lỗi khi tải dữ liệu đánh giá</p>
              <p className="text-sm mt-2">{errorFeedback.message}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchFeedback()}
                className="mt-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Thử lại
              </Button>
            </div>
          ) : !avgFeedback ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">
                Chưa có dữ liệu đánh giá nào để tổng hợp cho tháng này.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FeedbackCard
                title="Tính liên quan của nội dung"
                score={avgFeedback.q1_relevanceAvg}
              />
              <FeedbackCard
                title="Độ rõ ràng của bài giảng"
                score={avgFeedback.q2_clarityAvg}
              />
              <FeedbackCard
                title="Cấu trúc khóa học"
                score={avgFeedback.q3_structureAvg}
              />
              <FeedbackCard
                title="Thời lượng phù hợp"
                score={avgFeedback.q4_durationAvg}
              />
              <FeedbackCard
                title="Chất lượng tài liệu"
                score={avgFeedback.q5_materialAvg}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default StatisticsReport;
