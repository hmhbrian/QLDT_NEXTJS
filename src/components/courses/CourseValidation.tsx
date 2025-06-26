import React from "react";
import { useCourseValidation, useCoursesError } from "@/stores/course-store";
import type { Course } from "@/lib/types/course.types";

interface CourseValidationDisplayProps {
  course: Partial<Course>;
  className?: string;
}

/**
 * Component hiển thị lỗi validation cho khóa học
 * Sử dụng để hiển thị lỗi trong real-time khi user nhập liệu
 */
export function CourseValidationDisplay({
  course,
  className = "",
}: CourseValidationDisplayProps) {
  const { validateCourse } = useCourseValidation();
  const storeError = useCoursesError();

  const validation = validateCourse(course);

  // Nếu không có lỗi validation local và store, không hiển thị gì
  if (validation.isValid && !storeError) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Lỗi validation local */}
      {!validation.isValid && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Cần kiểm tra lại thông tin
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc pl-5 space-y-1">
                  {Object.entries(validation.errors).map(([field, message]) => (
                    <li key={field}>{message}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lỗi từ store (API errors) */}
      {storeError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Lỗi {storeError.type}
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{storeError.message}</p>
                {storeError.details &&
                  typeof storeError.details === "object" && (
                    <div className="mt-2">
                      <p className="font-medium">Chi tiết lỗi:</p>
                      <pre className="mt-1 text-xs bg-red-100 p-2 rounded overflow-auto">
                        {JSON.stringify(storeError.details, null, 2)}
                      </pre>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface CourseValidationSummaryProps {
  course: Partial<Course>;
  showSuccessState?: boolean;
}

/**
 * Component hiển thị tóm tắt validation status
 * Sử dụng để hiển thị trạng thái tổng quan của form
 */
export function CourseValidationSummary({
  course,
  showSuccessState = true,
}: CourseValidationSummaryProps) {
  const { validateCourse } = useCourseValidation();
  const validation = validateCourse(course);

  if (validation.isValid && showSuccessState) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-md p-3">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-green-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-green-800">
              Thông tin khóa học đã đầy đủ và hợp lệ
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!validation.isValid) {
    const errorCount = Object.keys(validation.errors).length;
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-yellow-800">
              Còn {errorCount} vấn đề cần khắc phục trước khi lưu
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

/**
 * Hook để sử dụng validation trong form
 * Trả về validation state và helper functions
 */
export function useCourseFormValidation(initialCourse: Partial<Course> = {}) {
  const [course, setCourse] = React.useState<Partial<Course>>(initialCourse);
  const { validateCourse, validateBeforeSubmit } = useCourseValidation();

  const validation = React.useMemo(
    () => validateCourse(course),
    [course, validateCourse]
  );

  const updateField = (field: keyof Course, value: any) => {
    setCourse((prev) => ({ ...prev, [field]: value }));
  };

  const updateMultipleFields = (fields: Partial<Course>) => {
    setCourse((prev) => ({ ...prev, ...fields }));
  };

  const resetForm = (newCourse: Partial<Course> = {}) => {
    setCourse(newCourse);
  };

  const canSubmit = validation.isValid;

  const handleSubmit = async (
    onSubmit: (course: Partial<Course>) => Promise<void>
  ) => {
    try {
      validateBeforeSubmit(course);
      await onSubmit(course);
      return { success: true };
    } catch (error) {
      console.error("Validation or submission failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

  return {
    course,
    setCourse,
    updateField,
    updateMultipleFields,
    resetForm,
    validation,
    canSubmit,
    handleSubmit,
  };
}

export default CourseValidationDisplay;
