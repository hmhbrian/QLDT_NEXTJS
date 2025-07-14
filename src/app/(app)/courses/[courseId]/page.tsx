"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Clock,
  GraduationCap,
  BookOpen,
  CheckCircle,
  FileText,
  Video,
  Link as LinkIcon,
  Download,
  ListChecks,
  Target,
  UserPlus,
  Info,
  Library,
  FileQuestion,
  Star,
  MessageSquare,
  AlertTriangle,
  ShieldQuestion,
  Check,
  Loader2,
  ChevronRight,
  User,
  Calendar,
} from "lucide-react";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  Course,
  Lesson,
  Feedback,
  LessonContentType,
  CourseMaterialType,
} from "@/lib/types/course.types";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { StarRatingInput } from "@/components/courses/StarRatingInput";
import StarRatingDisplay from "@/components/ui/StarRatingDisplay";
import { getCategoryLabel, isRegistrationOpen } from "@/lib/helpers";
import {
  useCourse,
  useUpdateCourse,
  useEnrollCourse,
  useEnrolledCourses,
} from "@/hooks/use-courses";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTests } from "@/hooks/use-tests";
import { useAttachedFiles } from "@/hooks/use-course-attached-files";
import { extractErrorMessage } from "@/lib/core";
import {
  useLessonProgress,
  useUpsertLessonProgress,
} from "@/hooks/use-lesson-progress";
import ReactPlayer from "react-player/youtube";
import { useDebounce } from "@/hooks/use-debounce";
import { Progress } from "@/components/ui/progress";

const PdfLessonViewer = dynamic(
  () => import("@/components/lessons/PdfLessonViewer"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-6 min-h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    ),
  }
);

const renderLessonIcon = (contentType: LessonContentType | undefined) => {
  if (!contentType) return <FileText className="h-5 w-5 text-gray-500" />;
  const iconMap: Record<LessonContentType, React.ReactNode> = {
    video_url: <Video className="h-5 w-5 text-blue-500" />,
    pdf_url: <FileText className="h-5 w-5 text-red-500" />,
    slide_url: <FileText className="h-5 w-5 text-yellow-500" />,
    text: <BookOpen className="h-5 w-5 text-green-500" />,
    external_link: <LinkIcon className="h-5 w-5 text-gray-500" />,
  };
  return iconMap[contentType] || <FileText className="h-5 w-5 text-gray-500" />;
};

const renderMaterialIcon = (type: CourseMaterialType) => {
  const iconMap: Record<CourseMaterialType, React.ReactNode> = {
    PDF: <FileText className="h-5 w-5 text-red-500" />,
    Link: <LinkIcon className="h-5 w-5 text-blue-500" />,
  };
  return iconMap[type] || <FileText className="h-5 w-5 text-gray-500" />;
};

const EVALUATION_CRITERIA_LABELS: Record<
  keyof Omit<Feedback, "id" | "userId" | "courseId" | "comment">,
  string
> = {
  q1_relevance: "Nội dung phù hợp và hữu ích",
  q2_clarity: "Nội dung rõ ràng, dễ hiểu",
  q3_structure: "Cấu trúc khóa học logic, dễ theo dõi",
  q4_duration: "Thời lượng khóa học hợp lý",
  q5_material: "Tài liệu và công cụ học tập hỗ trợ hiệu quả",
} as const;

