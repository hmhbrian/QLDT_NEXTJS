"use client";

import { BaseService } from "@/lib/core";
import { API_CONFIG } from "@/lib/config";

export interface Certificate {
  id: number;
  user: any;
  course: {
    id: string;
    name: string;
  };
  certificateUrl: string;
  createdAt: string;
}

export interface CertificateApiResponse {
  success: boolean;
  message: string | null;
  data: Certificate | Certificate[];
}

export class CertificatesService extends BaseService<Certificate, any, any> {
  constructor() {
    super(API_CONFIG.endpoints.certs.base);
  }

  async getAllCertificates(): Promise<Certificate[]> {
    try {
      const data = await this.get<Certificate[]>(this.endpoint);
      console.log("Certificates API Data:", data);

      if (Array.isArray(data)) {
        return data;
      }

      return [];
    } catch (error) {
      console.error("Error fetching certificates:", error);
      throw error;
    }
  }

  async getCertificateByCourseId(
    courseId: string
  ): Promise<Certificate | null> {
    try {
      const data = await this.get<Certificate>(`${this.endpoint}/${courseId}`);
      console.log(`Certificate for course ${courseId} API Data:`, data);

      if (data && !Array.isArray(data)) {
        return data;
      }

      return null;
    } catch (error) {
      console.error(
        `Error fetching certificate for course ${courseId}:`,
        error
      );
      throw error;
    }
  }

  async createCertificate(courseId: string): Promise<Certificate> {
    try {
      const endpoint = `${this.endpoint}/${courseId}`;
      const data = await this.post<Certificate>(endpoint, {});
      console.log(`Creating certificate for course ${courseId}:`, data);
      return data;
    } catch (error) {
      console.error(`Error creating certificate for course ${courseId}:`, error);
      throw this.handleError("POST", `${this.endpoint}/${courseId}`, error);
    }
  }

  async downloadCertificate(certificateUrl: string): Promise<void> {
    try {
      // Open certificate in new tab for download
      window.open(certificateUrl, "_blank");
    } catch (error) {
      console.error("Error downloading certificate:", error);
      throw error;
    }
  }
}

export const certificatesService = new CertificatesService();
