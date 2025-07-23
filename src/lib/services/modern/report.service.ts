import { BaseService } from "@/lib/core";
import { API_CONFIG } from "@/lib/config";
import { TopDepartment } from "@/lib/types/report.types";

// Interface cho dữ liệu thống kê báo cáo
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

export interface CourseAndAvgFeedback {
  courseName: string;
  avgFeedback: AvgFeedbackData;
}

export interface StudentsOfCourse {
  courseName: string;
  totalStudent: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
}

class ReportService extends BaseService {
  constructor() {
    super(""); // Base endpoint không cần thiết vì sử dụng full paths
  }

  // API lấy đánh giá trung bình tổng thể
  async getAvgFeedback(): Promise<AvgFeedbackData> {
    console.log("🔍 Calling getAvgFeedback API...");
    const response = await this.get<AvgFeedbackData>(
      API_CONFIG.endpoints.report.avgFeedback
    );
    console.log("📊 Processed response:", response);

    if (!response) {
      throw new Error("Không thể lấy dữ liệu đánh giá trung bình");
    }

    return response;
  }

  // API lấy báo cáo theo tháng
  async getMonthlyReport(month: number): Promise<MonthlyReportData> {
    console.log(`🔍 Calling getMonthlyReport API for month ${month}...`);
    const response = await this.get<MonthlyReportData>(
      API_CONFIG.endpoints.report.monthlyReport(month)
    );
    console.log("📊 Monthly report response:", response);

    if (!response) {
      throw new Error(`Không thể lấy dữ liệu báo cáo tháng ${month}`);
    }

    return response;
  }

  // API lấy danh sách khóa học và đánh giá trung bình
  async getCourseAndAvgFeedback(): Promise<CourseAndAvgFeedback[]> {
    const response = await this.get<CourseAndAvgFeedback[]>(
      API_CONFIG.endpoints.report.courseAndAvgFeedback
    );
    return response || [];
  }

  // API lấy số học viên theo khóa học
  async getStudentsOfCourse(): Promise<StudentsOfCourse[]> {
    const response = await this.get<StudentsOfCourse[]>(
      API_CONFIG.endpoints.report.studentsOfCourse
    );
    return response || [];
  }
  
  // API for top departments
  async getTopDepartments(): Promise<TopDepartment[]> {
    const response = await this.get<TopDepartment[]>(
      API_CONFIG.endpoints.report.topDepartment
    );
    return response || [];
  }
}

export const reportService = new ReportService();
