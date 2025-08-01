import {
  CustomHttpClient,
  HttpResponse,
  HttpRequestConfig,
} from "./http-client";
import { API_CONFIG } from "./config";
import { cacheManager, cookieManager } from "./cache";

// Create custom HTTP client instance
const httpClient = new CustomHttpClient({
  baseURL: API_CONFIG.baseURL,
  headers: API_CONFIG.defaultHeaders,
  timeout: API_CONFIG.timeout,
});

// Request wrapper to add auth token and caching
const makeRequest = async <T>(
  method: "get" | "post" | "put" | "patch" | "delete" | "options" | "head",
  url: string,
  data?: any,
  config?: HttpRequestConfig & {
    cache?: boolean;
    cacheKey?: string;
    maxAge?: number;
  }
): Promise<HttpResponse<T>> => {
  const token =
    cookieManager.get("auth_token") ||
    (typeof window !== "undefined"
      ? localStorage.getItem(API_CONFIG.storage.token)
      : null);

  // Skip adding token for login endpoint
  const isLoginEndpoint = url.includes("/login");
  const isPublicEndpoint = url.includes("/public") || url.includes("/health");

  // Check cache for GET requests
  if (method === "get" && config?.cache !== false) {
    const cacheKey =
      config?.cacheKey || `api:${url}:${JSON.stringify(config?.params || {})}`;
    const cached = cacheManager.get<T>(cacheKey);

    if (cached) {
      console.log(`Cache hit for ${cacheKey}`);
      return {
        data: cached,
        status: 200,
        statusText: "OK (Cached)",
        headers: { "x-cache": "HIT" },
      };
    }
  }

  // Prepare headers
  const headers = {
    ...config?.headers,
  };

  // Add auth header if token exists and not login/public endpoint
  if (token && !isLoginEndpoint && !isPublicEndpoint) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Add cache control headers
  if (method === "get") {
    headers["Cache-Control"] = "no-cache";
    headers["Pragma"] = "no-cache";
  }

  // Log requests in development
  if (process.env.NODE_ENV === "development") {
    console.log("API Request:", {
      method: method.toUpperCase(),
      url: `${API_CONFIG.baseURL}${url}`,
      params: config?.params,
      hasTokenInStorage: !!token,
      isLoginEndpoint,
      willSendToken: !!token && !isLoginEndpoint && !isPublicEndpoint,
      cacheEnabled: config?.cache !== false,
    });
  }

  try {
    let response: HttpResponse<T>;

    const requestConfig = {
      ...config,
      headers,
    };

    switch (method) {
      case "get":
        response = await httpClient.get<T>(url, requestConfig);
        break;
      case "post":
        response = await httpClient.post<T>(url, data, requestConfig);
        break;
      case "put":
        response = await httpClient.put<T>(url, data, requestConfig);
        break;
      case "patch":
        response = await httpClient.patch<T>(url, data, requestConfig);
        break;
      case "delete":
        response = await httpClient.delete<T>(url, data, requestConfig);
        break;
      case "options":
        response = await httpClient.options<T>(url, requestConfig);
        break;
      case "head":
        response = await httpClient.head<T>(url, requestConfig);
        break;
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }

    // Cache successful GET responses
    if (
      method === "get" &&
      response.status === 200 &&
      config?.cache !== false
    ) {
      const cacheKey =
        config?.cacheKey ||
        `api:${url}:${JSON.stringify(config?.params || {})}`;
      const maxAge = config?.maxAge || 5 * 60 * 1000; // 5 minutes default

      cacheManager.set(cacheKey, response.data, { maxAge });
      console.log(`Cached response for ${cacheKey}`);
    }

    // Log successful responses in development
    if (process.env.NODE_ENV === "development") {
      console.log("API Response:", {
        method: method.toUpperCase(),
        url: `${API_CONFIG.baseURL}${url}`,
        status: response.status,
        cached: response.headers["x-cache"] === "HIT",
        dataKeys:
          typeof response.data === "object"
            ? Object.keys(response.data || {})
            : "non-object",
      });
    }

    return response;
  } catch (error: any) {
    const errorInfo = {
      method: method.toUpperCase(),
      url: `${API_CONFIG.baseURL}${url}`,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      responseData: error.response?.data,
    };

    console.error("API Error:", errorInfo);

    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - clear all auth data and redirect
      cookieManager.remove("auth_token");
      cookieManager.remove("refresh_token");
      localStorage.removeItem(API_CONFIG.storage.token);
      localStorage.removeItem(API_CONFIG.storage.user);
      cacheManager.clear();

      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login") &&
        !window.location.pathname.includes("/auth")
      ) {
        // Redirect to login page
        window.location.href = "/login";
      }
    } else if (error.response?.status === 403) {
      // Forbidden - user doesn't have permission
      console.warn("Access forbidden - user may not have required permissions");
    } else if (error.response?.status >= 500) {
      // Server error - potentially retry or show user-friendly message
      console.error("Server error - may retry or show maintenance message");
    }

    // Rate limiting
    if (error.response?.status === 429) {
      const retryAfter = error.response?.headers["retry-after"];
      console.warn(`Rate limited. Retry after: ${retryAfter}s`);
    }

    throw error;
  }
};

