
"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  Pencil,
  Copy,
  Archive,
  Trash2,
  Eye,
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
import { getStatusBadgeVariant, isRegistrationOpen } from "@/lib/helpers";
import { formatDateVN } from "@/lib/utils/date.utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LoadingButton } from "../ui/loading";

// --- Types for different column configurations ---
type AdminActions = {
  handleEdit: (courseId: string) => void;
  handleDuplicateCourse: (course: Course) => void;
  setArchivingCourse: (course: Course | null) => void;
  setDeletingCourse: (course: Course | null) => void;
  canManageCourses: boolean;
};

type UserActions = {
  currentUserId: string | undefined;
  handleEnroll: (courseId: string) => void;
  isEnrolling: (courseId: string) => boolean;
  isCourseAccessible: (course: Course) => boolean;
  enrolledCourses: Course[];
  currentUserRole?: string;
};

// --- Reusable Column Definitions ---

const baseColumns = (
  handleViewDetails: (courseId: string) => void
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
];

const sharedInfoColumns = (
  departments: DepartmentInfo[],
  positions: Position[]
): ColumnDef<Course>[] => [
  {
    accessorKey: "courseCode",
    header: "Mã",
  },
  {
    accessorKey: "department",
    header: "Phòng ban",
    size: 160,
    cell: ({ row }) => {
      const departmentIds = row.original.department;
      if (!departmentIds || departmentIds.length === 0) return "N/A";

      const departmentNames = departmentIds.map((id) => {
        const foundDept = departments.find(
          (d) => String(d.departmentId) === String(id)
        );
        return foundDept ? foundDept.name : `Dept-${id}`;
      });

      const displayText =
        departmentNames.length > 1
          ? `${departmentNames[0]} +${departmentNames.length - 1}`
          : departmentNames.join(", ");

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="max-w-[160px] overflow-hidden truncate">
                {displayText}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {departmentNames.map((name, idx) => (
                <div key={idx}>• {name}</div>
              ))}
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
    cell: ({ row }) => {
      const levelIds = row.original.level;
      if (!levelIds || levelIds.length === 0) return "N/A";

      const levelNames = levelIds.map((id) => {
        const foundLevel = positions.find(
          (p) => String(p.positionId) === String(id)
        );
        return foundLevel ? foundLevel.positionName : `Level-${id}`;
      });

      const displayText =
        levelNames.length > 1
          ? `${levelNames[0]} +${levelNames.length - 1}`
          : levelNames.join(", ");
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="max-w-[120px] overflow-hidden truncate">
                {displayText}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {levelNames.map((name, idx) => (
                <div key={idx}>• {name}</div>
              ))}
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
      const statusName =
        typeof status === "object" && status && "name" in status && typeof status.name === "string"
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
];

const adminInfoColumns = (): ColumnDef<Course>[] => [
  {
    accessorKey: "createdBy",
    header: "Thông tin",
    size: 140,
    cell: ({ row }) => {
      const course = row.original;
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
                  <span className="truncate">
                    Tạo bởi: <strong>{createdByName}</strong>
                  </span>
                )}
                {modifiedByName && (
                  <span className="truncate">
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
                  Ngày sửa: {formatDateVN(course.modifiedAt, "dd/MM/yyyy HH:mm")}
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
];

const adminActionsColumn = (actions: AdminActions): ColumnDef<Course> => ({
  id: "actions",
  size: 60,
  enableResizing: false,
  enableSorting: false,
  enableHiding: false,
  meta: { sticky: "right" },
  cell: ({ row }) => {
    const course = row.original;
    if (!actions.canManageCourses) return null;
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
            <DropdownMenuItem onClick={() => actions.handleEdit(course.id)}>
              <Pencil className="mr-2 h-4 w-4" /> Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => actions.handleDuplicateCourse(course)}>
              <Copy className="mr-2 h-4 w-4" /> Nhân bản
            </DropdownMenuItem>
            {course.status !== "Hủy" && (
              <DropdownMenuItem onClick={() => actions.setArchivingCourse(course)}>
                <Archive className="mr-2 h-4 w-4" /> Lưu trữ
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => actions.setDeletingCourse(course)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  },
});

const userActionsColumn = (
  actions: UserActions,
  handleViewDetails: (id: string) => void
): ColumnDef<Course> => ({
  id: "actions",
  header: "Hành động",
  size: 120,
  enableResizing: false,
  cell: ({ row }) => {
    const course = row.original;
    const enrolledCourseIds = new Set(actions.enrolledCourses.map((c) => c.id));
    const isEnrolled = enrolledCourseIds.has(course.id);
    const registrationOpen = isRegistrationOpen(course.registrationDeadline);
    const canEnroll =
      actions.currentUserRole === "HOCVIEN" &&
      course.enrollmentType === "optional" &&
      !isEnrolled &&
      registrationOpen;

    if (canEnroll) {
      return (
        <LoadingButton
          size="sm"
          onClick={() => actions.handleEnroll(course.id)}
          isLoading={actions.isEnrolling(course.id)}
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
    if (
      actions.currentUserRole === "HOCVIEN" &&
      course.enrollmentType === "optional" &&
      !registrationOpen
    ) {
      return (
        <Button variant="outline" size="sm" disabled>
          Hết hạn đăng ký
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
              onClick={() =>
                actions.isCourseAccessible(course) &&
                handleViewDetails(course.id)
              }
              disabled={!actions.isCourseAccessible(course)}
            >
              Xem chi tiết
            </Button>
          </TooltipTrigger>
          {!actions.isCourseAccessible(course) && (
            <TooltipContent>
              <p>Khóa học này là nội bộ. Bạn không có quyền truy cập.</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  },
});

// --- Exported Functions to Get Columns ---

export const getAdminCourseColumns = (
  handleViewDetails: (courseId: string) => void,
  handleEdit: (courseId: string) => void,
  handleDuplicateCourse: (course: Course) => void,
  setArchivingCourse: (course: Course | null) => void,
  setDeletingCourse: (course: Course | null) => void,
  canManageCourses: boolean,
  departments: DepartmentInfo[],
  positions: Position[]
): ColumnDef<Course>[] => {
  const adminActions: AdminActions = {
    handleEdit,
    handleDuplicateCourse,
    setArchivingCourse,
    setDeletingCourse,
    canManageCourses,
  };

  return [
    ...baseColumns(handleViewDetails),
    ...sharedInfoColumns(departments, positions),
    ...adminInfoColumns(),
    adminActionsColumn(adminActions),
  ];
};

export const getUserCourseColumns = (
  handleViewDetails: (courseId: string) => void,
  actions: UserActions,
  departments: DepartmentInfo[],
  positions: Position[]
): ColumnDef<Course>[] => [
  ...baseColumns(handleViewDetails),
  { accessorKey: "category", header: "Danh mục" },
  { accessorKey: "instructor", header: "Giảng viên" },
  {
    accessorKey: "duration",
    header: "Thời lượng",
    cell: ({ row }) =>
      `${row.original.duration.sessions} buổi (${row.original.duration.hoursPerSession}h/buổi)`,
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
  userActionsColumn(actions, handleViewDetails),
];
