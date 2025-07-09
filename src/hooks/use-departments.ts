
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { departmentsService } from "@/lib/services";
import type {
  DepartmentInfo,
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
} from "@/lib/types/department.types";
import { useError } from "./use-error";

export const DEPARTMENTS_QUERY_KEY = "departments";

// Query Hook for fetching departments
export function useDepartments(params?: { status?: string }) {
  const {
    data,
    isLoading,
    error,
    refetch: reloadDepartments,
  } = useQuery<DepartmentInfo[], Error>({
    queryKey: [DEPARTMENTS_QUERY_KEY, params],
    queryFn: () => departmentsService.getDepartments(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const activeDepartments =
    data?.filter((dept) => dept.status === "active") ?? [];

  return {
    departments: data ?? [],
    isLoading,
    error,
    activeDepartments,
    reloadDepartments,
  };
}

// Mutation Hook for creating a department
export function useCreateDepartment() {
  const queryClient = useQueryClient();
  const { showError } = useError();

  return useMutation<DepartmentInfo, Error, CreateDepartmentPayload>({
    mutationFn: (payload) => departmentsService.createDepartment(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [DEPARTMENTS_QUERY_KEY] });
      showError(response);
    },
    onError: (error) => {
      showError(error);
    },
  });
}

// Mutation Hook for updating a department
export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  const { showError } = useError();

  return useMutation<void, Error, { id: string; payload: UpdateDepartmentPayload }>({
    mutationFn: ({ id, payload }) =>
      departmentsService.updateDepartment(id, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [DEPARTMENTS_QUERY_KEY] });
      showError(response);
    },
    onError: (error) => {
      showError(error);
    },
  });
}

// Mutation Hook for deleting a department
export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  const { showError } = useError();

  return useMutation<void, Error, string>({
    mutationFn: (id) => departmentsService.deleteDepartment(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [DEPARTMENTS_QUERY_KEY] });
      showError(response);
    },
    onError: (error) => {
      showError(error);
    },
  });
}
