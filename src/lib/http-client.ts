/**
 * Simplified HTTP Client for Next.js 15
 * Uses native fetch with Next.js built-in optimizations
 */

import { cookieManager } from "./utils/cookie-manager";

export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface HttpRequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  params?: Record<string, any>;
  cache?: RequestCache; // Use native fetch cache options
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
}

export interface HttpClient {
  get<T = any>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
  post<T = any>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
  put<T = any>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
  patch<T = any>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
  delete<T = any>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
}

class CustomHttpClient implements HttpClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;
  private authorizationHeader: string | null = null;

  constructor(config: {
    baseURL: string;
    headers?: Record<string, string>;
    timeout?: number;
  }) {
    this.baseURL = config.baseURL;
    this.defaultHeaders = config.headers || {};
    this.timeout = config.timeout || 8000; // Reduced from 30s to 8s
  }

  public setAuthorizationHeader(token: string | null): void {
    if (token) {
      this.authorizationHeader = `Bearer ${token}`;
    } else {
      this.authorizationHeader = null;
    }
  }

  public getAuthorizationToken(): string | null {
    if (this.authorizationHeader?.startsWith("Bearer ")) {
      return this.authorizationHeader.replace("Bearer ", "");
    }
    return cookieManager.getSecureAuth();
  }

  public clearAuthorizationHeader(): void {
    this.authorizationHeader = null;
  }

  private async request<T>(
    method: string,
    url: string,
    data?: any,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>> {
    const fullUrl = url.startsWith("http") ? url : `${this.baseURL}${url}`;

    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...config?.headers,
    };

    // Add auth header if available
    if (this.authorizationHeader) {
      headers["Authorization"] = this.authorizationHeader;
    } else if (typeof window !== "undefined") {
      const token = cookieManager.getSecureAuth();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    // Handle content type
    if (data && !(data instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    // Build fetch URL with params
    let finalUrl = fullUrl;
    if (config?.params && Object.keys(config.params).length > 0) {
      const urlObj = new URL(fullUrl);
      Object.entries(config.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          urlObj.searchParams.set(key, String(value));
        }
      });
      finalUrl = urlObj.toString();
    }

    // Use AbortController for timeout
    const controller = new AbortController();
    const timeoutMs = config?.timeout || this.timeout;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // Use native fetch with Next.js 15 optimizations
      const response = await fetch(finalUrl, {
        method,
        headers,
        body: data ? (data instanceof FormData ? data : JSON.stringify(data)) : undefined,
        signal: controller.signal,
        credentials: "include",
        // Next.js 15 cache options (default is 'no-store' in v15)
        cache: config?.cache || 'no-store',
        // Next.js specific options
        next: config?.next,
      });

      clearTimeout(timeoutId);

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      let responseData: any;
      const contentType = response.headers.get("content-type");

      if (contentType?.includes("json")) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      if (!response.ok) {
        const error: any = new Error(`HTTP Error: ${response.status}`);
        error.response = {
          data: responseData,
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
        };

        // Handle auth errors
        if (response.status === 401) {
          this.clearAuthorizationHeader();
          cookieManager.removeSecureAuth();

          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("auth-error", {
                detail: { status: response.status, error },
              })
            );
          }
        }

        throw error;
      }

      return {
        data: responseData as T,
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === "AbortError") {
        error.message = `Request timeout after ${timeoutMs}ms`;
      }

      throw error;
    }
  }

  async get<T = any>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    return this.request<T>("GET", url, undefined, config);
  }

  async post<T = any>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    return this.request<T>("POST", url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    return this.request<T>("PUT", url, data, config);
  }

  async patch<T = any>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    return this.request<T>("PATCH", url, data, config);
  }

  async delete<T = any>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    return this.request<T>("DELETE", url, data, config);
  }
}

export { CustomHttpClient };