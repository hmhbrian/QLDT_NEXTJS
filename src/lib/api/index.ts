/**
 * API Services Index
 * This file exports all API services and configuration from a single location
 */

// Re-export from config
export * from "./config";
export { default as API_CONFIG } from "./config";

// Re-export individual API modules
export * from "./auth";
export * from "./users";

// Re-export commonly used functions with better names
export { loginApi as login, logout, validateToken } from "./auth";
export { fetchUsers, getUserById, createUser } from "./users";

// Create a unified API object for convenience
const api = {
  auth: {
    login: async (email: string, password: string) => {
      const { loginApi } = await import("./auth");
      return loginApi({ email, password });
    },
    logout: async () => {
      const { logout } = await import("./auth");
      return logout();
    },
    validateToken: async () => {
      const { validateToken } = await import("./auth");
      return validateToken();
    },
  },
  users: {
    getAll: async (params?: any) => {
      const { fetchUsers } = await import("./users");
      return fetchUsers(params);
    },
    getById: async (id: string) => {
      const { getUserById } = await import("./users");
      return getUserById(id);
    },
    create: async (userData: any) => {
      const { createUser } = await import("./users");
      return createUser(userData);
    },
  },
};

// Default export for direct import
export default api;