type LessonWithProgress = Lesson & {
  progressPercentage: number;
  currentPage?: number;
  currentTimeSecond?: number;
};

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseIdFromParams = params.courseId as string;

  const [isEvaluationDialogOpen, setIsEvaluationDialogOpen] = useState(false);
  const [hasSubmittedEvaluation, setHasSubmittedEvaluation] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  const [selectedLesson, setSelectedLesson] =
    useState<LessonWithProgress | null>(null);
  const [allEvaluations, setAllEvaluations] = useState<Feedback[]>([]);
  const playerRef = useRef<ReactPlayer>(null);

  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const updateCourseMutation = useUpdateCourse();
  const enrollCourseMutation = useEnrollCourse();
  const upsertProgressMutation = useUpsertLessonProgress(courseIdFromParams);

  const {
    course,
    isLoading,
    error: courseError,
    reloadCourse,
  } = useCourse(courseIdFromParams);
  const { enrolledCourses } = useEnrolledCourses(!!currentUser);

  const isEnrolled = useMemo(() => {
    if (!currentUser || !course) return false;

    // Khóa học bắt buộc thì luôn được coi là đã đăng ký
    if (course.enrollmentType === "mandatory") return true;

    // Kiểm tra trong danh sách khóa học đã đăng ký
    const isInEnrolledList =
      enrolledCourses?.some(
        (enrolledCourse) => enrolledCourse.id === course.id
      ) ?? false;

    // Fallback: kiểm tra userIds (có thể không đáng tin cậy lắm)
    const isInUserIds = course.userIds?.includes(currentUser.id) ?? false;

    return isInEnrolledList || isInUserIds;
  }, [currentUser, course, enrolledCourses]);

  const canViewContent = useMemo(
    () =>
      isEnrolled || currentUser?.role === "ADMIN" || currentUser?.role === "HR",
    [isEnrolled, currentUser?.role]
  );

  const {
    tests,
    isLoading: isLoadingTests,
    error: testsError,
  } = useTests(courseIdFromParams, canViewContent);

  const {
    attachedFiles,
    isLoading: isLoadingAttachedFiles,
    error: attachedFilesError,
  } = useAttachedFiles(courseIdFromParams);
  const { lessonProgresses, isLoading: isLoadingProgress } = useLessonProgress(
    courseIdFromParams,
    canViewContent
  );

  const [visiblePage, setVisiblePage] = useState(1);
  const debouncedVisiblePage = useDebounce(visiblePage, 1000);
  const lastReportedPageRef = useRef(0);

  const [videoProgress, setVideoProgress] = useState({ playedSeconds: 0 });
  const debouncedVideoProgress = useDebounce(videoProgress.playedSeconds, 5000);
  const lastReportedTimeRef = useRef(0);

  useEffect(() => {
    if (
      selectedLesson?.type === "pdf_url" &&
      debouncedVisiblePage > 0 &&
      debouncedVisiblePage !== lastReportedPageRef.current
    ) {
      lastReportedPageRef.current = debouncedVisiblePage;
      upsertProgressMutation.mutate({
        lessonId: selectedLesson.id,
        currentPage: debouncedVisiblePage,
      });
    }
  }, [debouncedVisiblePage, selectedLesson, upsertProgressMutation]);

  useEffect(() => {
    if (selectedLesson?.type === "video_url" && debouncedVideoProgress > 0) {
      const currentTime = Math.round(debouncedVideoProgress);
      if (Math.abs(currentTime - lastReportedTimeRef.current) > 1) {
        lastReportedTimeRef.current = currentTime;
        upsertProgressMutation.mutate({
          lessonId: selectedLesson.id,
          currentTimeSecond: currentTime,
        });
      }
    }
  }, [debouncedVideoProgress, selectedLesson, upsertProgressMutation]);

  const lessonsWithProgress: LessonWithProgress[] = useMemo(() => {
    if (!lessonProgresses || !Array.isArray(lessonProgresses)) return [];

    return lessonProgresses.map((progress) => {
      let contentType: LessonContentType = "text"; // Default to text
      let fileUrl: string | null = null;
      let link: string | null = null;

      const apiType = progress.type?.toUpperCase();

      // Backend provides a single url in `urlPdf` but distinguishes by `type`
      if (apiType === "PDF" && progress.urlPdf) {
        contentType = "pdf_url";
        fileUrl = progress.urlPdf;
      } else if (apiType === "LINK" && progress.urlPdf) {
        // Check if the link is a YouTube video
        if (
          progress.urlPdf.includes("youtube.com") ||
          progress.urlPdf.includes("youtu.be")
        ) {
          contentType = "video_url";
        } else {
          contentType = "external_link"; // Or handle other link types
        }
        link = progress.urlPdf;
      }

      return {
        id: progress.id,
        title: progress.title,
        type: contentType,
        fileUrl: fileUrl,
        link: link,
        progressPercentage: progress.progressPercentage
          ? Math.round(progress.progressPercentage * 100)
          : 0,
        currentPage: progress.currentPage,
        currentTimeSecond: progress.currentTimeSecond,
      };
    });
  }, [lessonProgresses]);

  const [evaluationFormData, setEvaluationFormData] = useState<
    Partial<Feedback>
  >({
    q1_relevance: 0,
    q2_clarity: 0,
    q3_structure: 0,
    q4_duration: 0,
    q5_material: 0,
    comment: "",
  });

  const showRegisterGate = useMemo(
    () =>
      currentUser?.role === "HOCVIEN" &&
      course &&
      !isEnrolled &&
      course.enrollmentType === "optional",
    [currentUser, course, isEnrolled]
  );

  const handleEnroll = useCallback(() => {
    if (!course || !currentUser) {
      if (!currentUser) router.push("/login");
      return;
    }
    if (isEnrolled) return;
    enrollCourseMutation.mutate(course.id);
  }, [course, currentUser, router, isEnrolled, enrollCourseMutation]);

  const handleEvaluationRatingChange = useCallback(
    (
      field: keyof Omit<Feedback, "id" | "userId" | "courseId" | "comment">,
      rating: number
    ) => {
      setEvaluationFormData((prev) => ({ ...prev, [field]: rating }));
    },
    []
  );

  const handleSubmitEvaluation = useCallback(() => {
    if (!currentUser || !course) return;
    const newEvaluation: Feedback = {
      id: allEvaluations.length + 1,
      courseId: course.id,
      userId: currentUser.id,
      q1_relevance: evaluationFormData.q1_relevance || 0,
      q2_clarity: evaluationFormData.q2_clarity || 0,
      q3_structure: evaluationFormData.q3_structure || 0,
      q4_duration: evaluationFormData.q4_duration || 0,
      q5_material: evaluationFormData.q5_material || 0,
      comment: evaluationFormData.comment || "",
    };
    setAllEvaluations((prev) => [...prev, newEvaluation]);
    setHasSubmittedEvaluation(true);
    setIsEvaluationDialogOpen(false);
    toast({
      title: "Cảm ơn bạn!",
      description: "Đánh giá của bạn đã được gửi thành công.",
      variant: "success",
    });
    setEvaluationFormData({
      q1_relevance: 0,
      q2_clarity: 0,
      q3_structure: 0,
      q4_duration: 0,
      q5_material: 0,
      comment: "",
    });
  }, [
    currentUser,
    course,
    evaluationFormData,
    setAllEvaluations,
    toast,
    allEvaluations.length,
  ]);

  const handleSelectLesson = useCallback((lesson: LessonWithProgress) => {
    setSelectedLesson(lesson);
    lastReportedTimeRef.current = lesson.currentTimeSecond || 0;
    setActiveTab("content");
  }, []);

  const handleTabChange = (value: string) => {
    if (value !== "content") {
      setSelectedLesson(null);
    }
    setActiveTab(value);
  };

  const handleVisiblePageChange = useCallback((page: number) => {
    setVisiblePage(page);
  }, []);

  const handlePlayerReady = useCallback(() => {
    if (playerRef.current && selectedLesson?.currentTimeSecond) {
      playerRef.current.seekTo(selectedLesson.currentTimeSecond, "seconds");
    }
  }, [selectedLesson]);

  if (isLoading) {
    return (
      <div className="flex h-60 w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">
          Đang tải chi tiết khóa học...
        </p>
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <Alert variant="destructive" className="max-w-xl mx-auto my-12">
        <AlertTriangle className="h-4 w-4" />
        <CardTitle>Không tìm thấy khóa học</CardTitle>
        <AlertDescription>
          {courseError
            ? extractErrorMessage(courseError)
            : "Khóa học bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."}
        </AlertDescription>
        <Button asChild className="mt-4">
          <Link href="/courses">Quay lại danh sách khóa học</Link>
        </Button>
      </Alert>
    );
  }

  return (
    <>
      <div className="space-y-8 p-4 md:p-6 lg:p-8">
        {course.image && (
          <div className="relative h-48 md:h-60 lg:h-80 w-full overflow-hidden rounded-lg shadow-lg">
            <Image
              src={course.image}
              alt={`Ảnh bìa khóa học ${course.title}`}
              fill
              className="object-cover"
              priority
              data-ai-hint="course banner"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-4 md:p-6">
              <Badge
                variant="secondary"
                className="mb-2 text-sm font-medium bg-white/20 text-white backdrop-blur-sm"
              >
                {getCategoryLabel(course.category)}
              </Badge>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold font-headline text-white leading-tight">
                {course.title}
              </h1>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex-1">
            <p className="mt-1 text-base md:text-lg text-muted-foreground">
              {course.description}
            </p>
            {(currentUser?.role === "ADMIN" || currentUser?.role === "HR") && (
              <div className="text-xs text-muted-foreground mt-2 space-x-4">
                {course.createdBy && (
                  <span>
                    Tạo bởi <b>{course.createdBy}</b> vào{" "}
                    {formatDistanceToNow(new Date(course.createdAt), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </span>
                )}
                {course.modifiedBy && (
                  <span>
                    Cập nhật bởi <b>{course.modifiedBy}</b> vào{" "}
                    {formatDistanceToNow(new Date(course.modifiedAt), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0 w-full md:w-auto">
            {currentUser?.role === "HOCVIEN" &&
              course.enrollmentType === "optional" &&
              !isEnrolled &&
              isRegistrationOpen(course.registrationDeadline) && (
                <Button
                  onClick={handleEnroll}
                  disabled={enrollCourseMutation.isPending}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {enrollCourseMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang
                      đăng ký...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-5 w-5" /> Đăng ký ngay
                    </>
                  )}
                </Button>
              )}
            {currentUser?.role === "HOCVIEN" &&
              course.enrollmentType === "optional" &&
              isEnrolled && (
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto"
                  disabled
                >
                  <CheckCircle className="mr-2 h-5 w-5" /> Đã đăng ký
                </Button>
              )}
            {currentUser?.role === "HOCVIEN" && (
              <Button
                onClick={() => setIsEvaluationDialogOpen(true)}
                disabled={hasSubmittedEvaluation}
                variant="outline"
                size="lg"
                className={cn(
                  "w-full sm:w-auto transition-all duration-300",
                  hasSubmittedEvaluation
                    ? "bg-green-50/80 dark:bg-green-950/20 text-green-600 dark:text-green-400 border-green-200/50 dark:border-green-800/30 opacity-60 cursor-not-allowed"
                    : "bg-gray-50/80 dark:bg-gray-900/50 text-gray-700 dark:text-gray-200 border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-800/70 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                )}
              >
                <Star
                  className={cn(
                    "mr-2 h-5 w-5",
                    hasSubmittedEvaluation
                      ? "text-green-500"
                      : "text-gray-500 dark:text-gray-400"
                  )}
                />
                {hasSubmittedEvaluation ? "Đã đánh giá" : "Đánh giá khóa học"}
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Giảng viên</CardTitle>
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{course.instructor}</div>
            </CardContent>
          </Card>
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Thời lượng</CardTitle>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {course.duration.sessions} buổi (
                {course.duration.hoursPerSession}h/buổi)
              </div>
              {course.startDate && course.endDate && (
                <p className="text-xs text-muted-foreground">
                  {new Date(course.startDate).toLocaleDateString("vi-VN")} -{" "}
                  {new Date(course.endDate).toLocaleDateString("vi-VN")}
                </p>
              )}
            </CardContent>
          </Card>
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Loại ghi danh
              </CardTitle>
              <Info className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge
                variant={
                  course.enrollmentType === "mandatory"
                    ? "default"
                    : "secondary"
                }
                className="text-base"
              >
                {course.enrollmentType === "mandatory"
                  ? "Bắt buộc"
                  : "Tùy chọn"}
              </Badge>
              {course.enrollmentType === "optional" &&
                course.registrationDeadline && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Hạn ĐK:{" "}
                    {new Date(course.registrationDeadline).toLocaleDateString(
                      "vi-VN"
                    )}
                    {!isRegistrationOpen(course.registrationDeadline) && (
                      <Badge
                        variant="destructive"
                        className="ml-1 text-xs px-1 py-0"
                      >
                        Hết hạn
                      </Badge>
                    )}
                  </div>
                )}
            </CardContent>
          </Card>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="space-y-6"
        >
          <TabsList className="flex w-full overflow-x-auto h-auto items-center rounded-md bg-muted p-1 text-muted-foreground justify-start">
            <TabsTrigger value="content" className="text-base">
              Nội dung chính
            </TabsTrigger>
            <TabsTrigger value="objectives" className="text-base">
              Mục tiêu
            </TabsTrigger>
            <TabsTrigger value="lessons" className="text-base">
              Bài học
            </TabsTrigger>
            <TabsTrigger
              value="tests"
              className="text-base"
              disabled={!canViewContent}
            >
              Bài kiểm tra
            </TabsTrigger>
            <TabsTrigger value="requirements" className="text-base">
              Yêu cầu
            </TabsTrigger>
            <TabsTrigger value="materials" className="text-base">
              Tài liệu
            </TabsTrigger>
            {(currentUser?.role === "ADMIN" || currentUser?.role === "HR") && (
              <TabsTrigger value="evaluations" className="text-base">
                Phản hồi học viên
              </TabsTrigger>
            )}
          </TabsList>

          {showRegisterGate && (
            <div className="my-6 p-6 border-2 border-dashed rounded-lg bg-muted/30 text-center">
              <GraduationCap className="mx-auto h-16 w-16 text-primary/70 mb-4" />
              <h3 className="text-xl font-semibold">
                Bạn cần đăng ký khóa học này để xem nội dung
              </h3>
              <p className="mt-2 text-muted-foreground mb-4">
                Đây là khóa học tùy chọn, vui lòng đăng ký để truy cập nội dung
                chi tiết.
              </p>
              {isRegistrationOpen(course.registrationDeadline) ? (
                <Button
                  onClick={handleEnroll}
                  disabled={enrollCourseMutation.isPending}
                  size="lg"
                >
                  {enrollCourseMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Đang đăng ký...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-5 w-5" />
                      Đăng ký ngay
                    </>
                  )}
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm text-destructive font-medium">
                    Đã hết hạn đăng ký
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Hạn đăng ký:{" "}
                    {new Date(course.registrationDeadline!).toLocaleDateString(
                      "vi-VN"
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    {selectedLesson && (
                      <CardTitle className="flex items-center gap-3">
                        {renderLessonIcon(selectedLesson.type)}
                        {selectedLesson.title}
                      </CardTitle>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!selectedLesson ? (
                  <div className="text-center text-muted-foreground h-[500px] flex flex-col justify-center items-center">
                    <BookOpen className="mx-auto h-12 w-12 mb-4" />
                    <p className="font-semibold">
                      Vui lòng chọn một bài học từ tab "Bài học"
                    </p>
                    <p className="text-sm mt-2">
                      Nội dung chi tiết của bài học sẽ được hiển thị tại đây.
                    </p>
                  </div>
                ) : selectedLesson.type === "pdf_url" &&
                  selectedLesson.fileUrl ? (
                  <PdfLessonViewer
                    lessonId={selectedLesson.id}
                    pdfUrl={selectedLesson.fileUrl}
                    initialPage={selectedLesson.currentPage || 1}
                    onVisiblePageChange={handleVisiblePageChange}
                  />
                ) : selectedLesson.type === "video_url" &&
                  selectedLesson.link ? (
                  <div className="w-full aspect-video border rounded-md overflow-hidden bg-black">
                    <ReactPlayer
                      ref={playerRef}
                      url={selectedLesson.link}
                      width="100%"
                      height="100%"
                      controls
                      onReady={handlePlayerReady}
                      onProgress={setVideoProgress}
                    />
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground h-[500px] flex flex-col justify-center items-center">
                    <p>
                      Nội dung bài học này hiện không có hoặc không được hỗ trợ.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="objectives">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-5 w-5" />
                  Mục tiêu khóa học
                </CardTitle>
                <CardDescription>
                  Những kiến thức và kỹ năng bạn sẽ đạt được sau khi hoàn thành
                  khóa học.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {course.objectives ? (
                  <div className="space-y-3">
                    {(course.objectives || "").split("\n").map(
                      (objective, index) =>
                        objective.trim() && (
                          <div key={index} className="flex items-start mb-2">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                            <p className="text-muted-foreground">
                              {objective.replace(/^- /, "")}
                            </p>
                          </div>
                        )
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Mục tiêu khóa học đang được cập nhật.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lessons">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Library className="mr-2 h-5 w-5" />
                  Danh sách Bài học
                </CardTitle>
                <CardDescription>
                  Chọn một bài học để xem nội dung chi tiết trong tab "Nội dung
                  chính".
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingProgress ? (
                  <div className="flex items-center justify-center p-6">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Đang tải bài học...</span>
                  </div>
                ) : lessonsWithProgress.length > 0 ? (
                  <div className="space-y-4">
                    {lessonsWithProgress.map((lesson) => {
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => handleSelectLesson(lesson)}
                          className="w-full text-left p-4 border rounded-lg hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                          disabled={!canViewContent}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 flex-grow min-w-0">
                              {renderLessonIcon(lesson.type)}
                              <div className="flex-grow">
                                <p className="font-semibold truncate">
                                  {lesson.title}
                                </p>
                                {lesson.duration && (
                                  <p className="text-xs text-muted-foreground">
                                    Thời lượng: {lesson.duration}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              {lesson.progressPercentage > 0 && (
                                <span className="text-xs font-semibold text-primary">
                                  {lesson.progressPercentage}%
                                </span>
                              )}
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </div>
                          </div>
                          {canViewContent && lesson.progressPercentage > 0 && (
                            <Progress
                              value={lesson.progressPercentage}
                              className="mt-2 h-2"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Chưa có bài học nào được thêm cho khóa học này.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tests">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileQuestion className="mr-2 h-5 w-5" />
                  Danh sách Bài kiểm tra
                </CardTitle>
                <CardDescription>
                  Các bài kiểm tra và yêu cầu để hoàn thành.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingTests ? (
                  <div className="flex items-center justify-center p-6">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Đang tải bài kiểm tra...</span>
                  </div>
                ) : testsError ? (
                  <div className="text-center p-6 text-muted-foreground">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                    <p>Lỗi khi tải danh sách bài kiểm tra</p>
                    <p className="text-sm">{extractErrorMessage(testsError)}</p>
                  </div>
                ) : tests && tests.length > 0 ? (
                  <div className="space-y-4">
                    {tests.map((test) => (
                      <Card
                        key={String(test.id)}
                        className="p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <h4 className="font-semibold flex items-center gap-2">
                            <ShieldQuestion className="h-5 w-5 text-primary" />{" "}
                            {test.title}
                          </h4>
                          <Badge>Cần đạt: {test.passingScorePercentage}%</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Số lượng câu hỏi: {test.countQuestion || 0}
                        </p>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={!isEnrolled}
                                asChild
                                className="mt-3"
                              >
                                <Link
                                  href={`/courses/${course.id}/tests/${test.id}`}
                                  onClick={(e) =>
                                    !isEnrolled && e.preventDefault()
                                  }
                                  aria-disabled={!isEnrolled}
                                  tabIndex={!isEnrolled ? -1 : undefined}
                                  className={
                                    !isEnrolled ? "pointer-events-none" : ""
                                  }
                                >
                                  <Check className="mr-2 h-5 w-5" />
                                  Làm bài kiểm tra
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            {!isEnrolled && (
                              <TooltipContent>
                                <p>
                                  Bạn cần đăng ký khóa học để làm bài kiểm tra.
                                </p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Chưa có bài kiểm tra nào cho khóa học này.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requirements">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ListChecks className="mr-2 h-5 w-5" />
                  Yêu cầu tiên quyết
                </CardTitle>
                <CardDescription>
                  Những kiến thức và kỹ năng cần có trước khi tham gia khóa học.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Không có yêu cầu tiên quyết cụ thể cho khóa học này.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="materials">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="mr-2 h-5 w-5" />
                  Tài liệu khóa học
                </CardTitle>
                <CardDescription>
                  Các tài liệu bổ sung, bài tập, hoặc tài nguyên tham khảo.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingAttachedFiles ? (
                  <div className="flex items-center justify-center p-6">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Đang tải tài liệu...</span>
                  </div>
                ) : attachedFilesError ? (
                  <div className="text-center p-6 text-muted-foreground">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                    <p>Lỗi khi tải danh sách tài liệu</p>
                    <p className="text-sm">
                      {extractErrorMessage(attachedFilesError)}
                    </p>
                  </div>
                ) : attachedFiles && attachedFiles.length > 0 ? (
                  <div className="space-y-4">
                    {attachedFiles.map((material, index) => (
                      <Card
                        key={material.id || index}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3">
                          {renderMaterialIcon(material.type as any)}
                          <div>
                            <h4 className="font-semibold">{material.title}</h4>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="w-full sm:w-auto mt-2 sm:mt-0"
                        >
                          <a
                            href={material.link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            {material.type === "Link"
                              ? "Truy cập"
                              : "Tải xuống"}
                          </a>
                        </Button>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Không có tài liệu bổ sung cho khóa học này.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {(currentUser?.role === "ADMIN" || currentUser?.role === "HR") && (
            <TabsContent value="evaluations">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="mr-2 h-5 w-5 text-primary" /> Phản
                    hồi của Học viên
                  </CardTitle>
                  <CardDescription>
                    Tổng hợp các đánh giá và góp ý từ học viên đã tham gia khóa
                    học.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground text-center py-4">
                    Chưa có đánh giá nào cho khóa học này.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>

      <Dialog
        open={isEvaluationDialogOpen}
        onOpenChange={setIsEvaluationDialogOpen}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Đánh giá khóa học: {course?.title}</DialogTitle>
            <DialogDescription>
              Cảm ơn bạn đã tham gia khóa học. Vui lòng chia sẻ ý kiến của bạn
              để chúng tôi cải thiện hơn.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6 max-h-[60vh] overflow-y-auto pr-2">
            {(
              Object.keys(EVALUATION_CRITERIA_LABELS) as Array<
                keyof typeof EVALUATION_CRITERIA_LABELS
              >
            ).map((key) => (
              <div key={key.toString()} className="space-y-2">
                <Label htmlFor={`rating-${String(key)}`}>
                  {EVALUATION_CRITERIA_LABELS[key]}
                </Label>
                <StarRatingInput
                  rating={(evaluationFormData as any)[key] || 0}
                  setRating={(rating) =>
                    handleEvaluationRatingChange(key, rating)
                  }
                  size={6}
                />
              </div>
            ))}
            <div className="space-y-2">
              <Label htmlFor="suggestions">
                Điều anh/chị chưa hài lòng hoặc đề xuất cải tiến:
              </Label>
              <Textarea
                id="suggestions"
                value={evaluationFormData.comment || ""}
                onChange={(e) =>
                  setEvaluationFormData((prev) => ({
                    ...prev,
                    comment: e.target.value,
                  }))
                }
                placeholder="Ý kiến của bạn..."
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEvaluationDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button onClick={handleSubmitEvaluation}>Gửi đánh giá</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
