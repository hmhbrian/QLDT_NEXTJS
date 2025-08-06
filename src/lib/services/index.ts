/**
 * Enterprise Services Index
 * Central export point for all API services using modern architecture
 */

// Export all modern services individually
export * from "./modern/auth.service";
export * from "./modern/courses.service";
export * from "./modern/certificates.service";
export * from "./modern/departments.service";
export * from "./modern/employeeLevel.service";
export * from "./modern/roles.service";
export * from "./modern/users.service";
export * from "./modern/course-attached-files.service";
export * from "./modern/lessons.service";
export * from "./modern/tests.service";
export * from "./modern/questions.service";
export * from "./modern/lesson-progress.service";
export * from "./modern/report.service";
export * from "./modern/feedback.service";
export * from "./modern/dashboard.service";

// Import services to create a single `services` object
import { authService } from "./modern/auth.service";
import { coursesService } from "./modern/courses.service";
import { departmentsService } from "./modern/departments.service";
import { EmployeeLevelService } from "./modern/employeeLevel.service";
import { rolesService } from "./modern/roles.service";
import { usersService } from "./modern/users.service";
import { courseAttachedFilesService } from "./modern/course-attached-files.service";
import { lessonsService } from "./modern/lessons.service";
import { testsService } from "./modern/tests.service";
import { questionsService } from "./modern/questions.service";
import { lessonProgressService } from "./modern/lesson-progress.service";
import { reportService } from "./modern/report.service";
import { feedbackService } from "./modern/feedback.service";
import { dashboardService } from "./modern/dashboard.service";

// Export a single object containing all services for convenience
export const services = {
  auth: authService,
  courses: coursesService,
  departments: departmentsService,
  EmployeeLevel: EmployeeLevelService,
  roles: rolesService,
  users: usersService,
  courseAttachedFiles: courseAttachedFilesService,
  lessons: lessonsService,
  tests: testsService,
  questions: questionsService,
  lessonProgress: lessonProgressService,
  report: reportService,
  feedback: feedbackService,
  dashboard: dashboardService,
} as const;

// Default export for backward compatibility or alternative import style
export default services;

// Type-safe services object type
export type Services = typeof services;
