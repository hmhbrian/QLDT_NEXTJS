import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useCourseProgressList } from "@/hooks/use-courses";
import {
  Loader2,
  Users,
  XCircle,
  TrendingUp,
  Award,
  Eye,
  RefreshCw,
  BookOpen,
} from "lucide-react";
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
    refetch,
    isFetching,
  } = useCourseProgressList(courseId);
  const [selectedUserId, setSelectedUserId] = React.useState<string | null>(
    null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Auto refresh every 30 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

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
      <Card className="border-0 bg-white shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-xl font-semibold text-gray-900">
            <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg mr-3">
              <BookOpen className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <span>Tiến độ học viên</span>
              <p className="text-sm font-normal text-gray-500 mt-0.5">
                Đang tải dữ liệu...
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
            <p className="text-sm text-gray-500">Đang tải dữ liệu học viên</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-0 bg-white shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-xl font-semibold text-gray-900">
            <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg mr-3">
              <BookOpen className="h-5 w-5 text-orange-600" />
            </div>
            Tiến độ học viên
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg">
            <XCircle className="h-6 w-6 text-orange-600" />
          </div>
          <div className="text-center">
            <p className="font-medium text-gray-900 mb-1">
              Không thể tải dữ liệu
            </p>
            <p className="text-sm text-gray-500 max-w-sm">{error.message}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="border-orange-200 text-orange-700 hover:bg-orange-50"
          >
            <RefreshCw
              className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")}
            />
            Thử lại
          </Button>
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
    <Card className="border-0 bg-white shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-xl font-semibold text-gray-900">
            <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg mr-3">
              <BookOpen className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <span>Tiến độ học viên</span>
              <p className="text-sm font-normal text-gray-500 mt-0.5">
                {students.length} học viên đang tham gia
              </p>
            </div>
          </CardTitle>

          <div className="flex items-center gap-3">
            {students.length > 0 && (
              <div className="flex gap-2">
                <Badge
                  variant="secondary"
                  className="bg-orange-100 text-orange-800 border-orange-200 font-medium hover:bg-orange-100"
                >
                  <Award className="w-3 h-3 mr-1.5" />
                  {completedStudents} hoàn thành
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-orange-100 text-orange-800 border-orange-200 font-medium hover:bg-orange-100"
                >
                  <TrendingUp className="w-3 h-3 mr-1.5" />
                  {averageProgress}% TB
                </Badge>
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing || isFetching}
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            >
              <RefreshCw
                className={cn(
                  "h-4 w-4",
                  (isRefreshing || isFetching) && "animate-spin"
                )}
              />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {students.length === 0 ? (
          <div className="text-center py-16">
            <div className="flex items-center justify-center w-16 h-16 bg-gray-50 rounded-xl mx-auto mb-4">
              <Users className="h-8 w-8 text-orange-500" />
            </div>
            <p className="text-gray-900 font-medium mb-1">Chưa có học viên</p>
            <p className="text-gray-500 text-sm">
              Chưa có học viên nào tham gia khóa học này.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {students.map((student, index) => (
              <div
                key={student.userId}
                className={cn(
                  "group relative flex items-center gap-4 p-4 rounded-lg border border-gray-100 transition-all duration-200 cursor-pointer",
                  "hover:border-orange-200 hover:shadow-sm hover:bg-orange-50/50"
                )}
                onClick={() => handleStudentClick(student.userId)}
              >
                <Avatar className="h-10 w-10 border border-orange-200">
                  <AvatarFallback className="bg-orange-100 text-orange-700 font-medium text-sm">
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
                        <Badge className="bg-gray-100 hover:bg-gray-100 text-gray-800 border-gray-200 text-xs font-medium">
                          Hoàn thành
                        </Badge>
                      )}
                      <span className="text-sm font-semibold text-gray-900">
                        {student.progressPercentage}%
                      </span>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${student.progressPercentage}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg">
                    <Eye className="h-4 w-4 text-orange-600" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {selectedUserId && (
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden border-0 shadow-xl">
            <DialogHeader className="pb-4 border-b border-gray-100">
              <DialogTitle className="text-xl font-semibold text-gray-900">
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
