import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useCourseProgressList } from "@/hooks/use-courses";
import { Loader2, Users, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserCourseProgressDetail } from "./UserCourseProgressDetail";

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
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5 text-primary" />
            Tiến độ học viên
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-3 text-muted-foreground">
            Đang tải tiến độ học viên...
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
            <Users className="mr-2 h-5 w-5 text-primary" />
            Tiến độ học viên
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-40 text-red-500">
          <XCircle className="h-8 w-8 mb-2" />
          <p className="text-sm text-muted-foreground">
            Lỗi tải tiến độ học viên: {error.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  const students = progressData?.items || [];

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-5 w-5 text-primary" />
          Tiến độ học viên ({students.length} học viên)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {students.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Chưa có học viên nào tham gia khóa học này.
          </p>
        ) : (
          <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
            {students.map((student) => (
              <div
                key={student.userId}
                className="flex items-center gap-4 p-3 border rounded-md bg-background cursor-pointer hover:bg-muted/70 transition-colors"
                onClick={() => handleStudentClick(student.userId)}
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">{student.userName}</p>
                  <Progress
                    value={student.progressPercentage}
                    className="h-2 mt-1"
                  />
                </div>
                <span className="text-sm font-semibold text-primary">
                  {student.progressPercentage}%
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {selectedUserId && (
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chi tiết tiến độ học viên</DialogTitle>
            </DialogHeader>
            <UserCourseProgressDetail
              courseId={courseId}
              userId={selectedUserId}
            />
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};
