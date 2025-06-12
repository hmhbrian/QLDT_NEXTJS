import type { DepartmentInfo } from '@/lib/types';

/**
 * Tạo bảng tra cứu nhanh từ ID sang Department
 * Giúp cải thiện hiệu suất khi cần truy vấn department nhiều lần
 */
function createDepartmentMap(departments: DepartmentInfo[]): Map<string, DepartmentInfo> {
    const map = new Map<string, DepartmentInfo>();
    departments.forEach(dept => map.set(dept.id, dept));
    return map;
}

/**
 * Xây dựng cấu trúc cây phân cấp từ một mảng phẳng các phòng ban
 */
export function buildDepartmentTree(
    departments: DepartmentInfo[],
    parentId: string | null = null,
    maxDepth: number = -1, // -1 nghĩa là không giới hạn
    currentDepth: number = 0
): (DepartmentInfo & { children?: DepartmentInfo[] })[] {
    // Nếu đã đạt đến độ sâu tối đa và không phải không giới hạn, trả về mảng rỗng
    if (maxDepth !== -1 && currentDepth >= maxDepth) {
        return [];
    }

    // Tìm các phòng ban khớp với parentId hiện tại
    const roots = departments.filter(dept =>
        parentId === null
            ? !dept.parentId // Phòng ban gốc không có phòng ban cha
            : dept.parentId === parentId
    );

    // Với mỗi phòng ban gốc, xây dựng đệ quy cây con của nó
    return roots.map(dept => {
        const node = { ...dept };

        // Lấy đệ quy các phòng ban con, tăng độ sâu
        const children = buildDepartmentTree(
            departments,
            dept.id,
            maxDepth,
            currentDepth + 1
        );

        // Chỉ thêm thuộc tính children nếu có các phòng ban con
        if (children.length > 0) {
            (node as DepartmentInfo & { children: DepartmentInfo[] }).children = children;
        }

        return node;
    });
}

/**
 * Kiểm tra xem một phòng ban có phòng ban con nào không
 */
export function hasDepartmentChildren(
    departmentId: string,
    departments: DepartmentInfo[]
): boolean {
    return departments.some(dept => dept.parentId === departmentId);
}

/**
 * Lấy tất cả phòng ban con một cách đệ quy
 * Phiên bản tối ưu hóa với memoization để tránh tính toán lặp lại
 */
export function getAllChildDepartments(
    departmentId: string,
    departments: DepartmentInfo[],
    memo: Map<string, DepartmentInfo[]> = new Map()
): DepartmentInfo[] {
    // Kiểm tra xem đã tính toán trước đó chưa
    if (memo.has(departmentId)) {
        return memo.get(departmentId)!;
    }

    const directChildren = departments.filter(dept => dept.parentId === departmentId);

    const allChildren = [
        ...directChildren,
        ...directChildren.flatMap(child => getAllChildDepartments(child.id, departments, memo))
    ];

    // Lưu kết quả cho các lần gọi trong tương lai
    memo.set(departmentId, allChildren);

    return allChildren;
}

/**
 * Làm phẳng cấu trúc cây phòng ban thành một mảng
 */
export function flattenDepartmentTree(
    tree: (DepartmentInfo & { children?: DepartmentInfo[] })[]
): DepartmentInfo[] {
    return tree.flatMap(node => {
        const { children, ...nodeWithoutChildren } = node;
        return [
            nodeWithoutChildren as DepartmentInfo,
            ...(children ? flattenDepartmentTree(children) : [])
        ];
    });
}

/**
 * Tải cây phòng ban một cách lười biếng đến độ sâu cụ thể
 * Trả về cả cây đã tải một phần và một hàm để tải thêm các phòng ban con
 */
export function lazyLoadDepartmentTree(
    departments: DepartmentInfo[],
    initialDepth: number = 1
): {
    tree: (DepartmentInfo & { children?: DepartmentInfo[] })[];
    loadMoreChildren: (departmentId: string) => (DepartmentInfo & { children?: DepartmentInfo[] })[];
} {
    // Ban đầu tải cây đến độ sâu cụ thể
    const initialTree = buildDepartmentTree(departments, null, initialDepth);

    // Hàm để tải thêm các phòng ban con cho một phòng ban cụ thể
    const loadMoreChildren = (departmentId: string) => {
        const department = findDepartmentInTree(initialTree, departmentId);
        if (!department) return [];

        // Lấy các phòng ban con trực tiếp
        const children = departments.filter(dept => dept.parentId === departmentId);

        // Thiết lập các phòng ban con cho phòng ban
        department.children = children.map(child => {
            // Thêm mảng children rỗng làm giữ chỗ nếu phòng ban này có phòng ban con
            const hasChildren = hasDepartmentChildren(child.id, departments);
            return {
                ...child,
                ...(hasChildren ? { children: [] } : {}) // Thêm mảng children rỗng làm giữ chỗ
            };
        });

        return department.children;
    };

    return { tree: initialTree, loadMoreChildren };
}

