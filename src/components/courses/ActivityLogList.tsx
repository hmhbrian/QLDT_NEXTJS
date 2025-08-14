"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import {
  Activity,
  Plus,
  Edit,
  Trash2,
  UserPlus,
  UserMinus,
  Play,
  CheckCircle,
  FileText,
  Eye,
  Clock,
  MapPin,
  MoreHorizontal,
  Copy,
  ExternalLink,
  Info,
} from "lucide-react";
import {
  ActivityLog,
  ActivityAction,
  ActivityEntityType,
} from "@/lib/types/course.types";
import { useActivityLogs } from "@/hooks/use-activity-logs";
import { cn } from "@/lib/utils";
import { ClientTime } from "@/components/ClientTime";

interface ActivityLogListProps {
  courseId: string;
  className?: string;
}

const getActionIcon = (action: ActivityAction) => {
  const iconProps = { className: "h-4 w-4" };

  switch (action) {
    case "CREATE":
      return <Plus {...iconProps} className="h-4 w-4 text-green-600" />;
    case "UPDATE":
      return <Edit {...iconProps} className="h-4 w-4 text-blue-600" />;
    case "DELETE":
      return <Trash2 {...iconProps} className="h-4 w-4 text-red-600" />;
    case "ENROLL":
      return <UserPlus {...iconProps} className="h-4 w-4 text-purple-600" />;
    case "UNENROLL":
      return <UserMinus {...iconProps} className="h-4 w-4 text-orange-600" />;
    case "START_LESSON":
      return <Play {...iconProps} className="h-4 w-4 text-blue-500" />;
    case "COMPLETE_LESSON":
      return <CheckCircle {...iconProps} className="h-4 w-4 text-green-500" />;
    case "SUBMIT_TEST":
      return <FileText {...iconProps} className="h-4 w-4 text-indigo-600" />;
    case "VIEW_CONTENT":
      return <Eye {...iconProps} className="h-4 w-4 text-gray-500" />;
    default:
      return <Activity {...iconProps} className="h-4 w-4 text-gray-500" />;
  }
};

