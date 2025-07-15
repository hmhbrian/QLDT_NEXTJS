"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { Course } from "@/lib/types/course.types";
import { isRegistrationOpen } from "@/lib/helpers";
import { LoadingButton } from "@/components/ui/loading";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const getColumns = (
  currentUserId: string | undefined,
  handleEnroll: (courseId: string) => void,
  handleViewDetails: (courseId: string) => void,
  isEnrolling: (courseId: string) => boolean,
  isCourseAccessible: (course: Course) => boolean
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
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Tên khóa học
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
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
    accessorKey: "category",
    header: "Danh mục",
  },
  {
    accessorKey: "instructor",
    header: "Giảng viên",
  },
  {
    accessorKey: "duration",
    header: "Thời lượng",
    cell: ({ row }) => {
      const { sessions, hoursPerSession } = row.original.duration;
      return `${sessions} buổi (${hoursPerSession}h/buổi)`;
    },
  },
  {
    accessorKey: "enrollmentType",
    header: "Loại",
    cell: ({ row }) => (
      <Badge
        variant={
          row.original.enrollmentType === "mandatory" ? "default" : "secondary"
        }
      >
        {row.original.enrollmentType === "mandatory" ? "Bắt buộc" : "Tùy chọn"}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "Hành động",
    cell: ({ row }) => {
      const course = row.original;
      const isEnrolled = course.userIds?.includes(currentUserId || "");
      const canEnroll =
        currentUserId &&
        course.enrollmentType === "optional" &&
        !isEnrolled &&
        isRegistrationOpen(course.registrationDeadline);

      const accessible = isCourseAccessible(course);

      if (canEnroll) {
        return (
          <LoadingButton
            size="sm"
            onClick={() => handleEnroll(course.id)}
            isLoading={isEnrolling(course.id)}
          >
            Đăng ký
          </LoadingButton>
        );
      }

      if (isEnrolled) {
        return (
          <Button
            variant="default"
            size="sm"
            onClick={() => handleViewDetails(course.id)}
          >
            <Eye className="mr-2 h-4 w-4" /> Vào học
          </Button>
        );
      }

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => accessible && handleViewDetails(course.id)}
                disabled={!accessible}
              >
                Xem chi tiết
              </Button>
            </TooltipTrigger>
            {!accessible && (
              <TooltipContent>
                <p>Khóa học này là nội bộ. Bạn không có quyền truy cập.</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
];
