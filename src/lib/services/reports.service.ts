import { BaseService } from "./base.service";

export interface AvgFeedbackData {
  q1_relevanceAvg: number;
  q2_clarityAvg: number;
  q3_structureAvg: number;
  q4_durationAvg: number;
  q5_materialAvg: number;
}

export interface MonthlyReportData {
  numberOfCourses: number;
  numberOfStudents: number;
  averangeCompletedPercentage: number;
  averangeTime: number;
  averagePositiveFeedback: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
}

class ReportService extends BaseService {
  async getAvgFeedback(): Promise<AvgFeedbackData> {
    const response = await this.get<ApiResponse<AvgFeedbackData>>(
      "/Report/avg-feedback"
    );
    return response.data;
  }

  async getMonthlyReport(month: number): Promise<MonthlyReportData> {
    const response = await this.get<ApiResponse<MonthlyReportData>>(
      `/Report/data-report/${month}`
    );
    return response.data;
  }
}

export const reportService = new ReportService();
