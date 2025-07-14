
import { User, UserApiResponse } from "@/lib/types/user.types";
import { DepartmentInfo } from "@/lib/types/department.types";

export function mapUserApiToUi(apiUser: UserApiResponse): User {
  return {
    id: apiUser.id || 'N/A',
    fullName: apiUser.fullName || 'N/A',
    urlAvatar: apiUser.urlAvatar,
    idCard: apiUser.idCard || 'N/A',
    email: apiUser.email || 'N/A',
    phoneNumber: apiUser.phoneNumber || 'N/A',
    role: (apiUser.role?.toUpperCase() as User["role"]) || 'HOCVIEN',
    employeeId: apiUser.code,
    department: apiUser.department,
    position: apiUser.position,
    userStatus: apiUser.userStatus,
    manager: apiUser.managerBy,
    startWork: apiUser.startWork,
    endWork: apiUser.endWork,
    createdAt: apiUser.createdAt,
    modifiedAt: apiUser.modifedAt, // Corrected from backend typo
  };
}