const getActionColor = (action: ActivityAction): string => {
  switch (action) {
    case "CREATE":
      return "bg-green-50 text-green-700 border-green-200";
    case "UPDATE":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "DELETE":
      return "bg-red-50 text-red-700 border-red-200";
    case "ENROLL":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "UNENROLL":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "START_LESSON":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "COMPLETE_LESSON":
      return "bg-green-50 text-green-700 border-green-200";
    case "SUBMIT_TEST":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "VIEW_CONTENT":
      return "bg-gray-50 text-gray-700 border-gray-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

const getRoleColor = (role: string): string => {
  switch (role) {
    case "ADMIN":
      return "bg-red-100 text-red-800";
    case "HR":
      return "bg-blue-100 text-blue-800";
    case "HOCVIEN":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getRoleName = (role: string): string => {
  switch (role) {
    case "ADMIN":
      return "Quản trị viên";
    case "HR":
      return "Nhân sự";
    case "HOCVIEN":
      return "Học viên";
    default:
      return role;
  }
};

const getEntityTypeName = (entityType: ActivityEntityType): string => {
  switch (entityType) {
    case "COURSE":
      return "Khóa học";
    case "LESSON":
      return "Bài học";
    case "TEST":
      return "Bài kiểm tra";
    case "USER_ENROLLMENT":
      return "Đăng ký";
    case "QUESTION":
      return "Câu hỏi";
    case "MATERIAL":
      return "Tài liệu";
    default:
      return entityType;
  }
};

export const ActivityLogList: React.FC<ActivityLogListProps> = ({
  courseId,
  className,
}) => {
  const { toast } = useToast();
  const { data: logs, isLoading } = useActivityLogs(courseId);

  const handleCopyToClipboard = async (log: ActivityLog) => {
    try {
      const logInfo = {
        id: log.id,
        user: log.userName,
        role: getRoleName(log.userRole),
        action: log.action,
        entityType: getEntityTypeName(log.entityType),
        entityName: log.entityName,
        description: log.description,
        timestamp: new Date(log.timestamp).toLocaleString("vi-VN"),
        metadata: log.metadata,
      };

      await navigator.clipboard.writeText(JSON.stringify(logInfo, null, 2));
      toast({
        title: "Đã sao chép",
        description: "Thông tin hoạt động đã được sao chép vào clipboard.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể sao chép thông tin. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (log: ActivityLog) => {
    // Open a detailed view or console log for now
    console.group(`📋 Chi tiết hoạt động: ${log.description}`);
    console.groupEnd();

    toast({
      title: "Chi tiết hoạt động",
      description: "Xem thông tin chi tiết trong Console (F12).",
    });
  };
  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-start space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <Card className={cn("p-8 text-center", className)}>
        <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">
          Chưa có hoạt động nào
        </h3>
        <p className="text-sm text-muted-foreground">
          Các hoạt động liên quan đến khóa học này sẽ được hiển thị tại đây.
        </p>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {logs.map((log) => (
        <Card
          key={log.id}
          className="p-4 hover:shadow-md transition-shadow relative overflow-hidden group"
        >
          <div className="flex items-start space-x-4 pr-12">
            {/* Avatar & Action Icon */}
            <div className="relative flex-shrink-0">
              <Avatar className="h-10 w-10">
                <AvatarFallback
                  className={cn(
                    "text-sm font-medium",
                    getRoleColor(log.userRole)
                  )}
                >
                  {log.userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm border">
                {getActionIcon(log.action)}
              </div>
            </div>

            {/* Content - with right padding for fixed menu */}
            <div className="flex-1 min-w-0">
              <div className="mb-2">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-semibold text-foreground">
                    {log.userName}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn("text-xs", getRoleColor(log.userRole))}
                  >
                    {getRoleName(log.userRole)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs whitespace-nowrap",
                      getActionColor(log.action)
                    )}
                  >
                    {getEntityTypeName(log.entityType)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {log.description}
                </p>
              </div>

              {/* Entity Name */}
              {log.entityName && (
                <div className="text-xs text-muted-foreground mb-2 bg-muted/30 px-2 py-1 rounded inline-block">
                  <span className="font-medium">
                    {getEntityTypeName(log.entityType)}:
                  </span>{" "}
                  {log.entityName}
                </div>
              )}

              {/* Metadata */}
              {log.metadata && Object.keys(log.metadata).length > 0 && (
                <div className="text-xs text-muted-foreground mb-2 space-x-4">
                  {log.metadata.score && (
                    <span>
                      Điểm: <strong>{log.metadata.score}</strong>
                    </span>
                  )}
                  {log.metadata.progress && (
                    <span>
                      Tiến độ: <strong>{log.metadata.progress}%</strong>
                    </span>
                  )}
                  {log.metadata.duration && (
                    <span>
                      Thời lượng: <strong>{log.metadata.duration}</strong>
                    </span>
                  )}
                  {log.metadata.questionCount && (
                    <span>
                      Số câu hỏi: <strong>{log.metadata.questionCount}</strong>
                    </span>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-3 pt-2 border-t border-muted/30">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      <ClientTime date={log.timestamp} />
                    </span>
                  </div>
                  {log.ipAddress && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{log.ipAddress}</span>
                    </div>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(log.timestamp).toLocaleString("vi-VN")}
                </span>
              </div>
            </div>
          </div>

          {/* Fixed Dropdown Menu - EmployeeLeveled absolutely in top right */}
          <div className="absolute top-3 right-3 z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-muted data-[state=open]:bg-muted shadow-sm border bg-background/95 backdrop-blur-sm opacity-60 hover:opacity-100 group-hover:opacity-100 transition-all duration-200"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Mở menu tùy chọn</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem
                  onClick={() => handleCopyToClipboard(log)}
                  className="cursor-pointer"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Sao chép thông tin
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => handleViewDetails(log)}
                  className="cursor-pointer"
                >
                  <Info className="mr-2 h-4 w-4" />
                  Xem chi tiết
                </DropdownMenuItem>

                {log.entityId &&
                  (log.entityType === "LESSON" ||
                    log.entityType === "TEST") && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          // This would navigate to the specific entity
                          // For now, just show a toast
                          toast({
                            title: "Điều hướng",
                            description: `Tính năng điều hướng đến ${getEntityTypeName(
                              log.entityType
                            ).toLowerCase()} sẽ có trong bản cập nhật sau.`,
                          });
                        }}
                        className="cursor-pointer"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Đến {getEntityTypeName(log.entityType).toLowerCase()}
                      </DropdownMenuItem>
                    </>
                  )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>
      ))}
    </div>
  );
};
