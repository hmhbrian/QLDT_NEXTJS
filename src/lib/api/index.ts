/**
 * API Services Index
 * This file exports all API services and their types from a single location
 */

// Re-export from config
export * from './config';
export { default as API_CONFIG } from './config';

// Re-export from api-utils
export * from './api-utils';

// Re-export from base-service
export * from './base-service';

// Re-export all services
export * from './services';
export { default as services } from './services';

// Create API object with all service instances
import {
  authService,
  departmentsService,
  coursesService,
  usersService,
  analyticsService
} from './services';

// Aggregate all services into a single API object for convenience
export const api = {
  auth: authService,
  departments: departmentsService,
  courses: coursesService,
  users: usersService,
  analytics: analyticsService,
};

// Default export for direct import
export default api; 