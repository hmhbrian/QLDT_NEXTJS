/**
 * Department Domain Types
 * All department-related interfaces and types
 */

// Frontend model for a department
export interface DepartmentInfo {
  departmentId: string;
  name?: string; // Keep for backward compatibility
  departmentName?: string; // Actual field from API
  code?: string;
  departmentCode?: string; // Actual field from API
  description?: string;
  parentId?: string | null;
  parentName?: string | null;
  managerId?: string | null;
  managerName?: string | null;
  status: string; // Changed to string to match API response
  level: number;
  path?: string[] | null;
  createdAt: string;
  updatedAt: string;
  children?: DepartmentInfo[];
}

// Department creation payload
export interface CreateDepartmentPayload {
  name: string;
  code: string;
  description?: string;
  status: "active" | "inactive";
  managerId?: string;
  parentId?: string | null;
}

// Department update payload
export type UpdateDepartmentPayload = Partial<CreateDepartmentPayload>;

// Alias for service-specific types for consistency
export type ServiceDepartment = DepartmentInfo;
