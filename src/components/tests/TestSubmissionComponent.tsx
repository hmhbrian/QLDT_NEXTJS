/**
 * Component ví dụ để submit test
 * Sử dụng hook useSubmitTest để gửi câu trả lời lên API
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useSubmitTest } from "@/hooks/use-tests";
import type { SelectedAnswer } from "@/lib/types/test.types";

interface Question {
  id: number;
  questionText: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  type: "single" | "multiple"; // single choice hoặc multiple choice
}

export type { Question };

interface TestSubmissionComponentProps {
  courseId: string;
  testId: number;
  questions: Question[];
  timeLimit?: number; // phút
}

export type { TestSubmissionComponentProps };

export function TestSubmissionComponent({
  courseId,
  testId,
  questions,
  timeLimit = 60,
}: TestSubmissionComponentProps) {
  // State để lưu các câu trả lời đã chọn
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string[]>
  >({});
  const [testStartTime, setTestStartTime] = useState<string | null>(null);
  const [isTestStarted, setIsTestStarted] = useState(false);

  // Hooks để gọi API
  const submitTestMutation = useSubmitTest(courseId, testId);

  // Xử lý khi bắt đầu test
  const handleStartTest = async () => {
    // No API call needed to start, just set the client-side state
    const startTime = new Date().toISOString();
    setTestStartTime(startTime);
    setIsTestStarted(true);
  };

  // Xử lý khi chọn câu trả lời (single choice)
  const handleSingleAnswerChange = (
    questionId: number,
    selectedOption: string
  ) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: [selectedOption],
    }));
  };

  // Xử lý khi chọn câu trả lời (multiple choice)
  const handleMultipleAnswerChange = (
    questionId: number,
    option: string,
    checked: boolean
  ) => {
    setSelectedAnswers((prev) => {
      const currentAnswers = prev[questionId] || [];
      if (checked) {
        return {
          ...prev,
          [questionId]: [...currentAnswers, option],
        };
      } else {
        return {
          ...prev,
          [questionId]: currentAnswers.filter((answer) => answer !== option),
        };
      }
    });
  };

  // Xử lý khi nộp bài
  const handleSubmitTest = async () => {
    if (!testStartTime) {
      alert("Bạn cần bắt đầu test trước khi nộp bài!");
      return;
    }

    // Chuyển đổi selectedAnswers thành format API yêu cầu
    const answers: SelectedAnswer[] = Object.entries(selectedAnswers).map(
      ([questionId, options]) => ({
        questionId: parseInt(questionId),
        selectedOptions: options,
      })
    );

    console.log("🎯 Submitting test with data:", {
      courseId,
      testId,
      answers,
      startedAt: testStartTime,
      selectedAnswers,
    });

    try {
      const result = await submitTestMutation.mutateAsync({
        answers,
        startedAt: testStartTime,
      });
      console.log("✅ Test submission successful:", result);
    } catch (error) {
      console.error("❌ Test submission failed:", error);
    }
  };

  // Kiểm tra xem đã trả lời đủ câu hỏi chưa
  const isAllQuestionsAnswered = questions.every(
    (question) =>
      selectedAnswers[question.id] && selectedAnswers[question.id].length > 0
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bài kiểm tra</CardTitle>
          <p className="text-sm text-muted-foreground">
            Thời gian: {timeLimit} phút | Số câu hỏi: {questions.length}
          </p>
        </CardHeader>
        <CardContent>
          {!isTestStarted ? (
            <div className="text-center">
              <p className="mb-4">Nhấn nút bên dưới để bắt đầu làm bài</p>
              <Button onClick={handleStartTest}>Bắt đầu làm bài</Button>
            </div>
          ) : (
            <div className="space-y-6">
              {questions.map((question, index) => (
                <Card key={question.id}>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-4">
                      Câu {index + 1}: {question.questionText}
                    </h3>

                    {question.type === "single" ? (
                      // Single choice question
                      <RadioGroup
                        value={selectedAnswers[question.id]?.[0] || ""}
                        onValueChange={(value) =>
                          handleSingleAnswerChange(question.id, value)
                        }
                      >
                        {Object.entries(question.options).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="flex items-center space-x-2"
                            >
                              <RadioGroupItem
                                value={key}
                                id={`q${question.id}_${key}`}
                              />
                              <Label
                                htmlFor={`q${question.id}_${key}`}
                                className="cursor-pointer"
                              >
                                {key.toUpperCase()}. {value}
                              </Label>
                            </div>
                          )
                        )}
                      </RadioGroup>
                    ) : (
                      // Multiple choice question
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground mb-2">
                          (Có thể chọn nhiều đáp án)
                        </p>
                        {Object.entries(question.options).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`q${question.id}_${key}`}
                                checked={
                                  selectedAnswers[question.id]?.includes(key) ||
                                  false
                                }
                                onCheckedChange={(checked) =>
                                  handleMultipleAnswerChange(
                                    question.id,
                                    key,
                                    checked as boolean
                                  )
                                }
                              />
                              <Label
                                htmlFor={`q${question.id}_${key}`}
                                className="cursor-pointer"
                              >
                                {key.toUpperCase()}. {value}
                              </Label>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              <div className="text-center pt-6">
                <Button
                  onClick={handleSubmitTest}
                  disabled={
                    !isAllQuestionsAnswered || submitTestMutation.isPending
                  }
                  size="lg"
                >
                  {submitTestMutation.isPending ? "Đang nộp bài..." : "Nộp bài"}
                </Button>

                {!isAllQuestionsAnswered && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Vui lòng trả lời tất cả câu hỏi trước khi nộp bài
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hiển thị trạng thái loading hoặc kết quả */}
      {submitTestMutation.isSuccess && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-green-600">
              <h3 className="font-semibold">Nộp bài thành công!</h3>
              <p>Kết quả sẽ được hiển thị sau khi chấm điểm.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default TestSubmissionComponent;
