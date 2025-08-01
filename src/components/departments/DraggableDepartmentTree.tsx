
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
  onUpdateDepartments: (
    draggedDept: DepartmentInfo,
    newParentId: string | null
  ) => void;
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

  const departmentTree = useMemo(
    () => buildDepartmentTree(departments),
    [departments]
  );
  const departmentMap = useMemo(() => {
    const map = new Map<string, DepartmentInfo>();
    departments.forEach((dept) => map.set(dept.departmentId, dept));
    return map;
  }, [departments]);

  useEffect(() => {
    setDraggedDeptId(null);
    setDropTarget(null);

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

    if (targetId !== null) {
      const childIds = getAllChildDepartments(draggedId, departments).map(
        (d) => d.departmentId
      );
      if (childIds.includes(targetId)) {
        console.error("Circular drop detected.");
        return;
      }
    }

    onUpdateDepartments(sourceDept, targetId);
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
      handleDragStart,
      handleDragEnd,
      handleDragOver,
      handleDrop,
      toggleExpand
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
