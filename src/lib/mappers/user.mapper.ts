
import { User, UserApiResponse } from "@/lib/types/user.types";

export function mapUserApiToUi(apiUser: UserApiResponse | null): User {
  // Ensure apiUser is not null or undefined before mapping
  if (!apiUser) {
    // Return a default/empty user object to avoid crashing the app
    console.error("mapUserApiToUi received null or undefined apiUser, returning default.");
    return {
        id: 'N/A',
        fullName: 'N/A',
        email: 'N/A',
        idCard: 'N/A',
        phoneNumber: 'N/A',
        role: 'HOCVIEN', // Sensible default
    };
  }

  // Ensure role is a valid value, defaulting to HOCVIEN if not
  const validRoles = ["ADMIN", "HR", "HOCVIEN"];
  const role = (apiUser.role?.toUpperCase() || 'HOCVIEN') as User["role"];
  
  return {
    id: apiUser.id || 'N/A', // Provide a default for ID
    fullName: apiUser.fullName || 'N/A',
    urlAvatar: apiUser.urlAvatar,
    idCard: apiUser.idCard || 'N/A',
    email: apiUser.email || 'N/A',
    phoneNumber: apiUser.phoneNumber || 'N/A',
    role: validRoles.includes(role) ? role : 'HOCVIEN',
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
