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

// --- Local date helpers for date-only fields (avoid timezone shifts) ---

// Format a Date to local YYYY-MM-DD (no timezone conversion)
export const formatLocalYMD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Extract YYYY-MM-DD from a string (supports ISO or YMD). Returns undefined if invalid
export const extractYMD = (dateString?: string | null): string | undefined => {
  if (!dateString) return undefined;
  try {
    const trimmed = String(dateString).trim();
    if (trimmed.length >= 10 && /\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.slice(0, 10);
    }
    return undefined;
  } catch {
    return undefined;
  }
};

// Parse YYYY-MM-DD to a Date constructed in local time
export const parseYMDToLocalDate = (
  ymd?: string | null
): Date | undefined => {
  const part = extractYMD(ymd);
  if (!part) return undefined;
  const [y, m, d] = part.split("-").map((v) => parseInt(v, 10));
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
};

// Build API datetime string at start of day with UTC designator (Z)
// Input expected as YYYY-MM-DD; output example: 2025-08-12T00:00:00.000Z
export const toApiDateStartOfDay = (
  ymd?: string | null
): string | undefined => {
  const part = extractYMD(ymd);
  if (!part) return undefined;
  const [y, m, d] = part.split("-").map((v) => parseInt(v, 10));
  if (!y || !m || !d) return undefined;
  // Construct date at UTC start-of-day to avoid timezone shifts
  const utcStart = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
  return utcStart.toISOString();
};
