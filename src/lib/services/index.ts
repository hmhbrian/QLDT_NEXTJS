/**
 * API Services Index
 * Central export point for all API services
 */

// Export base service
export * from "./base-api.service";

// Export service instances
export { authApiService } from "./auth-api.service";
export { usersApiService } from "./users-api.service";
export { rolesApiService } from "./roles-api.service";
export { positionsApiService } from "./positions-api.service";
export { departmentsApiService } from "./departments-api.service";

// Export types separately
export type {
  LoginCredentials,
  LoginResponse,
  RefreshTokenResponse,
} from "./auth-api.service";
export type {
  UserQueryParams,
  CreateUserPayload,
  UpdateUserPayload,
} from "./users-api.service";
export type {
  Role,
  RoleQueryParams,
  CreateRolePayload,
  UpdateRolePayload,
} from "./roles-api.service";
export type {
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  DepartmentQueryParams,
} from "./departments-api.service";

// Import service instances
import authApiService from "./auth-api.service";
import usersApiService from "./users-api.service";
import rolesApiService from "./roles-api.service";
import positionsApiService from "./positions-api.service";
import departmentsApiService from "./departments-api.service";

export {
  authApiService as auth,
  usersApiService as users,
  rolesApiService as roles,
  positionsApiService as positions,
  departmentsApiService as departments,
};

// Default export as unified API object
const apiServices = {
  auth: authApiService,
  users: usersApiService,
  roles: rolesApiService,
  positions: positionsApiService,
  departments: departmentsApiService,
};

export default apiServices;
