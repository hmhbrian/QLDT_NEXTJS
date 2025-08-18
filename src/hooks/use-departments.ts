import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { departmentsService } from "@/lib/services";
import type {
  DepartmentInfo,
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
} from "@/lib/types/department.types";
import { extractErrorMessage } from "@/lib/core";
import { useToast } from "@/components/ui/use-toast";
import type { PaginatedResponse } from "@/lib/core";
import { mapDepartmentApiToUi } from "@/lib/mappers/department.mapper";

export const DEPARTMENTS_QUERY_KEY = "departments";

export function useDepartments(params?: { status?: "active" }) {
  const queryKey = [DEPARTMENTS_QUERY_KEY, "list", params];

  const { data, isLoading, error } = useQuery<DepartmentInfo[], Error>({
    queryKey,
    queryFn: async () => {
      console.log(
        `♻️ [useDepartments] Refetching departments with params:`,
        params
      );
      const apiResponse = await departmentsService.getDepartments(params);
      return (apiResponse || []).map(mapDepartmentApiToUi);
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
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
    mutationFn: (payload) => {
      console.log(
        "▶️ [useCreateDepartment] Mutation started with payload:",
        payload
      );
      return departmentsService.createDepartment(payload);
    },
    onSuccess: (newDepartment) => {
      console.log(
        "✅ [useCreateDepartment] Mutation successful:",
        newDepartment
      );
      toast({
        title: "Thành công",
        description: `Đã tạo phòng ban "${newDepartment.name}" thành công.`,
        variant: "success",
      });
    },
    onError: (error) => {
      console.error("❌ [useCreateDepartment] Mutation failed:", error);
      toast({
        title: "Lỗi",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
    onSettled: () => {
      console.log(`🔄 [useCreateDepartment] Invalidating queries with key:`, [
        DEPARTMENTS_QUERY_KEY,
      ]);
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
    { id: number; payload: UpdateDepartmentPayload },
    { previousDepartments?: DepartmentInfo[] }
  >({
    mutationFn: ({ id, payload }) => {
      return departmentsService.updateDepartment(id, payload);
    },
    onSuccess: (_, { payload }) => {
      toast({
        title: "Thành công",
        description: `Đã cập nhật phòng ban "${payload.DepartmentName}" thành công.`,
        variant: "success",
      });
    },
    onError: (err, variables, context) => {
      console.error("❌ [useUpdateDepartment] Mutation failed:", err);
      if (context?.previousDepartments) {
        queryClient.setQueryData(
          [DEPARTMENTS_QUERY_KEY, "list", { status: undefined }],
          context.previousDepartments
        );
      }
      toast({
        title: "Lỗi cập nhật",
        description: `Không thể cập nhật phòng ban: ${extractErrorMessage(
          err
        )}`,
        variant: "destructive",
      });
    },
    onSettled: () => {
      console.log(`🔄 [useUpdateDepartment] Invalidating queries with key:`, [
        DEPARTMENTS_QUERY_KEY,
      ]);
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
    number,
    { previousDepartments?: PaginatedResponse<DepartmentInfo> }
  >({
    mutationFn: (id) => {
      console.log(`▶️ [useDeleteDepartment] Mutation started for ID:`, id);
      return departmentsService.deleteDepartment(id);
    },
    onSuccess: () => {
      console.log("✅ [useDeleteDepartment] Mutation successful");
      toast({
        title: "Thành công",
        description: "Đã xóa phòng ban thành công.",
        variant: "success",
      });
    },
    onError: (err) => {
      console.error("❌ [useDeleteDepartment] Mutation failed:", err);
      toast({
        title: "Lỗi",
        description: extractErrorMessage(err),
        variant: "destructive",
      });
    },
    onSettled: () => {
      console.log(`🔄 [useDeleteDepartment] Invalidating queries with key:`, [
        DEPARTMENTS_QUERY_KEY,
      ]);
      queryClient.invalidateQueries({ queryKey: [DEPARTMENTS_QUERY_KEY] });
    },
  });
}
