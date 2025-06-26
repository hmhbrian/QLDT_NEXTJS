/**
 * Form Utilities
 * Utilities for form handling and validation
 */

import { z } from "zod";

// Email validation schema
export const emailSchema = z.string().email("Invalid email address");

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/\d/, "Password must contain at least one number");

// Phone number validation schema
export const phoneSchema = z
  .string()
  .regex(/^[0-9+\-\s()]+$/, "Invalid phone number format");

// ID card validation schema (Vietnamese ID card)
export const idCardSchema = z
  .string()
  .regex(/^[0-9]{9,12}$/, "ID card must be 9-12 digits");

// Common form field validation
export const requiredString = (fieldName: string) =>
  z.string().min(1, `${fieldName} is required`);

// Optional string with min length
export const optionalString = (minLength: number = 0) =>
  z.string().min(minLength).optional().or(z.literal(""));

// Date validation helpers
export const dateSchema = z.string().datetime().or(z.date());
export const optionalDateSchema = dateSchema.optional().or(z.literal(""));

// Form data sanitization
export const sanitizeFormData = (data: Record<string, any>) => {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") {
      sanitized[key] = value.trim();
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

// Form error formatting
export const formatFormErrors = (errors: Record<string, string[]>) => {
  const formatted: Record<string, string> = {};

  for (const [field, messages] of Object.entries(errors)) {
    formatted[field] = messages[0]; // Take first error message
  }

  return formatted;
};

// Legacy functions from form.ts - to be migrated gradually

/**
 * Build FormData from object (only valid fields, removing undefined/null)
 * @deprecated Use modern form handling libraries like react-hook-form instead
 */
export function buildFormData(obj: Record<string, any>): FormData {
  const formData = new FormData();
  Object.entries(obj).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v !== undefined && v !== null && v !== "") {
          formData.append(key, v.toString());
        }
      });
    } else if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value.toString());
    }
  });
  return formData;
}

/**
 * Get API token (prefer becamex-token, fallback to accessToken)
 * @deprecated This should be handled by auth service
 */
export function getApiToken(): string {
  if (typeof window !== "undefined") {
    return (
      localStorage.getItem("becamex-token") ||
      localStorage.getItem("accessToken") ||
      ""
    );
  }
  return "";
}
