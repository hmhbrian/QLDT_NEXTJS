"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  LinkIcon,
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
} from "lucide-react";

import { useCookie } from "@/hooks/use-cookie";
import { cn } from "@/lib/utils";
import {
  categoryOptions,
  statusOptions as courseStatusOptions,
  EVALUATIONS_COOKIE_KEY,
} from "@/lib/constants";
import {
  Course,
  CourseCategory,
  Lesson,
  CourseMaterial,
  StudentCourseEvaluation,
} from "@/lib/types";
import { mockEvaluations as initialMockEvaluationsFromLib } from "@/lib/mock";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useUserStore } from "@/stores/user-store";
import { useCourseStore } from "@/stores/course-store";
import { StarRatingInput } from "@/components/courses/StarRatingInput";
import { StarRatingDisplay } from "@/components/courses/StarRatingDisplay";

// Dynamic imports với lazy loading để tối ưu performance
const CourseViewer = dynamic(
  () => import("@/components/courses/CourseViewer"),
  {
    ssr: false,
    loading: () => <Skeleton className="w-full h-[500px]" />,
  }
);

const PdfLessonViewer = dynamic(
  () => import("@/components/courses/PdfLessonViewer"),
  {
    ssr: false,
    loading: () => <Skeleton className="w-full h-full" />,
  }
);

// Helper functions được extract ra để tái sử dụng
const getCategoryLabel = (categoryValue?: CourseCategory) => {
  if (!categoryValue) return "Chưa xác định";
  const option = categoryOptions.find((opt) => opt.value === categoryValue);
  return option ? option.label : categoryValue;
};

const isRegistrationOpen = (deadline?: string | null): boolean => {
  if (!deadline) return true;
  const now = new Date();
  const deadlineDate = new Date(deadline);
  return now <= deadlineDate;
};

const renderLessonIcon = (contentType: Lesson["contentType"]) => {
  const iconMap = {
    video_url: <Video className="h-5 w-5 text-blue-500" />,
    pdf_url: <FileText className="h-5 w-5 text-red-500" />,
    slide_url: <FileText className="h-5 w-5 text-yellow-500" />,
    text: <BookOpen className="h-5 w-5 text-green-500" />,
    external_link: <LinkIcon className="h-5 w-5 text-gray-500" />,
  };
  return iconMap[contentType] || <FileText className="h-5 w-5 text-gray-500" />;
};

const renderMaterialIcon = (type: CourseMaterial["type"]) => {
  const iconMap = {
    document: <FileText className="h-5 w-5 text-blue-500" />,
    video: <Video className="h-5 w-5 text-red-500" />,
    link: <LinkIcon className="h-5 w-5 text-green-500" />,
  };
  return iconMap[type] || <FileText className="h-5 w-5 text-gray-500" />;
};