// Enhanced API client with typed methods and caching
const apiClient = {
  get: <T = any>(
    url: string,
    config?: HttpRequestConfig & {
      cache?: boolean;
      cacheKey?: string;
      maxAge?: number;
    }
  ): Promise<HttpResponse<T>> => {
    return makeRequest<T>("get", url, undefined, config);
  },
  post: <T = any>(
    url: string,
    data?: any,
    config?: HttpRequestConfig & { invalidateCache?: string[] }
  ): Promise<HttpResponse<T>> => {
    const response = makeRequest<T>("post", url, data, config);

    // Invalidate related cache after successful POST
    response
      .then(() => {
        if (config?.invalidateCache) {
          config.invalidateCache.forEach((pattern) => {
            cacheManager.invalidateByPattern(pattern);
          });
        }
      })
      .catch(() => {
        // Ignore cache invalidation errors
      });

    return response;
  },
  put: <T = any>(
    url: string,
    data?: any,
    config?: HttpRequestConfig & { invalidateCache?: string[] }
  ): Promise<HttpResponse<T>> => {
    const response = makeRequest<T>("put", url, data, config);

    response
      .then(() => {
        if (config?.invalidateCache) {
          config.invalidateCache.forEach((pattern) => {
            cacheManager.invalidateByPattern(pattern);
          });
        }
      })
      .catch(() => {
        // Ignore cache invalidation errors
      });

    return response;
  },
  patch: <T = any>(
    url: string,
    data?: any,
    config?: HttpRequestConfig & { invalidateCache?: string[] }
  ): Promise<HttpResponse<T>> => {
    const response = makeRequest<T>("patch", url, data, config);

    response
      .then(() => {
        if (config?.invalidateCache) {
          config.invalidateCache.forEach((pattern) => {
            cacheManager.invalidateByPattern(pattern);
          });
        }
      })
      .catch(() => {
        // Ignore cache invalidation errors
      });

    return response;
  },
  delete: <T = any>(
    url: string,
    data?: any,
    config?: HttpRequestConfig & { invalidateCache?: string[] }
  ): Promise<HttpResponse<T>> => {
    const response = makeRequest<T>("delete", url, data, config);

    response
      .then(() => {
        if (config?.invalidateCache) {
          config.invalidateCache.forEach((pattern) => {
            cacheManager.invalidateByPattern(pattern);
          });
        }
      })
      .catch(() => {
        // Ignore cache invalidation errors
      });

    return response;
  },
  options: <T = any>(
    url: string,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>> => {
    return makeRequest<T>("options", url, undefined, config);
  },
  head: <T = any>(
    url: string,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>> => {
    return makeRequest<T>("head", url, undefined, config);
  },
  instance: httpClient,

  // Utility methods
  clearCache: (pattern?: string) => {
    if (pattern) {
      cacheManager.invalidateByPattern(pattern);
    } else {
      cacheManager.clear();
    }
  },

  getCacheStats: () => cacheManager.getStats(),
};

export default apiClient;
