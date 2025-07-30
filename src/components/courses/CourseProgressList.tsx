import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useCourseProgressList } from "@/hooks/use-courses";
import { Loader2, Users, XCircle, TrendingUp, Award, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserCourseProgressDetail } from "./UserCourseProgressDetail";
import { cn } from "@/lib/utils";

interface CourseProgressListProps {
  courseId: string;
}

export const CourseProgressList: React.FC<CourseProgressListProps> = ({
  courseId,
}) => {
  const {
    data: progressData,
    isLoading,
    error,
  } = useCourseProgressList(courseId);
  const [selectedUserId, setSelectedUserId] = React.useState<string | null>(
    null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);

  const handleStudentClick = (userId: string) => {
    setSelectedUserId(userId);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setSelectedUserId(null);
    setIsDetailModalOpen(false);
  };

  if (isLoading) {
    return (
      <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-orange-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg font-semibold">
            <div className="p-2 bg-orange-100 rounded-lg mr-3">
              <Users className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Tiến độ học viên
              </span>
              <p className="text-sm font-normal text-muted-foreground mt-1">
                Theo dõi progress học tập của từng học viên
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
              <div className="absolute inset-0 h-10 w-10 rounded-full border-2 border-orange-200 opacity-25"></div>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900">
                Đang tải dữ liệu học viên
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Vui lòng chờ trong giây lát...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-red-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg font-semibold">
            <div className="p-2 bg-red-100 rounded-lg mr-3">
              <Users className="h-5 w-5 text-red-600" />
            </div>
            <span className="bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
              Tiến độ học viên
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-48 space-y-4">
          <div className="p-4 bg-red-100 rounded-full">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
          <div className="text-center">
            <p className="font-medium text-gray-900 mb-1">
              Không thể tải dữ liệu
            </p>
            <p className="text-sm text-muted-foreground max-w-sm">
              {error.message}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const students = progressData?.items || [];

  // Calculate statistics
  const completedStudents = students.filter(
    (s) => s.progressPercentage === 100
  ).length;
  const averageProgress =
    students.length > 0
      ? Math.round(
          students.reduce((sum, s) => sum + s.progressPercentage, 0) /
            students.length
        )
      : 0;

  return (
    <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-blue-50/30">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg font-semibold">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Tiến độ học viên
              </span>
              <p className="text-sm font-normal text-muted-foreground mt-1">
                {students.length} học viên đang tham gia
              </p>
            </div>
          </CardTitle>

          {students.length > 0 && (
            <div className="flex gap-2">
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700 border-green-200"
              >
                <Award className="w-3 h-3 mr-1" />
                {completedStudents} hoàn thành
              </Badge>
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-700 border-blue-200"
              >
                <TrendingUp className="w-3 h-3 mr-1" />
                {averageProgress}% TB
              </Badge>
            </div>
          )}
        </div>

        {/* {students.length > 0 && (
          <div className="mt-4 p-3 bg-white/60 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tiến độ trung bình lớp</span>
              <span className="font-semibold text-blue-600">{averageProgress}%</span>
            </div>
            <Progress value={averageProgress} className="h-2 mt-2" />
          </div>
        )} */}
      </CardHeader>

      <CardContent>
        {students.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-900 font-medium mb-1">Chưa có học viên</p>
            <p className="text-muted-foreground text-sm">
              Chưa có học viên nào tham gia khóa học này.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent">
            {students.map((student, index) => (
              <div
                key={student.userId}
                className={cn(
                  "group relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer",
                  "bg-white/80 hover:bg-white hover:shadow-md hover:scale-[1.01] hover:border-blue-200",
                  "backdrop-blur-sm"
                )}
                onClick={() => handleStudentClick(student.userId)}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: "fadeInUp 0.5s ease-out forwards",
                }}
              >
                <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white font-semibold">
                    {student.userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900 truncate">
                      {student.userName}
                    </p>
                    <div className="flex items-center gap-2">
                      {student.progressPercentage === 100 && (
                        <Badge className="bg-green-500 hover:bg-green-500 text-white px-2 py-1 text-xs">
                          Hoàn thành
                        </Badge>
                      )}
                      <span
                        className={cn(
                          "text-sm font-bold",
                          student.progressPercentage >= 80
                            ? "text-green-600"
                            : student.progressPercentage >= 50
                            ? "text-blue-600"
                            : "text-orange-600"
                        )}
                      >
                        {student.progressPercentage}%
                      </span>
                    </div>
                  </div>

                  <div className="relative">
                    <Progress
                      value={student.progressPercentage}
                      className="h-2.5 bg-gray-100"
                    />
                    <div
                      className="absolute top-0 left-0 h-2.5 rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${student.progressPercentage}%`,
                        background:
                          student.progressPercentage >= 80
                            ? "linear-gradient(90deg, #10b981, #059669)"
                            : student.progressPercentage >= 50
                            ? "linear-gradient(90deg, #3b82f6, #1d4ed8)"
                            : "linear-gradient(90deg, #f59e0b, #d97706)",
                      }}
                    />
                  </div>
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Eye className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {selectedUserId && (
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Chi tiết tiến độ học viên
              </DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[calc(90vh-120px)] pr-2">
              <UserCourseProgressDetail
                courseId={courseId}
                userId={selectedUserId}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};
