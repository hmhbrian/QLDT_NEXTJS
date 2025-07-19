"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import {
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";
import { useCourseAuditLog } from "@/hooks/use-audit-log";
import { AuditLogEntry, FieldChange } from "@/lib/types/audit-log.types";
import { cn } from "@/lib/utils";

interface AuditLogProps {
  courseId: string;
  className?: string;
}

const actionColors = {
  Added: "bg-green-100 text-green-800 border-green-200",
  Modified: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Deleted: "bg-red-100 text-red-800 border-red-200",
};

const actionLabels = {
  Added: "Thêm mới",
  Modified: "Sửa đổi",
  Deleted: "Xóa",
};

function FieldChangeDisplay({
  field,
  type,
}: {
  field: FieldChange;
  type: "changed" | "added" | "deleted";
}) {
  // Định dạng giá trị để hiển thị
  const formatValue = (value: any) => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "boolean") return value ? "Có" : "Không";
    if (typeof value === "string" && value.length > 50) {
      return value.substring(0, 50) + "...";
    }
    return String(value);
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case "changed":
        return "border-l-blue-400 bg-blue-50/50";
      case "added":
        return "border-l-emerald-400 bg-emerald-50/50";
      case "deleted":
        return "border-l-rose-400 bg-rose-50/50";
      default:
        return "border-l-gray-400 bg-gray-50/50";
    }
  };

  return (
    <div
      className={cn(
        "text-sm border-l-4 rounded-r-lg p-3 shadow-sm",
        getTypeStyle(type)
      )}
    >
      <div className="font-medium text-gray-800 mb-2 text-xs uppercase tracking-wide">
        {field.fieldName}
      </div>
      {type === "changed" && (
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-rose-600 font-medium text-xs bg-rose-100 px-2 py-1 rounded">
              Cũ
            </span>
            <span className="text-rose-700 text-xs break-all">
              {formatValue(field.oldValue)}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-600 font-medium text-xs bg-emerald-100 px-2 py-1 rounded">
              Mới
            </span>
            <span className="text-emerald-700 text-xs break-all">
              {formatValue(field.newValue)}
            </span>
          </div>
        </div>
      )}
      {type === "added" && (
        <div className="flex items-start gap-2">
          <span className="text-emerald-600 font-medium text-xs bg-emerald-100 px-2 py-1 rounded">
            Giá trị
          </span>
          <span className="text-emerald-700 text-xs break-all">
            {formatValue(field.value)}
          </span>
        </div>
      )}
      {type === "deleted" && (
        <div className="flex items-start gap-2">
          <span className="text-rose-600 font-medium text-xs bg-rose-100 px-2 py-1 rounded">
            Đã xóa
          </span>
          <span className="text-rose-700 text-xs break-all">
            {formatValue(field.value)}
          </span>
        </div>
      )}
    </div>
  );
}

