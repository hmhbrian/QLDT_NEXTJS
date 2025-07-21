"use client";

import React, { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import {
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Plus,
  ArrowRight,
  Loader2,
  FileText,
} from "lucide-react";
import { useCourseAuditLog } from "@/hooks/use-audit-log";
import { AuditLogEntry, FieldChange } from "@/lib/types/audit-log.types";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { ClientTime } from "../ClientTime";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const getActionInfo = (action: string) => {
  switch (action) {
    case "Added":
      return {
        label: "Thêm",
        icon: Plus,
        color: "text-green-600",
        bgColor: "bg-green-100",
        borderColor: "border-green-300",
        verb: "Đã tạo",
      };
    case "Modified":
      return {
        label: "Sửa",
        icon: Edit,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        borderColor: "border-blue-300",
        verb: "Đã chỉnh sửa",
      };
    case "Deleted":
      return {
        label: "Xóa",
        icon: Trash2,
        color: "text-red-600",
        bgColor: "bg-red-100",
        borderColor: "border-red-300",
        verb: "Đã xóa",
      };
    default:
      return {
        label: action,
        icon: Eye,
        color: "text-gray-600",
        bgColor: "bg-gray-100",
        borderColor: "border-gray-300",
        verb: "Đã thực hiện",
      };
  }
};

const getEntityDisplayName = (entityName: string): string => {
  switch (entityName.toLowerCase()) {
    case "courses":
      return "Khóa học";
    case "lessons":
      return "Bài học";
    case "tests":
      return "Bài kiểm tra";
    case "questions":
      return "Câu hỏi";
    case "users":
      return "Người dùng";
    default:
      return entityName.toLowerCase();
  }
};

function FieldChangeDisplay({ field }: { field: FieldChange }) {
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "Không có";
    if (value === "Unknown") return "Chưa xác định";
    if (value === "") return "Trống";
    if (typeof value === "boolean") return value ? "Có" : "Không";
    if (typeof value === "object") {
      if (value.name) return value.name;
      if (value.title) return value.title;
      try {
        return JSON.stringify(value);
      } catch {
        return "[Object]";
      }
    }

    // Định dạng ngày tháng nếu là ISO string
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

  const hasOldValue = "oldValue" in field;

  return (
    <div className="text-sm border-l-4 border-blue-200 pl-3 py-2 bg-gradient-to-r from-blue-50/50 to-transparent rounded-r-md break-words overflow-hidden">
      <div className="font-semibold text-blue-800 mb-1 text-xs break-words">
        {field.fieldName}
      </div>
      {hasOldValue ? (
        <div className="space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
            <span className="px-2 py-1 bg-red-100 text-red-700 rounded line-through break-words max-w-full overflow-hidden">
              {formatValue(field.oldValue)}
            </span>
            <ArrowRight className="h-3 w-3 text-gray-400 flex-shrink-0" />
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-semibold break-words max-w-full overflow-hidden">
              {formatValue(field.newValue)}
            </span>
          </div>
        </div>
      ) : (
        <div className="text-xs">
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-semibold inline-block break-words max-w-full overflow-hidden">
            {formatValue(field.value)}
          </span>
        </div>
      )}
    </div>
  );
}

function AuditLogEntryCard({ entry }: { entry: AuditLogEntry }) {
  const [isOpen, setIsOpen] = useState(false);
  const actionInfo = getActionInfo(entry.action);

  // Extract the title or a descriptive name from the fields
  const entityTitleField = useMemo(() => {
    const fields =
      entry.action === "Added"
        ? entry.addedFields
        : entry.changedFields.length > 0
        ? entry.changedFields
        : [];
    return fields.find(
      (f) =>
        f.fieldName.toLowerCase().includes("tiêu đề") ||
        f.fieldName.toLowerCase().includes("tên") ||
        f.fieldName.toLowerCase() === "title" ||
        f.fieldName.toLowerCase() === "name"
    );
  }, [entry]);

  const entityTitle = entityTitleField
    ? entityTitleField.newValue ?? entityTitleField.value
    : null;
  const entityDisplayName = getEntityDisplayName(entry.entityName);

  const allFields = useMemo(() => {
    return [
      ...entry.addedFields,
      ...entry.changedFields,
      ...entry.deletedFields,
    ];
  }, [entry]);

  const hasDetails = allFields.length > 0;

  // Tạo mô tả hành động chi tiết hơn
  const getDetailedDescription = () => {
    if (entry.action === "Added") {
      return `${actionInfo.verb} ${entityDisplayName.toLowerCase()}${
        entityTitle ? ` "${entityTitle}"` : ""
      } với ${entry.addedFields.length} thuộc tính`;
    } else if (entry.action === "Modified") {
      const changeCount = entry.changedFields.length;
      const mainChanges = entry.changedFields
        .slice(0, 2)
        .map((f) => f.fieldName)
        .join(", ");
      return `${actionInfo.verb} ${entityDisplayName.toLowerCase()}${
        entityTitle ? ` "${entityTitle}"` : ""
      }: ${mainChanges}${
        changeCount > 2 ? ` và ${changeCount - 2} thay đổi khác` : ""
      }`;
    } else if (entry.action === "Deleted") {
      return `${actionInfo.verb} ${entityDisplayName.toLowerCase()}${
        entityTitle ? ` "${entityTitle}"` : ""
      }`;
    }
    return `${actionInfo.verb} ${entityDisplayName.toLowerCase()}`;
  };

  return (
    <div className="relative pl-8">
      {/* Timeline Dot */}
      <div
        className={cn(
          "absolute -left-[9px] top-2 w-4 h-4 rounded-full border-2 border-background flex items-center justify-center shadow-sm",
          actionInfo.bgColor,
          actionInfo.borderColor
        )}
      >
        <actionInfo.icon className={cn("w-2.5 h-2.5", actionInfo.color)} />
      </div>

      <div className="mb-6">
        <Card
          className="shadow-sm hover:shadow-md transition-all duration-200 border-l-4"
          style={{
            borderLeftColor: actionInfo.color.includes("green")
              ? "#16a34a"
              : actionInfo.color.includes("blue")
              ? "#2563eb"
              : "#dc2626",
          }}
        >
          <CardHeader className="p-4 pb-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-foreground text-base">
                    {entry.userName}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-semibold px-2 py-1",
                      actionInfo.bgColor,
                      actionInfo.color,
                      actionInfo.borderColor
                    )}
                  >
                    {actionInfo.label}
                  </Badge>
                  <Badge variant="secondary" className="text-xs font-medium">
                    {entityDisplayName}
                  </Badge>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-2">
                  {getDetailedDescription()}
                </p>
                {hasDetails && (
                  <div className="flex items-center gap-4 text-xs text-blue-600">
                    {entry.changedFields.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Edit className="h-3 w-3" />
                        {entry.changedFields.length} đã sửa
                      </span>
                    )}
                    {entry.addedFields.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Plus className="h-3 w-3" />
                        {entry.addedFields.length} đã thêm
                      </span>
                    )}
                    {entry.deletedFields.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Trash2 className="h-3 w-3" />
                        {entry.deletedFields.length} đã xóa
                      </span>
                    )}
                  </div>
                )}
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground cursor-default">
                        <ClientTime date={entry.timestamp} />
                      </p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Thời gian chính xác:{" "}
                      {new Date(entry.timestamp).toLocaleString("vi-VN")}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          {hasDetails && (
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleContent>
                <CardContent className="px-4 pb-4 pt-0 max-w-full overflow-hidden">
                  <div className="space-y-4 max-w-full overflow-hidden">
                    {/* Changed Fields */}
                    {entry.changedFields.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-3 text-blue-700 flex items-center gap-2">
                          <Edit className="h-4 w-4" />
                          Các trường đã thay đổi ({entry.changedFields.length})
                        </h4>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 w-full overflow-hidden">
                          {entry.changedFields.map((field, index) => (
                            <FieldChangeDisplay
                              key={`changed-${index}`}
                              field={field}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Added Fields */}
                    {entry.addedFields.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-3 text-green-700 flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Các trường đã thêm ({entry.addedFields.length})
                        </h4>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 w-full overflow-hidden">
                          {entry.addedFields.map((field, index) => (
                            <FieldChangeDisplay
                              key={`added-${index}`}
                              field={field}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Deleted Fields */}
                    {entry.deletedFields.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-3 text-red-700 flex items-center gap-2">
                          <Trash2 className="h-4 w-4" />
                          Các trường đã xóa ({entry.deletedFields.length})
                        </h4>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 w-full overflow-hidden">
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
                </CardContent>
              </CollapsibleContent>

              <div className="border-t bg-gray-50/50 px-4 py-3">
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-center text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 h-8"
                  >
                    {isOpen ? (
                      <>
                        <ChevronDown className="h-3 w-3 mr-2" />
                        Ẩn chi tiết
                      </>
                    ) : (
                      <>
                        <ChevronRight className="h-3 w-3 mr-2" />
                        Xem chi tiết thay đổi ({allFields.length} mục)
                      </>
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>
            </Collapsible>
          )}
        </Card>
      </div>
    </div>
  );
}

export function AuditLog({
  courseId,
  className,
}: {
  courseId: string;
  className?: string;
}) {
  const {
    data: auditLogs,
    isLoading,
    error,
    refetch,
  } = useCourseAuditLog(courseId);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Nhật ký hoạt động</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw
              className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")}
            />
            Làm mới
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            <Loader2 className="h-6 w-6 mx-auto animate-spin" />
            <p className="mt-2">Đang tải nhật ký...</p>
          </div>
        ) : error ? (
          <div className="text-center text-destructive py-8">
            <p>Lỗi khi tải nhật ký hoạt động.</p>
          </div>
        ) : !auditLogs || auditLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
            <FileText className="h-10 w-10 mb-2 opacity-50" />
            <p className="font-medium">Chưa có hoạt động</p>
            <p className="text-sm">
              Chưa có hoạt động nào được ghi lại cho khóa học này.
            </p>
          </div>
        ) : (
          <div className="relative border-l-2 border-border ml-2">
            {auditLogs.map((entry) => (
              <AuditLogEntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
