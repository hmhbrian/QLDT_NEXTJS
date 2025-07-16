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
  },
  {
    accessorKey: "department",
    header: "Phòng ban",
    size: 160,
    minSize: 120,
    maxSize: 200,
    cell: ({ row }) => {
      const departmentData = row.original.department;
      console.log("🔍 Course departments data:", departmentData);

      if (!departmentData || departmentData.length === 0) return "N/A";

      // Handle case where department might be array of objects {id, name} or array of string IDs
      const departmentNames = departmentData.map((dept: any, index: number) => {
        // If it's an object with name property
        if (typeof dept === "object" && dept) {
          if ("name" in dept && typeof dept.name === "string") return dept.name;
          if (
            "departmentName" in dept &&
            typeof dept.departmentName === "string"
          )
            return dept.departmentName;
        }
        // If it's a string ID, lookup in departments prop
        if (typeof dept === "string") {
          const foundDept = departments.find((d) => d.departmentId === dept);
          if (foundDept) return foundDept.name;
          return `Dept-${dept}`; // Fallback if not found
        }
        console.warn(`🚨 Invalid department at index ${index}:`, dept);
        return String(dept);
      });

      const displayText =
        departmentNames.length > 1
          ? `${departmentNames[0]} +${departmentNames.length - 1}`
          : departmentNames.join(", ");

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="max-w-[160px] overflow-hidden">
                <span className="block truncate text-sm">{displayText}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="max-w-xs">
                <p className="font-medium">Phòng ban:</p>
                <div className="text-sm">
                  {departmentNames.map((name, idx) => (
                    <div key={idx}>• {name}</div>
                  ))}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "level",
    header: "Cấp độ",
    size: 120,
    minSize: 100,
    maxSize: 150,
    cell: ({ row }) => {
      const levelData = row.original.level;
      console.log("🔍 Course levels data:", levelData);

      if (!levelData || levelData.length === 0) return "N/A";

      // Handle case where level might be array of objects {id, name} or array of string IDs
      const levelNames = levelData.map((level: any, index: number) => {
        // If it's an object with name property
        if (typeof level === "object" && level) {
          if ("name" in level && typeof level.name === "string")
            return level.name;
          if ("positionName" in level && typeof level.positionName === "string")
            return level.positionName;
        }
        // If it's a string ID, lookup in positions prop
        if (typeof level === "string") {
          const foundPosition = positions.find(
            (p) => p.positionId.toString() === level
          );
          if (foundPosition) return foundPosition.positionName;
          return `Level-${level}`; // Fallback if not found
        }
        console.warn(`🚨 Invalid level at index ${index}:`, level);
        return String(level);
      });

      const displayText =
        levelNames.length > 1
          ? `${levelNames[0]} +${levelNames.length - 1}`
          : levelNames.join(", ");

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="max-w-[120px] overflow-hidden">
                <span className="block truncate text-sm">{displayText}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="max-w-xs">
                <p className="font-medium">Cấp độ:</p>
                <div className="text-sm">
                  {levelNames.map((name, idx) => (
                    <div key={idx}>• {name}</div>
                  ))}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
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
      // console.log("🔍 Status data:", status);

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
    size: 140,
    minSize: 120,
    maxSize: 160,
    cell: ({ row }) => {
      const course = row.original;
      // console.log("🔍 Course createdBy/modifiedBy data:", {
      //   createdBy: course.createdBy,
      //   modifiedBy: course.modifiedBy,
      // });

      // Handle createdBy and modifiedBy which might be objects {id, name}
      const createdByName =
        typeof course.createdBy === "object" &&
        course.createdBy &&
        "name" in course.createdBy
          ? course.createdBy.name
          : typeof course.createdBy === "string"
          ? course.createdBy
          : null;

      const modifiedByName =
        typeof course.modifiedBy === "object" &&
        course.modifiedBy &&
        "name" in course.modifiedBy
          ? course.modifiedBy.name
          : typeof course.modifiedBy === "string"
          ? course.modifiedBy
          : null;

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex flex-col text-xs max-w-[200px] overflow-hidden">
                {createdByName && (
                  <span className="block truncate">
                    Tạo bởi: <strong>{createdByName}</strong>
                  </span>
                )}
                {modifiedByName && (
                  <span className="block truncate">
                    Sửa bởi: <strong>{modifiedByName}</strong>
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

    size: 60,
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
        <div className="sticky-action-cell">
          <div className="flex flex-col justify-center">
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
          </div>
        </div>
      );
    },
  },
];
