/**
 * Optimized CRUD Operations Hook
 * Provides smart caching, optimistic updates, and efficient data management
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { extractErrorMessage } from "@/lib/core";

interface OptimizedCrudConfig<T, CreatePayload, UpdatePayload> {
  queryKey: string;
  // Services
  createFn: (payload: CreatePayload) => Promise<T>;
  updateFn: (id: string, payload: UpdatePayload) => Promise<T>;
  deleteFn: (id: string) => Promise<void>;

  // Optimistic update functions
  createOptimistic?: (old: T[], payload: CreatePayload) => T[];
  updateOptimistic?: (old: T[], id: string, payload: UpdatePayload) => T[];
  deleteOptimistic?: (old: T[], id: string) => T[];

  // Messages
  createSuccessMessage?: string;
  updateSuccessMessage?: string;
  deleteSuccessMessage?: string;

  // Additional invalidation keys
  relatedKeys?: string[];
}

export function useOptimizedCrud<
  T extends { id: string | number },
  CreatePayload,
  UpdatePayload
>(config: OptimizedCrudConfig<T, CreatePayload, UpdatePayload>) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const optimisticCountRef = useRef(0);

  const {
    queryKey,
    createFn,
    updateFn,
    deleteFn,
    createOptimistic,
    updateOptimistic,
    deleteOptimistic,
    createSuccessMessage = "Đã tạo thành công",
    updateSuccessMessage = "Đã cập nhật thành công",
    deleteSuccessMessage = "Đã xóa thành công",
    relatedKeys = [],
  } = config;

  // Smart invalidation - only invalidate what's necessary
  const smartInvalidate = useCallback(
    (keys: string[] = []) => {
      const allKeys = [queryKey, ...relatedKeys, ...keys];

      // Batch invalidations to reduce re-renders
      Promise.all(
        allKeys.map((key) =>
          queryClient.invalidateQueries({
            queryKey: [key],
            refetchType: "active",
          })
        )
      );
    },
    [queryClient, queryKey, relatedKeys]
  );

  // Create mutation with optimistic updates
  const createMutation = useMutation<
    T,
    Error,
    CreatePayload,
    { previousData?: T[] }
  >({
    mutationFn: createFn,
    onMutate: async (payload) => {
      const queryKeyArray = [queryKey];
      await queryClient.cancelQueries({ queryKey: queryKeyArray });

      const previousData = queryClient.getQueryData<T[]>(queryKeyArray);

      if (createOptimistic && previousData) {
        const optimisticData = createOptimistic(previousData, payload);
        queryClient.setQueryData(queryKeyArray, optimisticData);
      }

      return { previousData };
    },
    onSuccess: (data) => {
      toast({
        title: "Thành công",
        description: createSuccessMessage,
        variant: "success",
      });

      // Update cache with real data
      const queryKeyArray = [queryKey];
      queryClient.setQueryData<T[]>(queryKeyArray, (old = []) => {
        // Remove optimistic item and add real item
        const filtered = old.filter(
          (item) =>
            typeof item.id !== "string" ||
            !item.id.toString().startsWith("temp-")
        );
        return [...filtered, data];
      });
    },
    onError: (error, _, context) => {
      if (context?.previousData) {
        queryClient.setQueryData([queryKey], context.previousData);
      }

      toast({
        title: "Lỗi",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Light invalidation only if optimistic update failed
      smartInvalidate();
    },
  });

  // Update mutation with optimistic updates
  const updateMutation = useMutation<
    T,
    Error,
    { id: string; payload: UpdatePayload },
    { previousData?: T[] }
  >({
    mutationFn: ({ id, payload }) => updateFn(id, payload),
    onMutate: async ({ id, payload }) => {
      const queryKeyArray = [queryKey];
      await queryClient.cancelQueries({ queryKey: queryKeyArray });

      const previousData = queryClient.getQueryData<T[]>(queryKeyArray);

      if (updateOptimistic && previousData) {
        const optimisticData = updateOptimistic(previousData, id, payload);
        queryClient.setQueryData(queryKeyArray, optimisticData);
      }

      return { previousData };
    },
    onSuccess: (data, { id }) => {
      toast({
        title: "Thành công",
        description: updateSuccessMessage,
        variant: "success",
      });

      // Update cache with real data
      const queryKeyArray = [queryKey];
      queryClient.setQueryData<T[]>(queryKeyArray, (old = []) =>
        old.map((item) => (item.id === id ? data : item))
      );
    },
    onError: (error, _, context) => {
      if (context?.previousData) {
        queryClient.setQueryData([queryKey], context.previousData);
      }

      toast({
        title: "Lỗi",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  // Delete mutation with optimistic updates
  const deleteMutation = useMutation<
    void,
    Error,
    string,
    { previousData?: T[] }
  >({
    mutationFn: deleteFn,
    onMutate: async (id) => {
      const queryKeyArray = [queryKey];
      await queryClient.cancelQueries({ queryKey: queryKeyArray });

      const previousData = queryClient.getQueryData<T[]>(queryKeyArray);

      if (deleteOptimistic && previousData) {
        const optimisticData = deleteOptimistic(previousData, id);
        queryClient.setQueryData(queryKeyArray, optimisticData);
      }

      return { previousData };
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: deleteSuccessMessage,
        variant: "success",
      });
    },
    onError: (error, _, context) => {
      if (context?.previousData) {
        queryClient.setQueryData([queryKey], context.previousData);
      }

      toast({
        title: "Lỗi",
        description: extractErrorMessage(error),
        variant: "destructive",
      });

      // Refetch on error
      smartInvalidate();
    },
  });

  // Optimistic helpers
  const generateOptimisticId = useCallback(() => {
    optimisticCountRef.current += 1;
    return `temp-${Date.now()}-${optimisticCountRef.current}`;
  }, []);

  return {
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,

    // Async versions
    createAsync: createMutation.mutateAsync,
    updateAsync: updateMutation.mutateAsync,
    deleteAsync: deleteMutation.mutateAsync,

    // States
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Utilities
    generateOptimisticId,
    smartInvalidate,

    // Raw mutations for advanced usage
    createMutation,
    updateMutation,
    deleteMutation,
  };
}

// Example usage - commented out to avoid implementation errors
/* 
export function useOptimizedCourseCrud() {
  return useOptimizedCrud({
    queryKey: 'courses',
    createFn: async (payload: any) => {
      // Replace with actual service call
      throw new Error('Not implemented');
    },
    updateFn: async (id: string, payload: any) => {
      // Replace with actual service call
      throw new Error('Not implemented');
    },  
    deleteFn: async (id: string) => {
      // Replace with actual service call
      throw new Error('Not implemented');
    },
    createOptimistic: (old: any[], payload: any) => [
      ...old,
      {
        id: `temp-${Date.now()}`,
        ...payload,
        createdAt: new Date().toISOString(),
      }
    ],
    updateOptimistic: (old: any[], id: string, payload: any) =>
      old.map(item => 
        item.id === id ? { ...item, ...payload } : item
      ),
    deleteOptimistic: (old: any[], id: string) =>
      old.filter(item => item.id !== id),
    relatedKeys: ['enrolledCourses', 'attachedFiles']
  });
}
*/
