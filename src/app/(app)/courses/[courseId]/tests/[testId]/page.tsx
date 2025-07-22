
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
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Check,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { testsService } from "@/lib/services/modern/tests.service";
import { useToast } from "@/components/ui/use-toast";
import { mapApiTestToUiTest } from "@/lib/mappers/test.mapper";
import type {
  Test,
  Question,
  TestSubmissionResponse,
  DetailedTestResult,
  SelectedAnswer,
} from "@/lib/types/test.types";

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"];

export default function TestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const courseId = params.courseId as string;
  const testId = params.testId as string;

  const [testData, setTestData] = useState<Test | null>(null);
  const [result, setResult] = useState<DetailedTestResult | null>(null);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  // Fetch test data
  const {
    data: fetchedTest,
    isLoading: isLoadingTest,
    error: testError,
  } = useQuery({
    queryKey: ["test", courseId, testId],
    queryFn: async () => {
      const apiTest = await testsService.getTestById(
        courseId,
        parseInt(testId, 10)
      );
      return mapApiTestToUiTest(apiTest);
    },
    enabled: !!courseId && !!testId,
    staleTime: Infinity,
  });

  // Fetch previous result if exists
  const {
    data: previousResult,
    isLoading: isLoadingResult,
    refetch: refetchResult,
  } = useQuery({
    queryKey: ["testResult", courseId, testId],
    queryFn: () => testsService.getTestResult(courseId, parseInt(testId, 10)),
    enabled: !!courseId && !!testId && !isStarted,
    retry: false,
  });

  useEffect(() => {
    if (fetchedTest) setTestData(fetchedTest);
  }, [fetchedTest]);

  useEffect(() => {
    if (previousResult) setResult(previousResult);
  }, [previousResult]);

  // Timer
  useEffect(() => {
    if (!isStarted || result || !testData?.time) return;

    if (timeRemaining === null) {
      setTimeRemaining(testData.time * 60);
      return;
    }

    if (timeRemaining <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, result, testData, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleStartTest = () => {
    setResult(null);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setShowReview(false);
    setStartedAt(new Date().toISOString());
    setIsStarted(true);
  };

  const handleSelect = (questionId: string, optionLetter: string) => {
    if (result) return;
    const question = testData?.questions.find(
      (q) => q.id.toString() === questionId
    );
    if (!question) return;

    setAnswers((prev) => {
      const currentAnswers = prev[questionId] || [];
      const questionType =
        (question.correctAnswerIndexes?.length ?? 0) > 1 ? 2 : 1;
      if (questionType === 1) {
        // Single choice
        return { ...prev, [questionId]: [optionLetter] };
      } else {
        // Multiple choice
        const newAnswers = currentAnswers.includes(optionLetter)
          ? currentAnswers.filter((ans) => ans !== optionLetter)
          : [...currentAnswers, optionLetter];
        return { ...prev, [questionId]: newAnswers };
      }
    });
  };

  const handleSubmit = async () => {
    if (isSubmitting || !startedAt) return;
    setIsSubmitting(true);

    const submissionAnswers: SelectedAnswer[] = Object.entries(answers).map(
      ([questionId, selectedOptions]) => ({
        questionId: parseInt(questionId),
        selectedOptions: selectedOptions || [],
      })
    );

    try {
      const response = await testsService.submitTest(
        courseId,
        parseInt(testId),
        submissionAnswers,
        startedAt
      );

      const scorePercent =
        typeof response.score === "number" ? response.score : 0;

      toast({
        title: "Nộp bài thành công!",
        description: `Điểm số của bạn: ${scorePercent.toFixed(
          1
        )}%. ${response.isPassed ? "Chúc mừng bạn đã đạt!" : "Tiếc quá, bạn chưa đạt."}`,
        variant: response.isPassed ? "success" : "default",
      });

      // Fetch the detailed results to show the review
      const detailedResult = await refetchResult();
      if (detailedResult.data) {
        setResult(detailedResult.data);
      }

      setIsStarted(false); // End the test session on client
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi nộp bài",
        description: "Không thể gửi kết quả. Vui lòng thử lại.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < (testData?.questions.length || 0)) {
      setCurrentQuestionIndex(index);
      setShowReview(false);
    }
  };

  const answeredQuestionsCount = Object.keys(answers).filter(
    (qId) => answers[qId] && answers[qId].length > 0
  ).length;

  const progressPercentage = testData?.questions.length
    ? (answeredQuestionsCount / testData.questions.length) * 100
    : 0;

  if (isLoadingTest || isLoadingResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">
          Đang tải dữ liệu bài kiểm tra...
        </p>
      </div>
    );
  }

  if (testError || !testData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertTriangle className="w-12 h-12 text-destructive" />
        <h2 className="mt-4 text-xl font-semibold">Lỗi tải bài kiểm tra</h2>
        <p className="text-muted-foreground mt-2">
          {testError?.message || "Không tìm thấy bài kiểm tra."}
        </p>
        <Button onClick={() => router.back()} className="mt-6">
          Quay lại khóa học
        </Button>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <Award className="h-12 w-12 mx-auto text-primary" />
            <CardTitle className="text-2xl mt-4">{testData.title}</CardTitle>
            <CardDescription>
              Chào mừng đến với bài kiểm tra của Becamex
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg flex items-center gap-4">
                <FileText className="h-5 w-5 text-primary" />{" "}
                <div>
                  <p className="font-medium">Số câu hỏi</p>
                  <p className="text-sm text-muted-foreground">
                    {testData.questions.length} câu
                  </p>
                </div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg flex items-center gap-4">
                <Target className="h-5 w-5 text-primary" />{" "}
                <div>
                  <p className="font-medium">Điểm đạt</p>
                  <p className="text-sm text-muted-foreground">
                    {testData.passingScorePercentage}%
                  </p>
                </div>
              </div>
              {testData.time > 0 && (
                <div className="p-4 bg-muted/50 rounded-lg flex items-center gap-4">
                  <Timer className="h-5 w-5 text-primary" />{" "}
                  <div>
                    <p className="font-medium">Thời gian</p>
                    <p className="text-sm text-muted-foreground">
                      {testData.time} phút
                    </p>
                  </div>
                </div>
              )}
              <div className="p-4 bg-muted/50 rounded-lg flex items-center gap-4">
                <User className="h-5 w-5 text-primary" />{" "}
                <div>
                  <p className="font-medium">Tạo bởi</p>
                  <p className="text-sm text-muted-foreground">
                    {testData.createdBy?.name || "Unknown"}
                  </p>
                </div>
              </div>
            </div>
            {result && (
              <div className="mt-6 border-t pt-4 text-center">
                <h3 className="font-semibold mb-2">Kết quả lần làm trước</h3>
                <p
                  className={`text-xl font-bold ${
                    result.isPassed ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {result.score.toFixed(1)}% -{" "}
                  {result.isPassed ? "ĐẠT" : "CHƯA ĐẠT"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Số câu đúng: {result.correctAnswerCount}/
                  {result.correctAnswerCount + result.incorrectAnswerCount}
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleStartTest}
              className="w-full sm:w-auto flex-1"
              size="lg"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              {result ? "Làm lại bài" : "Bắt đầu làm bài"}
            </Button>
            {result && (
              <Button
                onClick={() => setIsStarted(true)}
                variant="outline"
                className="w-full sm:w-auto"
              >
                <Eye className="mr-2 h-4 w-4" /> Xem lại chi tiết
              </Button>
            )}
            <Button
              onClick={() => router.back()}
              variant="secondary"
              className="w-full sm:w-auto"
            >
              Quay lại
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const renderHeader = () => (
    <div className="bg-background border-b shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <h1 className="font-semibold truncate">{testData.title}</h1>
        <div className="flex items-center gap-4">
          {timeRemaining !== null && !result && (
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                timeRemaining < 300
                  ? "bg-destructive/10 text-destructive"
                  : "bg-primary/10 text-primary"
              }`}
            >
              <Clock className="h-4 w-4" />{" "}
              <span className="font-mono">{formatTime(timeRemaining)}</span>
            </div>
          )}
          <div className="text-right">
            <p className="font-medium">
              {answeredQuestionsCount}/{testData.questions.length}
            </p>
            <p className="text-xs text-muted-foreground">đã trả lời</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderQuestionNavigation = () => (
    <Card className="h-fit sticky top-24">
      <CardHeader>
        <CardTitle className="text-sm">Danh sách câu hỏi</CardTitle>
        <Progress value={progressPercentage} className="h-2 mt-2" />
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="grid grid-cols-4 gap-2">
            {testData.questions.map((q, idx) => {
              const isAnswered =
                answers[q.id.toString()] &&
                answers[q.id.toString()].length > 0;
              return (
                <Button
                  key={q.id}
                  variant={
                    currentQuestionIndex === idx
                      ? "default"
                      : isAnswered
                      ? "secondary"
                      : "outline"
                  }
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => goToQuestion(idx)}
                  disabled={!!result}
                >
                  {idx + 1}
                </Button>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );

  const renderCurrentQuestion = () => {
    const q = testData.questions[currentQuestionIndex];
    if (!q) return null;
    const selectedOptions = answers[q.id.toString()] || [];
    const questionType =
      (q.correctAnswerIndexes?.length ?? 0) > 1 ? 2 : 1;
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium pr-4">
              Câu {currentQuestionIndex + 1}: {q.text}
            </h3>
            <Badge variant={questionType > 1 ? "secondary" : "default"}>
              {questionType > 1 ? "Nhiều đáp án" : "Một đáp án"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {q.options.map((opt, optIdx) => {
            const optionLetter = String.fromCharCode(97 + optIdx);
            const isSelected = selectedOptions.includes(optionLetter);
            return (
              <label
                key={optIdx}
                className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                }`}
              >
                {questionType === 1 ? (
                  <div
                    className={`flex items-center justify-center w-5 h-5 rounded-full border-2 mt-0.5 ${
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                ) : (
                  <div
                    className={`flex items-center justify-center w-5 h-5 rounded border-2 mt-0.5 ${
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                )}
                <span className="flex-1">
                  {OPTION_LABELS[optIdx]}. {opt}
                </span>
                <input
                  type={questionType === 1 ? "radio" : "checkbox"}
                  name={`q_${q.id}`}
                  value={optionLetter}
                  checked={isSelected}
                  onChange={() => handleSelect(q.id.toString(), optionLetter)}
                  className="sr-only"
                />
              </label>
            );
          })}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => goToQuestion(currentQuestionIndex - 1)}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Câu trước
          </Button>
          {currentQuestionIndex === testData.questions.length - 1 ? (
            <Button onClick={() => setShowReview(true)}>
              <Eye className="h-4 w-4 mr-2" />
              Xem lại & Nộp bài
            </Button>
          ) : (
            <Button onClick={() => goToQuestion(currentQuestionIndex + 1)}>
              Câu sau
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  };

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
              {testData.questions
                ? testData.questions.length - answeredQuestionsCount
                : 0}
            </div>
            <div className="text-xs text-muted-foreground">Chưa trả lời</div>
          </div>
          <div className="text-center p-4 bg-accent/10 rounded-lg">
            <div className="text-2xl font-bold text-accent-foreground">
              {testData.questions ? testData.questions.length : 0}
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
            {(testData.questions || []).map((q, idx) => {
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
        {answeredQuestionsCount < (testData.questions?.length || 0) && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800">Cảnh báo</h4>
                <p className="text-sm text-amber-700 mt-1">
                  Bạn chưa trả lời{" "}
                  {(testData.questions?.length || 0) - answeredQuestionsCount} câu hỏi.
                  Các câu chưa trả lời sẽ được tính là sai.
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
              onClick={() => setShowReview(false)}
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

  const renderResults = () => {
    if (!result) return null;
    return (
      <div className="space-y-6">
        <Card
          className={
            result.isPassed
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
          }
        >
          <CardContent className="pt-6 text-center">
            <div
              className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
                result.isPassed ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {result.isPassed ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <XCircle className="h-8 w-8 text-red-600" />
              )}
            </div>
            <h2
              className={`text-2xl font-bold mt-4 ${
                result.isPassed ? "text-green-700" : "text-red-700"
              }`}
            >
              {result.isPassed
                ? "Chúc mừng! Bạn đã đạt"
                : "Tiếc quá! Bạn chưa đạt"}
            </h2>
            <p className="text-muted-foreground mt-1">
              Điểm của bạn:{" "}
              <span className="font-semibold">{result.score.toFixed(1)}%</span>{" "}
              ({result.correctAnswerCount}/
              {result.correctAnswerCount + result.incorrectAnswerCount} câu
              đúng)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Chi tiết bài làm</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96 pr-4">
              <div className="space-y-4">
                {result.userAnswers.map((ua, idx) => (
                  <div key={ua.question.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium pr-4">
                        Câu {idx + 1}: {ua.question.questionText}
                      </h4>
                      <Badge variant={ua.isCorrect ? "default" : "destructive"}>
                        {ua.isCorrect ? "Đúng" : "Sai"}
                      </Badge>
                    </div>
                    <div className="space-y-2 mt-3">
                      {[
                        ua.question.a,
                        ua.question.b,
                        ua.question.c,
                        ua.question.d,
                      ]
                        .filter((o) => o)
                        .map((opt, optIdx) => {
                          const optLetter = String.fromCharCode(97 + optIdx);
                          const isUserChoice =
                            ua.selectedOptions.includes(optLetter);
                          const isCorrectAnswer =
                            ua.correctAnswer.includes(optLetter);
                          return (
                            <div
                              key={optIdx}
                              className={`flex items-center gap-3 p-2 rounded ${
                                isCorrectAnswer
                                  ? "bg-green-50"
                                  : isUserChoice
                                  ? "bg-red-50"
                                  : ""
                              }`}
                            >
                              <span className="font-semibold">
                                {OPTION_LABELS[optIdx]}
                              </span>
                              <span>{opt}</span>
                              {isUserChoice && (
                                <Badge variant="outline" className="ml-auto">
                                  Bạn chọn
                                </Badge>
                              )}
                            </div>
                          );
                        })}
                    </div>
                    {ua.question.explanation && (
                      <div className="mt-3 bg-blue-50 border border-blue-200 p-3 rounded">
                        <h5 className="font-medium text-sm text-blue-800">
                          Giải thích:
                        </h5>
                        <p className="text-sm text-blue-700">
                          {ua.question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <Home className="h-4 w-4 mr-2" />
            Quay lại khóa học
          </Button>
          <Button onClick={handleStartTest}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm lại bài
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-muted/40">
      {!result && renderHeader()}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {result ? (
          renderResults()
        ) : showReview ? (
          renderReview()
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
