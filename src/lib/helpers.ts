import type { Status } from "@/lib/types/status.types";

export const COURSE_STATUSES: Status[] = [
  { id: 1, name: "Lưu nháp" },
  { id: 2, name: "Sắp khai giảng" },
  { id: 3, name: "Đang mở" },
  { id: 4, name: "Đã kết thúc" },
  { id: 5, name: "Hủy" },
];

export function getStatusNameFromId(statusId?: number): string | undefined {
  if (statusId === undefined) return undefined;
  return COURSE_STATUSES.find((s) => s.id === statusId)?.name;
}

export function getStatusIdFromName(statusName?: string): number | undefined {
  if (statusName === undefined) return undefined;
  return COURSE_STATUSES.find((s) => s.name === statusName)?.id;
}

export const getStatusBadgeVariant = (
  statusName: string | undefined
): "default" | "destructive" | "outline" | "secondary" => {
  switch (statusName) {
    case "Đang mở":
      return "default";
    case "Lưu nháp":
    case "Sắp khai giảng":
      return "secondary";
    case "Đã kết thúc":
    case "Hủy":
      return "destructive";
    default:
      return "outline";
  }
};

export const getStatusColor = (status: string) => {
  const colorMap: { [key: string]: string } = {
    "Đang làm việc": "bg-green-100 text-green-800",
    "Đang hoạt động": "bg-primary text-primary-foreground hover:bg-primary/90",
    "Đang nghỉ phép": "bg-yellow-100 text-yellow-800",
    "Đã nghỉ việc": "bg-red-100 text-red-800",
    "Không hoạt động": "bg-gray-100 text-gray-800",
  };
  return colorMap[status] || "bg-gray-100 text-gray-800";
};

// --- Course Helpers ---

export const isRegistrationOpen = (
  deadline: string | null | undefined
): boolean => {
  if (!deadline) return true;
  return new Date(deadline) >= new Date();
};

export const getCategoryLabel = (
  categoryValue:
    | string
    | { id: number; categoryName: string }
    | null
    | undefined
): string => {
  if (!categoryValue) return "Chung";

  // If categoryValue is an object with categoryName property
  if (
    typeof categoryValue === "object" &&
    categoryValue !== null &&
    "categoryName" in categoryValue
  ) {
    const categoryName = categoryValue.categoryName;
    return categoryName
      ? categoryName.charAt(0).toUpperCase() + categoryName.slice(1)
      : "Chung";
  }

  // If categoryValue is a string
  if (typeof categoryValue === "string") {
    return categoryValue.charAt(0).toUpperCase() + categoryValue.slice(1);
  }

  return "Chung";
};

export const getLevelBadgeColor = (
  level: string
):
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "success"
  | "warning" => {
  switch (level) {
    case "senior_manager":
      return "default";
    case "employee":
      return "secondary";
    case "intern":
      return "outline";
    default:
      return "outline";
  }
};
