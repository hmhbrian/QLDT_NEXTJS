/**
 * Department Domain Types
 * All department-related interfaces and types
 */

import type { Status } from "./status.types";

// --- Frontend UI Model ---
export interface DepartmentInfo {
  departmentId: number;
  name: string;
  code: string;
  description?: string;
  parentId?: number | null;
  parentName?: string | null;
  managerId?: string | null;
  managerName?: string | null;
  status: Status; // Now an object
  level: number;
  path: string[];
  createdAt: string;
  updatedAt: string;
  children?: DepartmentInfo[];
}

// --- API Request Payloads ---
export interface CreateDepartmentPayload {
  DepartmentName: string;
  DepartmentCode: string;
  Description?: string;
  StatusId?: number;
  ManagerId?: string;
  ParentId?: number | null;
}

export type UpdateDepartmentPayload = Partial<CreateDepartmentPayload>;

// --- API Response DTO ---
export interface DepartmentApiResponse {
  departmentId: number;
  departmentName?: string;
  departmentCode?: string;
  description?: string;
  parentId?: number | null;
  parentName?: string | null;
  managerId?: string | null;
  managerName?: string | null;
  status?: Status;
  level: number;
  path: string[];
  createdAt: string;
  updatedAt: string;
  children?: DepartmentApiResponse[];
}
