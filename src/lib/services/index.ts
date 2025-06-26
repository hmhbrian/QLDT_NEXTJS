/**
 * Enterprise Services Index
 * Central export point for all API services using modern architecture
 */

// Export all modern services individually
export * from "./modern/auth.service";
export * from "./modern/courses.service";
export * from "./modern/departments.service";
export * from "./modern/positions.service";
export * from "./modern/roles.service";
export * from "./modern/users.service";

// Import services to create a single `services` object
import { authService } from "./modern/auth.service";
import { coursesService } from "./modern/courses.service";
import { departmentsService } from "./modern/departments.service";
import { positionsService } from "./modern/positions.service";
import { rolesService } from "./modern/roles.service";
import { usersService } from "./modern/users.service";

// Export a single object containing all services for convenience
export const services = {
  auth: authService,
  courses: coursesService,
  departments: departmentsService,
  positions: positionsService,
  roles: rolesService,
  users: usersService,
} as const;

// Default export for backward compatibility or alternative import style
export default services;

// Type-safe services object type
export type Services = typeof services;
