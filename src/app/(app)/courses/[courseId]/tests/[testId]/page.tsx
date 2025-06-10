"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useCookie } from "@/hooks/use-cookie";
import { mockCourses as initialMockCourses } from "@/lib/mock";
import type { Course, Test, Question } from "@/lib/types";

const COURSES_COOKIE_KEY = "becamex-courses-data";
const OPTION_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"];

export default function TestDetailPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const testId = params.testId as string;
  const [allCourses] = useCookie<Course[]>(COURSES_COOKIE_KEY, initialMockCourses);

  // Tìm course và test tương ứng
  const course = allCourses.find((c) => c.id === courseId);
  const test = course?.tests?.find((t) => t.id === testId);

  // State cho đáp án người dùng chọn
  const [answers, setAnswers] = useState<{ [questionId: string]: number | null }>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [passed, setPassed] = useState<boolean | null>(null);

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
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle>{test.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {test.questions.map((q, idx) => (
              <div key={q.id} className="mb-6">
                <div className="font-semibold mb-2 flex items-center gap-2">
                  Câu {idx + 1}: {q.text}
                  {idx === 0 && (
                    <span className="ml-2 px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-semibold">Câu hỏi mẫu</span>
                  )}
                </div>
                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => (
                    <label key={optIdx} className={`flex items-center gap-2 p-2 rounded cursor-pointer border transition-colors ${answers[q.id] === optIdx ? 'border-primary bg-primary/10' : 'border-muted'}`}
                      style={{ pointerEvents: submitted ? 'none' : 'auto' }}>
                      <input
                        type="radio"
                        name={`q_${q.id}`}
                        value={optIdx}
                        checked={answers[q.id] === optIdx}
                        onChange={() => handleSelect(q.id, optIdx)}
                        disabled={submitted}
                        className="accent-primary"
                      />
                      <span className="font-semibold">{OPTION_LABELS[optIdx] || String.fromCharCode(65 + optIdx)}</span>
                      <span>{opt}</span>
                      {submitted && q.correctAnswerIndex === optIdx && (
                        <CheckCircle className="w-4 h-4 text-green-600 ml-2" />
                      )}
                      {submitted && answers[q.id] === optIdx && answers[q.id] !== q.correctAnswerIndex && (
                        <XCircle className="w-4 h-4 text-red-500 ml-2" />
                      )}
                    </label>
                  ))}
                </div>
                {submitted && (
                  <div className="mt-1 text-sm text-muted-foreground">
                    Đáp án đúng: <b>{OPTION_LABELS[q.correctAnswerIndex] || String.fromCharCode(65 + q.correctAnswerIndex)}. {q.options[q.correctAnswerIndex]}</b>
                    {q.explanation && <span> — {q.explanation}</span>}
                  </div>
                )}
              </div>
            ))}
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
        </CardContent>
      </Card>
    </div>
  );
} 