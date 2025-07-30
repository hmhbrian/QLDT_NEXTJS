"use client";

import { useQuery } from "@tanstack/react-query";
import {
  certificatesService,
  Certificate,
} from "@/lib/services/modern/certificates.service";
import { useAuth } from "./useAuth";
import { useError } from "./use-error";

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
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
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
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
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
