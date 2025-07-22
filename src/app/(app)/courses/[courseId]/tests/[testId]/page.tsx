"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Loader2,
  Clock,
  User,
  FileText,
  Home,
  Target,
  BookOpen,
  Award,
  Timer,
  Flag,
  Eye,
  Send,
  CheckSquare,
  Square,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { testsService } from "@/lib/services/modern/tests.service";
import type { SelectedAnswer } from "@/lib/types/course.types";
import { useToast } from "@/components/ui/use-toast";

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"];

// API data types based on the actual API response structure
interface ApiTestResponse {
  id: string;
  courseId: string;
  title: string;
  passThreshold: number;
  timeTest: number; // in minutes
  createdBy: {
    id: string;
    name: string;
  };
  updatedBy: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  questions: ApiQuestionResponse[];
}

interface ApiQuestionResponse {
  id: number;
  questionText: string;
  correctOption: string;
  questionType: number; // 1: single choice, 2: multiple choice, 3: all choices
  explanation: string;
  position: number;
  a: string;
  b: string;
  c: string;
  d: string;
}

// UI data types
interface UiQuestion {
  id: number;
  text: string;
  options: string[];
  correctOptions: string[]; // array of option letters like ["b", "c"]
  questionType: number;
  explanation: string;
  position: number;
}

interface UiTest {
  id: string;
  courseId: string;
  title: string;
  passThreshold: number;
  timeTest: number;
  createdBy: {
    id: string;
    name: string;
  };
  questions: UiQuestion[];
}

