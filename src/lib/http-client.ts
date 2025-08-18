/**
 * Custom HTTP Client - Thay thế axios với native fetch
 * Cung cấp interface tương tự axios nhưng sử dụng fetch API
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
  withCredentials?: boolean;
  signal?: AbortSignal;
}

export interface HttpClient {
  get<T = any>(
    url: string,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>>;
  post<T = any>(
    url: string,
    data?: any,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>>;
  put<T = any>(
    url: string,
    data?: any,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>>;
  patch<T = any>(
    url: string,
    data?: any,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>>;
  delete<T = any>(
    url: string,
    data?: any, // Allow body for delete
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>>;
  options<T = any>(
    url: string,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>>;
  head<T = any>(
    url: string,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>>;
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
    this.timeout = config.timeout || 8000;
  }

  public setAuthorizationHeader(token: string | null): void {
    if (token) {
      this.authorizationHeader = `Bearer ${token}`;
    } else {
      this.authorizationHeader = null;
    }
  }

  public getAuthorizationToken(): string | null {
    if (
      this.authorizationHeader &&
      this.authorizationHeader.startsWith("Bearer ")
    ) {
      return this.authorizationHeader.replace("Bearer ", "");
    }
    // Fallback: get token from cookie if not in memory
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

    // Ưu tiên sử dụng authorization header đã được set
    if (this.authorizationHeader) {
      headers["Authorization"] = this.authorizationHeader;
    }
    // Fallback: lấy token từ secure cookie nếu chưa có header
    else if (typeof window !== "undefined") {
      try {
        const token = cookieManager.getSecureAuth();
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
      } catch (error) {
        // Silently handle cookie access errors
      }
    }

    if (data instanceof FormData) {
      delete headers["Content-Type"];
    } else if (data) {
      headers["Content-Type"] = "application/json";
    }

    const finalUrl = config?.params
      ? `${fullUrl}?${new URLSearchParams(config.params).toString()}`
      : fullUrl;

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      config?.timeout || this.timeout
    );
    const externalSignal = config?.signal;
    if (externalSignal) {
      if (externalSignal.aborted) controller.abort();
      else externalSignal.addEventListener("abort", () => controller.abort());
    }

    try {
      const response = await fetch(finalUrl, {
        method,
        headers,
        body: data
          ? data instanceof FormData
            ? data
            : JSON.stringify(data)
          : undefined,
        signal: controller.signal,
        credentials: "include",
      });

      clearTimeout(timeoutId);

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      let responseData: any;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("json")) {
        responseData = await response.json();
      } else {
        responseData = (await response.text()) as any;
      }

      if (!response.ok) {
        const error: any = new Error(`HTTP Error: ${response.status}`);
        error.response = {
          data: responseData,
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
        };
        error.config = { method, url: finalUrl, data, headers };

        // Handle authentication errors carefully
        if (response.status === 401) {
          this.clearAuthorizationHeader();
          cookieManager.removeSecureAuth();

          // Dispatch custom event for auth error
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("auth-error", {
                detail: { status: response.status, error },
              })
            );
          }
        } else if (response.status === 403) {
          // 403 might be permission issue, not necessarily invalid token
          // Don't clear auth state for 403
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
        const timeoutError: any = new Error("Request timeout");
        timeoutError.code = "TIMEOUT";
        throw timeoutError;
      }

      throw error;
    }
  }

  async get<T = any>(
    url: string,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>> {
    return this.request<T>("GET", url, undefined, config);
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>> {
    return this.request<T>("POST", url, data, config);
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>> {
    return this.request<T>("PUT", url, data, config);
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>> {
    return this.request<T>("PATCH", url, data, config);
  }

  async delete<T = any>(
    url: string,
    data?: any, // Allow body for delete
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>> {
    return this.request<T>("DELETE", url, data, config);
  }

  async options<T = any>(
    url: string,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>> {
    return this.request<T>("OPTIONS", url, undefined, config);
  }

  async head<T = any>(
    url: string,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>> {
    return this.request<T>("HEAD", url, undefined, config);
  }
}

export { CustomHttpClient };
