'use client';

import { useState, useEffect } from 'react';
import { services } from '@/lib/api';
import type { DepartmentInfo } from '@/lib/types/index';

export function useDepartments() {
    const [departments, setDepartments] = useState<DepartmentInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const data = await services.departments.getAllDepartments();
                setDepartments(data);
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
        isLoading
    };
} 