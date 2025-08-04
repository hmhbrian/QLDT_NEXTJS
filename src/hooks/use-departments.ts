
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { departmentsService } from "@/lib/services";
import type {
  DepartmentInfo,
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
  DepartmentApiResponse,
} from "@/lib/types/department.types";
import { extractErrorMessage } from "@/lib/core";
import { useToast } from "@/components/ui/use-toast";
import type { PaginatedResponse } from "@/lib/core";
import { mapDepartmentApiToUi } from "@/lib/mappers/department.mapper";

export const DEPARTMENTS_QUERY_KEY = "departments";

export function useDepartments(params?: { status?: "active" }) {
  const queryKey = [DEPARTMENTS_QUERY_KEY, "list", params];

  // Sửa lỗi logic: API trả về mảng DepartmentApiResponse[] trực tiếp, không phải PaginatedResponse
  // Do đó, ta cần map trực tiếp mảng này.
  const { data, isLoading, error } = useQuery<DepartmentInfo[], Error>({
    queryKey,
    queryFn: async () => {
      const apiResponse = await departmentsService.getDepartments(params);
      return (apiResponse || []).map(mapDepartmentApiToUi);
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    departments: data ?? [],
    isLoading,
    error,
  };
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<DepartmentInfo, Error, CreateDepartmentPayload>({
    mutationFn: (payload) => departmentsService.createDepartment(payload),
    onSuccess: (newDepartment) => {
      toast({
        title: "Thành công",
        description: `Đã tạo phòng ban "${newDepartment.name}" thành công.`,
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [DEPARTMENTS_QUERY_KEY] });
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    void,
    Error,
    { id: string; payload: UpdateDepartmentPayload },
    { previousDepartments?: DepartmentInfo[] }
  >({
    mutationFn: ({ id, payload }) => {
        return departmentsService.updateDepartment(id, payload);
    },
    onMutate: async ({ id, payload }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: [DEPARTMENTS_QUERY_KEY] });

      // Snapshot the previous value
      const previousDepartments = queryClient.getQueryData<DepartmentInfo[]>([DEPARTMENTS_QUERY_KEY, 'list', { status: undefined }]);

      // Optimistically update to the new value
      if (previousDepartments) {
          queryClient.setQueryData<DepartmentInfo[]>([DEPARTMENTS_QUERY_KEY, 'list', { status: undefined }], old => {
              if (!old) return [];
              return old.map(d => 
                  d.departmentId === id 
                  ? { 
                      ...d, 
                      name: payload.DepartmentName ?? d.name,
                      code: payload.DepartmentCode ?? d.code,
                      description: payload.Description ?? d.description,
                      managerId: payload.ManagerId ?? d.managerId,
                      parentId: payload.ParentId !== undefined ? String(payload.ParentId) : d.parentId,
                      status: { ...d.status, id: payload.StatusId ?? d.status.id },
                    } 
                  : d
              );
          });
      }

      // Return a context object with the snapshotted value
      return { previousDepartments };
    },
    onSuccess: (_, { payload }) => {
      toast({
        title: "Thành công",
        description: `Đã cập nhật phòng ban "${payload.DepartmentName}" thành công.`,
        variant: "success",
      });
    },
    onError: (err, variables, context) => {
      // Rollback to the previous value if the mutation fails
      if (context?.previousDepartments) {
        queryClient.setQueryData(
          [DEPARTMENTS_QUERY_KEY, "list", { status: undefined }],
          context.previousDepartments
        );
      }
      toast({
        title: "Lỗi cập nhật",
        description: `Không thể cập nhật phòng ban: ${extractErrorMessage(err)}`,
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure data consistency
      queryClient.invalidateQueries({
        queryKey: [DEPARTMENTS_QUERY_KEY, "list"],
      });
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    void,
    Error,
    string,
    { previousDepartments?: PaginatedResponse<DepartmentInfo> }
  >({
    mutationFn: (id) => departmentsService.deleteDepartment(id),
    onMutate: async (idToDelete) => {
      const queryKey = [DEPARTMENTS_QUERY_KEY, "list", { status: "active" }];
      await queryClient.cancelQueries({ queryKey });

      const previousDepartments =
        queryClient.getQueryData<PaginatedResponse<DepartmentInfo>>(queryKey);

      if (previousDepartments) {
        queryClient.setQueryData<PaginatedResponse<DepartmentInfo>>(
          queryKey,
          (old) => old ? { ...old, items: old.items.filter((d) => d.departmentId !== idToDelete) } : old
        );
      }

      return { previousDepartments };
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã xóa phòng ban thành công.",
        variant: "success",
      });
    },
    onError: (err, id, context) => {
      if (context?.previousDepartments) {
        queryClient.setQueryData(
          [DEPARTMENTS_QUERY_KEY, "list", { status: "active" }],
          context.previousDepartments
        );
      }
      toast({
        title: "Lỗi",
        description: extractErrorMessage(err),
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [DEPARTMENTS_QUERY_KEY] });
    },
  });
}
