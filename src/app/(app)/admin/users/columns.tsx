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
import { Checkbox } from "@/components/ui/checkbox";
import type { User, Role } from "@/lib/types/user.types";
import { cn } from "@/lib/utils";
import { getStatusColor } from "@/lib/helpers";

const roleBadgeVariant: Record<Role, "default" | "secondary" | "outline"> = {
  ADMIN: "default",
  HR: "secondary",
  HOCVIEN: "outline",
};

const roleTranslations: Record<Role, string> = {
  ADMIN: "Quản trị viên",
  HR: "Nhân sự",
  HOCVIEN: "Học viên",
};

export const getColumns = (
  currentUser: User | null,
  handleViewDetails: (user: User) => void,
  handleEdit: (user: User) => void,
  handleDelete: (user: User) => void
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
        Tên
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-medium flex items-center gap-2">
        {row.original.fullName}
        {row.original.email === currentUser?.email && (
          <Badge variant="outline">Bạn</Badge>
        )}
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Vai trò",
    cell: ({ row }) => (
      <Badge variant={roleBadgeVariant[row.original.role]}>
        {roleTranslations[row.original.role]}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const statusName = row.original.userStatus?.name || "Không có";
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
      const user = row.original;
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
              {user.role === "HOCVIEN" && (
                <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                  <UserCircle2 className="mr-2 h-4 w-4" />
                  Xem chi tiết
                </DropdownMenuItem>
              )}
              {/* HR không thể sửa/xóa ADMIN */}
              {!(currentUser?.role === "HR" && user.role === "ADMIN") && (
                <>
                  <DropdownMenuItem onClick={() => handleEdit(user)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Chỉnh sửa
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDelete(user)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
