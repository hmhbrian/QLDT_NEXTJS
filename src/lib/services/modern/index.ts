/**
 * Modern Services Exports
 * Centralized export of all service instances for easy importing
 */

// Import all service instances
import { usersService } from './users.service';
import { departmentsService } from './departments.service';
import { rolesService } from './roles.service';
import { positionsService } from './positions.service';
import { authService } from './auth.service';

// Export individual service instances
export {
  usersService,
  departmentsService,
  rolesService,
  positionsService,
  authService,
};

// Export as a single services object for convenience
export const services = {
  users: usersService,
  departments: departmentsService,
  roles: rolesService,
  positions: positionsService,
  auth: authService,
} as const;

// Default export
export default services;
