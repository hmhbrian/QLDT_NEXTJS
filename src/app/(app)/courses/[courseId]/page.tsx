"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";

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
  Play,
  UserCircle2,
  Eye,
  XCircle,
  ChevronLeft,
  X,
  SkipBack,
  SkipForward,
  MoreVertical,
  Menu,
  // MoreVertical, // removed – no three-dot menu
  // Menu,
  EyeOff,
} from "lucide-react";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  Lesson,
  Feedback,
  LessonContentType,
  CourseMaterialType,
  CreateFeedbackPayload,
} from "@/lib/types/course.types";
import { useAuth } from "@/hooks/useAuth";
import { StarRatingInput } from "@/components/courses/StarRatingInput";
import StarRatingDisplay from "@/components/ui/StarRatingDisplay";
import { getCategoryLabel, isRegistrationOpen } from "@/lib/helpers";
import {
  useCourse,
  useEnrollCourse,
  useCancelEnrollCourse,
  useEnrolledCourses,
  useCompletedLessonsCount, // Import the new hook
  useIsCourseCompleted,
} from "@/hooks/use-courses";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTests, useHasSubmittedTest } from "@/hooks/use-tests";
import { useAttachedFiles } from "@/hooks/use-course-attached-files";
import { extractErrorMessage } from "@/lib/core";
import { useLessonProgress } from "@/hooks/use-lesson-progress";
import { useDebouncedLessonProgress } from "@/hooks/use-debounced-lesson-progress";
import ReactPlayer from "react-player/youtube";
import { useDebounce } from "@/hooks/use-debounce";
import { Progress } from "@/components/ui/progress";
import { AuditLog } from "@/components/audit-log";
import { useFeedbacks, useCreateFeedback } from "@/hooks/use-feedback";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ClientTime } from "@/components/ClientTime";
import { CourseProgressList } from "@/components/courses/CourseProgressList";
import { useIsMobile } from "@/hooks/use-mobile";

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
  keyof Omit<CreateFeedbackPayload, "comment">,
  string
> = {
  q1_relevance: "Nội dung phù hợp và hữu ích",
  q2_clarity: "Nội dung rõ ràng, dễ hiểu",
  q3_structure: "Cấu trúc khóa học logic, dễ theo dõi",
  q4_duration: "Thời lượng khóa học hợp lý",
  q5_material: "Tài liệu và công cụ học tập hỗ trợ hiệu quả",
} as const;

const EVALUATION_CRITERIA_SHORT_LABELS: Record<
  keyof Omit<CreateFeedbackPayload, "comment">,
  string
> = {
  q1_relevance: "Phù hợp",
  q2_clarity: "Rõ ràng",
  q3_structure: "Cấu trúc",
  q4_duration: "Thời lượng",
  q5_material: "Tài liệu",
};

type LessonWithProgress = Lesson & {
  progressPercentage: number;
  currentPage?: number;
  currentTimeSecond?: number;
};

