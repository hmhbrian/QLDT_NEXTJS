
import {
  CustomHttpClient,
  HttpResponse,
  HttpRequestConfig,
} from "./http-client";
import { API_CONFIG } from "./config";
import { cookieManager } from "./cache";

// Create custom HTTP client instance
const httpClient = new CustomHttpClient({
  baseURL: API_CONFIG.baseURL,
  headers: API_CONFIG.defaultHeaders,
  timeout: API_CONFIG.timeout,
});

// Request wrapper to add auth token
const makeRequest = async <T>(
  method: "get" | "post" | "put" | "patch" | "delete" | "options" | "head",
  url: string,
  data?: any,
  config?: HttpRequestConfig
): Promise<HttpResponse<T>> => {
  const token = cookieManager.get("auth_token");

  const isPublicEndpoint = url.includes("/public") || url.includes("/health");
  // Login is a special case, handled by its own service logic
  const isLoginEndpoint = url.endsWith(API_CONFIG.endpoints.auth.login);

  // Prepare headers
  const headers: Record<string, string> = {
    ...config?.headers,
  };
  
  // Disable caching for login requests specifically
  if (isLoginEndpoint) {
    headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
    headers["Pragma"] = "no-cache";
    headers["Expires"] = "0";
  }

  // Add auth header if token exists and not a public endpoint
  if (token && !isPublicEndpoint) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Log requests in development
  if (process.env.NODE_ENV === "development") {
    console.log("➡️ API Request:", {
      method: method.toUpperCase(),
      url: `${API_CONFIG.baseURL}${url}`,
      params: config?.params,
      hasTokenInStorage: !!token,
      isLoginEndpoint,
      willSendToken: !!token && !isPublicEndpoint,
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

    // Log successful responses in development
    if (process.env.NODE_ENV === "development") {
      console.log("⬅️ API Response:", {
        method: method.toUpperCase(),
        url: `${API_CONFIG.baseURL}${url}`,
        status: response.status,
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

    console.error("❌ API Error:", errorInfo);

    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - clear all auth data and redirect
      cookieManager.remove("auth_token");
      cookieManager.remove("refresh_token");

      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login")
      ) {
        // Redirect to login page
        window.location.href = "/login";
      }
    }
    
    throw error;
  }
};

// API client with typed methods
const apiClient = {
  get: <T = any>(
    url: string,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>> => {
    return makeRequest<T>("get", url, undefined, config);
  },
  post: <T = any>(
    url: string,
    data?: any,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>> => {
    return makeRequest<T>("post", url, data, config);
  },
  put: <T = any>(
    url: string,
    data?: any,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>> => {
    return makeRequest<T>("put", url, data, config);
  },
  patch: <T = any>(
    url: string,
    data?: any,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>> => {
    return makeRequest<T>("patch", url, data, config);
  },
  delete: <T = any>(
    url: string,
    data?: any,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>> => {
    return makeRequest<T>("delete", url, data, config);
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
};

export default apiClient;
