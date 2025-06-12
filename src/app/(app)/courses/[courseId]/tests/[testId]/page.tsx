"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, XCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { useCourseStore } from "@/stores/course-store";
import { Progress } from "@/components/ui/progress";

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"];

export default function TestDetailPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const testId = params.testId as string;
  const { courses: allCourses } = useCourseStore();

  // Tìm course và test tương ứng
  const course = allCourses.find((c) => c.id === courseId);
  const test = course?.tests?.find((t) => t.id === testId);

  // State cho đáp án người dùng chọn
  const [answers, setAnswers] = useState<{ [questionId: string]: number | null }>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [passed, setPassed] = useState<boolean | null>(null);
  
  // State mới cho việc hiển thị từng câu hỏi
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showReview, setShowReview] = useState(false);

  if (!course || !test) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <Card className="max-w-lg w-full">
          <CardHeader>
            <CardTitle>Làm bài kiểm tra</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <AlertTriangle className="h-10 w-10 text-yellow-500" />
              <p className="text-lg font-semibold">Không tìm thấy bài kiểm tra hoặc khóa học.</p>
              <p className="text-muted-foreground text-sm">Course ID: <b>{courseId}</b></p>
              <p className="text-muted-foreground text-sm">Test ID: <b>{testId}</b></p>
            </div>
          </CardContent> 
        </Card>
      </div>
    );
  }

  const handleSelect = (questionId: string, optionIdx: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleSubmit = () => {
    if (submitted) return;
    let correct = 0;
    test.questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswerIndex) correct++;
    });
    const percent = (correct / test.questions.length) * 100;
    setScore(percent);
    setPassed(percent >= test.passingScorePercentage);
    setSubmitted(true);
    setShowReview(true); // Hiển thị kết quả sau khi nộp bài
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Nếu đã là câu cuối cùng, hiển thị trang xem lại trước khi nộp
      setShowReview(true);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < test.questions.length) {
      setCurrentQuestionIndex(index);
      setShowReview(false);
    }
  };

  // Tính số câu đã trả lời
  const answeredQuestionsCount = Object.keys(answers).length;
  const progressPercentage = (answeredQuestionsCount / test.questions.length) * 100;

  // Render câu hỏi hiện tại
  const renderCurrentQuestion = () => {
    const q = test.questions[currentQuestionIndex];
    return (
      <div className="mb-6">
        <div className="font-semibold mb-2 flex items-center gap-2">
          Câu {currentQuestionIndex + 1}: {q.text}
        </div>
        <div className="space-y-2 mt-4">
          {q.options.map((opt, optIdx) => (
            <label key={optIdx} className={`flex items-center gap-2 p-3 rounded cursor-pointer border transition-colors ${answers[q.id] === optIdx ? 'border-primary bg-primary/10' : 'border-muted'}`}>
              <input
                type="radio"
                name={`q_${q.id}`}
                value={optIdx}
                checked={answers[q.id] === optIdx}
                onChange={() => handleSelect(q.id, optIdx)}
                className="accent-primary"
              />
              <span className="font-semibold">{OPTION_LABELS[optIdx] || String.fromCharCode(65 + optIdx)}</span>
              <span>{opt}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  // Render màn hình xem lại trước khi nộp bài
  const renderReview = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Xem lại trước khi nộp bài</h3>
        <div className="grid grid-cols-5 gap-2">
          {test.questions.map((q, idx) => (
            <Button
              key={q.id}
              variant={answers[q.id] !== undefined ? "default" : "outline"}
              className={`text-center ${answers[q.id] !== undefined ? "bg-primary" : "bg-muted/50"}`}
              onClick={() => goToQuestion(idx)}
            >
              {idx + 1}
            </Button>
          ))}
        </div>
        <div className="p-4 border rounded-md bg-muted/10">
          <p className="text-sm mb-2">Trạng thái:</p>
          <div className="flex items-center justify-between mb-2">
            <span>Đã trả lời: {answeredQuestionsCount}/{test.questions.length}</span>
            <span>Tiến độ: {progressPercentage.toFixed(0)}%</span>
          </div>
          <Progress value={progressPercentage} className="w-full h-2" />
        </div>
        {!submitted ? (
          <Button onClick={handleSubmit} className="w-full mt-4">Nộp bài</Button>
        ) : (
          <div className="mt-4 flex flex-col items-center gap-2">
            <div className={`text-lg font-bold flex items-center gap-2 ${passed ? 'text-green-600' : 'text-red-500'}`}>
              {passed ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
              {passed ? 'Đạt' : 'Chưa đạt'} ({score?.toFixed(1)}%)
            </div>
            <Button variant="outline" onClick={() => window.location.reload()}>Làm lại</Button>
          </div>
        )}
      </div>
    );
  };

  // Render kết quả chi tiết sau khi nộp bài
  const renderResults = () => {
    return (
      <div className="space-y-6">
        <div className={`text-lg font-bold flex items-center gap-2 ${passed ? 'text-green-600' : 'text-red-500'}`}>
          {passed ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
          {passed ? 'Đạt' : 'Chưa đạt'} ({score?.toFixed(1)}%)
        </div>
        
        <div className="space-y-4">
          {test.questions.map((q, idx) => (
            <div key={q.id} className="p-4 border rounded-md">
              <div className="font-semibold mb-2">
                Câu {idx + 1}: {q.text}
              </div>
              <div className="space-y-2 mt-2">
                {q.options.map((opt, optIdx) => (
                  <div key={optIdx} className={`flex items-center gap-2 p-2 rounded border 
                    ${q.correctAnswerIndex === optIdx ? 'border-green-500 bg-green-50' : 
                      answers[q.id] === optIdx && answers[q.id] !== q.correctAnswerIndex ? 'border-red-500 bg-red-50' : 'border-muted'}`}>
                    <span className="font-semibold">{OPTION_LABELS[optIdx]}</span>
                    <span>{opt}</span>
                    {q.correctAnswerIndex === optIdx && (
                      <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                    )}
                    {answers[q.id] === optIdx && answers[q.id] !== q.correctAnswerIndex && (
                      <XCircle className="w-4 h-4 text-red-500 ml-auto" />
                    )}
                  </div>
                ))}
              </div>
              {q.explanation && (
                <div className="mt-2 text-sm bg-blue-50 p-2 rounded">
                  <span className="font-semibold">Giải thích: </span>
                  {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
          Làm lại
        </Button>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle>{test.title}</CardTitle>
          {!submitted && (
            <div className="flex flex-col space-y-2 mt-2">
              <div className="flex justify-between text-sm">
                <span>Tiến độ: {answeredQuestionsCount}/{test.questions.length} câu</span>
                <span>{progressPercentage.toFixed(0)}%</span>
              </div>
              <Progress value={progressPercentage} className="w-full h-2" />
            </div>
          )}
        </CardHeader>
        <CardContent>
          {submitted ? (
            renderResults()
          ) : showReview ? (
            renderReview()
          ) : (
            renderCurrentQuestion()
          )}
        </CardContent>
        {!submitted && !showReview && (
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={goToPreviousQuestion} 
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Câu trước
            </Button>
            <Button 
              onClick={goToNextQuestion}
              className={currentQuestionIndex === test.questions.length - 1 ? "bg-amber-500 hover:bg-amber-600" : ""}
            >
              {currentQuestionIndex === test.questions.length - 1 ? "Xem lại" : "Câu tiếp theo"} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        )}
        {!submitted && showReview && (
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => goToQuestion(test.questions.length - 1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại câu hỏi
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
} 