// Component con để hiển thị một bài test, giúp quản lý state đã làm bài
const TestItem = ({
  test,
  courseId,
  isEnrolled,
}: {
  test: any;
  courseId: string;
  isEnrolled: boolean;
}) => {
  const { hasSubmitted, isLoading } = useHasSubmittedTest(
    courseId,
    Number(test.id)
  );

  return (
    <Card
      key={String(test.id)}
      className="p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h4 className="font-semibold flex items-center gap-2">
          <ShieldQuestion className="h-5 w-5 text-primary" /> {test.title}
        </h4>
        <Badge>Cần đạt: {test.passingScorePercentage}%</Badge>
      </div>
      <p className="text-sm text-muted-foreground mt-1">
        Số lượng câu hỏi: {test.countQuestion || 0}
      </p>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="mt-3 flex items-center gap-2">
              {isLoading ? (
                <Button variant="outline" size="sm" disabled>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tải...
                </Button>
              ) : hasSubmitted ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={`/courses/${courseId}/tests/${test.id}`}>
                    <Eye className="mr-2 h-4 w-4" /> Xem lại bài
                  </Link>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!isEnrolled}
                  asChild
                >
                  <Link
                    href={`/courses/${courseId}/tests/${test.id}`}
                    onClick={(e) => !isEnrolled && e.preventDefault()}
                    aria-disabled={!isEnrolled}
                    tabIndex={!isEnrolled ? -1 : undefined}
                    className={!isEnrolled ? "pointer-events-none" : ""}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Làm bài kiểm tra
                  </Link>
                </Button>
              )}
            </div>
          </TooltipTrigger>
          {!isEnrolled && !hasSubmitted && (
            <TooltipContent>
              <p>Bạn cần đăng ký khóa học để làm bài kiểm tra.</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </Card>
  );
};

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseIdFromParams = params.courseId as string;

  const [isEvaluationDialogOpen, setIsEvaluationDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("lessons");
  const [selectedLesson, setSelectedLesson] =
    useState<LessonWithProgress | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [controlsEnabled, setControlsEnabled] = useState(false); // toggle ẩn/hiện controls
  const playerRef = useRef<ReactPlayer>(null);
  const isMobile = useIsMobile();

  // Helper function to render lesson type icons
  const renderLessonIcon = (type: LessonContentType) => {
    switch (type) {
      case "video_url":
        return <Video className="h-4 w-4" />;
      case "pdf_url":
        return <FileText className="h-4 w-4" />;
      case "text":
        return <BookOpen className="h-4 w-4" />;
      case "external_link":
        return <LinkIcon className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const { user: currentUser } = useAuth();
  const enrollCourseMutation = useEnrollCourse();
  const cancelEnrollMutation = useCancelEnrollCourse();
  const createFeedbackMutation = useCreateFeedback(courseIdFromParams);

  const { data: completedLessonsCount, isLoading: isLoadingCompletedLessons } =
    useCompletedLessonsCount(courseIdFromParams);

  const {
    isCompleted: isCourseCompleted,
    progressPercentage: courseProgressPercentage,
  } = useIsCourseCompleted(courseIdFromParams);

  const {
    debouncedUpsert,
    saveImmediately,
    cleanup: cleanupProgress,
    isLoading: isSavingProgress,
    hasPendingProgress,
  } = useDebouncedLessonProgress(courseIdFromParams);

  const {
    course,
    isLoading,
    error: courseError,
  } = useCourse(courseIdFromParams);
  const { enrolledCourses } = useEnrolledCourses(!!currentUser);
  const { feedbacks, isLoading: isLoadingFeedbacks } =
    useFeedbacks(courseIdFromParams);

  // All hooks need to be before early returns to comply with Rules of Hooks
  const isEnrolled = useMemo(() => {
    if (!currentUser || !course) return false;
    if (course.enrollmentType === "mandatory") return true;
    const isInEnrolledList =
      enrolledCourses?.some(
        (enrolledCourse) => enrolledCourse.id === course.id
      ) ?? false;
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
  const lastReportedTimeRef = useRef(0);
  const hasReportedCompletionRef = useRef<Set<number>>(new Set()); // Track completed lessons
  const [videoDuration, setVideoDuration] = useState<number | null>(null); // Track video duration

  const lessonsWithProgress: LessonWithProgress[] = useMemo(() => {
    if (!lessonProgresses || !Array.isArray(lessonProgresses)) return [];

    return lessonProgresses.map((progress) => {
      let contentType: LessonContentType = "text";
      let fileUrl: string | null = null;
      let link: string | null = null;
      const apiType = progress.type?.toUpperCase();
      if (apiType === "PDF" && progress.urlPdf) {
        contentType = "pdf_url";
        fileUrl = progress.urlPdf;
      } else if (apiType === "LINK" && progress.urlPdf) {
        if (
          progress.urlPdf.includes("youtube.com") ||
          progress.urlPdf.includes("youtu.be")
        ) {
          contentType = "video_url";
        } else {
          contentType = "external_link";
        }
        link = progress.urlPdf;
      }

      const result = {
        id: progress.id,
        title: progress.title,
        type: contentType,
        fileUrl: fileUrl,
        link: link,
        progressPercentage:
          progress.progressPercentage !== undefined
            ? progress.progressPercentage > 1
              ? Math.round(progress.progressPercentage) // Already in percentage format (0-100)
              : Math.round(progress.progressPercentage * 100) // Convert from decimal (0-1) to percentage
            : 0,
        currentPage: progress.currentPage,
        currentTimeSecond: progress.currentTimeSecond,
      };

      return result;
    });
  }, [lessonProgresses]);

  const [evaluationFormData, setEvaluationFormData] =
    useState<CreateFeedbackPayload>({
      q1_relevance: 0,
      q2_clarity: 0,
      q3_structure: 0,
      q4_duration: 0,
      q5_material: 0,
      comment: "",
    });

  const handleEvaluationRatingChange = (
    key: keyof Omit<CreateFeedbackPayload, "comment">,
    rating: number
  ) => {
    setEvaluationFormData((prev) => ({
      ...prev,
      [key]: rating,
    }));
  };

  const hasSubmittedEvaluation = useMemo(() => {
    if (!currentUser) return false;
    // Since backend doesn't return userId/courseId, we check if any feedback exists
    // for this course (assuming the endpoint only returns current user's feedback)
    return Boolean(feedbacks && feedbacks.length > 0);
  }, [feedbacks, currentUser]);

  const showRegisterGate = useMemo(
    () =>
      currentUser?.role === "HOCVIEN" &&
      course &&
      !isEnrolled &&
      course.enrollmentType === "optional",
    [currentUser, course, isEnrolled]
  );

  useEffect(() => {
    if (
      selectedLesson?.type === "pdf_url" &&
      debouncedVisiblePage > 0 &&
      debouncedVisiblePage !== lastReportedPageRef.current
    ) {
      lastReportedPageRef.current = debouncedVisiblePage;
      debouncedUpsert({
        lessonId: selectedLesson.id,
        currentPage: debouncedVisiblePage,
      });
    }
  }, [debouncedVisiblePage, selectedLesson, debouncedUpsert]);

  useEffect(() => {
    if (
      selectedLesson?.type === "video_url" &&
      videoProgress.playedSeconds > 0 &&
      videoDuration // Only update if we know the video duration
    ) {
      // Use higher precision and only round for comparison
      // Keep one decimal place for better accuracy
      const currentTime = Math.round(videoProgress.playedSeconds * 10) / 10;
      const currentTimeInt = Math.floor(currentTime);

      // Only update if significant time difference (more than 5 seconds) for regular updates
      // This reduces spam while still tracking progress
      // Also avoid reporting if we're near completion (handled by onProgress callback)
      const timeToEnd = videoDuration - videoProgress.playedSeconds;
      if (
        Math.abs(currentTimeInt - lastReportedTimeRef.current) >= 5 &&
        timeToEnd > 15 // Don't spam updates near the end
      ) {
        lastReportedTimeRef.current = currentTimeInt;
        debouncedUpsert({
          lessonId: selectedLesson.id,
          currentTimeSecond: currentTimeInt,
        });
      }
    }
  }, [
    videoProgress.playedSeconds,
    selectedLesson,
    debouncedUpsert,
    videoDuration,
  ]); // Cleanup progress on unmount
  useEffect(() => {
    return () => {
      cleanupProgress();
    };
  }, [cleanupProgress]);

  useEffect(() => {
    if (hasPendingProgress()) {
      if (
        selectedLesson?.type === "video_url" &&
        videoProgress.playedSeconds > 0 &&
        videoDuration
      ) {
        // Use floor for final save to ensure we don't exceed actual video duration
        const finalTime = Math.min(
          Math.floor(videoProgress.playedSeconds),
          Math.floor(videoDuration)
        );
        saveImmediately({
          lessonId: selectedLesson.id,
          currentTimeSecond: finalTime,
        });
      } else if (selectedLesson?.type === "pdf_url" && visiblePage > 0) {
        saveImmediately({
          lessonId: selectedLesson.id,
          currentPage: visiblePage,
        });
      }
    }
  }, [selectedLesson?.id, videoDuration]);

  const handleEnroll = useCallback(() => {
    if (!course || !currentUser) {
      if (!currentUser) router.push("/login");
      return;
    }
    if (isEnrolled) return;
    enrollCourseMutation.mutate(course.id);
  }, [course, currentUser, router, isEnrolled, enrollCourseMutation]);

  const handleCancelEnroll = useCallback(() => {
    if (!course || !currentUser) {
      if (!currentUser) router.push("/login");
      return;
    }
    if (!isEnrolled) return;
    cancelEnrollMutation.mutate(course.id);
  }, [course, currentUser, router, isEnrolled, cancelEnrollMutation]);

  const handleSubmitEvaluation = useCallback(() => {
    if (!currentUser || !course) return;
    createFeedbackMutation.mutate(evaluationFormData, {
      onSuccess: () => {
        // Close dialog and reset form
        setIsEvaluationDialogOpen(false);
        setEvaluationFormData({
          q1_relevance: 0,
          q2_clarity: 0,
          q3_structure: 0,
          q4_duration: 0,
          q5_material: 0,
          comment: "",
        });
        // Data refresh is automatically handled by useCreateFeedback hook
      },
      onError: (error) => {
        const errorMessage = extractErrorMessage(error);
        // Close dialog if user has already submitted evaluation
        if (
          errorMessage.includes("đã đánh giá") ||
          errorMessage.includes("already")
        ) {
          setIsEvaluationDialogOpen(false);
          setEvaluationFormData({
            q1_relevance: 0,
            q2_clarity: 0,
            q3_structure: 0,
            q4_duration: 0,
            q5_material: 0,
            comment: "",
          });
        }
        // Other errors keep dialog open so user can see and try again
      },
    });
  }, [currentUser, course, evaluationFormData, createFeedbackMutation]);

  const handleSelectLesson = useCallback(
    (lesson: LessonWithProgress) => {
      // Simply update lesson without any fullscreen interruption
      setSelectedLesson(lesson);
      lastReportedTimeRef.current = lesson.currentTimeSecond || 0;

      // If not in fullscreen, open it
      if (!isFullscreen) {
        setActiveTab("lessons");
        setIsFullscreen(true);
        // Mặc định ẩn sidebar để tập trung nội dung chính
        setIsSidebarOpen(false);
      }

      // Reset video state for new lesson
      setVideoProgress({ playedSeconds: 0 });
      setVideoDuration(null);

      // Don't clear completion tracking - let it accumulate across session
      // hasReportedCompletionRef.current.clear(); // Removed this line
    },
    [isFullscreen]
  );

  const handleNextLesson = useCallback(() => {
    if (!selectedLesson || lessonsWithProgress.length === 0) return;
    const currentIndex = lessonsWithProgress.findIndex(
      (l) => l.id === selectedLesson.id
    );
    if (currentIndex < lessonsWithProgress.length - 1) {
      handleSelectLesson(lessonsWithProgress[currentIndex + 1]);
    }
  }, [selectedLesson, lessonsWithProgress, handleSelectLesson]);

  const handlePrevLesson = useCallback(() => {
    if (!selectedLesson || lessonsWithProgress.length === 0) return;
    const currentIndex = lessonsWithProgress.findIndex(
      (l) => l.id === selectedLesson.id
    );
    if (currentIndex > 0) {
      handleSelectLesson(lessonsWithProgress[currentIndex - 1]);
    }
  }, [selectedLesson, lessonsWithProgress, handleSelectLesson]);

  const closeFullscreen = useCallback(() => {
    setIsFullscreen(false);
    setIsSidebarOpen(true); // Reset sidebar state
    // Keep selectedLesson for potential resume
  }, []);

  const handleTabChange = (value: string) => {
    if (value !== "lessons") {
      setSelectedLesson(null);
      setIsFullscreen(false);
    }
    setActiveTab(value);
  };

  const handleVisiblePageChange = useCallback((page: number) => {
    setVisiblePage(page);
  }, []);

  // Auto-hide controls trên mobile chỉ với PDF; video giữ controls
  useEffect(() => {
    if (!isMobile) return;
    if (!controlsEnabled) return;
    if (!showControls) return;
    if (selectedLesson?.type !== "pdf_url") return;
    const t = setTimeout(() => setShowControls(false), 3000);
    return () => clearTimeout(t);
  }, [isMobile, controlsEnabled, showControls, selectedLesson?.type]);

  const handlePlayerReady = useCallback(() => {
    if (playerRef.current && selectedLesson?.currentTimeSecond) {
      // Get and store video duration
      const duration = playerRef.current.getDuration();
      setVideoDuration(duration);

      // Seek to last watched position
      playerRef.current.seekTo(selectedLesson.currentTimeSecond, "seconds");
    } else if (playerRef.current) {
      // Just get duration for new videos
      const duration = playerRef.current.getDuration();
      setVideoDuration(duration);
    }
  }, [selectedLesson]);

  // Keyboard shortcuts for fullscreen mode
  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeFullscreen();
      } else if (e.key === "ArrowLeft" && e.altKey) {
        e.preventDefault();
        handlePrevLesson();
      } else if (e.key === "ArrowRight" && e.altKey) {
        e.preventDefault();
        handleNextLesson();
      } else if (e.key === "Tab" && e.shiftKey) {
        e.preventDefault();
        setIsSidebarOpen(!isSidebarOpen);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    isFullscreen,
    closeFullscreen,
    handlePrevLesson,
    handleNextLesson,
    isSidebarOpen,
  ]);

  // Instant navigation - show skeleton while loading
  if (isLoading || courseError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="h-8 bg-gray-200 animate-pulse rounded mb-4"></div>
            <div className="h-64 bg-gray-200 animate-pulse rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4"></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-32 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
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
      {/* Fullscreen Learning View - Udemy Style */}
      {isFullscreen && selectedLesson && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="flex h-full">
            {/* Main Content Area */}
            <div className="flex-1 relative">
              {/* Floating Controls - Like Udemy */}
              {/* {controlsEnabled && !isMobile && (
                <div className="absolute top-4 left-4 z-50 flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={closeFullscreen}
                    aria-label="Đóng"
                    className="bg-white text-gray-900 hover:bg-white/90 border border-gray-200 rounded-full w-10 h-10 p-0 shadow-md"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              )} */}
              {/* {controlsEnabled && !isMobile && (
                <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
                 
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrevLesson}
                    disabled={
                      !selectedLesson ||
                      lessonsWithProgress.findIndex(
                        (l) => l.id === selectedLesson.id
                      ) === 0
                    }
                    aria-label="Bài trước"
                    className="bg-white text-gray-900 hover:bg-white/90 border border-gray-200 rounded-full w-10 h-10 p-0 shadow-md disabled:opacity-40"
                  >
                    <SkipBack className="h-5 w-5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNextLesson}
                    disabled={
                      !selectedLesson ||
                      lessonsWithProgress.findIndex(
                        (l) => l.id === selectedLesson.id
                      ) ===
                        lessonsWithProgress.length - 1
                    }
                    aria-label="Bài tiếp theo"
                    className="bg-white text-gray-900 hover:bg-white/90 border border-gray-200 rounded-full w-10 h-10 p-0 shadow-md disabled:opacity-40"
                  >
                    <SkipForward className="h-5 w-5" />
                  </Button>

                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    aria-label="Mở danh sách bài học"
                    className="bg-white text-gray-900 hover:bg-white/90 border border-gray-200 rounded-full w-10 h-10 p-0 shadow-md"
                  >
                    <Library className="h-5 w-5" />
                  </Button>
                </div>
              )} */}

              {/* Content Area - Full Height */}
              <div className="w-full h-full">
                {selectedLesson.type === "video_url" && selectedLesson.link ? (
                  <div className="w-full h-full">
                    <ReactPlayer
                      key={selectedLesson.id} // Force re-render when lesson changes
                      ref={playerRef}
                      url={selectedLesson.link}
                      width="100%"
                      height="100%"
                      controls
                      playing={false}
                      config={{
                        playerVars: {
                          autoplay: 0,
                          rel: 0,
                          modestbranding: 1,
                          showinfo: 0,
                          iv_load_policy: 3,
                        },
                      }}
                      onReady={handlePlayerReady}
                      onDuration={(duration) => {
                        setVideoDuration(duration);
                      }}
                      onProgress={(progress) => {
                        if (
                          !selectedLesson ||
                          selectedLesson.type !== "video_url" ||
                          !videoDuration
                        ) {
                          return;
                        }

                        setVideoProgress(progress);

                        const timeToEnd =
                          videoDuration - progress.playedSeconds;
                        if (
                          timeToEnd <= 5 &&
                          timeToEnd > 0 &&
                          !hasReportedCompletionRef.current.has(
                            selectedLesson.id
                          )
                        ) {
                          hasReportedCompletionRef.current.add(
                            selectedLesson.id
                          );
                          saveImmediately({
                            lessonId: selectedLesson.id,
                            currentTimeSecond: Math.floor(videoDuration),
                          });
                        }
                      }}
                      onEnded={() => {
                        if (
                          selectedLesson &&
                          videoDuration &&
                          !hasReportedCompletionRef.current.has(
                            selectedLesson.id
                          )
                        ) {
                          hasReportedCompletionRef.current.add(
                            selectedLesson.id
                          );
                          saveImmediately({
                            lessonId: selectedLesson.id,
                            currentTimeSecond: Math.floor(videoDuration),
                          });
                        }
                      }}
                    />
                  </div>
                ) : selectedLesson.type === "pdf_url" && selectedLesson.fileUrl ? (
                  <div className="w-full h-full bg-gray-100 relative overflow-hidden">
                    {/* PDF Container with proper styling */}
                    <div
                      className="w-full h-full"
                      onClick={() => {
                        if (isMobile && controlsEnabled) setShowControls((s) => !s);
                      }}
                    >
                      <PdfLessonViewer
                        key={selectedLesson.id} // Force re-render when lesson changes
                        pdfUrl={selectedLesson.fileUrl}
                        initialPage={selectedLesson.currentPage || 1}
                        onVisiblePageChange={handleVisiblePageChange}
                        isMobile={isMobile}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full bg-slate-900">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-slate-400" />
                      </div>
                      <p className="text-white font-medium">
                        Nội dung không khả dụng
                      </p>
                      <p className="text-sm text-slate-400 mt-1">
                        Vui lòng thử lại sau
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - Course Content */}
            {isSidebarOpen && (
              <div
                className={cn(
                  "bg-white border-l border-orange-200 flex flex-col shadow-xl",
                  isMobile
                    ? "fixed inset-y-0 right-0 w-[85%] max-w-sm z-50"
                    : "w-full max-w-xs md:w-80"
                )}
              >
                <div className="p-4 border-b border-orange-200 bg-orange-50">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-lg text-orange-800">
                      Nội dung khóa học
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Đóng danh sách"
                      onClick={() => setIsSidebarOpen(false)}
                      className="bg-white text-gray-900 hover:bg-white/90 border border-gray-200 rounded-full w-8 h-8 p-0 shadow-sm"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-orange-600">
                      {lessonsWithProgress.length} bài học
                    </p>
                    <span className="text-xs text-orange-500">
                      {Math.round(
                        ((completedLessonsCount || 0) /
                          lessonsWithProgress.length) *
                          100
                      )}
                      % hoàn thành
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <div className="p-3 space-y-2">
                    {lessonsWithProgress.map((lesson, index) => {
                      const isCompleted = lesson.progressPercentage >= 100;
                      const isActive = selectedLesson?.id === lesson.id;

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => handleSelectLesson(lesson)}
                          disabled={!canViewContent}
                          className={cn(
                            "w-full text-left p-3 rounded-lg transition-all duration-200 border",
                            isActive
                              ? "bg-orange-50 border-orange-200 shadow-sm"
                              : "hover:bg-gray-50 border-transparent hover:border-orange-200",
                            !canViewContent && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold flex-shrink-0 border",
                                isCompleted
                                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                  : isActive
                                  ? "bg-orange-100 text-orange-700 border-orange-200"
                                  : "bg-gray-100 text-gray-600 border-gray-200"
                              )}
                            >
                              {isCompleted ? (
                                <Check className="h-4 w-4" />
                              ) : isActive ? (
                                <Play className="h-4 w-4" />
                              ) : (
                                index + 1
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <div
                                  className={cn(
                                    "w-4 h-4",
                                    lesson.type === "video_url" &&
                                      "text-red-500",
                                    lesson.type === "pdf_url" &&
                                      "text-orange-500",
                                    lesson.type === "text" && "text-green-500",
                                    lesson.type === "external_link" &&
                                      "text-blue-500"
                                  )}
                                >
                                  {renderLessonIcon(lesson.type)}
                                </div>
                                <span className="text-xs font-medium text-orange-500 uppercase tracking-wide">
                                  {lesson.type === "video_url" && "Video"}
                                  {lesson.type === "pdf_url" && "PDF"}
                                  {lesson.type === "text" && "Văn bản"}
                                  {lesson.type === "external_link" &&
                                    "Liên kết"}
                                </span>
                              </div>

                              <h4
                                className={cn(
                                  "font-medium text-sm line-clamp-2 mb-2",
                                  isActive ? "text-orange-700" : "text-gray-800"
                                )}
                              >
                                {lesson.title}
                              </h4>

                              {canViewContent &&
                                lesson.progressPercentage > 0 && (
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-gray-500">
                                        Tiến độ
                                      </span>
                                      <span className="text-xs font-medium text-gray-700">
                                        {lesson.progressPercentage}%
                                      </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                      <div
                                        className={cn(
                                          "h-1.5 rounded-full transition-all duration-300",
                                          isCompleted
                                            ? "bg-emerald-500"
                                            : "bg-orange-500"
                                        )}
                                        style={{
                                          width: `${lesson.progressPercentage}%`,
                                        }}
                                      />
                                    </div>
                                  </div>
                                )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {/* Backdrop for mobile */}
                {isMobile && (
                  <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                    onClick={() => setIsSidebarOpen(false)}
                  />
                )}
              </div>
            )}
            {/* Eye toggle for mobile (top-left)
            {isMobile && (
              <div className="fixed top-3 left-3 z-50">
                <Button
                  size="sm"
                  className="bg-white text-gray-900 hover:bg-white/90 rounded-full h-9 px-3 shadow-md border border-gray-200 flex items-center gap-1"
                  onClick={() => {
                    setControlsEnabled((v) => !v);
                    setShowControls(true);
                  }}
                  title={controlsEnabled ? "Ẩn điều khiển" : "Hiện điều khiển"}
                >
                  {controlsEnabled ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="text-[11px] hidden xs:inline">
                    {controlsEnabled ? "Ẩn" : "Hiện"}
                  </span>
                </Button>
              </div>
            )} */}
            {/* Mobile bottom controls */}
            { controlsEnabled && !isSidebarOpen && (
              <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-full shadow-lg px-2 py-1 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeFullscreen}
                  aria-label="Thoát"
                  className="bg-white text-gray-900 hover:bg-white/90 rounded-full w-11 h-11 p-0"
                >
                  <X className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevLesson}
                  disabled={
                    !selectedLesson ||
                    lessonsWithProgress.findIndex(
                      (l) => l.id === selectedLesson.id
                    ) === 0
                  }
                  aria-label="Bài trước"
                  className="bg-white text-gray-900 hover:bg-white/90 rounded-full w-11 h-11 p-0 disabled:opacity-40"
                >
                  <SkipBack className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNextLesson}
                  disabled={
                    !selectedLesson ||
                    lessonsWithProgress.findIndex(
                      (l) => l.id === selectedLesson.id
                    ) ===
                      lessonsWithProgress.length - 1
                  }
                  aria-label="Bài tiếp theo"
                  className="bg-white text-gray-900 hover:bg-white/90 rounded-full w-11 h-11 p-0 disabled:opacity-40"
                >
                  <SkipForward className="h-5 w-5" />
                </Button>
                <div className="h-6 w-px bg-gray-200 mx-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSidebarOpen(true)}
                  aria-label="Danh sách bài"
                  className="bg-white text-gray-900 hover:bg-white/90 rounded-full w-11 h-11 p-0"
                >
                  <Library className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setControlsEnabled((v) => !v);
                    setShowControls(true);
                  }}
                  aria-label={
                    controlsEnabled ? "Ẩn điều khiển" : "Hiện điều khiển"
                  }
                  className="bg-white text-gray-900 hover:bg-white/90 rounded-full w-11 h-11 p-0"
                >
                  {controlsEnabled ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 space-y-6 md:space-y-8">
          {course.image && (
            <div className="relative h-32 sm:h-48 md:h-60 lg:h-80 w-full overflow-hidden rounded-lg shadow-lg">
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
                  {getCategoryLabel(
                    course.category?.categoryName || "Không có"
                  )}
                </Badge>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold font-headline text-white leading-tight">
                  {course.title}
                </h1>
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="flex-1">
              <p className="mt-1 text-base md:text-lg text-muted-foreground line-clamp-5">
                {course.description}
              </p>
              {(currentUser?.role === "ADMIN" ||
                currentUser?.role === "HR") && (
                <div className="text-xs text-muted-foreground mt-2 space-x-4">
                  {course.createdBy && (
                    <span>
                      Tạo bởi{" "}
                      <b>
                        {typeof course.createdBy === "object" &&
                        course.createdBy !== null &&
                        "name" in course.createdBy
                          ? (course.createdBy as { name: string }).name
                          : typeof course.createdBy === "string"
                          ? course.createdBy
                          : "Không có"}
                      </b>{" "}
                      vào <ClientTime date={course.createdAt} />
                    </span>
                  )}
                  {course.modifiedBy && (
                    <span>
                      Cập nhật bởi{" "}
                      <b>
                        {typeof course.modifiedBy === "object" &&
                        course.modifiedBy !== null &&
                        "name" in course.modifiedBy
                          ? (course.modifiedBy as { name: string }).name
                          : typeof course.modifiedBy === "string"
                          ? course.modifiedBy
                          : "Không có"}
                      </b>{" "}
                      vào <ClientTime date={course.modifiedAt} />
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
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button
                      variant="secondary"
                      size="lg"
                      className="w-full sm:w-auto"
                      disabled
                    >
                      <CheckCircle className="mr-2 h-5 w-5" /> Đã đăng ký
                    </Button>
                    {isRegistrationOpen(course.registrationDeadline) && (
                      <Button
                        onClick={handleCancelEnroll}
                        disabled={cancelEnrollMutation.isPending}
                        variant="outline"
                        size="lg"
                        className="w-full sm:w-auto"
                      >
                        {cancelEnrollMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                            Đang hủy...
                          </>
                        ) : (
                          <>
                            <XCircle className="mr-2 h-5 w-5" /> Hủy đăng ký
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}
              {currentUser?.role === "HOCVIEN" && isCourseCompleted && (
                <Button
                  onClick={() => setIsEvaluationDialogOpen(true)}
                  disabled={hasSubmittedEvaluation}
                  variant="outline"
                  size="lg"
                  className={cn(
                    "w-full sm:w-auto transition-all duration-300",
                    hasSubmittedEvaluation
                      ? "bg-gray-50/80 dark:bg-gray-950/20 text-gray-600 dark:text-gray-400 border-gray-200/50 dark:border-gray-800/30 opacity-60 cursor-not-allowed"
                      : "bg-gray-50/80 dark:bg-gray-900/50 text-gray-700 dark:text-gray-200 border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-800/70 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                  )}
                >
                  <Star
                    className={cn(
                      "mr-2 h-5 w-5",
                      hasSubmittedEvaluation
                        ? "text-gray-500"
                        : "text-gray-500 dark:text-gray-400"
                    )}
                  />
                  {hasSubmittedEvaluation ? "Đã đánh giá" : "Đánh giá khóa học"}
                </Button>
              )}
              {currentUser?.role === "HOCVIEN" &&
                isEnrolled &&
                !isCourseCompleted && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="lg"
                          className="w-full sm:w-auto opacity-50 cursor-not-allowed"
                          disabled
                        >
                          <Star className="mr-2 h-5 w-5 text-gray-400" />
                          Đánh giá khóa học
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Bạn cần hoàn thành khóa học để đánh giá</p>
                        <p className="text-xs">
                          Tiến độ hiện tại:{" "}
                          {Math.round(courseProgressPercentage)}%
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
            </div>
          </div>

          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {/* Khối giảng viên đã bỏ */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Thời lượng
                </CardTitle>
                <Clock className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-xl font-bold">
                  {course.duration.sessions} buổi (
                  {course.duration.hoursPerSession}h/buổi)
                </div>
                {course.startDate && course.endDate && (
                  <p className="text-xs text-muted-foreground">
                    Bắt đầu:{" "}
                    {new Date(course.startDate).toLocaleDateString("vi-VN")}–
                    Kết thúc:{" "}
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

            {/* New Card for Completed Lessons */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Bài học đã hoàn thành
                </CardTitle>
                <CheckCircle className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoadingCompletedLessons ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <div className="text-xl font-bold">
                    {completedLessonsCount ?? 0}
                    <span className="text-sm text-muted-foreground ml-1">
                      bài
                    </span>
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
            <TabsList className="flex w-full overflow-x-auto h-auto items-center rounded-lg bg-slate-50/80 p-1 text-slate-600 justify-start border">
              <TabsTrigger
                value="lessons"
                className="rounded-md px-4 py-2 font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
              >
                Nội dung chính
              </TabsTrigger>
              <TabsTrigger
                value="objectives"
                className="rounded-md px-4 py-2 font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
              >
                Mục tiêu
              </TabsTrigger>
              <TabsTrigger
                value="tests"
                disabled={!canViewContent}
                className="rounded-md px-4 py-2 font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm disabled:opacity-50"
              >
                Bài kiểm tra
              </TabsTrigger>
              {(course as any).requirements &&
                String((course as any).requirements).trim().length > 0 && (
                  <TabsTrigger
                    value="requirements"
                    className="rounded-md px-4 py-2 font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                  >
                    Yêu cầu
                  </TabsTrigger>
                )}
              <TabsTrigger
                value="materials"
                className="rounded-md px-4 py-2 font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
              >
                Tài liệu
              </TabsTrigger>
              {(currentUser?.role === "ADMIN" ||
                currentUser?.role === "HR") && (
                <TabsTrigger
                  value="activity-logs"
                  className="rounded-md px-4 py-2 font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                >
                  Nhật ký hoạt động
                </TabsTrigger>
              )}
              <TabsTrigger
                value="evaluations"
                className="rounded-md px-4 py-2 font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
              >
                Phản hồi học viên
              </TabsTrigger>
              {currentUser?.role === "ADMIN" && (
                <TabsTrigger
                  value="students"
                  className="rounded-md px-4 py-2 font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                >
                  Học viên & Tiến độ
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="objectives">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="mr-2 h-5 w-5" />
                    Mục tiêu khóa học
                  </CardTitle>
                  <CardDescription>
                    Những kiến thức và kỹ năng bạn sẽ đạt được sau khi hoàn
                    thành khóa học.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {course.objectives ? (
                    <div className="space-y-3">
                      {(course.objectives || "").split("\n").map(
                        (objective, index) =>
                          objective.trim() && (
                            <div key={index} className="flex items-start mb-2">
                              <CheckCircle className="h-5 w-5 text-orange-500 mr-3 mt-1 flex-shrink-0" />
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
              <div className="space-y-6">
                {/* Course Overview */}
                <Card className="border-0 shadow-sm bg-gradient-to-r from-slate-50 to-white">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-semibold text-slate-800 mb-1">
                          Nội dung khóa học
                        </CardTitle>
                        <CardDescription className="text-slate-600">
                          {lessonsWithProgress.length} bài học • {completedLessonsCount ?? 0} đã hoàn thành
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-slate-800">
                          {lessonsWithProgress.length > 0
                            ? Math.round(
                                ((completedLessonsCount || 0) /
                                  lessonsWithProgress.length) *
                                  100
                              )
                            : 0}
                          %
                        </div>
                        <div className="text-xs text-slate-500">hoàn thành</div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Lessons List */}
                {isLoadingProgress ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="relative mb-4">
                      <div className="w-12 h-12 border-4 border-slate-200 rounded-full animate-pulse"></div>
                      <div className="absolute inset-0 w-12 h-12 border-4 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-slate-600 font-medium">
                      Đang tải nội dung...
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                      Vui lòng đợi trong giây lát
                    </p>
                  </div>
                ) : lessonsWithProgress.length > 0 ? (
                  <div className="space-y-3">
                    {lessonsWithProgress.map((lesson, index) => {
                      const isCompleted = lesson.progressPercentage >= 100;
                      const isInProgress =
                        lesson.progressPercentage > 0 &&
                        lesson.progressPercentage < 100;

                      return (
                        <Card
                          key={lesson.id}
                          className={cn(
                            "group border transition-all duration-200 hover:shadow-md cursor-pointer",
                            "bg-white border-slate-200/60 hover:border-slate-300",
                            !canViewContent && "opacity-50 cursor-not-allowed"
                          )}
                          onClick={() =>
                            canViewContent && handleSelectLesson(lesson)
                          }
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              {/* Lesson Number/Status */}
                              <div className="flex-shrink-0">
                                <div
                                  className={cn(
                                    "relative w-12 h-12 rounded-lg flex items-center justify-center font-semibold text-sm transition-all",
                                    isCompleted
                                      ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-200"
                                      : isInProgress
                                      ? "bg-blue-100 text-blue-700 border-2 border-blue-200"
                                      : "bg-slate-100 text-slate-600 border-2 border-slate-200 group-hover:border-slate-300"
                                  )}
                                >
                                  {isCompleted ? (
                                    <CheckCircle className="w-6 h-6" />
                                  ) : isInProgress ? (
                                    <Play className="w-5 h-5" />
                                  ) : (
                                    index + 1
                                  )}
                                </div>
                              </div>

                              {/* Lesson Content */}
                              <div className="flex-1 min-w-0">
                                {/* Lesson Type & Duration */}
                                <div className="flex items-center gap-2 mb-2">
                                  <div
                                    className={cn(
                                      "w-5 h-5 flex items-center justify-center",
                                      lesson.type === "video_url" &&
                                        "text-red-500",
                                      lesson.type === "pdf_url" &&
                                        "text-orange-500",
                                      lesson.type === "text" &&
                                        "text-green-500",
                                      lesson.type === "external_link" &&
                                        "text-blue-500"
                                    )}
                                  >
                                    {renderLessonIcon(lesson.type)}
                                  </div>
                                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                    {lesson.type === "video_url" && "Video"}
                                    {lesson.type === "pdf_url" &&
                                      "Tài liệu PDF"}
                                    {lesson.type === "text" && "Bài đọc"}
                                    {lesson.type === "external_link" &&
                                      "Liên kết"}
                                  </span>
                                  {lesson.duration && (
                                    <>
                                      <span className="text-slate-300">•</span>
                                      <span className="text-xs text-slate-500">
                                        {lesson.duration}
                                      </span>
                                    </>
                                  )}
                                </div>

                                {/* Lesson Title */}
                                <h3
                                  className={cn(
                                    "font-semibold text-slate-800 line-clamp-2 mb-3 transition-colors",
                                    "group-hover:text-slate-900"
                                  )}
                                >
                                  {lesson.title}
                                </h3>

                                {/* Progress Bar */}
                                {canViewContent &&
                                  lesson.progressPercentage >= 0 && (
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-slate-500">
                                          Tiến độ
                                        </span>
                                        <span className="text-xs font-semibold text-slate-700">
                                          {lesson.progressPercentage}%
                                        </span>
                                      </div>
                                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                        <div
                                          className={cn(
                                            "h-full transition-all duration-300 rounded-full",
                                            isCompleted
                                              ? "bg-emerald-500"
                                              : "bg-blue-500"
                                          )}
                                          style={{
                                            width: `${lesson.progressPercentage}%`,
                                          }}
                                        />
                                      </div>
                                    </div>
                                  )}
                              </div>

                              {/* Status Badge & Action */}
                              <div className="flex-shrink-0 flex items-center gap-3">
                                {/* Status Badge */}
                                {isCompleted && (
                                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Hoàn thành
                                  </Badge>
                                )}
                                {isInProgress && !isCompleted && (
                                  <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">
                                    <Play className="w-3 h-3 mr-1" />
                                    Đang học
                                  </Badge>
                                )}

                                {/* Action Button */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={!canViewContent}
                                  className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card className="border-0 shadow-sm">
                    <CardContent className="text-center py-16">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-700 mb-2">
                        Chưa có bài học
                      </h3>
                      <p className="text-slate-500 max-w-md mx-auto">
                        Nội dung khóa học đang được cập nhật. Vui lòng quay lại
                        sau.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
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
                      <p className="text-sm">
                        {extractErrorMessage(testsError)}
                      </p>
                    </div>
                  ) : tests && tests.length > 0 ? (
                    <div className="space-y-4">
                      {tests.map((test) => (
                        <TestItem
                          key={test.id}
                          test={test}
                          courseId={course.id}
                          isEnrolled={isEnrolled}
                        />
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

            {(course as any).requirements &&
              String((course as any).requirements).trim().length > 0 && (
                <TabsContent value="requirements">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <ListChecks className="mr-2 h-5 w-5" />
                        Yêu cầu tiên quyết
                      </CardTitle>
                      <CardDescription>
                        Những kiến thức và kỹ năng cần có trước khi tham gia
                        khóa học.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        {String((course as any).requirements)}
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

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
                              <h4 className="font-semibold">
                                {material.title}
                              </h4>
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
              <TabsContent value="activity-logs">
                <AuditLog courseId={courseIdFromParams} />
              </TabsContent>
            )}

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
                  {isLoadingFeedbacks ? (
                    <div className="flex items-center justify-center p-6">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : feedbacks.length > 0 ? (
                    feedbacks.map((fb, index) => (
                      <Card key={fb.id || index} className="p-4 bg-muted/30">
                        <div className="flex items-start gap-4">
                          <Avatar>
                            <AvatarImage src={fb.userAvatar} />
                            <AvatarFallback>
                              <UserCircle2 />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold">
                                {fb.userName || "Học viên ẩn danh"}
                              </p>
                              {fb.createdAt && (
                                <span className="text-xs text-muted-foreground">
                                  <ClientTime date={fb.createdAt} />
                                </span>
                              )}
                            </div>
                            <StarRatingDisplay
                              rating={fb.averageScore}
                              size={4}
                              className="my-2"
                            />
                            {fb.comment && (
                              <p className="text-sm text-foreground italic border-l-2 pl-3 py-1 my-3">
                                "{fb.comment}"
                              </p>
                            )}
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-3 gap-x-6 pt-3 mt-3 border-t">
                              {(
                                Object.keys(
                                  EVALUATION_CRITERIA_SHORT_LABELS
                                ) as Array<
                                  keyof typeof EVALUATION_CRITERIA_SHORT_LABELS
                                >
                              ).map((key) => (
                                <div key={key}>
                                  <p className="text-xs font-medium text-muted-foreground">
                                    {EVALUATION_CRITERIA_SHORT_LABELS[key]}
                                  </p>
                                  <StarRatingDisplay
                                    rating={fb[key as keyof Feedback] as number}
                                    size={4}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      Chưa có đánh giá nào cho khóa học này.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {currentUser?.role === "ADMIN" && (
              <TabsContent value="students">
                <CourseProgressList courseId={courseIdFromParams} />
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
                    rating={evaluationFormData[key] || 0}
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
                disabled={createFeedbackMutation.isPending}
              >
                Hủy
              </Button>
              <Button
                onClick={handleSubmitEvaluation}
                disabled={createFeedbackMutation.isPending}
              >
                {createFeedbackMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Gửi đánh giá
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Fullscreen Learning Modal (disabled duplicate to prevent background play) */}
        {isFullscreen && selectedLesson && (
          <div className="fixed z-[99]">
            {/* Main Content Area */}
            <div className="flex h-full relative">
              {/* Content Area - Left Side */}
              <div className="flex-1 relative">
                {selectedLesson.type === "video_url" && selectedLesson.link && (
                  <div className="h-full flex items-center justify-center bg-black">
                    <ReactPlayer
                      key={`fullscreen-${selectedLesson.id}`}
                      url={selectedLesson.link}
                      playing={false}
                      controls
                      width="100%"
                      height="100%"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                      }}
                      config={{
                        playerVars: {
                          autoplay: 0,
                          rel: 0,
                          modestbranding: 1,
                          showinfo: 0,
                          iv_load_policy: 3,
                        },
                      }}
                    />
                  </div>
                )}

                {selectedLesson.type === "pdf_url" && selectedLesson.link && (
                  <div className="h-full relative z-[1]">
                    <PdfLessonViewer
                      key={`fullscreen-pdf-${selectedLesson.id}`}
                      pdfUrl={selectedLesson.link}
                      onVisiblePageChange={(page) => {
                        setVisiblePage(page);
                        // Update progress based on page
                      }}
                      initialPage={selectedLesson.currentPage || 1}
                      isMobile={isMobile}
                    />
                  </div>
                )}

                {selectedLesson.type === "text" && (
                  <div className="h-full overflow-y-auto bg-white">
                    <div className="max-w-4xl mx-auto p-8">
                      <h1 className="text-3xl font-bold text-gray-900 mb-6">
                        {selectedLesson.title}
                      </h1>
                      <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                        <p>Nội dung bài học sẽ được hiển thị ở đây.</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedLesson.type === "external_link" &&
                  selectedLesson.link && (
                    <div className="h-full">
                      <iframe
                        src={selectedLesson.link}
                        className="w-full h-full border-0"
                        title={selectedLesson.title}
                      />
                    </div>
                  )}
              </div>

              {/* Mobile Backdrop Overlay */}
              {isMobile && isSidebarOpen && (
                <div
                  className="fixed inset-0 bg-black/50 z-[90] backdrop-blur-sm"
                  onClick={() => setIsSidebarOpen(false)}
                />
              )}

              {/* Sidebar - Right Side */}
              <div
                className={cn(
                  "bg-white transition-all duration-300 overflow-hidden relative z-[95] shadow-xl",
                  isMobile
                    ? cn(
                        "fixed top-0 right-0 h-full",
                        isSidebarOpen
                          ? "w-full max-w-xs translate-x-0"
                          : "w-0 translate-x-full"
                      )
                    : cn(
                        "border-l border-gray-200",
                        isSidebarOpen ? "w-80 min-w-[320px]" : "w-0"
                      )
                )}
              >
                {isSidebarOpen && (
                  <div className="h-full overflow-y-auto">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-orange-50 to-orange-100">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">
                          Nội dung khóa học
                        </h3>
                        <p className="text-xs text-gray-600 mt-1">
                          {lessonsWithProgress.length} bài học
                        </p>
                      </div>
                      {/* Close Button inside sidebar */}
                      <Button
                        size="sm"
                        onClick={() => setIsSidebarOpen(false)}
                        className="bg-white/80 text-gray-700 hover:bg-white hover:text-gray-900 rounded-full w-8 h-8 p-0 shadow-sm border border-gray-200"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="p-2">
                      {lessonsWithProgress.map((lesson, index) => {
                        const isActive = lesson.id === selectedLesson?.id;
                        const isCompleted = lesson.progressPercentage >= 100;
                        const isInProgress =
                          lesson.progressPercentage > 0 &&
                          lesson.progressPercentage < 100;

                        return (
                          <div
                            key={lesson.id}
                            className={cn(
                              "p-3 rounded-lg cursor-pointer transition-all duration-200 mb-2",
                              isActive
                                ? "bg-orange-100 border-2 border-orange-300"
                                : "hover:bg-gray-100 border-2 border-transparent"
                            )}
                            onClick={() => handleSelectLesson(lesson)}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                                  isCompleted
                                    ? "bg-green-100 text-green-700"
                                    : isInProgress
                                    ? "bg-blue-100 text-blue-700"
                                    : isActive
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-gray-100 text-gray-600"
                                )}
                              >
                                {isCompleted ? (
                                  <CheckCircle className="w-5 h-5" />
                                ) : (
                                  index + 1
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p
                                  className={cn(
                                    "font-medium text-sm truncate",
                                    isActive
                                      ? "text-orange-900"
                                      : "text-gray-900"
                                  )}
                                >
                                  {lesson.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="w-4 h-4 text-gray-500">
                                    {renderLessonIcon(lesson.type)}
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {lesson.type === "video_url" && "Video"}
                                    {lesson.type === "pdf_url" && "PDF"}
                                    {lesson.type === "text" && "Bài đọc"}
                                    {lesson.type === "external_link" &&
                                      "Liên kết"}
                                  </span>
                                  {lesson.duration && (
                                    <>
                                      <span className="text-gray-300">•</span>
                                      <span className="text-xs text-gray-500">
                                        {lesson.duration}
                                      </span>
                                    </>
                                  )}
                                </div>
                                {lesson.progressPercentage > 0 && (
                                  <div className="mt-2">
                                    <Progress
                                      value={lesson.progressPercentage}
                                      className="h-1"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Fixed top-right controls: only toggle (no 3-dot menu) */}
            <div
              className={cn(
                "fixed top-16 z-[100] transition-all duration-300 flex items-center gap-2",
                isSidebarOpen ? "right-[330px]" : "right-4"
              )}
            >
              <Button
                size="sm"
                className="bg-white text-gray-900 hover:bg-white/90 rounded-full h-8 px-3 shadow-md border border-gray-200 flex items-center gap-1"
                onClick={() => {
                  setControlsEnabled((v) => !v);
                  setShowControls(true);
                }}
                title={
                  controlsEnabled
                    ? "Ẩn các nút điều khiển"
                    : "Hiện các nút điều khiển"
                }
              >
                {controlsEnabled ? (
                  <EyeOff className="h-3 w-3" />
                ) : (
                  <Eye className="h-3 w-3" />
                )}
                {/* <span className="text-[11px]">
                  {controlsEnabled ? "Ẩn" : "Hiện"}
                </span> */}
              </Button>
            </div>

            {/* Navigation Controls - hover only when enabled */}
            {controlsEnabled && (
              <div
                className="absolute inset-0 z-[49] pointer-events-none"
                onMouseEnter={() => controlsEnabled && setShowControls(true)}
              >
                {showControls && (
                  <>
                    {/* Previous Button - Left Center */}
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-auto">
                      <Button
                        size="sm"
                        onClick={handlePrevLesson}
                        disabled={
                          lessonsWithProgress.findIndex(
                            (l) => l.id === selectedLesson.id
                          ) === 0
                        }
                        className="bg-white/90 text-gray-700 hover:bg-white hover:text-gray-900 rounded-full w-8 h-8 p-0 shadow-lg border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Next Button - Right Center */}
                    <div
                      className={cn(
                        "absolute top-1/2 transform -translate-y-1/2 transition-all duration-300 pointer-events-auto",
                        isSidebarOpen ? "right-[340px]" : "right-4"
                      )}
                    >
                      <Button
                        size="sm"
                        onClick={handleNextLesson}
                        disabled={
                          lessonsWithProgress.findIndex(
                            (l) => l.id === selectedLesson.id
                          ) ===
                          lessonsWithProgress.length - 1
                        }
                        className="bg-white/90 text-gray-700 hover:bg-white hover:text-gray-900 rounded-full w-8 h-8 p-0 shadow-lg border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
