import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useCourseProgressDetail } from "@/hooks/use-courses";
import {
  Loader2,
  User,
  BookOpen,
  Award,
  XCircle,
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserCourseProgressDetailProps {
  courseId: string;
  userId: string;
}

export const UserCourseProgressDetail: React.FC<
  UserCourseProgressDetailProps
> = ({ courseId, userId }) => {
  const {
    data: progressDetail,
    isLoading,
    error,
  } = useCourseProgressDetail(courseId, userId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-48">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
              <div className="absolute inset-0 h-10 w-10 rounded-full border-2 border-orange-200 opacity-25"></div>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900">
                Đang tải chi tiết tiến độ
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Vui lòng chờ trong giây lát...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-48 space-y-4">
        <div className="p-4 bg-red-100 rounded-full">
          <XCircle className="h-8 w-8 text-red-500" />
        </div>
        <div className="text-center">
          <p className="font-medium text-gray-900 mb-1">
            Không thể tải chi tiết tiến độ
          </p>
          <p className="text-sm text-muted-foreground max-w-sm">
            {error.message}
          </p>
        </div>
      </div>
    );
  }

  if (!progressDetail) {
    return (
      <div className="text-center py-12">
        <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <User className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-gray-900 font-medium mb-1">Không có dữ liệu</p>
        <p className="text-muted-foreground text-sm">
          Không tìm thấy chi tiết tiến độ cho học viên này.
        </p>
      </div>
    );
  }

  const { userName, progressPercentage, lessonProgress, testScore, status } =
    progressDetail;

  const completedLessons = lessonProgress.filter(
    (lesson) => lesson.isCompleted
  ).length;
  const passedTests = testScore.filter((test) => test.isPassed).length;
  const averageTestScore =
    testScore.length > 0
      ? Math.round(
          testScore.reduce((sum, test) => sum + test.score, 0) /
            testScore.length
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Student Header Card */}
      <Card className="border-0 bg-gradient-to-br from-orange-50 to-amber-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
              <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-600 text-white text-xl font-bold">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {userName}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Khóa học: {progressDetail.courseName}
              </p>

              <div className="flex items-center gap-4">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-sm font-medium px-3 py-1",
                    status === "Completed"
                      ? "bg-green-100 text-green-700 border-green-200"
                      : "bg-yellow-100 text-yellow-700 border-yellow-200"
                  )}
                >
                  {status === "Completed" ? "Đã hoàn thành" : "Đang học"}
                </Badge>

                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Cập nhật gần đây</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                {progressPercentage}%
              </div>
              <p className="text-sm text-muted-foreground">Tiến độ tổng thể</p>
            </div>
          </div>

          <div className="mt-4">
            <Progress value={progressPercentage} className="h-3 bg-white/50" />
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">
                  Bài học hoàn thành
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {completedLessons}/{lessonProgress.length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-orange-50 to-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">
                  Bài kiểm tra đạt
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {passedTests}/{testScore.length}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Award className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-amber-50 to-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700">Điểm TB</p>
                <p className="text-2xl font-bold text-amber-600">
                  {averageTestScore}%
                </p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lesson Progress */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-lg">
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <BookOpen className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Tiến độ bài học
              </span>
              <p className="text-sm font-normal text-muted-foreground mt-1">
                {lessonProgress.length} bài học trong khóa học
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lessonProgress.length === 0 ? (
            <div className="text-center py-8">
              <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-900 font-medium mb-1">Chưa có bài học</p>
              <p className="text-muted-foreground text-sm">
                Chưa có bài học nào được ghi nhận.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-orange-200 scrollbar-track-transparent">
              {lessonProgress.map((lesson, index) => (
                <div
                  key={lesson.lessonId}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border transition-all duration-200",
                    lesson.isCompleted
                      ? "bg-green-50 border-green-200"
                      : "bg-white border-gray-200"
                  )}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: "fadeInUp 0.5s ease-out forwards",
                  }}
                >
                  <div
                    className={cn(
                      "p-2 rounded-lg",
                      lesson.isCompleted ? "bg-green-100" : "bg-gray-100"
                    )}
                  >
                    {lesson.isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-1">
                      {lesson.lessonName}
                    </p>
                    <div className="relative">
                      <Progress
                        value={lesson.progressPercentage}
                        className="h-2.5 bg-gray-100"
                      />
                      <div
                        className="absolute top-0 left-0 h-2.5 rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${lesson.progressPercentage}%`,
                          background: lesson.isCompleted
                            ? "linear-gradient(90deg, #10b981, #059669)"
                            : "linear-gradient(90deg, #ea580c, #c2410c)",
                        }}
                      />
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={cn(
                        "text-sm font-bold",
                        lesson.isCompleted
                          ? "text-green-600"
                          : "text-orange-600"
                      )}
                    >
                      {lesson.progressPercentage}%
                    </span>
                    {lesson.isCompleted && (
                      <Badge className="bg-green-500 hover:bg-green-500 text-white px-2 py-1 text-xs ml-2">
                        Hoàn thành
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Scores */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-lg">
            <div className="p-2 bg-orange-100 rounded-lg mr-3">
              <Award className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Kết quả kiểm tra
              </span>
              <p className="text-sm font-normal text-muted-foreground mt-1">
                {testScore.length} bài kiểm tra đã thực hiện
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {testScore.length === 0 ? (
            <div className="text-center py-8">
              <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Award className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-900 font-medium mb-1">
                Chưa có bài kiểm tra
              </p>
              <p className="text-muted-foreground text-sm">
                Chưa có bài kiểm tra nào được ghi nhận.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-orange-200 scrollbar-track-transparent">
              {testScore.map((test, index) => (
                <div
                  key={test.testId}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border transition-all duration-200",
                    test.isPassed
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  )}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: "fadeInUp 0.5s ease-out forwards",
                  }}
                >
                  <div
                    className={cn(
                      "p-2 rounded-lg",
                      test.isPassed ? "bg-green-100" : "bg-red-100"
                    )}
                  >
                    {test.isPassed ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-1">
                      {test.testName}
                    </p>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-muted-foreground">
                        Điểm số: {test.score}%
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-medium px-3 py-1",
                        test.isPassed
                          ? "bg-green-100 text-green-700 border-green-200"
                          : "bg-red-100 text-red-700 border-red-200"
                      )}
                    >
                      {test.isPassed ? "Đạt" : "Không đạt"}
                    </Badge>
                    <p
                      className={cn(
                        "text-lg font-bold mt-1",
                        test.isPassed ? "text-green-600" : "text-red-600"
                      )}
                    >
                      {test.score}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
