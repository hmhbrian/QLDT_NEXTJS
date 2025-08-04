"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Play,
  CheckCircle,
  Clock,
  Award,
  Star,
  Calendar,
  Target,
  TrendingUp,
  Users,
  ArrowRight,
  Search,
  Filter,
  BookMarked,
  Trophy,
  PlayCircle,
  FileText,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCourses } from "@/hooks/use-courses";
import { Badge } from "@/components/ui/badge";
import NextImage from "next/image";

// Optimized components
import {
  PageHeader,
  GridLayout,
  LoadingState,
  StatsCard,
  FilterToolbar,
} from "@/components/layout/optimized-layouts";
import {
  OptimizedCard,
  StatusBadge,
  ActionButtons,
  EmptyState,
} from "@/components/ui/optimized";

// Mock data for student progress (in real app, this would come from API)
const mockStudentData = {
  enrolledCourses: 12,
  completedCourses: 8,
  inProgressCourses: 4,
  certificates: 6,
  totalHours: 45,
  averageScore: 8.5,
  streak: 7,
  rank: 15,
};

const mockRecentActivity = [
  {
    id: "1",
    type: "course_completed",
    title: "Hoàn thành khóa 'An toàn lao động'",
    time: "2 giờ trước",
    icon: <CheckCircle className="h-4 w-4 text-green-500" />,
  },
  {
    id: "2",
    type: "lesson_started",
    title: "Bắt đầu bài học 'Quy trình xử lý sự cố'",
    time: "1 ngày trước",
    icon: <Play className="h-4 w-4 text-blue-500" />,
  },
  {
    id: "3",
    type: "certificate_earned",
    title: "Nhận chứng chỉ 'Excel nâng cao'",
    time: "3 ngày trước",
    icon: <Award className="h-4 w-4 text-yellow-500" />,
  },
  {
    id: "4",
    type: "quiz_completed",
    title: "Hoàn thành bài kiểm tra với điểm 9.2",
    time: "1 tuần trước",
    icon: <Star className="h-4 w-4 text-purple-500" />,
  },
];

const mockRecommendedCourses = [
  {
    id: "rec1",
    title: "Kỹ năng thuyết trình",
    description: "Nâng cao khả năng thuyết trình và giao tiếp",
    image: "/api/placeholder/300/200",
    duration: "8 giờ",
    level: "Trung cấp",
    rating: 4.8,
    students: 234,
  },
  {
    id: "rec2", 
    title: "Quản lý thời gian hiệu quả",
    description: "Học cách sắp xếp và quản lý thời gian tối ưu",
    image: "/api/placeholder/300/200",
    duration: "6 giờ",
    level: "Cơ bản",
    rating: 4.9,
    students: 456,
  },
  {
    id: "rec3",
    title: "Leadership và quản lý nhóm",
    description: "Phát triển kỹ năng lãnh đạo và làm việc nhóm",
    image: "/api/placeholder/300/200", 
    duration: "12 giờ",
    level: "Nâng cao",
    rating: 4.7,
    students: 189,
  },
];

