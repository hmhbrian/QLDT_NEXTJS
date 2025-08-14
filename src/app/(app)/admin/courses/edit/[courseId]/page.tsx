
"use client";

import { Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CourseForm } from "@/components/courses/forms/CourseForm";
import { Loading } from "@/components/ui/loading";
import { ArrowLeft } from "lucide-react";

function CourseEditPageContent() {
  const params = useParams();
  const router = useRouter();

  const courseId = Array.isArray(params.courseId)
    ? params.courseId[0]
    : params.courseId;

  const isCreating = courseId === "new";

  return (
    <div className="space-y-6 container mx-auto px-2 sm:px-4 md:px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/admin/courses")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl md:text-2xl font-semibold">
          {isCreating ? "Tạo khóa học mới" : "Chỉnh sửa khóa học"}
        </h1>
      </div>
      <CourseForm
        courseId={isCreating ? undefined : courseId}
        onSaveSuccess={() => router.push("/admin/courses")}
      />
    </div>
  );
}

export default function CourseEditPage() {
  return (
    <Suspense fallback={<Loading variant="overlay" text="Đang tải..." />}>
      <CourseEditPageContent />
    </Suspense>
  );
}
