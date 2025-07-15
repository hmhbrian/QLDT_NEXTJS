
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
      const statusName = row.original.status;
      return (
        <Badge variant={getStatusBadgeVariant(statusName)}>
          {statusName || "N/A"}
        </Badge>
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
                <span className="truncate">Tạo bởi: <strong>{course.createdBy}</strong></span>
                {course.modifiedBy && <span className="truncate">Sửa bởi: <strong>{course.modifiedBy}</strong></span>}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ngày tạo: {formatDateVN(course.createdAt, 'dd/MM/yyyy HH:mm')}</p>
              {course.modifiedAt && <p>Ngày sửa: {formatDateVN(course.modifiedAt, 'dd/MM/yyyy HH:mm')}</p>}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const course = row.original;

      if (!canManageCourses) return null;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Mở menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleEdit(course.id)}>
              <Pencil className="mr-2 h-4 w-4" /> Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDuplicateCourse(course)}>
              <Copy className="mr-2 h-4 w-4" /> Nhân bản
            </DropdownMenuItem>
            {course.status !== "Hủy" && (
              <DropdownMenuItem onClick={() => setArchivingCourse(course)}>
                <Archive className="mr-2 h-4 w-4" /> Lưu trữ
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => setDeletingCourse(course)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