export default function TestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const courseId = params.courseId as string;
  const testId = params.testId as string;

  // Transform API data to UI data
  const mapApiTestToUiTest = (apiTest: ApiTestResponse): UiTest => {
    return {
      id: apiTest.id,
      courseId: apiTest.courseId,
      title: apiTest.title,
      passThreshold: apiTest.passThreshold,
      timeTest: apiTest.timeTest,
      createdBy: apiTest.createdBy,
      questions: apiTest.questions.map((q) => ({
        id: q.id,
        text: q.questionText,
        options: [q.a, q.b, q.c, q.d],
        correctOptions: q.correctOption.split(",").map((opt) => opt.trim()),
        questionType: q.questionType,
        explanation: q.explanation,
        position: q.position,
      })),
    };
  };

  const {
    data: test,
    isLoading,
    error,
  } = useQuery<UiTest | null, Error>({
    queryKey: ["test", courseId, testId],
    queryFn: async () => {
      if (!courseId || !testId) return null;
      try {
        const response = (await testsService.getTestById(
          courseId,
          parseInt(testId, 10)
        )) as any; // Cast as any since we know the actual structure
        return mapApiTestToUiTest(response);
      } catch (e) {
        console.error("Failed to fetch test details:", e);
        return null;
      }
    },
    enabled: !!courseId && !!testId,
  });

  const getInitialState = () => ({
    answers: {} as { [questionId: string]: string[] }, // Array of selected option letters
    submitted: false,
    score: null as number | null,
    passed: null as boolean | null,
    currentQuestionIndex: 0,
    showReview: false,
    timeRemaining: null as number | null,
    isStarted: false,
    startedAt: null as string | null, // Thời điểm bắt đầu làm bài
  });

  const [state, setState] = useState(getInitialState());
  const {
    answers,
    submitted,
    score,
    passed,
    currentQuestionIndex,
    showReview,
    timeRemaining,
    isStarted,
    startedAt,
  } = state;

  // Timer functionality
  useEffect(() => {
    if (!test || !test.timeTest || !isStarted || submitted) return;

    if (timeRemaining === null) {
      setState((prev) => ({ ...prev, timeRemaining: test.timeTest * 60 }));
      return;
    }

    if (timeRemaining <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setState((prev) => ({
        ...prev,
        timeRemaining: prev.timeRemaining ? prev.timeRemaining - 1 : 0,
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [test, timeRemaining, isStarted, submitted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <BookOpen className="w-8 h-8 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                Đang tải bài kiểm tra
              </h3>
              <p className="text-sm text-muted-foreground">
                Vui lòng đợi trong giây lát...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !test || !test.questions || test.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-destructive/5 via-background to-destructive/10">
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <Card className="max-w-lg w-full border-destructive/20 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-destructive">
                {!test || !test.questions || test.questions.length === 0
                  ? "Bài kiểm tra chưa có câu hỏi"
                  : "Không tìm thấy bài kiểm tra"}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                {!test || !test.questions || test.questions.length === 0
                  ? "Bài kiểm tra này chưa có câu hỏi nào. Vui lòng liên hệ với giảng viên để thêm câu hỏi."
                  : "Bài kiểm tra này có thể đã bị xóa hoặc bạn không có quyền truy cập."}
              </p>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>
                  Mã khóa học:{" "}
                  <code className="bg-muted px-2 py-1 rounded">{courseId}</code>
                </p>
                <p>
                  Mã bài kiểm tra:{" "}
                  <code className="bg-muted px-2 py-1 rounded">{testId}</code>
                </p>
              </div>
              {error && (
                <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-sm text-destructive font-medium">
                    Chi tiết lỗi:
                  </p>
                  <p className="text-xs text-destructive/80 mt-1">
                    {error.message}
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="w-full"
              >
                <Home className="mr-2 h-4 w-4" />
                Quay lại khóa học
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  const handleSelect = (questionId: string, optionLetter: string) => {
    if (submitted || !test.questions || test.questions.length === 0) return;

    const question = test.questions.find((q) => q.id.toString() === questionId);
    if (!question) return;

    setState((prev) => {
      const currentAnswers = prev.answers[questionId] || [];

      if (question.questionType === 1) {
        // Single choice - replace the answer
        return {
          ...prev,
          answers: { ...prev.answers, [questionId]: [optionLetter] },
        };
      } else {
        // Multiple choice - toggle the option
        const newAnswers = currentAnswers.includes(optionLetter)
          ? currentAnswers.filter((ans) => ans !== optionLetter)
          : [...currentAnswers, optionLetter];

        return {
          ...prev,
          answers: { ...prev.answers, [questionId]: newAnswers },
        };
      }
    });
  };

  const handleSubmit = async () => {
    console.log("🔥 handleSubmit function called!", { submitted, answers });

    if (submitted) {
      console.log("❌ Already submitted, returning early");
      return;
    }

    console.log("🚀 Starting test submission...");

    // Defensive check for empty questions
    if (!test.questions || test.questions.length === 0) {
      console.log("❌ No questions found, cannot submit");
      return;
    }

    // Tính điểm local để hiển thị ngay
    let correct = 0;
    test.questions.forEach((q) => {
      const userAnswers = answers[String(q.id)] || [];
      const correctAnswers = q.correctOptions;

      // Check if user answers match correct answers exactly
      const isCorrect =
        userAnswers.length === correctAnswers.length &&
        userAnswers.every((ans) => correctAnswers.includes(ans)) &&
        correctAnswers.every((ans) => userAnswers.includes(ans));

      if (isCorrect) correct++;
    });

    const percent = (correct / test.questions.length) * 100;

    // Chuẩn bị data để gửi API
    const submissionAnswers = Object.entries(answers)
      .map(([questionId, selectedOptions]) => ({
        questionId: parseInt(questionId),
        selectedOptions: selectedOptions || [],
      }))
      .filter((answer) => answer.selectedOptions.length > 0); // Chỉ gửi câu đã trả lời

    const submissionStartedAt = startedAt || new Date().toISOString(); // Dùng thời điểm đã lưu hoặc current time

    console.log("📤 Submitting to API:", {
      courseId,
      testId: parseInt(testId),
      answers: submissionAnswers,
      startedAt: submissionStartedAt,
    });

    try {
      // Gọi API submit test
      const response = await testsService.submitTest(
        courseId,
        parseInt(testId),
        submissionAnswers,
        submissionStartedAt
      );

      console.log("✅ API submission successful:", response);

      toast({
        title: "Nộp bài thành công! 🎉",
        description: `Điểm số: ${
          response?.score || Math.round((correct / test.questions.length) * 100)
        }%`,
      });

      // Cập nhật state với kết quả từ API (nếu có) hoặc dùng kết quả local
      setState((prev) => ({
        ...prev,
        // Nếu API trả về score nhỏ hơn hoặc bằng 1, coi là tỷ lệ, nếu lớn hơn 1 thì là số câu đúng
        score:
          typeof response?.score === "number"
            ? response.totalQuestions && response.score > 1
              ? (response.score / response.totalQuestions) * 100
              : response.score * 100
            : percent,
        passed:
          response?.isPassed !== undefined
            ? response.isPassed
            : percent >= test.passThreshold,
        correctCount:
          typeof response?.correctAnswers === "number"
            ? response.correctAnswers
            : correct,
        incorrectCount:
          test.questions.length -
          (typeof response?.correctAnswers === "number"
            ? response.correctAnswers
            : correct),
        submitted: true,
        showReview: true,
      }));
    } catch (error) {
      console.error("❌ API submission failed:", error);

      // Fallback: vẫn hiển thị kết quả local nếu API fail
      setState((prev) => ({
        ...prev,
        score: percent,
        passed: percent >= test.passThreshold,
        submitted: true,
        showReview: true,
      }));

      // Hiển thị thông báo lỗi
      toast({
        variant: "destructive",
        title: "Lỗi nộp bài",
        description:
          "Không thể gửi kết quả lên server, nhưng điểm số đã được tính toán locally.",
      });
    }
  };

  const handleRetry = () => {
    setState(getInitialState());
  };

  const handleStartTest = () => {
    const currentTime = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      isStarted: true,
      startedAt: currentTime,
    }));
    console.log("🎯 Test started at:", currentTime);
  };

  const goToNextQuestion = () => {
    if (!test.questions || test.questions.length === 0) return;

    if (currentQuestionIndex < test.questions.length - 1) {
      setState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
      }));
    } else {
      setState((prev) => ({ ...prev, showReview: true }));
    }
  };

  const goToPreviousQuestion = () => {
    if (!test.questions || test.questions.length === 0) return;

    if (currentQuestionIndex > 0) {
      setState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1,
      }));
    }
  };

  const goToQuestion = (index: number) => {
    if (!test.questions || test.questions.length === 0) return;

    if (index >= 0 && index < test.questions.length) {
      setState((prev) => ({
        ...prev,
        currentQuestionIndex: index,
        showReview: false,
      }));
    }
  };

  const answeredQuestionsCount = Object.keys(answers).filter(
    (questionId) => answers[questionId] && answers[questionId].length > 0
  ).length;
  const progressPercentage =
    test.questions && test.questions.length > 0
      ? (answeredQuestionsCount / test.questions.length) * 100
      : 0;

  // Start screen
  const renderStartScreen = () => (
    <div className="min-h-screen from-primary/5 via-background to-accent/5">
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="max-w-2xl w-full shadow-xl border-primary/20">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <Award className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-primary mb-2">
              {test.title}
            </CardTitle>
            <p className="text-muted-foreground">
              Chào mừng đến với bài kiểm tra của Becamex
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Test Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Số câu hỏi</p>
                  <p className="text-sm text-muted-foreground">
                    {test.questions ? test.questions.length : 0} câu
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
                <Target className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Điểm đạt</p>
                  <p className="text-sm text-muted-foreground">
                    {test.passThreshold}%
                  </p>
                </div>
              </div>
              {test.timeTest > 0 && (
                <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
                  <Timer className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Thời gian</p>
                    <p className="text-sm text-muted-foreground">
                      {test.timeTest} phút
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Tạo bởi</p>
                  <p className="text-sm text-muted-foreground">
                    {test.createdBy.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
              <h4 className="font-semibold text-accent-foreground mb-2 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Hướng dẫn làm bài
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Đọc kỹ từng câu hỏi trước khi chọn đáp án</li>
                <li>
                  • Bạn có thể di chuyển giữa các câu hỏi trong quá trình làm
                  bài
                </li>
                <li>• Kiểm tra lại các câu trả lời trước khi nộp bài</li>
                {test.timeTest > 0 && (
                  <li>• Bài thi sẽ tự động nộp khi hết thời gian</li>
                )}
                <li>• Kết quả sẽ được hiển thị ngay sau khi nộp bài</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="pt-6">
            <Button
              onClick={handleStartTest}
              className="w-full h-12 text-lg font-semibold"
              size="lg"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Bắt đầu làm bài
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );

  // Header component
  const renderHeader = () => (
    <div className="bg-background border-b border-border shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            {/* <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button> */}
            {/* <Separator orientation="vertical" className="h-6" /> */}
            <div>
              <h1 className="font-semibold text-foreground truncate max-w-md">
                {test.title}
              </h1>
              <p className="text-xs text-muted-foreground">
                Becamex Training System
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {timeRemaining !== null && !submitted && (
              <div
                className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                  timeRemaining < 300
                    ? "bg-destructive/10 text-destructive"
                    : "bg-primary/10 text-primary"
                }`}
              >
                <Clock className="h-4 w-4" />
                <span className="font-mono font-medium">
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
            <div className="text-right">
              <p className="text-sm font-medium">
                {answeredQuestionsCount}/
                {test.questions ? test.questions.length : 0}
              </p>
              <p className="text-xs text-muted-foreground">câu đã trả lời</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Question navigation sidebar
  const renderQuestionNavigation = () => {
    // Defensive check for empty questions array
    if (!test.questions || test.questions.length === 0) {
      return (
        <Card className="h-fit sticky top-24">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium">
              Danh sách câu hỏi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">Chưa có câu hỏi</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="h-fit sticky top-24">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-medium">
            Danh sách câu hỏi
          </CardTitle>
          <Progress value={progressPercentage} className="h-2" />
        </CardHeader>
        <CardContent className="space-y-2">
          <ScrollArea className="h-64">
            <div className="grid grid-cols-4 gap-2">
              {test.questions.map((q, idx) => {
                const isAnswered =
                  answers[String(q.id)] && answers[String(q.id)].length > 0;
                const isCurrent = idx === currentQuestionIndex;

                return (
                  <Button
                    key={String(q.id)}
                    variant={
                      isCurrent
                        ? "default"
                        : isAnswered
                        ? "secondary"
                        : "outline"
                    }
                    size="sm"
                    className={`h-8 w-8 p-0 text-xs font-medium ${
                      isCurrent ? "ring-2 ring-primary/50" : ""
                    } ${
                      isAnswered && !isCurrent
                        ? "bg-primary/10 text-primary border-primary/30"
                        : ""
                    }`}
                    onClick={() => goToQuestion(idx)}
                    disabled={submitted}
                  >
                    {idx + 1}
                  </Button>
                );
              })}
            </div>
          </ScrollArea>
          <Separator />
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Đã trả lời:</span>
              <span className="font-medium">{answeredQuestionsCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Chưa trả lời:</span>
              <span className="font-medium">
                {test.questions
                  ? test.questions.length - answeredQuestionsCount
                  : 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Current question display
  const renderCurrentQuestion = () => {
    // Defensive check for empty questions array or invalid index
    if (
      !test.questions ||
      test.questions.length === 0 ||
      currentQuestionIndex >= test.questions.length
    ) {
      return (
        <Card className="min-h-[500px]">
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-medium">Không có câu hỏi</h3>
                <p className="text-sm text-muted-foreground">
                  Bài kiểm tra này chưa có câu hỏi nào.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    const q = test.questions[currentQuestionIndex];
    const selectedOptions = answers[String(q.id)] || [];

    const getQuestionTypeBadge = (type: number) => {
      switch (type) {
        case 1:
          return { label: "Một đáp án", variant: "default" as const };
        case 2:
          return { label: "Nhiều đáp án", variant: "secondary" as const };
        case 3:
          return { label: "Tất cả đáp án", variant: "outline" as const };
        default:
          return { label: "Không xác định", variant: "destructive" as const };
      }
    };

    const typeBadge = getQuestionTypeBadge(q.questionType);

    return (
      <Card className="min-h-[500px]">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  Câu {currentQuestionIndex + 1}
                </Badge>
                <Badge variant={typeBadge.variant} className="text-xs">
                  {typeBadge.label}
                </Badge>
                {q.questionType > 1 && (
                  <Badge variant="outline" className="text-xs">
                    {selectedOptions.length} đã chọn
                  </Badge>
                )}
              </div>
              <h3 className="text-lg font-medium leading-relaxed">{q.text}</h3>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {q.options.map((opt, optIdx) => {
            const optionLetter = ["a", "b", "c", "d"][optIdx];
            const isSelected = selectedOptions.includes(optionLetter);

            return (
              <label
                key={optIdx}
                className={`group flex items-start space-x-4 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:bg-muted/50 ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <div className="flex items-center justify-center flex-shrink-0 mt-0.5">
                  {q.questionType === 1 ? (
                    // Radio button for single choice
                    <div
                      className={`flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                        isSelected
                          ? "border-primary bg-primary"
                          : "border-muted-foreground group-hover:border-primary/50"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  ) : (
                    // Checkbox for multiple choice
                    <div
                      className={`flex items-center justify-center w-6 h-6 rounded border-2 transition-all duration-200 ${
                        isSelected
                          ? "border-primary bg-primary"
                          : "border-muted-foreground group-hover:border-primary/50"
                      }`}
                    >
                      {isSelected && (
                        <CheckSquare className="w-4 h-4 text-white" />
                      )}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start space-x-3">
                    <span
                      className={`font-semibold text-sm mt-0.5 ${
                        isSelected ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {OPTION_LABELS[optIdx]}
                    </span>
                    <span
                      className={`leading-relaxed ${
                        isSelected
                          ? "text-foreground font-medium"
                          : "text-foreground"
                      }`}
                    >
                      {opt}
                    </span>
                  </div>
                </div>
                <input
                  type={q.questionType === 1 ? "radio" : "checkbox"}
                  name={`q_${String(q.id)}`}
                  value={optionLetter}
                  checked={isSelected}
                  onChange={() => handleSelect(String(q.id), optionLetter)}
                  className="sr-only"
                />
              </label>
            );
          })}

          {q.questionType > 1 && (
            <div className="mt-4 p-3 bg-accent/10 border border-accent/20 rounded-lg">
              <p className="text-sm text-accent-foreground flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                {q.questionType === 2
                  ? "Câu hỏi này có thể có nhiều đáp án đúng. Chọn tất cả đáp án bạn cho là đúng."
                  : "Câu hỏi này yêu cầu chọn tất cả các đáp án đúng."}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Câu trước</span>
          </Button>
          <div className="flex items-center space-x-2">
            {currentQuestionIndex ===
            (test.questions ? test.questions.length - 1 : 0) ? (
              <Button
                onClick={() =>
                  setState((prev) => ({ ...prev, showReview: true }))
                }
                className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600"
              >
                <Eye className="h-4 w-4" />
                <span>Xem lại bài</span>
              </Button>
            ) : (
              <Button
                onClick={goToNextQuestion}
                className="flex items-center space-x-2"
              >
                <span>Câu tiếp theo</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    );
  };

  // Review screen before submitting
  const renderReview = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Flag className="h-5 w-5 text-primary" />
          <span>Xem lại bài làm</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Kiểm tra lại các câu trả lời trước khi nộp bài. Bạn có thể quay lại
          chỉnh sửa câu trả lời bất kỳ.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-primary/10 rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {answeredQuestionsCount}
            </div>
            <div className="text-xs text-muted-foreground">Đã trả lời</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-muted-foreground">
              {test.questions
                ? test.questions.length - answeredQuestionsCount
                : 0}
            </div>
            <div className="text-xs text-muted-foreground">Chưa trả lời</div>
          </div>
          <div className="text-center p-4 bg-accent/10 rounded-lg">
            <div className="text-2xl font-bold text-accent-foreground">
              {test.questions ? test.questions.length : 0}
            </div>
            <div className="text-xs text-muted-foreground">Tổng câu hỏi</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {progressPercentage.toFixed(0)}%
            </div>
            <div className="text-xs text-muted-foreground">Hoàn thành</div>
          </div>
        </div>

        <Progress value={progressPercentage} className="h-3" />

        {/* Question Grid */}
        <div>
          <h4 className="font-medium mb-4">
            Danh sách câu hỏi (nhấn để chỉnh sửa)
          </h4>
          <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-2">
            {(test.questions || []).map((q, idx) => {
              const isAnswered =
                answers[String(q.id)] && answers[String(q.id)].length > 0;

              return (
                <Button
                  key={String(q.id)}
                  variant={isAnswered ? "default" : "outline"}
                  size="sm"
                  className={`h-10 w-10 p-0 text-sm ${
                    isAnswered
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => goToQuestion(idx)}
                >
                  {idx + 1}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Warning for unanswered questions */}
        {answeredQuestionsCount < test.questions.length && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800">Cảnh báo</h4>
                <p className="text-sm text-amber-700 mt-1">
                  Bạn chưa trả lời{" "}
                  {test.questions.length - answeredQuestionsCount} câu hỏi. Các
                  câu chưa trả lời sẽ được tính là sai.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Confirmation */}
        <div className="bg-muted/30 border rounded-lg p-4">
          <h4 className="font-medium mb-2">Xác nhận nộp bài</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Sau khi nộp bài, bạn sẽ không thể chỉnh sửa câu trả lời. Kết quả sẽ
            được hiển thị ngay lập tức.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() =>
                setState((prev) => ({ ...prev, showReview: false }))
              }
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Quay lại làm bài</span>
            </Button>
            <Button
              onClick={() => {
                console.log("🎯 Submit button clicked!");
                handleSubmit();
              }}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <Send className="h-4 w-4" />
              <span>Nộp bài kiểm tra</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Results screen
  const renderResults = () => {
    const correctCount = test.questions.filter((q) => {
      const userAnswers = answers[String(q.id)] || [];
      const correctAnswers = q.correctOptions;

      // Check if user answers match correct answers exactly
      return (
        userAnswers.length === correctAnswers.length &&
        userAnswers.every((ans) => correctAnswers.includes(ans)) &&
        correctAnswers.every((ans) => userAnswers.includes(ans))
      );
    }).length;

    return (
      <div className="space-y-6">
        {/* Results Header */}
        <Card
          className={`border-2 ${
            passed ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
          }`}
        >
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div
                className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center ${
                  passed ? "bg-green-100" : "bg-red-100"
                }`}
              >
                {passed ? (
                  <CheckCircle className="h-10 w-10 text-green-600" />
                ) : (
                  <XCircle className="h-10 w-10 text-red-600" />
                )}
              </div>
              <div>
                <h2
                  className={`text-2xl font-bold ${
                    passed ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {passed ? "Chúc mừng! Bạn đã đạt" : "Tiếc quá! Bạn chưa đạt"}
                </h2>
                <p className="text-muted-foreground mt-1">
                  Điểm của bạn:{" "}
                  <span className="font-semibold">
                    {Number.isFinite(score) && score !== null
                      ? score.toFixed(1)
                      : "0.0"}
                    %
                  </span>{" "}
                  ({typeof correctCount === "number" ? correctCount : 0}/
                  {test.questions.length} câu đúng)
                </p>
                <p className="text-sm text-muted-foreground">
                  Điểm tối thiểu để đạt: {test.passThreshold}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Review */}
        <Card>
          <CardHeader>
            <CardTitle>Chi tiết bài làm</CardTitle>
            <p className="text-sm text-muted-foreground">
              Xem lại từng câu hỏi và đáp án đúng
            </p>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96 pr-4">
              <div className="space-y-6">
                {test.questions.map((q, idx) => {
                  const userAnswers = answers[String(q.id)] || [];
                  const correctAnswers = q.correctOptions;
                  const isCorrect =
                    userAnswers.length === correctAnswers.length &&
                    userAnswers.every((ans) => correctAnswers.includes(ans)) &&
                    correctAnswers.every((ans) => userAnswers.includes(ans));

                  return (
                    <div
                      key={String(q.id)}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium pr-4">
                          Câu {idx + 1}: {q.text}
                        </h4>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <Badge
                            variant={isCorrect ? "default" : "destructive"}
                          >
                            {isCorrect ? "Đúng" : "Sai"}
                          </Badge>
                          {q.questionType > 1 && (
                            <Badge variant="outline" className="text-xs">
                              {q.questionType === 2
                                ? "Nhiều đáp án"
                                : "Tất cả đáp án"}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => {
                          const optionLetter = ["a", "b", "c", "d"][optIdx];
                          const isUserChoice =
                            userAnswers.includes(optionLetter);
                          const isCorrectAnswer =
                            correctAnswers.includes(optionLetter);

                          return (
                            <div
                              key={optIdx}
                              className={`flex items-center space-x-3 p-3 rounded-lg border ${
                                isCorrectAnswer
                                  ? "border-green-200 bg-green-50"
                                  : isUserChoice && !isCorrectAnswer
                                  ? "border-red-200 bg-red-50"
                                  : "border-border"
                              }`}
                            >
                              <span className="font-semibold text-sm w-6">
                                {OPTION_LABELS[optIdx]}
                              </span>
                              <span className="flex-1">{opt}</span>
                              <div className="flex items-center space-x-2">
                                {isCorrectAnswer && (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                )}
                                {isUserChoice && !isCorrectAnswer && (
                                  <XCircle className="h-4 w-4 text-red-600" />
                                )}
                                {isUserChoice && (
                                  <Badge variant="outline" className="text-xs">
                                    Bạn chọn
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {q.explanation && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <h5 className="font-medium text-blue-800 text-sm mb-1">
                            Giải thích:
                          </h5>
                          <p className="text-sm text-blue-700">
                            {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <Home className="h-4 w-4" />
            <span>Quay lại khóa học</span>
          </Button>
          <Button onClick={handleRetry} className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Làm lại bài kiểm tra</span>
          </Button>
        </div>
      </div>
    );
  };

  // Don't show anything if not started
  if (!isStarted) {
    return renderStartScreen();
  }

  // Main test interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {renderHeader()}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {submitted ? (
          <div className="max-w-4xl mx-auto">{renderResults()}</div>
        ) : showReview ? (
          <div className="max-w-4xl mx-auto">{renderReview()}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 order-2 lg:order-1">
              {renderQuestionNavigation()}
            </div>
            <div className="lg:col-span-3 order-1 lg:order-2">
              {renderCurrentQuestion()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
