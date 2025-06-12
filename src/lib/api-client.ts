import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG } from './api/config';

// Create axios instance with base configuration
const axiosInstance = axios.create({
    baseURL: API_CONFIG.baseURL,
    headers: API_CONFIG.defaultHeaders,
    timeout: API_CONFIG.timeout,
});

// Request interceptor to include auth token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle common errors
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 unauthorized (e.g., token expired)
        if (error.response?.status === 401) {
            // Clear local storage and redirect to login
            localStorage.clear();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Enhanced API client with typed methods
const apiClient = {
    // GET request
    get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
        return axiosInstance.get<T>(url, config);
    },

    // POST request
    post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
        return axiosInstance.post<T>(url, data, config);
    },

    // PUT request
    put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
        return axiosInstance.put<T>(url, data, config);
    },

    // PATCH request
    patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
        return axiosInstance.patch<T>(url, data, config);
    },

    // DELETE request
    delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
        return axiosInstance.delete<T>(url, config);
    },

    // OPTIONS request
    options: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
        return axiosInstance.options<T>(url, config);
    },

    // HEAD request
    head: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
        return axiosInstance.head<T>(url, config);
    },

    // Raw instance for advanced use cases
    instance: axiosInstance as AxiosInstance
};

export default apiClient; 