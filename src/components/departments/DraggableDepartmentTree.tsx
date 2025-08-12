"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Building2,
  ChevronRight,
  ChevronDown,
  Search,
  X,
  ExpandIcon,
  Minimize2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DepartmentInfo } from "@/lib/types/department.types";
import {
  buildDepartmentTree,
  getAllChildDepartments,
} from "@/lib/utils/department-tree";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

interface DraggableDepartmentTreeProps {
  departments: DepartmentInfo[];
  onSelectDepartment: (department: DepartmentInfo) => void;
  onUpdateDepartments: (
    draggedDept: DepartmentInfo,
    newParentId: number | null
  ) => void;
  className?: string;
}

export function DraggableDepartmentTree({
  departments,
  onSelectDepartment,
  onUpdateDepartments,
  className,
}: DraggableDepartmentTreeProps) {
  const { toast } = useToast();
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [draggedDeptId, setDraggedDeptId] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    id: number | null;
    isRoot: boolean;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);

  const departmentTree = useMemo(
    () => buildDepartmentTree(departments),
    [departments]
  );

  const departmentMap = useMemo(() => {
    const map = new Map<number, DepartmentInfo>();
    departments.forEach((dept) => map.set(dept.departmentId, dept));
    return map;
  }, [departments]);

  // Filter departments based on search
  const filteredDepartments = useMemo(() => {
    if (!searchTerm.trim()) return departments;

    const term = searchTerm.toLowerCase();
    return departments.filter(
      (dept) =>
        dept.name.toLowerCase().includes(term) ||
        dept.code.toLowerCase().includes(term) ||
        dept.description?.toLowerCase().includes(term)
    );
  }, [departments, searchTerm]);

  const filteredTree = useMemo(() => {
    if (!searchTerm.trim()) return departmentTree;
    return buildDepartmentTree(filteredDepartments);
  }, [departmentTree, filteredDepartments, searchTerm]);

  useEffect(() => {
    setDraggedDeptId(null);
    setDropTarget(null);

    // Auto-expand departments with children
    const departmentsWithChildren = departments.filter((dept) =>
      departments.some((d) => d.parentId === dept.departmentId)
    );

    if (departmentsWithChildren.length > 0) {
      setExpandedNodes(
        new Set(departmentsWithChildren.map((d) => d.departmentId))
      );
    }
  }, [departments]);

  const toggleExpand = useCallback((id: number) => {
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

  const expandAll = useCallback(() => {
    const allParentIds = departments
      .filter((dept) =>
        departments.some((d) => d.parentId === dept.departmentId)
      )
      .map((dept) => dept.departmentId);
    setExpandedNodes(new Set(allParentIds));
  }, [departments]);

  const collapseAll = useCallback(() => {
    setExpandedNodes(new Set());
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  const handleDragStart = (e: React.DragEvent, id: number) => {
    e.dataTransfer.setData("text/plain", String(id));
    e.dataTransfer.effectAllowed = "move";
    setDraggedDeptId(id);
  };

  const handleDragEnd = () => {
    setDraggedDeptId(null);
    setDropTarget(null);
  };

  const handleDragOver = (
    e: React.DragEvent,
    id: number | null,
    isRoot: boolean
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (id !== draggedDeptId) {
      setDropTarget({ id, isRoot });
      e.dataTransfer.dropEffect = "move";
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: number | null) => {
    e.preventDefault();
    e.stopPropagation();

    const draggedIdStr = e.dataTransfer.getData("text/plain");
    const draggedId = Number(draggedIdStr);
    handleDragEnd();

    if (draggedId === targetId) {
      const sourceDept = departmentMap.get(draggedId);
      if (sourceDept) {
        toast({
          title: "Không hợp lệ",
          description: `Không thể thả phòng ban "${sourceDept.name}" vào chính nó.`,
          variant: "warning",
        });
      }
      return;
    }

    const sourceDept = departmentMap.get(draggedId);
    if (!sourceDept) return;

    // Check if dropping on same parent
    const isDroppingOnSameParent =
      (sourceDept.parentId === null && targetId === null) ||
      sourceDept.parentId === targetId;
    if (isDroppingOnSameParent) {
      toast({
        title: "Không có thay đổi",
        description: `Phòng ban "${sourceDept.name}" đã thuộc phòng ban này.`,
        variant: "warning",
      });
      return;
    }

    // Prevent circular dependency
    if (targetId !== null) {
      const childIds = getAllChildDepartments(draggedId, departments).map(
        (d) => d.departmentId
      );
      if (childIds.includes(targetId)) {
        toast({
          title: "Không hợp lệ",
          description:
            "Không thể di chuyển phòng ban vào một phòng ban con của chính nó.",
          variant: "destructive",
        });
        return;
      }
    }

    onUpdateDepartments(sourceDept, targetId);
  };

  const findDepartmentInTree = useCallback(
    (
      tree: (DepartmentInfo & { children?: DepartmentInfo[] })[],
      targetId: number
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
      const isSelected = selectedDeptId === dept.departmentId;
      const isDragged = draggedDeptId === dept.departmentId;
      const isDropTarget = dropTarget?.id === dept.departmentId;

      const currentDept = departmentMap.get(dept.departmentId) || dept;

      return (
        <React.Fragment key={dept.departmentId}>
          <div
            className={cn(
              "flex items-center py-2 px-3 rounded cursor-pointer",
              "hover:bg-muted/50",
              isSelected && "bg-primary/10 border-l-4 border-primary",
              isDropTarget &&
                "bg-primary/10 border-2 border-primary/40 border-dashed",
              isDragged && "opacity-50"
            )}
            style={{ paddingLeft: `${level * 20 + 12}px` }}
            draggable
            onDragStart={(e) => handleDragStart(e, dept.departmentId)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, dept.departmentId, false)}
            onDrop={(e) => handleDrop(e, dept.departmentId)}
            onClick={() => {
              setSelectedDeptId(dept.departmentId);
              onSelectDepartment(currentDept);
            }}
          >
            {/* Expand/Collapse Button */}
            {hasChildren ? (
              <button
                className="w-4 h-4 mr-2 flex items-center justify-center hover:bg-muted rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(dept.departmentId);
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </button>
            ) : (
              <div className="w-4 h-4 mr-2"></div>
            )}

            {/* Department Icon */}
            <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />

            {/* Department Name */}
            <span className="flex-1 text-sm truncate">{currentDept.name}</span>

            {/* Child Count Badge */}
            {hasChildren && (
              <Badge variant="secondary" className="text-xs ml-2">
                {
                  departments.filter((d) => d.parentId === dept.departmentId)
                    .length
                }
              </Badge>
            )}
          </div>

          {/* Render Children */}
          {isExpanded &&
            findDepartmentInTree(
              searchTerm.trim() ? filteredTree : departmentTree,
              dept.departmentId
            )?.children?.map((child) => renderDepartmentNode(child, level + 1))}
        </React.Fragment>
      );
    },
    [
      departments,
      departmentMap,
      expandedNodes,
      selectedDeptId,
      draggedDeptId,
      dropTarget,
      searchTerm,
      onSelectDepartment,
      departmentTree,
      filteredTree,
      findDepartmentInTree,
      handleDragStart,
      handleDragEnd,
      handleDragOver,
      handleDrop,
      toggleExpand,
    ]
  );

  return (
    <div className={cn("space-y-3", className)}>
      {/* Search and Controls */}
      <div className="p-3 border rounded bg-muted/40">
        <div className="flex items-center gap-2 w-full">
          <div className="relative flex-1">
            {/* Search Bar */}
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm phòng ban..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-8"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                onClick={clearSearch}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          {/* Control Buttons */}

          <Button variant="outline" size="sm" onClick={expandAll}>
            <ExpandIcon className="h-3 w-3 mr-1" />
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>
            <Minimize2 className="h-3 w-3 mr-1" />
          </Button>
          {searchTerm && (
            <Badge variant="secondary" className="ml-auto">
              {filteredDepartments.length} kết quả
            </Badge>
          )}
        </div>
      </div>

      {/* Tree Container */}
      <div
        className={cn(
          "border rounded bg-card p-3 min-h-[400px]",
          dropTarget?.isRoot && "bg-primary/10 border-primary/40 border-dashed"
        )}
        onDragOver={(e) => handleDragOver(e, null, true)}
        onDrop={(e) => handleDrop(e, null)}
      >
        <div className="space-y-1">
          {(searchTerm.trim() ? filteredTree : departmentTree).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>
                {searchTerm.trim()
                  ? "Không tìm thấy phòng ban"
                  : "Chưa có phòng ban nào"}
              </p>
            </div>
          ) : (
            (searchTerm.trim() ? filteredTree : departmentTree).map((dept) =>
              renderDepartmentNode(dept, 0)
            )
          )}
        </div>
      </div>
    </div>
  );
}