// Constants cho evaluation criteria
const EVALUATION_CRITERIA_LABELS = {
  contentRelevance: "Nội dung phù hợp và hữu ích",
  clarity: "Nội dung rõ ràng, dễ hiểu",
  structureLogic: "Cấu trúc khóa học logic, dễ theo dõi",
  durationAppropriateness: "Thời lượng khóa học hợp lý",
  materialsEffectiveness: "Tài liệu và công cụ học tập hỗ trợ hiệu quả",
} as const;

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseIdFromParams = params.courseId as string;

  // State management
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEvaluationDialogOpen, setIsEvaluationDialogOpen] = useState(false);
  const [hasSubmittedEvaluation, setHasSubmittedEvaluation] = useState(false);

  // Hooks
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const allUsers = useUserStore((state) => state.users);
  const { courses: allCoursesFromStore } = useCourseStore();

  // Cookie state cho evaluations
  const [allEvaluations, setAllEvaluations] = useCookie<
    StudentCourseEvaluation[]
  >(EVALUATIONS_COOKIE_KEY, initialMockEvaluationsFromLib);

  // Form state cho evaluation
  const [evaluationFormData, setEvaluationFormData] = useState<
    Partial<StudentCourseEvaluation["ratings"] & { suggestions: string }>
  >({
    contentRelevance: 0,
    clarity: 0,
    structureLogic: 0,
    durationAppropriateness: 0,
    materialsEffectiveness: 0,
    suggestions: "",
  });

  // Memoized computed values để tránh re-computation không cần thiết
  const showRegisterGate = useMemo(
    () =>
      currentUser?.role === "HOCVIEN" &&
      course &&
      !course.enrolledTrainees?.includes(currentUser.id) &&
      course.enrollmentType === "optional",
    [currentUser, course]
  );

  const getTraineeNameById = useCallback(
    (traineeId: string) => {
      const user = allUsers.find((u) => u.id === traineeId);
      return user ? `${user.fullName || user.email}` : "Học viên ẩn danh";
    },
    [allUsers]
  );

  // Course fetching useEffect
  useEffect(() => {
    const fetchCourse = () => {
      setIsLoading(true);
      try {
        const foundCourse = allCoursesFromStore.find(
          (c) => c.id === courseIdFromParams
        );

        if (foundCourse) {
          const detailedCourseData: Course = {
            ...foundCourse,
            id: courseIdFromParams,
            maxParticipants: foundCourse.maxParticipants || 25,
            prerequisites: foundCourse.prerequisites || [
              "Không có yêu cầu tiên quyết cụ thể.",
            ],
            syllabus: foundCourse.syllabus || [
              {
                title: "Chương trình học đang được cập nhật",
                content: "",
                duration: "",
              },
            ],
            slides: foundCourse.slides || [
              {
                title: "Nội dung đang được cập nhật",
                url: "https://placehold.co/800x600.png?text=Updating...",
                type: "image" as const,
              },
            ],
            lessons: foundCourse.lessons || [],
            tests: foundCourse.tests || [],
            materials: foundCourse.materials || [],
          };

          setCourse(detailedCourseData);
        } else {
          toast({
            title: "Không tìm thấy khóa học",
            description:
              "Khóa học bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.",
            variant: "destructive",
          });
          setCourse(null);
          // Instant redirect - no delay
          router.push("/courses");
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu khóa học:", error);
        toast({
          title: "Lỗi tải dữ liệu",
          description:
            "Đã xảy ra lỗi khi tải thông tin khóa học. Vui lòng thử lại sau.",
          variant: "destructive",
        });
        setCourse(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [courseIdFromParams, allCoursesFromStore, toast, router]);

  // Check if user has submitted evaluation
  useEffect(() => {
    if (currentUser && courseIdFromParams && allEvaluations.length > 0) {
      const existingEvaluation = allEvaluations.find(
        (ev) =>
          ev.traineeId === currentUser.id && ev.courseId === courseIdFromParams
      );
      setHasSubmittedEvaluation(!!existingEvaluation);
    } else {
      setHasSubmittedEvaluation(false);
    }
  }, [currentUser, courseIdFromParams, allEvaluations]);

  // Optimized enrollment handler với error handling
  const handleEnroll = useCallback(() => {
    if (!course || !currentUser) {
      if (!currentUser) {
        router.push("/login");
        return;
      }
      return;
    }

    // Check if already enrolled
    if (course.enrolledTrainees?.includes(currentUser.id)) {
      toast({
        title: "Đã đăng ký",
        description: `Bạn đã đăng ký khóa học "${course.title}" trước đó.`,
        variant: "default",
      });
      return;
    }

    // Update enrollment
    const updatedEnrolledTrainees = [
      ...(course.enrolledTrainees || []),
      currentUser.id,
    ];

    useCourseStore.getState().updateCourse(course.id, {
      enrolledTrainees: updatedEnrolledTrainees,
    });

    toast({
      title: "Đăng ký thành công",
      description: `Bạn đã đăng ký khóa học "${course.title}" thành công.`,
      duration: 1500, // Faster toast - 1.5 seconds
      variant: "success",
    });

    // Update local state instantly
    setCourse((prev) => (prev ? { ...prev } : null));
  }, [course, currentUser, router, toast]);

  const handleEvaluationRatingChange = useCallback(
    (field: keyof StudentCourseEvaluation["ratings"], rating: number) => {
      setEvaluationFormData((prev) => ({
        ...prev,
        [field]: rating,
      }));
    },
    []
  );

  const handleSubmitEvaluation = useCallback(() => {
    if (!currentUser || !course) return;

    const newEvaluation: StudentCourseEvaluation = {
      id: crypto.randomUUID(),
      courseId: course.id,
      traineeId: currentUser.id,
      ratings: {
        contentRelevance: evaluationFormData.contentRelevance || 0,
        clarity: evaluationFormData.clarity || 0,
        structureLogic: evaluationFormData.structureLogic || 0,
        durationAppropriateness:
          evaluationFormData.durationAppropriateness || 0,
        materialsEffectiveness: evaluationFormData.materialsEffectiveness || 0,
      },
      suggestions: evaluationFormData.suggestions || "",
      submissionDate: new Date().toISOString(),
    };

    setAllEvaluations((prev) => [...prev, newEvaluation]);
    setHasSubmittedEvaluation(true);
    setIsEvaluationDialogOpen(false);

    toast({
      title: "Cảm ơn bạn!",
      description: "Đánh giá của bạn đã được gửi thành công.",
      variant: "success",
    });

    // Reset form
    setEvaluationFormData({
      contentRelevance: 0,
      clarity: 0,
      structureLogic: 0,
      durationAppropriateness: 0,
      materialsEffectiveness: 0,
      suggestions: "",
    });
  }, [currentUser, course, evaluationFormData, setAllEvaluations, toast]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-60 w-full items-center justify-center">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    );
  }

  // Course not found state
  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-6 text-red-500">
          <AlertTriangle className="mx-auto h-16 w-16" />
        </div>
        <h1 className="mb-2 text-2xl font-bold">Không tìm thấy khóa học</h1>
        <p className="mb-6 text-muted-foreground">
          Khóa học bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
        </p>
        <Button asChild>
          <Link href="/courses">Quay lại danh sách khóa học</Link>
        </Button>
      </div>
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
              layout="fill"
              objectFit="cover"
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
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0 w-full md:w-auto">
            {currentUser?.role === "HOCVIEN" &&
              course.enrollmentType === "optional" &&
              !course.enrolledTrainees?.includes(currentUser.id) &&
              isRegistrationOpen(course.registrationDeadline) && (
                <Button
                  onClick={handleEnroll}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <UserPlus className="mr-2 h-5 w-5" /> Đăng ký ngay
                </Button>
              )}
            {currentUser?.role === "HOCVIEN" &&
              course.enrollmentType === "optional" &&
              course.enrolledTrainees?.includes(currentUser.id) && (
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
                variant={hasSubmittedEvaluation ? "outline" : "outline"}
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                  <p className="text-xs text-muted-foreground mt-1">
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
                  </p>
                )}
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trạng thái</CardTitle>
              <BookOpen className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge
                variant={
                  courseStatusOptions.find((s) => s.value === course.status)
                    ?.value === "published"
                    ? "default"
                    : courseStatusOptions.find((s) => s.value === course.status)
                        ?.value === "draft"
                    ? "secondary"
                    : "destructive"
                }
                className="text-base"
              >
                {courseStatusOptions.find((s) => s.value === course.status)
                  ?.label || course.status}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="flex w-full overflow-x-auto h-auto items-center rounded-md bg-muted p-1 text-muted-foreground justify-start">
            <TabsTrigger value="content" className="text-base">
              Nội dung chính
            </TabsTrigger>
            <TabsTrigger value="objectives" className="text-base">
              Mục tiêu
            </TabsTrigger>
            <TabsTrigger value="lessons_tab" className="text-base">
              Bài học
            </TabsTrigger>
            <TabsTrigger value="tests_tab" className="text-base">
              Bài kiểm tra
            </TabsTrigger>
            <TabsTrigger value="requirements" className="text-base">
              Yêu cầu
            </TabsTrigger>
            <TabsTrigger value="syllabus" className="text-base">
              Chương trình học
            </TabsTrigger>
            <TabsTrigger value="materials_tab" className="text-base">
              Tài liệu
            </TabsTrigger>
            {(currentUser?.role === "ADMIN" || currentUser?.role === "HR") && (
              <TabsTrigger value="evaluations_tab" className="text-base">
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
                <Button onClick={handleEnroll} size="lg">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Đăng ký ngay
                </Button>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-destructive font-medium">
                    Đã hết hạn đăng ký
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Hạn đăng ký:{" "}
                    {new Date(course.registrationDeadline!).toLocaleDateString(
                      "vi-VN"
                    )}
                  </p>
                </div>
              )}
            </div>
          )}

          <TabsContent value="content">
            {course.slides && course.slides.length > 0 ? (
              <CourseViewer course={course} />
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <BookOpen className="mx-auto h-12 w-12 mb-4" />
                  Nội dung bài giảng đang được cập nhật.
                </CardContent>
              </Card>
            )}
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

          <TabsContent value="lessons_tab">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Library className="mr-2 h-5 w-5" />
                  Danh sách Bài học
                </CardTitle>
                <CardDescription>
                  Các bài học trong khóa học này.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {course.lessons && course.lessons.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {course.lessons.map((lesson, index) => (
                      <AccordionItem value={`lesson-${index}`} key={lesson.id}>
                        <AccordionTrigger className="text-base font-semibold hover:no-underline">
                          <div className="flex items-center gap-2">
                            {renderLessonIcon(lesson.contentType)}
                            {lesson.title}{" "}
                            {lesson.duration && `(${lesson.duration})`}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="prose prose-sm max-w-none text-muted-foreground dark:prose-invert">
                          {lesson.contentType === "text" ? (
                            <div
                              dangerouslySetInnerHTML={{
                                __html: lesson.content.replace(/\n/g, "<br />"),
                              }}
                            />
                          ) : lesson.contentType === "video_url" ? (
                            <iframe
                              src={lesson.content}
                              className="w-full h-64 rounded"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : lesson.contentType === "pdf_url" ? (
                            <PdfLessonViewer
                              pdfUrl={lesson.content}
                              onLessonComplete={() =>
                                console.log(
                                  `Bài học ${lesson.id} được đánh dấu hoàn thành bởi trình xem (prototype).`
                                )
                              }
                            />
                          ) : (
                            <a
                              href={lesson.content}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              Truy cập nội dung{" "}
                              {lesson.contentType.replace("_url", "")}
                            </a>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <p className="text-muted-foreground">
                    Chưa có bài học nào được thêm cho khóa học này.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tests_tab">
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
                {course.tests && course.tests.length > 0 ? (
                  <div className="space-y-4">
                    {course.tests.map((test) => (
                      <Card
                        key={test.id}
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
                          Số lượng câu hỏi:{" "}
                          {test.questions ? test.questions.length : 0}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          asChild
                        >
                          <Link href={`/courses/${course.id}/tests/${test.id}`}>
                            <Check className="mr-2 h-5 w-5" />
                            Làm bài kiểm tra
                          </Link>
                        </Button>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
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
                {course.prerequisites && course.prerequisites.length > 0 ? (
                  <ul className="space-y-2">
                    {course.prerequisites.map((req: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                        <span className="text-muted-foreground">{req}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">
                    Không có yêu cầu tiên quyết cụ thể cho khóa học này.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="syllabus">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Chương trình học chi tiết
                </CardTitle>
                <CardDescription>
                  Nội dung cụ thể của khóa học được chia theo từng phần hoặc
                  tuần.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {course.syllabus && course.syllabus.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {course.syllabus.map(
                      (
                        week: {
                          title: string;
                          content: string;
                          duration: string;
                        },
                        index: number
                      ) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                          <AccordionTrigger className="text-base font-semibold hover:no-underline">
                            {week.title} ({week.duration})
                          </AccordionTrigger>
                          <AccordionContent className="prose prose-sm max-w-none text-muted-foreground dark:prose-invert">
                            <p>{week.content}</p>
                          </AccordionContent>
                        </AccordionItem>
                      )
                    )}
                  </Accordion>
                ) : (
                  <p className="text-muted-foreground">
                    Chương trình học đang được cập nhật.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="materials_tab">
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
                {course.materials && course.materials.length > 0 ? (
                  <div className="space-y-4">
                    {course.materials.map((material, index) => (
                      <Card
                        key={material.id || index}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3">
                          {renderMaterialIcon(material.type)}
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
                            href={material.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            {material.type === "link" ||
                            material.type === "video"
                              ? "Truy cập"
                              : "Tải xuống"}
                          </a>
                        </Button>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Không có tài liệu bổ sung cho khóa học này.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {(currentUser?.role === "ADMIN" || currentUser?.role === "HR") && (
            <TabsContent value="evaluations_tab">
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
                  {allEvaluations.filter(
                    (ev) => ev.courseId === courseIdFromParams
                  ).length > 0 ? (
                    allEvaluations
                      .filter((ev) => ev.courseId === courseIdFromParams)
                      .map((evaluation) => (
                        <Card key={evaluation.id} className="bg-muted/30">
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-md font-semibold">
                                {getTraineeNameById(evaluation.traineeId)}
                              </CardTitle>
                              <CardDescription className="text-xs">
                                {new Date(
                                  evaluation.submissionDate
                                ).toLocaleDateString("vi-VN", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                })}
                              </CardDescription>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3 text-sm">
                            {Object.entries(evaluation.ratings).map(
                              ([key, rating]) => (
                                <div
                                  key={String(key)}
                                  className="flex justify-between items-center"
                                >
                                  <p className="text-muted-foreground">
                                    {
                                      EVALUATION_CRITERIA_LABELS[
                                        key as keyof typeof EVALUATION_CRITERIA_LABELS
                                      ]
                                    }
                                    :
                                  </p>
                                  <StarRatingDisplay
                                    rating={Number(rating)}
                                    size={4}
                                  />
                                </div>
                              )
                            )}
                            {evaluation.suggestions && (
                              <div className="pt-2">
                                <p className="font-medium text-foreground">
                                  Ý kiến đóng góp:
                                </p>
                                <p className="text-muted-foreground mt-1">
                                  &ldquo;{evaluation.suggestions}&rdquo;
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        Chưa có đánh giá nào cho khóa học này.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Dialog Đánh giá cho Học viên */}
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
                keyof StudentCourseEvaluation["ratings"]
              >
            ).map((key) => (
              <div key={String(key)} className="space-y-2">
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
                value={evaluationFormData.suggestions || ""}
                onChange={(e) =>
                  setEvaluationFormData((prev) => ({
                    ...prev,
                    suggestions: e.target.value,
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
