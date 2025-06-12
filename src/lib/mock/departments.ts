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
        path: ['Công nghệ thông tin'],
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
        path: ['Nhân sự'],
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
        path: ['Kinh doanh'],
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
        path: ['Marketing'],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
    },
    // Phòng ban con của IT
    {
        id: 'd5',
        name: 'Phát triển phần mềm',
        code: 'it-dev',
        description: 'Phòng phát triển ứng dụng và phần mềm',
        managerId: '5',
        parentId: 'd1', // Con của IT
        status: 'active',
        level: 2,
        path: ['Công nghệ thông tin', 'Phát triển phần mềm'],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
    },
    {
        id: 'd6',
        name: 'Hạ tầng & Vận hành',
        code: 'it-ops',
        description: 'Phòng quản lý hạ tầng CNTT và vận hành hệ thống',
        managerId: '6',
        parentId: 'd1', // Con của IT
        status: 'active',
        level: 2,
        path: ['Công nghệ thông tin', 'Hạ tầng & Vận hành'],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
    },
    // Phòng ban con cấp 3 của Phát triển phần mềm
    {
        id: 'd7',
        name: 'Phát triển Web',
        code: 'it-dev-web',
        description: 'Nhóm phát triển ứng dụng web',
        managerId: '7',
        parentId: 'd5', // Con của Phát triển phần mềm
        status: 'active',
        level: 3,
        path: ['Công nghệ thông tin', 'Phát triển phần mềm', 'Phát triển Web'],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
    },
    {
        id: 'd8',
        name: 'Phát triển Mobile',
        code: 'it-dev-mobile',
        description: 'Nhóm phát triển ứng dụng di động',
        managerId: '8',
        parentId: 'd5', // Con của Phát triển phần mềm
        status: 'active',
        level: 3,
        path: ['Công nghệ thông tin', 'Phát triển phần mềm', 'Phát triển Mobile'],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
    },
    // Phòng ban con của HR
    {
        id: 'd9',
        name: 'Tuyển dụng',
        code: 'hr-rec',
        description: 'Phòng tuyển dụng nhân sự',
        managerId: '9',
        parentId: 'd2', // Con của HR
        status: 'active',
        level: 2,
        path: ['Nhân sự', 'Tuyển dụng'],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
    },
    {
        id: 'd10',
        name: 'Phát triển nhân sự',
        code: 'hr-dev',
        description: 'Phòng phát triển và đào tạo nhân sự',
        managerId: '10',
        parentId: 'd2', // Con của HR
        status: 'active',
        level: 2,
        path: ['Nhân sự', 'Phát triển nhân sự'],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
    }
]; 