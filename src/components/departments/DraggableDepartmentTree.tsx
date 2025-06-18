"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Building2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DepartmentInfo } from "@/lib/types";
import {
  buildDepartmentTree,
  validateDepartmentTree,
} from "@/lib/utils/department-tree";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DraggableDepartmentTreeProps {
  departments: DepartmentInfo[];
  onSelectDepartment: (department: DepartmentInfo) => void;
  onUpdateDepartments: (departments: DepartmentInfo[]) => void;
  className?: string;
}

export function DraggableDepartmentTree({
  departments,
  onSelectDepartment,
  onUpdateDepartments,
  className,
}: DraggableDepartmentTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [draggedDeptId, setDraggedDeptId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  // Kiểm tra tính hợp lệ của cấu trúc cây phòng ban
  const validation = useMemo(
    () => validateDepartmentTree(departments),
    [departments]
  );

  // Xây dựng cấu trúc cây phòng ban
  const departmentTree = useMemo(
    () => buildDepartmentTree(departments),
    [departments]
  );

  // Tạo bảng tra cứu phòng ban để truy cập nhanh hơn
  const departmentMap = useMemo(() => {
    const map = new Map<string, DepartmentInfo>();
    departments.forEach((dept) => map.set(dept.id, dept));
    return map;
  }, [departments]);

  // Làm phẳng cấu trúc cây cho các thao tác nhưng vẫn giữ thông tin phân cấp
  const flatItems = useMemo(() => {
    const flattenedTreeWithLevels = (
      items: (DepartmentInfo & { children?: DepartmentInfo[] })[],
      level = 0,
      result: {
        id: string;
        level: number;
        item: DepartmentInfo & { children?: DepartmentInfo[] };
      }[] = []
    ) => {
      items.forEach((item) => {
        result.push({
          id: item.id,
          level,
          item,
        });

        if (item.children && item.children.length > 0) {
          flattenedTreeWithLevels(item.children, level + 1, result);
        }
      });

      return result;
    };

    return flattenedTreeWithLevels(departmentTree);
  }, [departmentTree]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDraggedDeptId(id);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();

      // Chỉ đặt mục tiêu thả nếu nó khác với mục tiêu hiện tại
      if (dropTarget !== id) {
        setDropTarget(id);
      }

      // Đặt hiệu ứng thả thành 'move'
      e.dataTransfer.dropEffect = "move";
    },
    [dropTarget]
  );

  const handleDragLeave = useCallback(() => {
    setDropTarget(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetId: string) => {
      e.preventDefault();
      e.stopPropagation();

      // Xóa mục tiêu thả
      setDropTarget(null);

      // Lấy ID phòng ban đang được kéo
      const draggedId = e.dataTransfer.getData("text/plain");

      // Không làm gì nếu thả vào chính nó
      if (draggedId === targetId) {
        return;
      }

      // Tìm phòng ban nguồn và đích sử dụng map để tra cứu nhanh
      const sourceDept = departmentMap.get(draggedId);
      const targetDept = departmentMap.get(targetId);

      if (sourceDept && targetDept) {
        // Kiểm tra xem đích có phải là con cháu của nguồn không (ngăn tham chiếu vòng tròn)
        let current = targetDept;
        let hasCircularRef = false;

        while (current.parentId) {
          if (current.parentId === draggedId) {
            // Đích là con cháu của nguồn, không thể di chuyển
            hasCircularRef = true;
            break;
          }
          const parent = departmentMap.get(current.parentId);
          if (!parent) break;
          current = parent;
        }

        if (hasCircularRef) {
          // Có thể hiển thị thông báo lỗi ở đây
          return;
        }

        // Cập nhật mối quan hệ cha-con
        const updatedDepartments = departments.map((dept) => {
          if (dept.id === draggedId) {
            // Cập nhật phòng ban nguồn
            const newParentId = targetId;

            // Tính toán đường dẫn và cấp độ mới
            const newPath = [...targetDept.path, dept.name];
            const newLevel = targetDept.level + 1;

            return {
              ...dept,
              parentId: newParentId,
              path: newPath,
              level: newLevel,
            };
          }

          // Nếu đây là con của phòng ban đang được kéo, cập nhật đường dẫn và cấp độ
          if (dept.parentId === draggedId) {
            const draggedDept = departmentMap.get(draggedId);
            if (draggedDept) {
              const pathDiff = dept.level - draggedDept.level;
              return {
                ...dept,
                path: [
                  ...targetDept.path,
                  draggedDept.name,
                  ...dept.path.slice(draggedDept.path.length),
                ],
                level: targetDept.level + 1 + pathDiff,
              };
            }
          }

          return dept;
        });

        // Kiểm tra tính hợp lệ của cây đã cập nhật trước khi áp dụng thay đổi
        const newValidation = validateDepartmentTree(updatedDepartments);
        if (newValidation.valid) {
          onUpdateDepartments(updatedDepartments);
        } else {
          // Có thể hiển thị lỗi ở đây
          console.error(
            "Thao tác không hợp lệ sẽ tạo ra vấn đề:",
            newValidation.issues
          );
        }
      }

      setDraggedDeptId(null);
    },
    [departments, departmentMap, onUpdateDepartments]
  );

  // Hỗ trợ thả vào cấp độ gốc (biến một phòng ban thành phòng ban cấp cao nhất)
  const handleRootDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Xóa mục tiêu thả
      setDropTarget(null);

      // Lấy ID phòng ban đang được kéo
      const draggedId = e.dataTransfer.getData("text/plain");

      // Tìm phòng ban nguồn
      const sourceDept = departmentMap.get(draggedId);

      if (sourceDept) {
        // Cập nhật để biến nó thành phòng ban gốc
        const updatedDepartments = departments.map((dept) => {
          if (dept.id === draggedId) {
            return {
              ...dept,
              parentId: undefined,
              path: [dept.name],
              level: 1,
            };
          }

          // Nếu đây là con của phòng ban đang được kéo, cập nhật đường dẫn và cấp độ
          if (dept.parentId === draggedId) {
            const draggedDept = departmentMap.get(draggedId);
            if (draggedDept) {
              const pathDiff = dept.level - draggedDept.level;
              return {
                ...dept,
                path: [
                  draggedDept.name,
                  ...dept.path.slice(draggedDept.path.length),
                ],
                level: 1 + pathDiff,
              };
            }
          }

          return dept;
        });

        // Kiểm tra trước khi áp dụng thay đổi
        const newValidation = validateDepartmentTree(updatedDepartments);
        if (newValidation.valid) {
          onUpdateDepartments(updatedDepartments);
        } else {
          console.error(
            "Thao tác không hợp lệ sẽ tạo ra vấn đề:",
            newValidation.issues
          );
        }
      }

      setDraggedDeptId(null);
    },
    [departments, departmentMap, onUpdateDepartments]
  );

  // Hiển thị vấn đề xác thực nếu có
  if (!validation.valid && validation.issues) {
    return (
      <div className={className}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Có lỗi trong cấu trúc phòng ban</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5 text-sm mt-2">
              {validation.issues.slice(0, 3).map((issue, index) => (
                <li key={index}>{issue.details}</li>
              ))}
              {validation.issues.length > 3 && (
                <li>...và {validation.issues.length - 3} lỗi khác</li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Xử lý trạng thái trống
  if (departments.length === 0) {
    return (
      <div className={cn("rounded-md border p-4 text-center", className)}>
        <Building2 className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
        <p className="text-muted-foreground">Chưa có phòng ban nào.</p>
      </div>
    );
  }

  return (
    <div
      className={cn("rounded-md border p-2", className)}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "move";
      }}
      onDrop={handleRootDrop}
    >
      <TooltipProvider>
        {flatItems.map(({ id, level, item }) => {
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedNodes.has(id);

          // If parent is not expanded, don't show children
          if (level > 0) {
            const parentIds = [];
            let currentItem = item;
            let currentLevel = level;

            while (currentLevel > 0 && currentItem.parentId) {
              const parent = departmentMap.get(currentItem.parentId);
              if (parent) {
                parentIds.push(parent.id);
                currentItem = parent;
                currentLevel--;
              } else {
                break;
              }
            }

            // Check if all parent nodes are expanded
            const allParentsExpanded = parentIds.every((pid) =>
              expandedNodes.has(pid)
            );
            if (!allParentsExpanded) {
              return null;
            }
          }

          return (
            <Tooltip key={id} delayDuration={0}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "flex items-center py-1 px-2 rounded-sm cursor-pointer",
                    "hover:bg-muted",
                    "draggable-item",
                    dropTarget === id &&
                      "bg-accent/50 outline outline-primary/30",
                    draggedDeptId === id && "opacity-50"
                  )}
                  style={{ paddingLeft: `${level * 16 + 4}px` }}
                  onClick={() => onSelectDepartment(item)}
                  draggable
                  onDragStart={(e) => handleDragStart(e, id)}
                  onDragOver={(e) => handleDragOver(e, id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, id)}
                >
                  {hasChildren ? (
                    <span
                      className="mr-1 h-4 w-4 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(id);
                      }}
                    >
                      {isExpanded ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="m18 15-6-6-6 6" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      )}
                    </span>
                  ) : (
                    <span className="mr-1 w-4" />
                  )}
                  <Building2 className="h-4 w-4 mr-2" />
                  <span className="truncate">{item.name}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" align="start">
                <div className="space-y-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Mã: {item.code}
                  </p>
                  {item.description && (
                    <p className="text-xs max-w-60 truncate">
                      {item.description}
                    </p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>
    </div>
  );
}
