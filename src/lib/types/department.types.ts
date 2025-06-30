
/**
 * Department Domain Types
 * All department-related interfaces and types
 */

// Frontend model for a department
export interface DepartmentInfo {
  departmentId: string;
  name: string; 
  code: string;
  description?: string;
  parentId?: string | null;
  parentName?: string | null;
  managerId?: string | null;
  managerName?: string | null;
  status: string;
  statusId?: number;
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
  statusId?: string;
  managerId?: string;
  parentId?: string | null;
}

// Department update payload
export type UpdateDepartmentPayload = Partial<CreateDepartmentPayload>;

// Alias for service-specific types for consistency
export type ServiceDepartment = DepartmentInfo;
