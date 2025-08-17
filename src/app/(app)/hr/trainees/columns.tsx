"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  Pencil,
  Trash2,
  UserCircle2,
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

      if (!department) return "Không có";

      // Handle both object {id, name, departmentName} and string
      if (typeof department === "string") return department;
      if (typeof department === "object" && department) {
        if ("name" in department && typeof department.name === "string")
          return department.name;
        if (
          "departmentName" in department &&
          typeof department.departmentName === "string"
        )
          return department.departmentName;
      }

      return "Không xác định";
    },
  },
  {
    accessorKey: "employeeLevel",
    header: "Cấp bậc",
    cell: ({ row }) => {
      const employeeLevel = row.original.employeeLevel;

      if (!employeeLevel) return "Không có";

      // Handle both object {id, name, eLevelName} and string
      let eLevelName: string = "Không xác định";
      if (typeof employeeLevel === "string") {
        eLevelName = employeeLevel;
      } else if (typeof employeeLevel === "object" && employeeLevel) {
        if (
          "eLevelName" in employeeLevel &&
          typeof employeeLevel.eLevelName === "string"
        ) {
          eLevelName = employeeLevel.eLevelName;
        } else if (
          "name" in employeeLevel &&
          typeof employeeLevel.name === "string"
        ) {
          eLevelName = employeeLevel.name;
        }
      }

      return (
        <Badge className={cn(getLevelBadgeColor(eLevelName))}>
          {eLevelName}
        </Badge>
      );
    },
  },
  {
    accessorKey: "userStatus",
    header: "Trạng thái",
    cell: ({ row }) => {
      const statusName = row.original.userStatus?.name || "Không có";
      return (
        <Badge variant="outline" className={cn(getStatusColor(statusName))}>
          {statusName}
        </Badge>
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
      const trainee = row.original;
      return (
        <div className="flex flex-col justify-center">
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
              {/* <DropdownMenuItem onClick={() => handleManageCourses(trainee)}>
                <BookOpen className="mr-2 h-4 w-4" /> Quản lý Khóa học
              </DropdownMenuItem> */}
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
