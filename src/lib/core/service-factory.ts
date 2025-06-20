/**
 * Service Factory
 * Centralized service creation and management
 */
import { BaseService } from "./base-service";
import {
  CreatePayload,
  UpdatePayload,
  BaseCreatePayload,
  BaseUpdatePayload,
} from "./types";

// Service Registry
const serviceRegistry = new Map<string, BaseService>();

/**
 * Create or get existing service instance
 */
export function createService<
  TEntity = unknown,
  TCreatePayload extends BaseCreatePayload = CreatePayload<TEntity>,
  TUpdatePayload extends BaseUpdatePayload = UpdatePayload<TEntity>
>(
  serviceName: string,
  endpoint: string,
  ServiceClass?: new (endpoint: string) => BaseService<
    TEntity,
    TCreatePayload,
    TUpdatePayload
  >
): BaseService<TEntity, TCreatePayload, TUpdatePayload> {
  // Check if service already exists
  if (serviceRegistry.has(serviceName)) {
    return serviceRegistry.get(serviceName) as BaseService<
      TEntity,
      TCreatePayload,
      TUpdatePayload
    >;
  }

  // Create new service instance
  const service = ServiceClass
    ? new ServiceClass(endpoint)
    : new (class extends BaseService<
        TEntity,
        TCreatePayload,
        TUpdatePayload
      > {})(endpoint);

  // Register service
  serviceRegistry.set(serviceName, service);

  return service;
}

/**
 * Get existing service
 */
export function getService<T extends BaseService>(
  serviceName: string
): T | undefined {
  return serviceRegistry.get(serviceName) as T;
}

/**
 * List all registered services
 */
export function listServices(): string[] {
  return Array.from(serviceRegistry.keys());
}

/**
 * Clear service registry (useful for testing)
 */
export function clearServiceRegistry(): void {
  serviceRegistry.clear();
}
