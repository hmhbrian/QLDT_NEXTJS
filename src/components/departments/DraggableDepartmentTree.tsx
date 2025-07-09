"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Building2, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DepartmentInfo } from "@/lib/types/department.types";
import {
  buildDepartmentTree,
  getAllChildDepartments,
} from "@/lib/utils/department-tree";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [dropTarget, setDropTarget] = useState<{
    id: string | null;
    isRoot: boolean;
  } | null>(null);

  // Buộc tạo lại departmentTree và departmentMap khi departments thay đổi
  const departmentTree = useMemo(
    () => buildDepartmentTree(departments),
    [departments]
  );
  const departmentMap = useMemo(() => {
    const map = new Map<string, DepartmentInfo>();
    departments.forEach((dept) => map.set(dept.departmentId, dept));
    return map;
  }, [departments]);

  // Reset trạng thái kéo thả khi departments thay đổi để tránh tham chiếu cũ
  // Và tự động mở rộng các phòng ban có con để hiển thị đầy đủ cấu trúc
  useEffect(() => {
    setDraggedDeptId(null);
    setDropTarget(null);

    // Tự động mở rộng tất cả phòng ban có con để hiển thị toàn bộ cấu trúc
    const departmentsWithChildren = departments.filter((dept) =>
      departments.some((d) => d.parentId === dept.departmentId)
    );

    if (departmentsWithChildren.length > 0) {
      setExpandedNodes(
        new Set(departmentsWithChildren.map((d) => d.departmentId))
      );
    }
  }, [departments]);

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

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
    setDraggedDeptId(id);
  };

  const handleDragEnd = () => {
    setDraggedDeptId(null);
    setDropTarget(null);
  };

  const handleDragOver = (
    e: React.DragEvent,
    id: string | null,
    isRoot: boolean
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (id !== draggedDeptId) {
      setDropTarget({ id, isRoot });
      e.dataTransfer.dropEffect = "move";
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string | null) => {
    e.preventDefault();
    e.stopPropagation();

    const draggedId = e.dataTransfer.getData("text/plain");
    handleDragEnd();

    if (draggedId === targetId) return;

    const sourceDept = departmentMap.get(draggedId);
    if (!sourceDept) return;
    if (sourceDept.parentId === targetId) return; // Thả vào chính parent của nó

    // Kiểm tra tham chiếu vòng tròn
    if (targetId !== null) {
      const childIds = getAllChildDepartments(draggedId, departments).map(
        (d) => d.departmentId
      );
      if (childIds.includes(targetId)) {
        console.error(
          "Phát hiện thả vòng tròn: không thể di chuyển phòng ban vào phòng ban con của chính nó."
        );
        return;
      }
    }

    const newParent = targetId ? departmentMap.get(targetId) : null;

    const updatedDepartmentsMap = new Map(
      departments.map((d) => [d.departmentId, { ...d }])
    );

    const updatedSourceDept = {
      ...sourceDept,
      parentId: targetId,
      level: newParent ? newParent.level + 1 : 1,
      path: newParent
        ? [...newParent.path, sourceDept.name]
        : [sourceDept.name],
    };
    updatedDepartmentsMap.set(draggedId, updatedSourceDept);

    const updateChildrenOf = (
      parentId: string,
      parentLevel: number,
      parentPath: string[]
    ) => {
      const childrenToUpdate = departments.filter(
        (d) => d.parentId === parentId
      );
      for (const child of childrenToUpdate) {
        const childData = updatedDepartmentsMap.get(child.departmentId)!;
        const newLevel = parentLevel + 1;
        const newPath = [...parentPath, childData.name];
        const updatedChild = { ...childData, level: newLevel, path: newPath };
        updatedDepartmentsMap.set(child.departmentId, updatedChild);
        updateChildrenOf(child.departmentId, newLevel, newPath);
      }
    };

    updateChildrenOf(
      draggedId,
      updatedSourceDept.level,
      updatedSourceDept.path
    );

    onUpdateDepartments(Array.from(updatedDepartmentsMap.values()));
  };

  // Helper function to find department in tree recursively
  const findDepartmentInTree = useCallback(
    (
      tree: (DepartmentInfo & { children?: DepartmentInfo[] })[],
      targetId: string
    ): (DepartmentInfo & { children?: DepartmentInfo[] }) | null => {
      for (const node of tree) {
        if (node.departmentId === targetId) {
          return node;
        }
        if (node.children) {
          const found = findDepartmentInTree(node.children, targetId);
          if (found) return found;
        }
      }
      return null;
    },
    []
  );

  const renderDepartmentNode = useCallback(
    (dept: DepartmentInfo, level: number) => {
      const hasChildren = departments.some(
        (d) => d.parentId === dept.departmentId
      );
      const isExpanded = expandedNodes.has(dept.departmentId);

      // Lấy thông tin mới nhất từ departmentMap để đảm bảo tooltip hiển thị đúng
      const currentDept = departmentMap.get(dept.departmentId) || dept;

      return (
        <React.Fragment
          key={`${dept.departmentId}-${currentDept.name}-${currentDept.code}`}
        >
          <Tooltip
            delayDuration={200}
            key={`tooltip-${dept.departmentId}-${currentDept.name}`}
          >
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "flex items-center py-1.5 px-2 rounded-md cursor-pointer transition-colors",
                  "hover:bg-muted",
                  dropTarget?.id === dept.departmentId &&
                    "bg-accent outline-dashed outline-1 outline-primary",
                  draggedDeptId === dept.departmentId && "opacity-40"
                )}
                style={{ paddingLeft: `${level * 20 + 8}px` }}
                draggable
                onDragStart={(e) => handleDragStart(e, dept.departmentId)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, dept.departmentId, false)}
                onDrop={(e) => handleDrop(e, dept.departmentId)}
                onClick={() => onSelectDepartment(currentDept)}
              >
                {hasChildren ? (
                  <div
                    className="w-4 h-4 mr-1 flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(dept.departmentId);
                    }}
                  >
                    {isExpanded ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </div>
                ) : (
                  <div className="w-4 h-4 mr-1"></div>
                )}
                <Building2 className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{currentDept.name}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" align="start">
              <p className="font-semibold">{currentDept.name}</p>
              <p className="text-xs text-muted-foreground">
                {currentDept.code}
              </p>
            </TooltipContent>
          </Tooltip>
          {isExpanded &&
            findDepartmentInTree(
              departmentTree,
              dept.departmentId
            )?.children?.map((child) => renderDepartmentNode(child, level + 1))}
        </React.Fragment>
      );
    },
    [
      departments,
      departmentMap,
      expandedNodes,
      dropTarget?.id,
      draggedDeptId,
      onSelectDepartment,
      departmentTree,
      findDepartmentInTree,
    ]
  );

  return (
    <div
      className={cn(
        "rounded-md border p-2 min-h-[300px] transition-colors space-y-0.5",
        dropTarget?.isRoot &&
          "bg-accent/50 outline-dashed outline-1 outline-primary",
        className
      )}
      onDragOver={(e) => handleDragOver(e, null, true)}
      onDrop={(e) => handleDrop(e, null)}
    >
      <TooltipProvider>
        {departmentTree.map((dept) => renderDepartmentNode(dept, 0))}
      </TooltipProvider>
    </div>
  );
}
