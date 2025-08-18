import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCourseProgressDetail } from "@/hooks/use-courses";
import { useWebSocketRealtime } from "@/hooks/use-websocket-realtime";
import {
  Loader2,
  User,
  BookOpen,
  Award,
  XCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Star,
  RefreshCw,
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
    refetch,
    isFetching,
  } = useCourseProgressDetail(courseId, userId);

  // Frontend-only revalidation (no WebSocket/SSE): tự động revalidate khi focus/online
  const { refresh } = useWebSocketRealtime({
    courseId,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    pollInterval: null,
  });

  const handleRefresh = async () => {
    await refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
            <p className="text-sm text-gray-600">Đang tải chi tiết tiến độ</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="flex items-center justify-center w-12 h-12 bg-red-50 rounded-lg">
          <XCircle className="h-6 w-6 text-red-500" />
        </div>
        <div className="text-center">
          <p className="font-medium text-gray-900 mb-1">
            Không thể tải chi tiết tiến độ
          </p>
          <p className="text-sm text-gray-500">{error.message}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isFetching}
        >
          <RefreshCw
            className={cn("h-4 w-4 mr-2", isFetching && "animate-spin")}
          />
          Thử lại
        </Button>
      </div>
    );
  }

  if (!progressDetail) {
    return (
      <div className="text-center py-16">
        <div className="flex items-center justify-center w-16 h-16 bg-gray-50 rounded-xl mx-auto mb-4">
          <User className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-gray-900 font-medium mb-1">Không có dữ liệu</p>
        <p className="text-gray-500 text-sm">
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
      <Card className="border-0 bg-white shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 border border-gray-200">
                <AvatarFallback className="bg-orange-100 text-orange-700 font-semibold">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {userName}
                </h3>
                <p className="text-sm text-gray-500">
                  {progressDetail.courseName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Auto-refresh indicator (focus/online/polling) */}
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-green-500" />
                <span className="text-xs text-green-600 font-medium">
                  Auto refresh
                </span>
              </div>

              <Badge
                variant="secondary"
                className={cn(
                  "font-medium",
                  status === "Completed"
                    ? "bg-orange-50 text-orange-700 border-orange-200"
                    : "bg-gray-50 text-gray-700 border-gray-200"
                )}
              >
                {status === "Completed" ? "Hoàn thành" : "Đang học"}
              </Badge>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isFetching}
                className="text-gray-500 hover:text-gray-700"
              >
                <RefreshCw
                  className={cn("h-4 w-4", isFetching && "animate-spin")}
                />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">
              Tiến độ tổng thể
            </span>
            <span className="text-lg font-bold text-gray-900">
              {progressPercentage}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Bài học hoàn thành
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {completedLessons}/{lessonProgress.length}
                </p>
              </div>
              <div className="flex items-center justify-center w-10 h-10 bg-orange-50 rounded-lg">
                <BookOpen className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Bài kiểm tra đạt
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {passedTests}/{testScore.length}
                </p>
              </div>
              <div className="flex items-center justify-center w-10 h-10 bg-orange-50 rounded-lg">
                <Award className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Điểm TB</p>
                <p className="text-xl font-bold text-gray-900">
                  {averageTestScore}%
                </p>
              </div>
              <div className="flex items-center justify-center w-10 h-10 bg-orange-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lesson Progress */}
      <Card className="border-0 bg-white shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
            <div className="flex items-center justify-center w-8 h-8 bg-orange-50 rounded-lg mr-3">
              <BookOpen className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <span>Tiến độ bài học</span>
              <p className="text-sm font-normal text-gray-500 mt-0.5">
                {lessonProgress.length} bài học trong khóa học
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lessonProgress.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex items-center justify-center w-16 h-16 bg-gray-50 rounded-xl mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-900 font-medium mb-1">Chưa có bài học</p>
              <p className="text-gray-500 text-sm">
                Chưa có bài học nào được ghi nhận.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {lessonProgress.map((lesson, index) => (
                <div
                  key={lesson.lessonId}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-lg border transition-all duration-200",
                    lesson.isCompleted
                      ? "bg-orange-50 border-orange-200"
                      : "bg-white border-gray-100"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-lg",
                      lesson.isCompleted ? "bg-orange-100" : "bg-gray-100"
                    )}
                  >
                    {lesson.isCompleted ? (
                      <CheckCircle className="h-4 w-4 text-orange-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-2">
                      {lesson.lessonName}
                    </p>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${lesson.progressPercentage}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      {lesson.isCompleted && (
                        <Badge className="bg-orange-100 hover:bg-orange-100 text-orange-700 border-orange-200 text-xs font-medium">
                          Hoàn thành
                        </Badge>
                      )}
                      <span className="text-sm font-semibold text-gray-900">
                        {lesson.progressPercentage}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Scores */}
      <Card className="border-0 bg-white shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
            <div className="flex items-center justify-center w-8 h-8 bg-orange-50 rounded-lg mr-3">
              <Award className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <span>Kết quả kiểm tra</span>
              <p className="text-sm font-normal text-gray-500 mt-0.5">
                {testScore.length} bài kiểm tra đã thực hiện
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {testScore.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex items-center justify-center w-16 h-16 bg-gray-50 rounded-xl mx-auto mb-4">
                <Award className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-900 font-medium mb-1">
                Chưa có bài kiểm tra
              </p>
              <p className="text-gray-500 text-sm">
                Chưa có bài kiểm tra nào được ghi nhận.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {testScore.map((test, index) => (
                <div
                  key={test.testId}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-lg border transition-all duration-200",
                    test.isPassed
                      ? "bg-orange-50 border-orange-200"
                      : "bg-gray-50 border-gray-200"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-lg",
                      test.isPassed ? "bg-orange-100" : "bg-gray-100"
                    )}
                  >
                    {test.isPassed ? (
                      <CheckCircle className="h-4 w-4 text-orange-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-1">
                      {test.testName}
                    </p>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-orange-500" />
                      <span className="text-sm text-gray-500">
                        Điểm số: {test.score}%
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "font-medium text-xs",
                          test.isPassed
                            ? "bg-orange-100 text-orange-700 border-orange-200"
                            : "bg-gray-100 text-gray-700 border-gray-200"
                        )}
                      >
                        {test.isPassed ? "Đạt" : "Không đạt"}
                      </Badge>
                      <span className="text-sm font-semibold text-gray-900">
                        {test.score}%
                      </span>
                    </div>
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
