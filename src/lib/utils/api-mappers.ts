/**
 * Optimized API Data Utilities
 * Simple, fast data extraction and mapping
 */

import type { DepartmentInfo } from "@/lib/types/department.types";
import type { Course } from "@/lib/types/course.types";

/**
 * Fast department mapping - only map essential fields
 */
export function mapDepartmentApiToUi(dept: any): DepartmentInfo {
  return {
    departmentId: dept.departmentId,
    name: dept.departmentName || dept.name || "",
    code: dept.departmentCode || dept.code || "",
    description: dept.description || "",
    parentId: dept.parentId || null,
    parentName: dept.parentName || null,
    managerId: dept.managerId || null,
    managerName: dept.managerName || null,
    status: dept.status || { id: 1, name: "Hoạt động" },
    level: dept.level || 0,
    path: dept.path || [],
    createdAt: dept.createdAt || "",
    updatedAt: dept.updatedAt || "",
  };
}

/**
 * Fast course mapping - only map essential fields
 */
export function mapCourseApiToUi(course: any): Course {
  return {
    ...course,
    title: course.name || course.title || "",
    courseCode: course.code || course.courseCode || "",
    image: course.thumbUrl || course.image || "/placeholder-course.jpg",
    instructor: "Không có",
    department:
      course.departments?.map((d: any) => String(d.departmentId || d.id)) ||
      course.department ||
      [],
    level:
      course.EmployeeLevel?.map((p: any) => String(p.eLevelId || p.id)) ||
      course.level ||
      [],
  };
}

/**
 * Fast array check
 */
export function ensureArray<T>(data: any): T[] {
  return Array.isArray(data) ? data : [];
}

/**
 * Fast data extraction from API wrapper
 */
export function extractApiData<T>(response: any): T {
  return response?.data !== undefined ? response.data : response;
}
