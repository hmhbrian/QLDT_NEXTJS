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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5 text-primary" />
            Chi tiết tiến độ học viên
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-60">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-3 text-muted-foreground">
            Đang tải chi tiết tiến độ...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5 text-primary" />
            Chi tiết tiến độ học viên
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-60 text-red-500">
          <XCircle className="h-8 w-8 mb-2" />
          <p className="text-sm text-muted-foreground">
            Lỗi tải chi tiết tiến độ: {error.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!progressDetail) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5 text-primary" />
            Chi tiết tiến độ học viên
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-center py-4">
          Không tìm thấy chi tiết tiến độ cho học viên này.
        </CardContent>
      </Card>
    );
  }

  const { userName, progressPercentage, lessonProgress, testScore, status } =
    progressDetail;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="mr-2 h-5 w-5 text-primary" />
          Chi tiết tiến độ của {userName}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Tổng quan tiến độ học tập trong khóa học {progressDetail.courseName}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-medium text-sm">Tiến độ tổng thể:</p>
            <span className="text-lg font-semibold text-primary">
              {progressPercentage}%
            </span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
          <Badge
            variant="outline"
            className={cn(
              "text-xs",
              status === "Completed"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            )}
          >
            {status}
          </Badge>
        </div>

        {/* Lesson Progress */}
        <div className="space-y-3">
          <h3 className="font-semibold text-base flex items-center">
            <BookOpen className="mr-2 h-4 w-4" /> Tiến độ bài học (
            {lessonProgress.length} bài)
          </h3>
          {lessonProgress.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Chưa có bài học nào được ghi nhận.
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {lessonProgress.map((lesson) => (
                <div
                  key={lesson.lessonId}
                  className="flex items-center gap-4 p-3 border rounded-md bg-background"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{lesson.lessonName}</p>
                    <Progress
                      value={lesson.progressPercentage}
                      className="h-2 mt-1"
                    />
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    {lesson.progressPercentage}%
                  </span>
                  {lesson.isCompleted && (
                    <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Test Scores */}
        <div className="space-y-3">
          <h3 className="font-semibold text-base flex items-center">
            <Award className="mr-2 h-4 w-4" /> Điểm bài kiểm tra (
            {testScore.length} bài)
          </h3>
          {testScore.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Chưa có bài kiểm tra nào được ghi nhận.
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {testScore.map((test) => (
                <div
                  key={test.testId}
                  className="flex items-center gap-4 p-3 border rounded-md bg-background"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{test.testName}</p>
                    <p className="text-xs text-muted-foreground">
                      Điểm: {test.score}%
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      test.isPassed ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {test.isPassed ? "Đạt" : "Không đạt"}
                  </span>
                  {test.isPassed && (
                    <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
