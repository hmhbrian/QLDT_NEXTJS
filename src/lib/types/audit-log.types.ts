/**
 * Audit Log Types
 * Types for audit log functionality
 */

export interface FieldChange {
  fieldName: string;
  oldValue?: string;
  newValue?: string;
  value?: any; // For addedFields
}

export interface AuditLogEntry {
  id: number;
  action: "Added" | "Modified" | "Deleted";
  entityName: string;
  entityId: string;
  userName: string;
  timestamp: string;
  changedFields: FieldChange[];
  addedFields: FieldChange[];
  deletedFields: FieldChange[];
}

export interface AuditLogResponse {
  success: boolean;
  message: string | null;
  data: AuditLogEntry[];
}

export interface AuditLogParams extends Record<string, unknown> {
  courseId?: string;
  userId?: string;
  entityName?: string;
  action?: "Added" | "Modified" | "Deleted";
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
