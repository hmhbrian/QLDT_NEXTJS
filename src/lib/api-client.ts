import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { API_CONFIG } from "./api/config";

// Create axios instance with base configuration
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  headers: API_CONFIG.defaultHeaders,
  timeout: API_CONFIG.timeout,
  withCredentials: false, // Tắt credentials cho CORS
});

// Request interceptor to include auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(API_CONFIG.storage.token);

    // Skip adding token for login endpoint
    const isLoginEndpoint = config.url?.includes("/login");

    // Add auth header if token exists and not login endpoint
    if (token && !isLoginEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log requests in development
    if (process.env.NODE_ENV === "development") {
      console.log("API Request:", {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL || API_CONFIG.baseURL,
        params: config.params,
        hasTokenInStorage: !!token,
        isLoginEndpoint,
        willSendToken: !!token && !isLoginEndpoint,
      });
    }

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === "development") {
      console.log("API Response:", {
        method: response.config.method?.toUpperCase(),
        url: response.config.url,
        status: response.status,
        dataKeys: Object.keys(response.data || {}),
      });
    }

    return response;
  },
  (error) => {
    const errorInfo = {
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
    };

    console.error("API Error:", errorInfo);

    // Handle specific error cases
    switch (error.response?.status) {
      case 401:
        // Unauthorized - clear storage and redirect to login
        localStorage.removeItem(API_CONFIG.storage.token);
        localStorage.removeItem(API_CONFIG.storage.user);
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/login")
        ) {
          window.location.href = "/login";
        }
        break;

      case 403:
        // Forbidden - show access denied message
        console.warn("Access denied to resource");
        break;

      case 404:
        // Not found - resource doesn't exist
        console.warn("Resource not found");
        break;

      case 500:
        // Server error
        console.error("Internal server error");
        break;
    }

    return Promise.reject(error);
  }
);

// Enhanced API client with typed methods
const apiClient = {
  // GET request
  get: <T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    return axiosInstance.get<T>(url, config);
  },

  // POST request
  post: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    return axiosInstance.post<T>(url, data, config);
  },

  // PUT request
  put: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    return axiosInstance.put<T>(url, data, config);
  },

  // PATCH request
  patch: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    return axiosInstance.patch<T>(url, data, config);
  },

  // DELETE request
  delete: <T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    return axiosInstance.delete<T>(url, config);
  },

  // OPTIONS request
  options: <T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    return axiosInstance.options<T>(url, config);
  },

  // HEAD request
  head: <T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    return axiosInstance.head<T>(url, config);
  },

  // Raw instance for advanced use cases
  instance: axiosInstance as AxiosInstance,
};

export default apiClient;
