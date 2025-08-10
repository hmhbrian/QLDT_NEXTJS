import { BaseService } from "@/lib/core/base-service";
import { ActivityLog } from "@/lib/types/course.types";
import { API_CONFIG } from "@/lib/config/api.config";

export interface ActivityLogParams {
  courseId: string;
  userId?: string;
  action?: string;
  entityType?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
}

export class ActivityLogService extends BaseService<ActivityLog> {
  constructor() {
    super("activity-logs");
  }

  async getCourseActivityLogs(
    courseId: string,
    params?: Omit<ActivityLogParams, 'courseId'>
  ): Promise<ActivityLog[]> {
    const endpoint = `${API_CONFIG.endpoints.courses.detail(courseId)}/activity-logs`;
    return this.get<ActivityLog[]>(endpoint, { params });
  }

  async createActivityLog(log: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<ActivityLog> {
    const endpoint = `activity-logs`;
    return this.post<ActivityLog>(endpoint, log);
  }

  // Mock data for development - remove when backend is ready
  async getMockActivityLogs(courseId?: string, params?: Omit<ActivityLogParams, 'courseId'>): Promise<ActivityLog[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockLogs: ActivityLog[] = [
      {
        id: "1",
        userId: "user1",
        userName: "Nguyễn Văn A",
        userRole: "ADMIN",
        courseId: courseId || "generic-course-1",
        action: "CREATE",
        entityType: "COURSE",
        entityId: courseId || "generic-course-1",
        entityName: "Khóa học JavaScript",
        description: "Tạo mới khóa học JavaScript cơ bản",
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: { version: "1.0" },
        ipAddress: "192.168.1.100"
      },
      {
        id: "2",
        userId: "user2",
        userName: "Trần Thị B",
        userRole: "HR",
        courseId: courseId || "generic-course-1",
        action: "UPDATE",
        entityType: "COURSE",
        entityId: courseId || "generic-course-1",
        entityName: "Khóa học JavaScript",
        description: "Cập nhật thông tin khóa học: thêm mô tả chi tiết",
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: { 
          changes: ["description", "objectives"],
          oldDescription: "Mô tả cũ",
          newDescription: "Mô tả mới"
        },
        ipAddress: "192.168.1.101"
      },
      {
        id: "3",
        userId: "user3",
        userName: "Lê Văn C",
        userRole: "HOCVIEN",
        courseId: courseId || "generic-course-1",
        action: "ENROLL",
        entityType: "USER_ENROLLMENT",
        entityId: "enrollment1",
        description: "Đăng ký tham gia khóa học",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        ipAddress: "192.168.1.102"
      },
      {
        id: "4",
        userId: "user1",
        userName: "Nguyễn Văn A",
        userRole: "ADMIN",
        courseId: courseId || "generic-course-1",
        action: "CREATE",
        entityType: "LESSON",
        entityId: "lesson1",
        entityName: "Bài 1: Giới thiệu JavaScript",
        description: "Thêm bài học mới: Giới thiệu JavaScript",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: { lessonType: "video_url", duration: "30 minutes" },
        ipAddress: "192.168.1.100"
      },
      {
        id: "5",
        userId: "user4",
        userName: "Phạm Thị D",
        userRole: "HOCVIEN",
        courseId: courseId || "generic-course-1",
        action: "START_LESSON",
        entityType: "LESSON",
        entityId: "lesson1",
        entityName: "Bài 1: Giới thiệu JavaScript",
        description: "Bắt đầu học bài: Giới thiệu JavaScript",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        ipAddress: "192.168.1.103"
      },
      {
        id: "6",
        userId: "user2",
        userName: "Trần Thị B",
        userRole: "HR",
        courseId: courseId || "generic-course-2",
        action: "CREATE",
        entityType: "TEST",
        entityId: "test1",
        entityName: "Kiểm tra giữa khóa",
        description: "Tạo bài kiểm tra giữa khóa với 10 câu hỏi",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        metadata: { questionCount: 10, passingScore: 70 },
        ipAddress: "192.168.1.101"
      },
      {
        id: "7",
        userId: "user3",
        userName: "Lê Văn C",
        userRole: "HOCVIEN",
        courseId: courseId || "generic-course-1",
        action: "COMPLETE_LESSON",
        entityType: "LESSON",
        entityId: "lesson1",
        entityName: "Bài 1: Giới thiệu JavaScript",
        description: "Hoàn thành bài học: Giới thiệu JavaScript",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        metadata: { completionTime: "25 minutes", progress: 100 },
        ipAddress: "192.168.1.102"
      },
      {
        id: "8",
        userId: "user5",
        userName: "Hoàng Văn E",
        userRole: "HOCVIEN",
        courseId: courseId || "generic-course-2",
        action: "SUBMIT_TEST",
        entityType: "TEST",
        entityId: "test1",
        entityName: "Kiểm tra giữa khóa",
        description: "Nộp bài kiểm tra giữa khóa - Điểm: 85/100",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        metadata: { score: 85, totalQuestions: 10, correctAnswers: 8.5 },
        ipAddress: "192.168.1.104"
      },
      {
        id: "9",
        userId: "user1",
        userName: "Nguyễn Văn A",
        userRole: "ADMIN",
        courseId: courseId || "generic-course-1",
        action: "UPDATE",
        entityType: "LESSON",
        entityId: "lesson1",
        entityName: "Bài 1: Giới thiệu JavaScript",
        description: "Cập nhật nội dung bài học: thêm video bổ sung",
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        metadata: { 
          changes: ["video_url", "duration"],
          oldDuration: "25 minutes",
          newDuration: "30 minutes"
        },
        ipAddress: "192.168.1.100"
      },
      {
        id: "10",
        userId: "user6",
        userName: "Ngô Thị F",
        userRole: "HOCVIEN",
        courseId: courseId || "generic-course-3",
        action: "VIEW_CONTENT",
        entityType: "COURSE",
        entityId: courseId || "generic-course-3",
        description: "Truy cập xem nội dung khóa học",
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        ipAddress: "192.168.1.105"
      }
    ];

    const sortedLogs = mockLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if(params?.pageSize) {
        return sortedLogs.slice(0, params.pageSize);
    }
    
    return sortedLogs;
  }
}

export const activityLogService = new ActivityLogService();

    