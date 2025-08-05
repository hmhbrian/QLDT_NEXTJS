"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { ApiResponse } from "@/lib/core";

export interface CourseCategory {
  id: number;
  categoryName: string;
  description: string;
}

const courseCategoriesService = {
  getAll: async (): Promise<ApiResponse<CourseCategory[]>> => {
    const response = await apiClient.request<ApiResponse<CourseCategory[]>>({
      method: "GET",
      url: "/CourseCategory",
    });
    return response;
  },
};

export const useCourseCategories = () => {
  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["course-categories"],
    queryFn: courseCategoriesService.getAll,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    categories: response?.data || [],
    isLoading,
    error,
  };
};
