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

export interface ReportData {
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

export interface CourseStatusDistribution {
  statusName: string;
  percent: number;
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

  // API thống nhất cho /api/Report/data-report với month, quarter, year
  async getDataReport(params: {
    month?: number;
    quarter?: number;
    year?: number;
  }): Promise<ReportData> {
    const { month, quarter, year } = params;
    console.log(`🔍 Calling getDataReport API with params:`, params);

    // Tạo query string từ params
    const queryParams = new URLSearchParams();
    if (month !== undefined) queryParams.append("month", month.toString());
    if (quarter !== undefined)
      queryParams.append("quarter", quarter.toString());
    if (year !== undefined) queryParams.append("year", year.toString());

    const endpoint = `/Report/data-report?${queryParams.toString()}`;
    console.log(`📡 Calling endpoint: ${endpoint}`);

    const response = await this.get<ReportData>(endpoint);
    console.log("📊 Data report response:", response);

    if (!response) {
      throw new Error("Không thể lấy dữ liệu báo cáo");
    }

    return response;
  }

  // API lấy báo cáo theo năm
  async getYearlyReport(year: number): Promise<ReportData> {
    return this.getDataReport({ year });
  }

  // API lấy báo cáo theo quý
  async getQuarterlyReport(quarter: number, year: number): Promise<ReportData> {
    return this.getDataReport({ quarter, year });
  }

  // API lấy báo cáo theo tháng
  async getMonthlyReport(month: number, year: number): Promise<ReportData> {
    return this.getDataReport({ month, year });
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

  // API for course status distribution
  async getCourseStatusDistribution(): Promise<CourseStatusDistribution[]> {
    console.log("🔍 Calling getCourseStatusDistribution API...");
    const response = await this.get<CourseStatusDistribution[]>(
      API_CONFIG.endpoints.report.reportStatus
    );
    console.log("📊 Course status distribution response:", response);
    return response || [];
  }
}

export const reportService = new ReportService();
