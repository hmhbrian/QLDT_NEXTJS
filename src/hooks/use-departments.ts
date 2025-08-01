import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { departmentsService } from "@/lib/services";
import type {
  DepartmentInfo,
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
} from "@/lib/types/department.types";
import { useError } from "./use-error";

export const DEPARTMENTS_QUERY_KEY = "departments";

export function useDepartments(params?: { status?: "active" }) {
  const {
    data,
    isLoading,
    error,
    refetch: reloadDepartments,
  } = useQuery<DepartmentInfo[], Error>({
    queryKey: [DEPARTMENTS_QUERY_KEY, params],
    queryFn: () => departmentsService.getDepartments(params),
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return {
    departments: data ?? [],
    isLoading,
    error,
    reloadDepartments,
  };
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  const { showError } = useError();

  return useMutation<DepartmentInfo, Error, CreateDepartmentPayload>({
    mutationFn: (payload) => departmentsService.createDepartment(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [DEPARTMENTS_QUERY_KEY] });
      showError({
        success: true,
        message: `Đã tạo phòng ban "${response.name}" thành công.`,
      });
    },
    onError: (error) => {
      showError(error);
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  const { showError } = useError();

  return useMutation<
    void,
    Error,
    { id: string; payload: UpdateDepartmentPayload }
  >({
    mutationFn: ({ id, payload }) =>
      departmentsService.updateDepartment(id, payload),
    onSuccess: (_, { payload }) => {
      queryClient.invalidateQueries({ queryKey: [DEPARTMENTS_QUERY_KEY] });
      showError({
        success: true,
        message: `Đã cập nhật phòng ban "${payload.DepartmentName}" thành công.`,
      });
    },
    onError: (error) => {
      showError(error);
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  const { showError } = useError();

  return useMutation<void, Error, string>({
    mutationFn: (id) => departmentsService.deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DEPARTMENTS_QUERY_KEY] });
      showError({ success: true, message: "Đã xóa phòng ban thành công." });
    },
    onError: (error) => {
      showError(error);
    },
  });
}