export default function StudentDashboard() {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch enrolled courses and available courses
  const { courses: availableCourses, isLoading: isLoadingCourses } = useCourses({
    Page: 1,
    Limit: 12,
    keyword: searchTerm,
  });

  // Mock enrolled courses (in real app, this would be a separate API call)
  const enrolledCourses = useMemo(() => {
    return availableCourses?.slice(0, 4).map(course => ({
      ...course,
      progress: Math.floor(Math.random() * 100),
      lastAccessed: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000),
      nextLesson: `Bài ${Math.floor(Math.random() * 10) + 1}: ${course.title.split(' ').slice(0, 3).join(' ')}`,
    })) || [];
  }, [availableCourses]);

  const completionRate = useMemo(() => {
    if (mockStudentData.enrolledCourses === 0) return 0;
    return Math.round((mockStudentData.completedCourses / mockStudentData.enrolledCourses) * 100);
  }, []);

  if (isLoadingCourses) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <PageHeader
          title="Dashboard Học viên"
          description="Theo dõi tiến trình học tập của bạn"
        />
        <LoadingState type="grid" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title={`Chào mừng trở lại, ${currentUser?.fullName}!`}
        description="Tiếp tục hành trình học tập của bạn"
        actions={
          <Button onClick={() => router.push("/courses")}>
            <Search className="mr-2 h-4 w-4" />
            Khám phá khóa học
          </Button>
        }
      />

      {/* Learning Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Khóa học đã tham gia"
          value={mockStudentData.enrolledCourses}
          icon={<BookOpen className="h-5 w-5" />}
        />
        <StatsCard
          title="Khóa học hoàn thành"
          value={mockStudentData.completedCourses}
          icon={<CheckCircle className="h-5 w-5" />}
          trend={`${completionRate}%`}
          trendUp={completionRate > 50}
        />
        <StatsCard
          title="Chứng chỉ đạt được"
          value={mockStudentData.certificates}
          icon={<Award className="h-5 w-5" />}
        />
        <StatsCard
          title="Tổng thời gian học"
          value={`${mockStudentData.totalHours}h`}
          icon={<Clock className="h-5 w-5" />}
        />
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <OptimizedCard className="lg:col-span-2">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Khóa học đang học</h3>
              <Button variant="ghost" size="sm" onClick={() => router.push("/trainee/my-courses")}>
                Xem tất cả
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              {enrolledCourses.map((course) => (
                <div key={course.id} className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                      <NextImage
                        src={course.image}
                        alt={course.title}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium mb-1 truncate">{course.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{course.nextLesson}</p>
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex-1">
                          <Progress value={course.progress} className="h-2" />
                        </div>
                        <span className="text-sm font-medium">{course.progress}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Truy cập lần cuối: {course.lastAccessed.toLocaleDateString('vi-VN')}
                        </span>
                        <Button size="sm" onClick={() => router.push(`/courses/${course.id}`)}>
                          <PlayCircle className="mr-2 h-4 w-4" />
                          Tiếp tục
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {enrolledCourses.length === 0 && (
                <EmptyState
                  title="Chưa tham gia khóa học nào"
                  description="Khám phá các khóa học có sẵn để bắt đầu học tập"
                  action={
                    <Button onClick={() => router.push("/courses")}>
                      Khám phá khóa học
                    </Button>
                  }
                  icon={<BookOpen className="h-12 w-12 text-muted-foreground" />}
                />
              )}
            </div>
          </div>
        </OptimizedCard>

        <OptimizedCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Thống kê cá nhân</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Điểm trung bình</span>
                </div>
                <span className="text-sm font-medium">{mockStudentData.averageScore}/10</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Chuỗi ngày học</span>
                </div>
                <span className="text-sm font-medium">{mockStudentData.streak} ngày</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Xếp hạng</span>
                </div>
                <span className="text-sm font-medium">#{mockStudentData.rank}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Khóa học đang mở</span>
                </div>
                <span className="text-sm font-medium">{mockStudentData.inProgressCourses}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t">
              <h4 className="font-medium mb-3">Hoạt động gần đây</h4>
              <div className="space-y-3">
                {mockRecentActivity.slice(0, 3).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center mt-0.5">
                      {activity.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </OptimizedCard>
      </div>

      {/* Recommended Courses */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Khóa học được đề xuất</h2>
          <Button variant="ghost" onClick={() => router.push("/courses")}>
            Xem tất cả
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <GridLayout>
          {mockRecommendedCourses.map((course) => (
            <OptimizedCard key={course.id} hover className="group">
              <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                <NextImage
                  src={course.image}
                  alt={course.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-white/90 text-gray-800 text-xs">
                    {course.level}
                  </Badge>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-1 line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{course.students}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    <span>{course.rating}</span>
                  </div>
                </div>

                <ActionButtons
                  onView={() => router.push(`/courses/${course.id}`)}
                  viewLabel="Xem chi tiết"
                  className="justify-center"
                />
              </div>
            </OptimizedCard>
          ))}
        </GridLayout>
      </div>

      {/* Learning Goals */}
      <OptimizedCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Mục tiêu học tập</h3>
            <Button variant="ghost" size="sm">
              Thiết lập mục tiêu
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
                <BookMarked className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="font-medium mb-1">Hoàn thành 15 khóa học</h4>
              <p className="text-sm text-muted-foreground mb-2">Tiến độ: {mockStudentData.completedCourses}/15</p>
              <Progress value={(mockStudentData.completedCourses / 15) * 100} className="h-2" />
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                <Award className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-medium mb-1">Nhận 10 chứng chỉ</h4>
              <p className="text-sm text-muted-foreground mb-2">Tiến độ: {mockStudentData.certificates}/10</p>
              <Progress value={(mockStudentData.certificates / 10) * 100} className="h-2" />
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center">
                <Target className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="font-medium mb-1">Đạt điểm 9.0 trung bình</h4>
              <p className="text-sm text-muted-foreground mb-2">Hiện tại: {mockStudentData.averageScore}/10</p>
              <Progress value={(mockStudentData.averageScore / 10) * 100} className="h-2" />
            </div>
          </div>
        </div>
      </OptimizedCard>
    </div>
  );
}
