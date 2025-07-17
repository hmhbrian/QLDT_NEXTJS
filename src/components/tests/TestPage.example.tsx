/**
 * Ví dụ sử dụng TestSubmissionComponent
 * Cho thấy cách tích hợp component vào ứng dụng
 */

import React from "react";
import { TestSubmissionComponent } from "@/components/tests";

// Dữ liệu mẫu cho câu hỏi
const sampleQuestions = [
  {
    id: 1,
    questionText: "React là gì?",
    type: "single" as const,
    options: {
      a: "Một thư viện JavaScript để xây dựng giao diện người dùng",
      b: "Một framework backend",
      c: "Một cơ sở dữ liệu",
      d: "Một ngôn ngữ lập trình",
    },
  },
  {
    id: 2,
    questionText: "Các hook nào là built-in trong React? (Chọn nhiều đáp án)",
    type: "multiple" as const,
    options: {
      a: "useState",
      b: "useEffect",
      c: "useCustomHook",
      d: "useCallback",
    },
  },
  {
    id: 3,
    questionText: "JSX là gì?",
    type: "single" as const,
    options: {
      a: "JavaScript XML",
      b: "Java Syntax Extension",
      c: "JSON XML",
      d: "JavaScript eXtension",
    },
  },
];

export function TestPage() {
  // Thông tin test (thường sẽ lấy từ props hoặc URL params)
  const courseId = "COURSE_123";
  const testId = 456;

  return (
    <div className="container mx-auto py-8">
      <TestSubmissionComponent
        courseId={courseId}
        testId={testId}
        questions={sampleQuestions}
        timeLimit={30} // 30 phút
      />
    </div>
  );
}

export default TestPage;
