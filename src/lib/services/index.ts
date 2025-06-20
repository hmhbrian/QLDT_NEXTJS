/**
 * Modern Services Index
 * Central export point for all modern API services using core architecture
 */

// Export core services
export * from "../core";

// Export all modern services
export * from "./modern";

// Import core service factory
import { createService } from "../core/service-factory";

// Re-export core service factory for convenience
export { createService };

// Default export for backward compatibility
export default { createService };
