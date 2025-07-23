
import { BaseService } from "./base-service";
import { BaseCreatePayload, BaseUpdatePayload } from "./types";

const serviceRegistry = new Map<string, BaseService<any, any, any>>();

export function createService<
  TEntity = unknown,
  TCreatePayload extends BaseCreatePayload = any,
  TUpdatePayload extends BaseUpdatePayload = any
>(
  serviceName: string,
  endpoint: string,
  ServiceClass?: new (endpoint: string) => BaseService<
    TEntity,
    TCreatePayload,
    TUpdatePayload
  >
): BaseService<TEntity, TCreatePayload, TUpdatePayload> {
  if (serviceRegistry.has(serviceName)) {
    return serviceRegistry.get(serviceName) as BaseService<
      TEntity,
      TCreatePayload,
      TUpdatePayload
    >;
  }

  const service = ServiceClass
    ? new ServiceClass(endpoint)
    : new (class extends BaseService<
        TEntity,
        TCreatePayload,
        TUpdatePayload
      > {})(endpoint);

  serviceRegistry.set(serviceName, service);
  return service;
}

export function getService<T extends BaseService<any, any, any>>(
  serviceName: string
): T | undefined {
  return serviceRegistry.get(serviceName) as T | undefined;
}

export function listServices(): string[] {
  return Array.from(serviceRegistry.keys());
}

export function clearServiceRegistry(): void {
  serviceRegistry.clear();
}
