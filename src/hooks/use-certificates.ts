"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  certificatesService,
  Certificate,
} from "@/lib/services/modern/certificates.service";
import { useAuth } from "./useAuth";
import { useError } from "./use-error";
import { useToast } from "@/components/ui/use-toast";

export const CERTIFICATES_QUERY_KEY = "certificates";

export function useCertificates() {
  const { user } = useAuth();
  const { showError } = useError();

  return useQuery<Certificate[], Error>({
    queryKey: [CERTIFICATES_QUERY_KEY, user?.id],
    queryFn: async () => {
      try {
        return await certificatesService.getAllCertificates();
      } catch (error) {
        showError(error);
        throw error;
      }
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: false,
  });
}

export function useCertificateByCourse(courseId: string) {
  const { user } = useAuth();
  const { showError } = useError();

  return useQuery<Certificate | null, Error>({
    queryKey: [CERTIFICATES_QUERY_KEY, "course", courseId, user?.id],
    queryFn: async () => {
      try {
        return await certificatesService.getCertificateByCourseId(courseId);
      } catch (error) {
        showError(error);
        throw error;
      }
    },
    enabled: !!user && !!courseId,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: false,
  });
}

export function useCreateCertificate() {
  const { showError } = useError();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      return await certificatesService.createCertificate(courseId);
    },
    onSuccess: (data) => {
      toast({
        title: "Thành công",
        description: "Chứng chỉ đã được tạo thành công!",
        variant: "success",
      });
      // Invalidate certificates queries to refresh data
      queryClient.invalidateQueries({ queryKey: [CERTIFICATES_QUERY_KEY] });
    },
    onError: (error) => {
      showError(error);
    },
  });
}

export function useDownloadCertificate() {
  const { showError } = useError();

  const downloadCertificate = async (certificateUrl: string) => {
    try {
      await certificatesService.downloadCertificate(certificateUrl);
    } catch (error) {
      showError(error);
      throw error;
    }
  };

  return { downloadCertificate };
}
