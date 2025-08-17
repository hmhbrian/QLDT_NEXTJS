import React from "react";
import {
  Card,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Award } from "lucide-react";
import type { Course } from "@/lib/types/course.types";

interface CourseCardProps {
  course: Course;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  return (
    <Card className="flex items-center gap-3 p-3 bg-background rounded-md border shadow-sm">
      <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden">
        {course.image ? (
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              target.nextElementSibling?.classList.remove("hidden");
            }}
          />
        ) : null}
        <Award className={`h-8 w-8 text-muted-foreground ${course.image ? "hidden" : ""}`} />
      </div>
      <div className="flex-1 min-w-0">
        <CardTitle
          className="text-base font-semibold truncate mb-1"
          title={course.title}
        >
          {course.title || "Tên khóa học không có"}
        </CardTitle>
        <CardDescription
          className="text-xs text-muted-foreground truncate"
          title={course.description}
        >
          {course.description || "Không có mô tả"}
        </CardDescription>
      </div>
      <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium flex-shrink-0">
        Hoàn thành
      </div>
    </Card>
  );
};
