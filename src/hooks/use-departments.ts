'use client';

import { useState, useEffect } from 'react';
import { getCookie } from './use-cookie';
import { mockDepartments } from '@/lib/mock';
import type { DepartmentInfo } from '@/lib/types';

const DEPARTMENTS_COOKIE_KEY = 'becamex-departments-data';

export function useDepartments() {
    const [departments, setDepartments] = useState<DepartmentInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Lấy dữ liệu phòng ban từ cookie
        const deptData = getCookie<DepartmentInfo[]>(DEPARTMENTS_COOKIE_KEY, mockDepartments);
        setDepartments(deptData);
        setIsLoading(false);
    }, []);

    // Lọc các phòng ban đang hoạt động
    const activeDepartments = departments.filter(dept => dept.status === 'active');

    return {
        departments,
        activeDepartments,
        isLoading
    };
} 