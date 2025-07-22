/**
 * Component test đơn giản để kiểm tra API submit test
 */

import React from "react";
import { Button } from "@/components/ui/button";
import { useSubmitTest } from "@/hooks/use-tests";
import type { SelectedAnswer } from "@/lib/types/test.types";

export function TestSubmitExample() {
  const courseId = "test-course-123";
  const testId = 1;

  const submitTestMutation = useSubmitTest(courseId, testId);

  const handleTestSubmit = async () => {
    // Dữ liệu test mẫu
    const answers: SelectedAnswer[] = [
      {
        questionId: 1,
        selectedOptions: ["a"],
      },
      {
        questionId: 2,
        selectedOptions: ["b", "c"], // multiple choice
      },
    ];

    const startedAt = new Date().toISOString();

    console.log("🧪 Testing submit with sample data:", {
      courseId,
      testId,
      answers,
      startedAt,
    });

    try {
      await submitTestMutation.mutateAsync({
        answers,
        startedAt,
      });
    } catch (error) {
      console.error("Test submit failed:", error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Test Submit API</h2>
      <div className="space-y-2">
        <p>
          <strong>Course ID:</strong> {courseId}
        </p>
        <p>
          <strong>Test ID:</strong> {testId}
        </p>
        <p>
          <strong>Sample Answers:</strong>
        </p>
        <pre className="text-sm bg-gray-100 p-2 rounded">
          {JSON.stringify(
            [
              { questionId: 1, selectedOptions: ["a"] },
              { questionId: 2, selectedOptions: ["b", "c"] },
            ],
            null,
            2
          )}
        </pre>

        <Button
          onClick={handleTestSubmit}
          disabled={submitTestMutation.isPending}
          className="mt-4"
        >
          {submitTestMutation.isPending ? "Đang gửi..." : "Test Submit API"}
        </Button>

        {submitTestMutation.isError && (
          <div className="text-red-600 mt-2">
            <p>Error: {submitTestMutation.error?.message}</p>
          </div>
        )}

        {submitTestMutation.isSuccess && (
          <div className="text-green-600 mt-2">
            <p>Success! Check console for details.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TestSubmitExample;
