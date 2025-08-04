
import apiClient from "@/lib/api-client";
import {
  RequestConfig,
} from "../core/types";
import { extractErrorMessage } from "./api-utils";

export abstract class BaseService<
  TEntity = unknown,
  TCreatePayload = any,
  TUpdatePayload = any
> {
  protected readonly endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  protected async request<T>(
    method: "get" | "post" | "put" | "patch" | "delete",
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    try {
      const responseData = await apiClient.request<any>({
        method,
        url,
        data,
        ...config,
      });
      
      if (responseData && typeof responseData.success === 'boolean') {
        if(responseData.success === false) {
           throw new Error(responseData.detail || responseData.message || "An API error occurred");
        }
        return responseData.data !== undefined ? responseData.data : responseData;
      }
      
      return responseData as T;
      
    } catch (error) {
      throw this.handleError(method, url, error);
    }
  }

  protected async get<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>("get", url, undefined, config);
  }

  protected async post<T>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>("post", url, data, config);
  }

  protected async put<T>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>("put", url, data, config);
  }

  protected async patch<T>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>("patch", url, data, config);
  }

  protected async delete<T = void>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>("delete", url, data, config);
  }

  protected handleError(method: string, url: string, error: unknown): Error {
    const message = extractErrorMessage(error);
    const errorToThrow = new Error(message, { cause: error });
    return errorToThrow;
  }
}
