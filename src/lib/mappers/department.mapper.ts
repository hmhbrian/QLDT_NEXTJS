import type {
  DepartmentApiResponse,
  DepartmentInfo,
} from "@/lib/types/department.types";

export function mapDepartmentApiToUi(
  apiDept: DepartmentApiResponse
): DepartmentInfo {
  const uiDept: DepartmentInfo = {
    departmentId: apiDept.departmentId,
    name: apiDept.departmentName || "Không có",
    code: apiDept.departmentCode || "Không có",
    description: apiDept.description,
    parentId: apiDept.parentId ? apiDept.parentId : null,
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
  return uiDept;
}
