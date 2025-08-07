"use client";

import React, { useMemo, useCallback } from "react";
import { Building2 } from "lucide-react";
import { TreeView, TreeNode } from "@/components/ui/tree-view";
import type { DepartmentInfo } from "@/lib/types/department.types";
import { buildDepartmentTree } from "@/lib/utils/department-tree";

interface DepartmentTreeProps {
  departments: DepartmentInfo[];
  onSelectDepartment: (department: DepartmentInfo) => void;
  className?: string;
}

export function DepartmentTreeView({
  departments,
  onSelectDepartment,
  className,
}: DepartmentTreeProps) {
  // Build the department tree structure - memoized to prevent unnecessary rebuilds
  const departmentTree = useMemo(
    () => buildDepartmentTree(departments),
    [departments]
  );

  // Get all department IDs that should be expanded by default (level 1)
  const defaultExpandedNodes = useMemo(
    () =>
      departments
        .filter((dept) => dept.level === 1)
        .map((dept) => String(dept.departmentId)),
    [departments]
  );

  // Handler for selecting a department - wrapped in useCallback to maintain reference equality
  const handleSelectDepartment = useCallback(
    (department: DepartmentInfo) => {
      onSelectDepartment(department);
    },
    [onSelectDepartment]
  );

  // Recursive function to render a department node and its children
  const renderDepartmentNode = useCallback(
    (
      department: DepartmentInfo & { children?: DepartmentInfo[] },
      level = 0
    ) => {
      const hasChildren = department.children && department.children.length > 0;

      return (
        <TreeNode
          key={department.departmentId}
          id={String(department.departmentId)}
          name={department.name}
          level={level}
          hasChildren={hasChildren}
          icon={<Building2 className="h-4 w-4 mr-2" />}
          onClick={() => handleSelectDepartment(department)}
        >
          {hasChildren &&
            department.children!.map((child) =>
              renderDepartmentNode(child, level + 1)
            )}
        </TreeNode>
      );
    },
    [handleSelectDepartment]
  );

  // Handle empty state
  if (departments.length === 0) {
    return (
      <div className="rounded-md border p-4 text-center">
        <Building2 className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
        <p className="text-muted-foreground">Chưa có phòng ban nào.</p>
      </div>
    );
  }

  return (
    <TreeView className={className} defaultExpandedNodes={defaultExpandedNodes}>
      {departmentTree.map((dept) => renderDepartmentNode(dept))}
    </TreeView>
  );
}
