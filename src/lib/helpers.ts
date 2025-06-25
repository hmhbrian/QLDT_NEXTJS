import type { TraineeLevel, WorkStatus, CourseCategory } from "@/lib/types";
import { categoryOptions } from "@/lib/constants";

// --- Course Helpers ---

/**
 * Checks if the registration deadline for a course has passed.
 * @param deadline The registration deadline as an ISO date string.
 * @returns True if registration is still open, false otherwise.
 */
export const isRegistrationOpen = (deadline?: string | null): boolean => {
    if (!deadline) return true; // No deadline means it's always open
    const now = new Date();
    const deadlineDate = new Date(deadline);
    return now <= deadlineDate;
};

/**
 * Gets the display label for a given course category value.
 * @param categoryValue The category value (e.g., 'programming').
 * @returns The display label (e.g., 'Lập trình').
 */
export const getCategoryLabel = (categoryValue?: CourseCategory) => {
    if (!categoryValue) return "Chưa xác định";
    const option = categoryOptions.find((opt) => opt.value === categoryValue);
    return option ? option.label : categoryValue;
};


// --- User/Trainee Display Helpers ---

/**
 * Returns Tailwind CSS classes for a trainee level badge.
 * @param level The trainee's level.
 * @returns A string of CSS classes.
 */
export const getLevelBadgeColor = (level?: TraineeLevel) => {
    if (!level) return "bg-gray-100 text-gray-800";
    switch (level) {
      case "intern": return "bg-blue-100 text-blue-800";
      case "probation": return "bg-yellow-100 text-yellow-800";
      case "employee": return "bg-green-100 text-green-800";
      case "middle_manager": return "bg-purple-100 text-purple-800";
      case "senior_manager": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
};

/**
 * Returns Tailwind CSS classes for a work status badge.
 * @param status The user's work status.
 * @returns A string of CSS classes.
 */
export const getStatusColor = (status?: WorkStatus | string) => {
    if (!status) return "bg-gray-100 text-gray-800";
    switch (status) {
      case "working": return "bg-green-100 text-green-800 hover:bg-green-50 transition-colors";
      case "resigned": return "bg-red-100 text-red-800";
      case "suspended": return "bg-yellow-100 text-yellow-800";
      case "maternity_leave": return "bg-purple-100 text-purple-800";
      case "sick_leave": return "bg-orange-100 text-orange-800";
      case "sabbatical": return "bg-blue-100 text-blue-800";
      case "terminated": return "bg-destructive text-destructive-foreground";
      default: return "bg-gray-100 text-gray-800";
    }
};

/**
 * Returns the display text for a work status.
 * @param status The user's work status.
 * @returns The display text in Vietnamese.
 */
export const getStatusText = (status?: WorkStatus | string) => {
    if (!status) return "Không xác định";
    switch (status) {
      case "working": return "Đang làm việc";
      case "resigned": return "Đã nghỉ việc";
      case "suspended": return "Tạm nghỉ";
      case "maternity_leave": return "Nghỉ thai sản";
      case "sick_leave": return "Nghỉ bệnh dài hạn";
      case "sabbatical": return "Nghỉ phép dài hạn";
      case "terminated": return "Đã sa thải";
      default: return typeof status === 'string' ? status : "Không xác định";
    }
};
