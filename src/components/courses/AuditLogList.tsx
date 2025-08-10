"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Clock,
  Eye,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types dựa trên API response
interface AuditLogField {
  fieldName: string;
  oldValue?: any;
  newValue?: any;
  value?: any;
}

interface AuditLogEntry {
  id: number;
  action: "Added" | "Modified" | "Deleted";
  entityName: string;
  entityId: string;
  userName: string;
  timestamp: string;
  changedFields: AuditLogField[];
  addedFields: AuditLogField[];
  deletedFields: AuditLogField[];
}

interface AuditLogListProps {
  courseId: string;
  className?: string;
  data?: AuditLogEntry[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

const getActionInfo = (action: string) => {
  switch (action) {
    case "Added":
      return {
        label: "Thêm mới",
        icon: Plus,
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        description: "đã tạo",
      };
    case "Modified":
      return {
        label: "Sửa đổi",
        icon: Edit,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        description: "đã chỉnh sửa",
      };
    case "Deleted":
      return {
        label: "Xóa",
        icon: Trash2,
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        description: "đã xóa",
      };
    default:
      return {
        label: action,
        icon: Eye,
        color: "text-gray-600",
        bgColor: "bg-gray-50",
        borderColor: "border-gray-200",
        description: "đã thực hiện",
      };
  }
};

const getEntityDisplayName = (entityName: string) => {
  switch (entityName.toLowerCase()) {
    case "courses":
      return "khóa học";
    case "lessons":
      return "bài học";
    case "tests":
      return "bài kiểm tra";
    case "questions":
      return "câu hỏi";
    case "users":
      return "người dùng";
    default:
      return entityName.toLowerCase();
  }
};

const formatFieldName = (fieldName: string): string => {
  const fieldMap: Record<string, string> = {
    EndDate: "Ngày kết thúc",
    StartDate: "Ngày bắt đầu",
    RegistrationStartDate: "Ngày mở đăng ký",
    RegistrationClosingDate: "Ngày đóng đăng ký",
    ModifiedAt: "Thời gian sửa đổi",
    CreatedAt: "Thời gian tạo",
    UpdatedAt: "Thời gian cập nhật",
    Title: "Tiêu đề",
    EmployeeLevel: "Vị trí",
    PassThreshold: "Điểm đạt",
    TimeTest: "Thời gian làm bài",
    FileUrl: "Đường dẫn file",
    TotalDurationSeconds: "Thời lượng (giây)",
    TotalPages: "Tổng số trang",
    CourseId: "Mã khóa học",
    CreatedById: "Người tạo",
    UpdatedById: "Người cập nhật",
    TypeDocId: "Loại tài liệu",
    PublicIdUrlPdf: "ID PDF công khai",
  };
  return fieldMap[fieldName] || fieldName;
};

const formatFieldValue = (value: any, fieldName?: string): string => {
  if (value === null || value === undefined) return "Trống";
  if (value === "Unknown") return "Không xác định";
  if (typeof value === "boolean") return value ? "Có" : "Không";

  // Định dạng cho TimeTest (phút)
  if (fieldName === "TimeTest" && typeof value === "number") {
    return `${value} phút`;
  }

  // Định dạng ngày tháng
  if (typeof value === "string" && value.includes("T")) {
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toLocaleString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    } catch {
      // Fallback to original value
    }
  }

  return String(value);
};

function FieldChangeDisplay({ field }: { field: AuditLogField }) {
  const hasOldValue = "oldValue" in field && field.oldValue !== undefined;

  return (
    <div className="text-sm border-l-2 border-blue-200 pl-3 py-2 bg-blue-50/30 rounded-r-md">
      <div className="font-medium text-foreground mb-1 text-xs uppercase tracking-wide text-blue-700">
        {formatFieldName(field.fieldName)}
      </div>
      {hasOldValue ? (
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span className="text-red-600 line-through bg-red-50 px-2 py-1 rounded">
            {formatFieldValue(field.oldValue, field.fieldName)}
          </span>
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
          <span className="text-green-700 font-semibold bg-green-50 px-2 py-1 rounded">
            {formatFieldValue(field.newValue, field.fieldName)}
          </span>
        </div>
      ) : (
        <div className="text-xs text-green-700 font-semibold bg-green-50 px-2 py-1 rounded inline-block">
          {formatFieldValue(field.value, field.fieldName)}
        </div>
      )}
    </div>
  );
}

function AuditLogEntryCard({ entry }: { entry: AuditLogEntry }) {
  const [isOpen, setIsOpen] = useState(false);
  const actionInfo = getActionInfo(entry.action);

  const totalChanges =
    entry.changedFields.length +
    entry.addedFields.length +
    entry.deletedFields.length;
  const hasDetails = totalChanges > 0;

  // Tạo mô tả chi tiết
  const entityDisplay = getEntityDisplayName(entry.entityName);
  const actionDescription = `${actionInfo.description} ${entityDisplay}`;

  return (
    <div className="relative pl-8 border-l-2 border-border">
      {/* Timeline Dot */}
      <div
        className={cn(
          "absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-background flex items-center justify-center",
          actionInfo.bgColor,
          actionInfo.borderColor
        )}
      >
        <actionInfo.icon className={cn("w-2.5 h-2.5", actionInfo.color)} />
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs font-medium bg-blue-100 text-blue-800">
                {entry.userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-foreground text-sm">
                  {entry.userName}
                </span>
                <span className="text-muted-foreground text-xs">
                  {actionDescription}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-medium",
                    actionInfo.bgColor,
                    actionInfo.color,
                    actionInfo.borderColor
                  )}
                >
                  {actionInfo.label}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {getEntityDisplayName(entry.entityName)}
                </Badge>
                {totalChanges > 0 && (
                  <Badge variant="outline" className="text-xs text-blue-600">
                    {totalChanges} thay đổi
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <Clock className="h-3 w-3" />
          <span>{entry.timestamp}</span>
        </div>

        {hasDetails && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-3">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs text-muted-foreground hover:bg-muted/50 h-8 pl-2"
              >
                {isOpen ? (
                  <ChevronDown className="h-3 w-3 mr-2" />
                ) : (
                  <ChevronRight className="h-3 w-3 mr-2" />
                )}
                {isOpen
                  ? "Ẩn chi tiết"
                  : `Xem chi tiết ${totalChanges} thay đổi`}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
                {entry.changedFields.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-3 text-blue-700 flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Các trường đã thay đổi ({entry.changedFields.length})
                    </h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {entry.changedFields.map((field, index) => (
                        <FieldChangeDisplay
                          key={`changed-${index}`}
                          field={field}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {entry.addedFields.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-3 text-green-700 flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Các trường đã thêm ({entry.addedFields.length})
                    </h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {entry.addedFields.map((field, index) => (
                        <FieldChangeDisplay
                          key={`added-${index}`}
                          field={field}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {entry.deletedFields.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-3 text-red-700 flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      Các trường đã xóa ({entry.deletedFields.length})
                    </h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {entry.deletedFields.map((field, index) => (
                        <FieldChangeDisplay
                          key={`deleted-${index}`}
                          field={field}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </div>
  );
}

export function AuditLogList({
  courseId,
  className,
  data = [],
  isLoading = false,
  onRefresh,
}: AuditLogListProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Nhật ký hoạt động chi tiết
          </CardTitle>
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")}
              />
              Làm mới
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            <RefreshCw className="h-6 w-6 mx-auto animate-spin" />
            <p className="mt-2">Đang tải nhật ký...</p>
          </div>
        ) : !data || data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">
              Chưa có hoạt động nào
            </h3>
            <p className="text-sm">
              Các hoạt động liên quan đến khóa học này sẽ được hiển thị tại đây.
            </p>
          </div>
        ) : (
          <div className="relative">
            {data.map((entry) => (
              <AuditLogEntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AuditLogList;
