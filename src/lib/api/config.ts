/**
 * API Configuration
 * Centralized configuration for API-related settings
 */

export const API_CONFIG = {
    /**
     * Base URL for API requests
     */
    baseURL: '/api',

    /**
     * Default headers to include with all requests
     */
    defaultHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },

    /**
     * Request timeout in milliseconds
     */
    timeout: 30000, // 30 seconds

    /**
     * Default pagination settings
     */
    pagination: {
        defaultPage: 1,
        defaultPageSize: 10,
        maxPageSize: 100,
    },

    /**
     * Endpoints configuration
     */
    endpoints: {
        auth: {
            login: '/auth/login',
            register: '/auth/register',
            refresh: '/auth/refresh',
            logout: '/auth/logout',
            me: '/auth/me',
        },
        departments: {
            base: '/departments',
            paginated: '/departments/paginated',
            tree: '/departments/tree',
            checkName: '/departments/check-name',
        },
        courses: {
            base: '/courses',
            paginated: '/courses/paginated',
        },
        users: {
            base: '/users',
            paginated: '/users/paginated',
        },
        analytics: {
            base: '/analytics',
            summary: '/analytics/summary',
        },
    },
};

export default API_CONFIG; 