/**
 * Tìm một phòng ban trong cây theo ID
 */
function findDepartmentInTree(
    tree: (DepartmentInfo & { children?: DepartmentInfo[] })[],
    departmentId: string
): (DepartmentInfo & { children?: DepartmentInfo[] }) | null {
    for (const node of tree) {
        if (node.id === departmentId) {
            return node;
        }

        if (node.children?.length) {
            const found = findDepartmentInTree(node.children, departmentId);
            if (found) return found;
        }
    }

    return null;
}

/**
 * Xác thực cấu trúc cây phòng ban đối với tham chiếu vòng tròn
 * Trả về true nếu cây hợp lệ, false nếu có tham chiếu vòng tròn
 */
export function validateDepartmentTree(departments: DepartmentInfo[]): {
    valid: boolean;
    issues?: {
        type: 'circular_reference' | 'missing_parent' | 'invalid_level' | 'invalid_path';
        departmentId: string;
        details: string
    }[]
} {
    const issues: {
        type: 'circular_reference' | 'missing_parent' | 'invalid_level' | 'invalid_path';
        departmentId: string;
        details: string
    }[] = [];

    // Tạo map để tra cứu nhanh hơn
    const deptMap = createDepartmentMap(departments);

    // Kiểm tra tham chiếu vòng tròn và mối quan hệ phòng ban cha không hợp lệ
    for (const dept of departments) {
        if (dept.parentId) {
            // Kiểm tra xem phòng ban cha có tồn tại không
            const parent = deptMap.get(dept.parentId);
            if (!parent) {
                issues.push({
                    type: 'missing_parent',
                    departmentId: dept.id,
                    details: `Phòng ban ${dept.name} tham chiếu đến ID phòng ban cha không tồn tại ${dept.parentId}`
                });
                continue;
            }

            // Kiểm tra tham chiếu vòng tròn
            let currentParentId = dept.parentId;
            const visitedIds = new Set<string>([dept.id]);

            while (currentParentId) {
                if (visitedIds.has(currentParentId)) {
                    issues.push({
                        type: 'circular_reference',
                        departmentId: dept.id,
                        details: `Phát hiện tham chiếu vòng tròn: Phòng ban ${dept.name} nằm trong một vòng lặp cha-con`
                    });
                    break;
                }

                visitedIds.add(currentParentId);
                const currentParent = deptMap.get(currentParentId);
                if (!currentParent) break;

                currentParentId = currentParent.parentId;
            }

            // Kiểm tra tính nhất quán của cấp độ
            if (parent && dept.level !== parent.level + 1) {
                issues.push({
                    type: 'invalid_level',
                    departmentId: dept.id,
                    details: `Phòng ban ${dept.name} có cấp độ không chính xác: ${dept.level}, dự kiến ${parent.level + 1}`
                });
            }

            // Kiểm tra tính nhất quán của đường dẫn
            if (parent && (dept.path.length !== parent.path.length + 1 ||
                !dept.path.slice(0, -1).every((item, i) => item === parent.path[i]))) {
                issues.push({
                    type: 'invalid_path',
                    departmentId: dept.id,
                    details: `Phòng ban ${dept.name} có đường dẫn không chính xác: dự kiến bắt đầu bằng đường dẫn của phòng ban cha`
                });
            }
        } else {
            // Phòng ban cấp độ gốc nên có level = 1
            if (dept.level !== 1) {
                issues.push({
                    type: 'invalid_level',
                    departmentId: dept.id,
                    details: `Phòng ban gốc ${dept.name} có cấp độ không chính xác: ${dept.level}, dự kiến 1`
                });
            }

            // Phòng ban gốc nên có đường dẫn chỉ với tên của nó
            if (dept.path.length !== 1 || dept.path[0] !== dept.name) {
                issues.push({
                    type: 'invalid_path',
                    departmentId: dept.id,
                    details: `Phòng ban gốc ${dept.name} có đường dẫn không chính xác: dự kiến [${dept.name}]`
                });
            }
        }
    }

    return {
        valid: issues.length === 0,
        issues: issues.length > 0 ? issues : undefined
    };
} 