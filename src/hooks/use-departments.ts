"use client";

import { useState, useEffect } from "react";
import type { DepartmentInfo } from "@/lib/types/index";

export function useDepartments() {
  const [departments, setDepartments] = useState<DepartmentInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        // Tạm thời return mock data vì backend chưa có API departments
        console.log("Departments API not available, using mock data");
        const mockDepartments: DepartmentInfo[] = [
          {
            id: "1",
            name: "Phòng Công nghệ thông tin",
            description: "Phòng phát triển và quản lý hệ thống CNTT",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "2",
            name: "Phòng Nhân sự",
            description: "Phòng quản lý nhân sự và đào tạo",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "3",
            name: "Phòng Kế toán",
            description: "Phòng quản lý tài chính và kế toán",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        setDepartments(mockDepartments);
      } catch (error) {
        console.error("Error fetching departments:", error);
        setDepartments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  // Lọc các phòng ban theo tiêu chí khác vì DepartmentInfo trong types/index không có trường status
  const activeDepartments = departments;

  return {
    departments,
    activeDepartments,
    isLoading,
  };
}
