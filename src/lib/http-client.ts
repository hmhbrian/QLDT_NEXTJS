/**
 * Custom HTTP Client - Thay thế axios với native fetch
 * Cung cấp interface tương thự axios nhưng sử dụng fetch API
 */

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

  constructor(config: {
    baseURL: string;
    headers?: Record<string, string>;
    timeout?: number;
  }) {
    this.baseURL = config.baseURL;
    this.defaultHeaders = config.headers || {};
    this.timeout = config.timeout || 30000; // Tăng timeout lên 30s
  }

  private async request<T>(
    method: string,
    url: string,
    data?: any,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>> {
    const fullUrl = url.startsWith("http") ? url : `${this.baseURL}${url}`;

    // Gộp headers
    const headers = {
      "Content-Type": "application/json",
      ...this.defaultHeaders,
      ...config?.headers,
    };

    // Thêm query params
    const finalUrl = config?.params
      ? `${fullUrl}?${new URLSearchParams(config.params).toString()}`
      : fullUrl;

    // Tạo AbortController cho timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      config?.timeout || this.timeout
    );

    try {
      const response = await fetch(finalUrl, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
        credentials: config?.withCredentials ? "include" : "same-origin",
      });

      clearTimeout(timeoutId);

      // Chuyển đổi headers thành object thuần
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      let responseData: T;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
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
        throw error;
      }

      return {
        data: responseData,
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
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>> {
    return this.request<T>("DELETE", url, undefined, config);
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
