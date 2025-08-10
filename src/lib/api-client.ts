import { httpClient } from "./services/modern/auth.service";
import type { HttpRequestConfig, HttpResponse } from "./http-client";

const apiClient = {
  request: async <T = any>(
    config: HttpRequestConfig & { method: string; url: string; data?: any }
  ): Promise<T> => {
    const { method, url, data, ...restConfig } = config;

    const lowercasedMethod = method.toLowerCase() as
      | "get"
      | "post"
      | "put"
      | "patch"
      | "delete";

    let response: HttpResponse<T>;

    try {
      switch (lowercasedMethod) {
        case "get":
          response = await httpClient.get<T>(url, restConfig);
          break;
        case "post":
          response = await httpClient.post<T>(url, data, restConfig);
          break;
        case "put":
          response = await httpClient.put<T>(url, data, restConfig);
          break;
        case "patch":
          response = await httpClient.patch<T>(url, data, restConfig);
          break;
        case "delete":
          response = await httpClient.delete<T>(url, data, restConfig);
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default apiClient;
