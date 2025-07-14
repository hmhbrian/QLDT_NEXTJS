
"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  Pencil,
  Trash2,
  UserCircle2,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import type { User } from "@/lib/types/user.types";
import type { DepartmentInfo } from "@/lib/types/department.types";
import type { Position } from "@/lib/types/user.types";
import { cn } from "@/lib/utils";
import { getLevelBadgeColor, getStatusColor } from "@/lib/helpers";

export const getColumns = (
  handleViewDetails: (trainee: User) => void,
  handleEdit: (trainee: User) => void,
  handleManageCourses: (trainee: User) => void,
  handleDelete: (trainee: User) => void
): ColumnDef<User>[] => [
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
    accessorKey: "fullName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Tên & Mã NV
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage
            src={row.original.urlAvatar || undefined}
            alt={row.original.fullName || "User Avatar"}
          />
          <AvatarFallback>
            {(row.original.fullName || "")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{row.original.fullName}</div>
          <div className="text-xs text-muted-foreground">
            {row.original.employeeId}
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Liên hệ",
    cell: ({ row }) => (
      <div>
        <div className="text-sm">{row.original.email}</div>
        <div className="text-xs text-muted-foreground">
          {row.original.phoneNumber}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "department",
    header: "Phòng ban",
    cell: ({ row }) => {
      const department = row.original.department;
      if (!department) return "N/A";
      return (department as DepartmentInfo).name || "Không xác định";
    },
  },
  {
    accessorKey: "position",
    header: "Cấp bậc",
    cell: ({ row }) => {
      const position = row.original.position;
      if (!position) return "N/A";
      return (
        <Badge variant="outline" className={cn(getLevelBadgeColor(position.positionName))}>
          {position.positionName}
        </Badge>
      );
    },
  },
  {
    accessorKey: "userStatus",
    header: "Trạng thái",
    cell: ({ row }) => {
      const statusName = row.original.userStatus?.name || "N/A";
      return (
        <Badge variant="outline" className={cn(getStatusColor(statusName))}>
          {statusName}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const trainee = row.original;
      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Mở menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleViewDetails(trainee)}>
                <UserCircle2 className="mr-2 h-4 w-4" /> Xem Chi tiết
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(trainee)}>
                <Pencil className="mr-2 h-4 w-4" /> Sửa Thông tin
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleManageCourses(trainee)}>
                <BookOpen className="mr-2 h-4 w-4" /> Quản lý Khóa học
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => handleDelete(trainee)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Xóa Học viên
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
