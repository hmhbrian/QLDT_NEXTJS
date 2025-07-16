"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  Pencil,
  Copy,
  Archive,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { Course } from "@/lib/types/course.types";
import { DepartmentInfo } from "@/lib/types/department.types";
import { Position } from "@/lib/types/user.types";
import { getStatusBadgeVariant } from "@/lib/helpers";
import { formatDateVN } from "@/lib/utils/date.utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const getColumns = (
  handleViewDetails: (courseId: string) => void,
  handleEdit: (courseId: string) => void,
  handleDuplicateCourse: (course: Course) => void,
  setArchivingCourse: (course: Course | null) => void,
  setDeletingCourse: (course: Course | null) => void,
  canManageCourses: boolean,
  departments: DepartmentInfo[],
  positions: Position[]
): ColumnDef<Course>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected()
            ? true
            : table.getIsSomePageRowsSelected()
            ? "indeterminate"
            : false
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tên khóa học
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div
        className="font-medium cursor-pointer hover:underline"
        onClick={() => handleViewDetails(row.original.id)}
      >
        {row.original.title}
      </div>
    ),
  },
  {
    accessorKey: "courseCode",
    header: "Mã",
    cell: ({ row }) => {
      const courseCode = row.original.courseCode;
      console.log("🔍 Components Course courseCode data:", courseCode);

      // Handle both object and string values with proper type checking
      if (
        typeof courseCode === "object" &&
        courseCode &&
        "code" in courseCode &&
        typeof (courseCode as any).code === "string"
      ) {
        return (courseCode as any).code;
      }
      if (
        typeof courseCode === "object" &&
        courseCode &&
        "name" in courseCode &&
        typeof (courseCode as any).name === "string"
      ) {
        return (courseCode as any).name;
      }
      return String(courseCode || "N/A");
    },
  },
  {
    accessorKey: "enrollmentType",
    header: "Loại Ghi danh",
    cell: ({ row }) => {
      const isMandatory = row.original.enrollmentType === "mandatory";
      return (
        <Badge variant={isMandatory ? "default" : "secondary"}>
          {isMandatory ? "Bắt buộc" : "Tùy chọn"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const status = row.original.status;
      console.log("🔍 Components Course status data:", status);

      // Handle case where status might be an object {id, name} or a string
      const statusName =
        typeof status === "object" &&
        status &&
        "name" in status &&
        typeof status.name === "string"
          ? status.name
          : typeof status === "string"
          ? status
          : "N/A";

      return (
        <Badge variant={getStatusBadgeVariant(statusName)}>{statusName}</Badge>
      );
    },
  },
  {
    accessorKey: "isPublic",
    header: "Công khai",
    cell: ({ row }) => {
      const isPublic = row.original.isPublic;
      return (
        <Badge variant={isPublic ? "default" : "outline"}>
          {isPublic ? "Công khai" : "Nội bộ"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdBy",
    header: "Thông tin",
    cell: ({ row }) => {
      const course = row.original;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex flex-col text-xs">
                {course.createdBy && (
                  <span className="truncate">
                    Tạo bởi:{" "}
                    <strong>
                      {(() => {
                        if (
                          typeof course.createdBy === "object" &&
                          course.createdBy &&
                          "name" in course.createdBy &&
                          typeof course.createdBy.name === "string"
                        ) {
                          return course.createdBy.name;
                        } else if (typeof course.createdBy === "string") {
                          return course.createdBy;
                        }
                        return "N/A";
                      })()}
                    </strong>
                  </span>
                )}
                {course.modifiedBy && (
                  <span className="truncate">
                    Sửa bởi:{" "}
                    <strong>
                      {(() => {
                        if (
                          typeof course.modifiedBy === "object" &&
                          course.modifiedBy &&
                          "name" in course.modifiedBy &&
                          typeof course.modifiedBy.name === "string"
                        ) {
                          return course.modifiedBy.name;
                        } else if (typeof course.modifiedBy === "string") {
                          return course.modifiedBy;
                        }
                        return "N/A";
                      })()}
                    </strong>
                  </span>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Ngày tạo: {formatDateVN(course.createdAt, "dd/MM/yyyy HH:mm")}
              </p>
              {course.modifiedAt && (
                <p>
                  Ngày sửa:{" "}
                  {formatDateVN(course.modifiedAt, "dd/MM/yyyy HH:mm")}
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    id: "actions",
    header: "Thao tác",
    size: 100,
    enableResizing: false,
    enableSorting: false,
    enableHiding: false,
    meta: {
      sticky: "right",
    },
    cell: ({ row }) => {
      const course = row.original;

      if (!canManageCourses) return null;

      return (
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-muted/50 transition-colors"
              >
                <span className="sr-only">Mở menu thao tác</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 shadow-lg border"
              sideOffset={5}
            >
              <DropdownMenuItem
                onClick={() => handleEdit(course.id)}
                className="cursor-pointer hover:bg-muted/50"
              >
                <Pencil className="mr-3 h-4 w-4 text-blue-600" />
                <span>Chỉnh sửa</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDuplicateCourse(course)}
                className="cursor-pointer hover:bg-muted/50"
              >
                <Copy className="mr-3 h-4 w-4 text-green-600" />
                <span>Nhân bản</span>
              </DropdownMenuItem>
              {course.status !== "Hủy" && (
                <DropdownMenuItem
                  onClick={() => setArchivingCourse(course)}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <Archive className="mr-3 h-4 w-4 text-amber-600" />
                  <span>Lưu trữ</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => setDeletingCourse(course)}
                className="cursor-pointer hover:bg-destructive/10 text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-3 h-4 w-4" />
                <span>Xóa</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
