import type { DepartmentInfo } from '../types';

// Mock Departments List
export const mockDepartments: DepartmentInfo[] = [
    {
        id: 'd1',
        name: 'Công nghệ thông tin',
        code: 'it',
        description: 'Phòng phát triển và quản lý hệ thống công nghệ thông tin',
        managerId: '1',
        status: 'active',
        level: 1,
        path: ['CNTT'],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
    },
    {
        id: 'd2',
        name: 'Nhân sự',
        code: 'hr',
        description: 'Phòng quản lý nhân sự và tuyển dụng',
        managerId: '2',
        status: 'active',
        level: 1,
        path: ['HR'],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
    },
    {
        id: 'd3',
        name: 'Kinh doanh',
        code: 'sales',
        description: 'Phòng phát triển kinh doanh và bán hàng',
        managerId: '3',
        status: 'active',
        level: 1,
        path: ['SALES'],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
    },
    {
        id: 'd4',
        name: 'Marketing',
        code: 'marketing',
        description: 'Phòng tiếp thị và truyền thông',
        managerId: '4',
        status: 'active',
        level: 1,
        path: ['MKT'],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
    }
]; 