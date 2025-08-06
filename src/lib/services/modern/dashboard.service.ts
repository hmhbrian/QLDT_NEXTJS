"use client";

import { BaseService } from "../../core";
import { API_CONFIG } from "@/lib/config";

export interface StudentDashboardData {
  numberRegisteredCourse: number;
  numberCompletedCourse: number;
  averangeCompletedPercentage: number;
}

interface StudentDashboardResponse {
  success: boolean;
  message: string | null;
  data: StudentDashboardData;
}

export class DashboardService extends BaseService<StudentDashboardResponse> {
  constructor() {
    super("/Dashboard");
  }

  async getStudentDashboard(): Promise<StudentDashboardData> {
    console.log("🚀 [DashboardService] Starting API call to:", `${this.endpoint}/Student`);
    
    try {
      // BaseService sẽ tự động xử lý response và trả về data nếu success=true
      // Hoặc throw error nếu success=false
      const data = await this.get<StudentDashboardData>(`${this.endpoint}/Student`);
      
      console.log("✅ [DashboardService] Successfully received data:", data);
      return data;
    } catch (error) {
      console.error("💥 [DashboardService] Exception caught:", error);
      console.error("💥 [DashboardService] Error type:", typeof error);
      console.error("💥 [DashboardService] Error details:", error);
      throw error;
    }
  }
}

export const dashboardService = new DashboardService();
