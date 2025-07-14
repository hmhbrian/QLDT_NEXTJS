import type {
  DepartmentApiResponse,
  DepartmentInfo,
} from "@/lib/types/department.types";

export function mapDepartmentApiToUi(
  apiDept: DepartmentApiResponse
): DepartmentInfo {
  return {
    departmentId: String(apiDept.departmentId),
    name: apiDept.departmentName || "N/A",
    code: apiDept.departmentCode || "N/A",
    description: apiDept.description,
    parentId: apiDept.parentId ? String(apiDept.parentId) : null,
    parentName: apiDept.parentName,
    managerId: apiDept.managerId,
    managerName: apiDept.managerName,
    status: apiDept.status || { id: 0, name: "Unknown" },
    level: apiDept.level,
    path: apiDept.path || [],
    createdAt: apiDept.createdAt,
    updatedAt: apiDept.updatedAt,
    children: (apiDept.children || []).map(mapDepartmentApiToUi),
  };
}
