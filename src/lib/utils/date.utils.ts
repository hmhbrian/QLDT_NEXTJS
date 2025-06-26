/**
 * Date Utilities
 * Utilities for date formatting and manipulation
 */

import { format, parseISO, isValid, differenceInDays } from "date-fns";
import { vi } from "date-fns/locale";

// Format date to Vietnamese format
export const formatDateVN = (
  date: string | Date,
  pattern: string = "dd/MM/yyyy"
) => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(dateObj)) return "Invalid date";
    return format(dateObj, pattern, { locale: vi });
  } catch {
    return "Invalid date";
  }
};

// Format date time to Vietnamese format
export const formatDateTimeVN = (date: string | Date) => {
  return formatDateVN(date, "dd/MM/yyyy HH:mm");
};

// Get relative time (e.g., "2 days ago")
export const getRelativeTime = (date: string | Date) => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(dateObj)) return "Invalid date";

    const days = differenceInDays(new Date(), dateObj);

    if (days === 0) return "Hôm nay";
    if (days === 1) return "Hôm qua";
    if (days < 7) return `${days} ngày trước`;
    if (days < 30) return `${Math.floor(days / 7)} tuần trước`;
    if (days < 365) return `${Math.floor(days / 30)} tháng trước`;
    return `${Math.floor(days / 365)} năm trước`;
  } catch {
    return "Invalid date";
  }
};

// Convert to ISO string safely
export const toISOString = (date: string | Date) => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(dateObj)) return null;
    return dateObj.toISOString();
  } catch {
    return null;
  }
};

// Check if date is in the past
export const isPastDate = (date: string | Date) => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(dateObj)) return false;
    return dateObj < new Date();
  } catch {
    return false;
  }
};
