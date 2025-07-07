
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
export * from "./modern/course-attached-files.service";
export * from "./modern/lessons.service";
export * from "./modern/tests.service";
export * from "./modern/questions.service";


// Import services to create a single `services` object
import { authService } from "./modern/auth.service";
import { coursesService } from "./modern/courses.service";
import { departmentsService } from "./modern/departments.service";
import { positionsService } from "./modern/positions.service";
import { rolesService } from "./modern/roles.service";
import { usersService } from "./modern/users.service";
import { courseAttachedFilesService } from "./modern/course-attached-files.service";
import { lessonsService } from "./modern/lessons.service";
import { testsService } from "./modern/tests.service";
import { questionsService } from "./modern/questions.service";


// Export a single object containing all services for convenience
export const services = {
  auth: authService,
  courses: coursesService,
  departments: departmentsService,
  positions: positionsService,
  roles: rolesService,
  users: usersService,
  courseAttachedFiles: courseAttachedFilesService,
  lessons: lessonsService,
  tests: testsService,
  questions: questionsService,
} as const;

// Default export for backward compatibility or alternative import style
export default services;

// Type-safe services object type
export type Services = typeof services;