function AuditLogEntryCard({ entry }: { entry: AuditLogEntry }) {
  const [isOpen, setIsOpen] = useState(false);

  const hasDetails =
    entry.changedFields.length > 0 ||
    entry.addedFields.length > 0 ||
    entry.deletedFields.length > 0;

  const getActionIcon = (action: string) => {
    switch (action) {
      case "Added":
        return <Plus className="w-5 h-5 text-green-500" />;
      case "Modified":
        return <Edit className="w-5 h-5 text-orange-500" />;
      case "Deleted":
        return <Trash2 className="w-5 h-5 text-red-500" />;
      default:
        return <Eye className="w-5 h-5 text-blue-500" />;
    }
  };

  // Fix: Define getActionColor here so it's in scope
  const getActionColor = (action: string) => {
    switch (action) {
      case "Added":
        return "bg-green-100 text-green-800 border-green-200";
      case "Modified":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Deleted":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-emerald-100",
      "bg-blue-100",
      "bg-purple-100",
      "bg-pink-100",
      "bg-indigo-100",
      "bg-teal-100",
      "bg-cyan-100",
      "bg-violet-100",
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <Card className="border-l-4 border-l-orange-400 hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar with initials, icon at bottom-right */}
          <div className="flex-shrink-0 relative">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 shadow-sm bg-white font-semibold text-gray-700 text-base uppercase",
                getAvatarColor(entry.userName)
              )}
            >
              {/* Show initials (first letter of each word) */}
              {entry.userName
                .split(" ")
                .map((w) => w[0])
                .join("")}
            </div>
            {/* Action icon at bottom-right of avatar */}
            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow">
              {getActionIcon(entry.action)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-gray-900">
                {entry.userName}
              </span>
              {/* <Badge
                className={cn(
                  "text-xs font-medium flex items-center gap-1 px-2 py-1",
                  getActionColor(entry.action)
                )}
              >
                {getActionIcon(entry.action)}
              </Badge> */}
              <Badge
                variant="outline"
                className="text-xs bg-green-50 text-green-700 border-green-200"
              >
                Học viên
              </Badge>
              <Badge
                variant="outline"
                className="text-xs bg-blue-50 text-blue-700 border-blue-200"
              >
                Khóa học
              </Badge>
            </div>
            <div className="text-sm text-gray-600 mb-1">
              Truy cập xem nội dung khóa học
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                {entry.entityName}
              </span>
              <span className="flex items-center gap-1">192.168.1.105</span>
              <span className="flex items-center gap-1">{entry.timestamp}</span>
            </div>
          </div>
          <div className="flex items-center gap-2"></div>
        </div>

        {hasDetails && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-3">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center text-xs hover:bg-gray-50 text-gray-600"
              >
                {isOpen ? (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    Ẩn chi tiết
                  </>
                ) : (
                  <>
                    <ChevronRight className="h-3 w-3 mr-1" />
                    Xem chi tiết
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <div className="bg-gradient-to-r from-gray-50 to-gray-50/70 rounded-lg p-4 space-y-3 border border-gray-100">
                {entry.changedFields.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-orange-600 flex items-center gap-1">
                      <span>📝</span>
                      Các trường đã thay đổi ({entry.changedFields.length}):
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {entry.changedFields.map((field, index) => (
                        <FieldChangeDisplay
                          key={index}
                          field={field}
                          type="changed"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {entry.addedFields.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-emerald-600 flex items-center gap-1">
                      <span>✨</span>
                      Các trường đã thêm ({entry.addedFields.length}):
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {entry.addedFields.map((field, index) => (
                        <FieldChangeDisplay
                          key={index}
                          field={field}
                          type="added"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {entry.deletedFields.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-rose-600 flex items-center gap-1">
                      <span>🗑️</span>
                      Các trường đã xóa ({entry.deletedFields.length}):
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {entry.deletedFields.map((field, index) => (
                        <FieldChangeDisplay
                          key={index}
                          field={field}
                          type="deleted"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}

export function AuditLog({ courseId, className }: AuditLogProps) {
  const [filters, setFilters] = useState({
    action: "" as "" | "Added" | "Modified" | "Deleted",
    entityName: "",
    userName: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Tạo params object chỉ với các giá trị có thực sự
  const auditParams = {
    ...(filters.action && { action: filters.action }),
    ...(filters.entityName && { entityName: filters.entityName }),
    ...(filters.userName && { userName: filters.userName }),
    limit: 100, // Giới hạn 100 records
  };

  const {
    data: auditLogs,
    isLoading,
    error,
    refetch,
  } = useCourseAuditLog(courseId, auditParams);

  // Reset về trang 1 khi thay đổi filter - LUÔN gọi useEffect
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Debug logging
  console.log("🔍 AuditLog Component:", {
    courseId,
    auditParams,
    isLoading,
    error,
    auditLogs,
    auditLogsLength: auditLogs?.length,
    auditLogsType: typeof auditLogs,
    auditLogsIsArray: Array.isArray(auditLogs),
  });

  // Thêm debug chi tiết hơn
  if (auditLogs && auditLogs.length > 0) {
    console.log("📊 First audit log entry:", auditLogs[0]);
  }

  if (isLoading) {
    // Use built-in Spinner from UI library if available, else fallback to improved loading
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            Nhật ký hoạt động
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Theo dõi tất cả các hoạt động liên quan đến khóa học này: tạo, sửa,
            xóa, đăng ký, học tập và kiểm tra.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-40">
            {/* Professional loading spinner, fallback if Spinner not available */}
            <div className="flex items-center gap-2">
              <RefreshCw className="animate-spin h-6 w-6 text-primary" />
              <span className="ml-2 text-sm text-gray-600">
                Đang tải nhật ký hoạt động...
              </span>
            </div>
            <span className="text-xs text-gray-500 mt-1">Vui lòng đợi</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">📋</span>
            </div>
            Nhật ký hoạt động
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            Theo dõi tất cả các hoạt động liên quan đến khóa học này: tạo, sửa,
            xóa, đăng ký, học tập và kiểm tra.
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600 py-8">
            <div> Có lỗi xảy ra khi tải nhật ký hoạt động </div>
            <div className="text-sm mt-2">
              {error instanceof Error ? error.message : "Lỗi không xác định"}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredLogs =
    auditLogs?.filter((log) => {
      return (
        (!filters.action || log.action === filters.action) &&
        (!filters.entityName ||
          log.entityName
            .toLowerCase()
            .includes(filters.entityName.toLowerCase())) &&
        (!filters.userName ||
          log.userName.toLowerCase().includes(filters.userName.toLowerCase()))
      );
    }) || [];

  // Phân trang
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">📋</span>
            </div>
            <CardTitle>Nhật ký hoạt động</CardTitle>
          </div>
          <Button
            variant="outline"
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
        <p className="text-sm text-muted-foreground mt-2">
          Theo dõi tất cả các hoạt động liên quan đến khóa học này: tạo, sửa,
          xóa, đăng ký, học tập và kiểm tra.
        </p>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="action-filter" className="text-sm">
              Hành động:
            </Label>
            <Select
              value={filters.action === "" ? "all" : filters.action}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  action:
                    value === "all"
                      ? ""
                      : (value as "" | "Added" | "Modified" | "Deleted"),
                }))
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="Added">Thêm mới</SelectItem>
                <SelectItem value="Modified">Sửa đổi</SelectItem>
                <SelectItem value="Deleted">Xóa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="entity-filter" className="text-sm">
              Đối tượng:
            </Label>
            <Input
              id="entity-filter"
              placeholder="Tên đối tượng..."
              value={filters.entityName}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, entityName: e.target.value }))
              }
              className="w-40"
            />
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="user-filter" className="text-sm">
              Người dùng:
            </Label>
            <Input
              id="user-filter"
              placeholder="Tên người dùng..."
              value={filters.userName}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, userName: e.target.value }))
              }
              className="w-40"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setFilters({ action: "" as "", entityName: "", userName: "" })
            }
          >
            <Filter className="h-4 w-4 mr-2" />
            Xóa bộ lọc
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {!auditLogs || auditLogs.length === 0 ? (
              <div className="space-y-2">
                <p className="text-lg">📝 Chưa có nhật ký hoạt động nào</p>
                <p className="text-sm">
                  Các hoạt động trên khóa học này sẽ được ghi lại tại đây
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-lg">🔍 Không tìm thấy kết quả</p>
                <p className="text-sm">
                  Thử thay đổi bộ lọc để xem các hoạt động khác
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFilters({
                      action: "" as "",
                      entityName: "",
                      userName: "",
                    })
                  }
                >
                  Xóa bộ lọc
                </Button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedLogs.map((entry) => (
                <AuditLogEntryCard key={entry.id} entry={entry} />
              ))}
            </div>

            {/* Phân trang */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-500">
                  Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
                  {Math.min(currentPage * itemsPerPage, filteredLogs.length)}{" "}
                  trong tổng số {filteredLogs.length} bản ghi
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                  >
                    Trước
                  </Button>
                  <span className="text-sm">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
