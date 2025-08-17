import { User, UserApiResponse } from "@/lib/types/user.types";

export function mapUserApiToUi(apiUser: UserApiResponse | null): User {
  // Ensure apiUser is not null or undefined before mapping
  if (!apiUser) {
    // Return a default/empty user object to avoid crashing the app
    console.error(
      "mapUserApiToUi received null or undefined apiUser, returning default."
    );
    return {
      id: "N/A",
      fullName: "N/A",
      email: "N/A",
      idCard: "N/A",
      phoneNumber: "N/A",
      role: "HOCVIEN", // Sensible default
    };
  }

  // Ensure role is a valid value, defaulting to HOCVIEN if not
  const validRoles = ["ADMIN", "HR", "HOCVIEN"];
  const role = (apiUser.role?.toUpperCase() || "HOCVIEN") as User["role"];

  return {
    id: apiUser.id || "N/A", // Provide a default for ID
    fullName: apiUser.fullName || "N/A",
    urlAvatar: apiUser.urlAvatar,
    idCard: apiUser.idCard || "N/A",
    email: apiUser.email || "N/A",
    phoneNumber: apiUser.phoneNumber || "N/A",
    role: apiUser.role ? role : "HOCVIEN",
    employeeId: apiUser.code,
    department: apiUser.department || null, // Keep as is since types now match
    employeeLevel: apiUser.eLevel, // Map eLevel field from API
    position: apiUser.position, // Map position field
    userStatus: apiUser.userStatus,
    manager:
      typeof apiUser.managerBy === "object"
        ? apiUser.managerBy?.Name || "N/A"
        : apiUser.managerBy || "N/A",
    startWork: apiUser.startWork,
    endWork: apiUser.endWork,
    createdAt: apiUser.createdAt,
    modifiedAt: apiUser.modifiedAt, // Corrected from backend typo
  };
}
