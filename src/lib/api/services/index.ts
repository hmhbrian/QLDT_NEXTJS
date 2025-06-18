/**
 * Services Index
 * Exports all service modules from a single file for cleaner imports
 */

// Export all services
export * from './auth';
export * from './courses';
export * from './departments';
export * from './users';
export * from './analytics';
export * from './roles';

// Export default instances
import authService from './auth';
import coursesService from './courses';
import departmentsService from './departments';
import usersService from './users';
import analyticsService from './analytics';

export {
    authService,
    coursesService,
    departmentsService,
    usersService,
    analyticsService
};

// Default export as an object containing all services
const services = {
    auth: authService,
    courses: coursesService,
    departments: departmentsService,
    users: usersService,
    analytics: analyticsService
};

export default services; 