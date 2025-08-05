"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DepartmentInfo } from "@/lib/types/department.types";
import type { Status } from "@/lib/types/status.types";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { getStatusColor } from "@/lib/helpers";
import { cn } from "@/lib/utils";

export const getColumns = (
  handleOpenEditDialog: (department: DepartmentInfo) => void,
  setDeletingDepartment: (department: DepartmentInfo | null) => void,
  departments: DepartmentInfo[],
  userStatuses: Status[]
): ColumnDef<DepartmentInfo>[] => [
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
    accessorKey: "code",
    header: "Mã phòng ban",
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Tên phòng ban
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.name}</p>
        <p className="text-sm text-muted-foreground">
          {row.original.description}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "parentId",
    header: "Phòng ban cha",
    cell: ({ row }) => {
      const parentId = row.original.parentId;
      if (!parentId) {
        return <span className="text-muted-foreground">—</span>;
      }
      const parent = departments.find((d) => d.departmentId === parentId);
      if (parent) {
        return parent.name;
      }
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-destructive text-xs cursor-help italic">
                ID không hợp lệ
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Không tìm thấy phòng ban cha với ID: {parentId}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "managerName",
    header: "Quản lý",
    cell: ({ row }) => row.original.managerName || "Không có",
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const status = row.original.status;
      const statusName = status?.name || "Không có";
      return (
        <Badge className={cn(getStatusColor(statusName))}>{statusName}</Badge>
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
      const department = row.original;
      return (
        <div className="sticky right-0 bg-background/80 backdrop-blur-sm flex justify-center items-center h-full">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Mở menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => handleOpenEditDialog(department)}
              >
                <Pencil className="mr-2 h-4 w-4" /> Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeletingDepartment(department)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
