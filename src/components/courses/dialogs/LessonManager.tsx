
"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  PlusCircle,
  Edit,
  Trash2,
  Library,
  Loader2,
  GripVertical,
  AlertTriangle,
} from "lucide-react";
import type {
  Lesson,
  UpdateLessonPayload,
} from "@/lib/types/course.types";
import { extractErrorMessage } from "@/lib/core";
import { LoadingButton } from "@/components/ui/loading";
import {
  useLessons,
  useCreateLesson,
  useUpdateLesson,
  useDeleteLesson,
  useReorderLesson,
} from "@/hooks/use-lessons";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface LessonManagerProps {
  courseId: string | null;
}

type DeletingItem = {
    type: "lesson";
    id: string | number;
    name: string;
};

// Sortable Lesson Item Component
function SortableLessonItem({
  lesson,
  onEdit,
  onDelete,
}: {
  lesson: Lesson;
  onEdit: (l: Lesson) => void;
  onDelete: (l: Lesson) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-2 border rounded-md bg-background"
    >
      <div className="flex items-center gap-2 flex-grow min-w-0">
        <button
          {...listeners}
          {...attributes}
          className="cursor-grab p-1 text-muted-foreground hover:bg-muted rounded touch-none"
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <span className="text-sm truncate">{lesson.title}</span>
      </div>
      <div className="space-x-1 flex-shrink-0">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onEdit(lesson)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(lesson)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}


export function LessonManager({ courseId }: LessonManagerProps) {
  const { toast } = useToast();
  const {
    lessons,
    isLoading: isLoadingLessons,
    error: lessonsError,
    reloadLessons
  } = useLessons(courseId ?? undefined);

  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [currentEditingLesson, setCurrentEditingLesson] = useState<Lesson | null>(null);
  const [lessonFormData, setLessonFormData] = useState<Partial<Lesson & { file: File | null }>>({
    title: "",
    content: "",
    file: null,
  });

  const [deletingItem, setDeletingItem] = useState<DeletingItem | null>(null);
  
  const createLessonMutation = useCreateLesson();
  const updateLessonMutation = useUpdateLesson();
  const deleteLessonMutation = useDeleteLesson();
  const reorderLessonMutation = useReorderLesson();

  const sensors = useSensors(useSensor(PointerSensor));

  const handleOpenAddLesson = () => {
    setCurrentEditingLesson(null);
    setLessonFormData({ title: "", content: "", file: null });
    setIsLessonDialogOpen(true);
  };

  const handleOpenEditLesson = (lesson: Lesson) => {
    setCurrentEditingLesson(lesson);
    setLessonFormData({
      title: lesson.title,
      content: lesson.content,
      file: null,
    });
    setIsLessonDialogOpen(true);
  };

  const handleSaveLesson = async () => {
    if (!courseId) return;
    if (!lessonFormData.title) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tiêu đề.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (currentEditingLesson) {
        const payload: UpdateLessonPayload = { title: lessonFormData.title };
        if (lessonFormData.file) {
          payload.file = lessonFormData.file;
        }
        await updateLessonMutation.mutateAsync({
          courseId: courseId,
          lessonId: Number(currentEditingLesson.id),
          payload,
        });
      } else {
        if (!lessonFormData.file) {
          toast({
            title: "Lỗi",
            description: "Vui lòng chọn file PDF cho bài học mới.",
            variant: "destructive",
          });
          return;
        }
        await createLessonMutation.mutateAsync({
          courseId: courseId,
          title: lessonFormData.title || "Bài học không tên",
          file: lessonFormData.file,
        });
      }
      setIsLessonDialogOpen(false);
    } catch (error) {
      console.error("Failed to save lesson:", error);
      toast({
        title: "Lỗi",
        description:
          extractErrorMessage(error) ||
          "Không thể lưu bài học. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLesson = (lesson: Lesson) => {
    setDeletingItem({
        type: "lesson",
        id: lesson.id,
        name: lesson.title,
    });
  };

  const executeDeleteLesson = () => {
    if (!deletingItem || deletingItem.type !== "lesson" || !courseId)
      return;
    deleteLessonMutation.mutate({
      courseId: courseId,
      lessonIds: [Number(deletingItem.id)],
    });
    setDeletingItem(null);
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
        const oldIndex = lessons.findIndex((l) => l.id === active.id);
        const newIndex = lessons.findIndex((l) => l.id === over.id);

        if (oldIndex === -1 || newIndex === -1) return;
        
        const reorderedLessons = arrayMove(lessons, oldIndex, newIndex);
        
        // Optimistically update the UI
        // queryClient.setQueryData([LESSONS_QUERY_KEY, courseId], reorderedLessons);
        reloadLessons(); // This might be too slow, need a better way

        if (courseId) {
            const movedLesson = reorderedLessons[newIndex];
            const previousLesson = newIndex > 0 ? reorderedLessons[newIndex - 1] : null;

            const payload = {
            lessonId: Number(movedLesson.id),
            previousLessonId: previousLesson ? Number(previousLesson.id) : null,
            };
            reorderLessonMutation.mutate({
            courseId: courseId,
            payload,
            });
        }
    }
  };

  return (
    <div className="space-y-2">
        <div className="flex items-center justify-between">
        <Label className="text-base font-semibold flex items-center">
            <Library className="mr-2 h-5 w-5 text-primary" /> Bài học
        </Label>
        <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleOpenAddLesson}
            disabled={!courseId}
        >
            <PlusCircle className="mr-2 h-4 w-4" /> Thêm bài học
        </Button>
        </div>
        {isLoadingLessons ? (
        <div className="flex justify-center items-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
        ) : lessonsError ? (
        <p className="text-destructive text-sm">
            Lỗi tải bài học: {lessonsError.message}
        </p>
        ) : lessons.length > 0 ? (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
            items={lessons.map((l) => l.id)}
            strategy={verticalListSortingStrategy}
            >
            <div className="space-y-2">
                {lessons.map((lesson) => (
                <SortableLessonItem
                    key={lesson.id}
                    lesson={lesson}
                    onEdit={handleOpenEditLesson}
                    onDelete={() => handleDeleteLesson(lesson)}
                />
                ))}
            </div>
            </SortableContext>
        </DndContext>
        ) : (
        <p className="text-sm text-muted-foreground">
            Chưa có bài học.
        </p>
        )}

        <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                    {currentEditingLesson ? "Chỉnh sửa Bài học" : "Thêm Bài học Mới"}
                    </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                    <Label htmlFor="lessonTitle">
                        Tiêu đề <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="lessonTitle"
                        value={lessonFormData.title || ""}
                        onChange={(e) =>
                        setLessonFormData((p) => ({ ...p, title: e.target.value }))
                        }
                    />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="lessonFile">
                        File PDF{" "}
                        {currentEditingLesson ? "(Để trống nếu không đổi)" : "*"}
                    </Label>
                    {currentEditingLesson?.urlPdf && (
                        <a
                        href={currentEditingLesson.urlPdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline block mb-2"
                        >
                        Xem file hiện tại
                        </a>
                    )}
                    <Input
                        id="lessonFile"
                        type="file"
                        accept=".pdf"
                        onChange={(e) =>
                        setLessonFormData((p) => ({
                            ...p,
                            file: e.target.files?.[0] || null,
                        }))
                        }
                    />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                    variant="outline"
                    onClick={() => setIsLessonDialogOpen(false)}
                    >
                    Hủy
                    </Button>
                    <LoadingButton
                    onClick={handleSaveLesson}
                    isLoading={
                        createLessonMutation.isPending || updateLessonMutation.isPending
                    }
                    >
                    Lưu Bài học
                    </LoadingButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog open={!!deletingItem} onOpenChange={() => setDeletingItem(null)}>
            <DialogContent>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="text-destructive" />
                Xác nhận xóa
                </DialogTitle>
                <DialogDescription className="pt-2">
                Bạn có chắc chắn muốn xóa mục{" "}
                <strong>&quot;{deletingItem?.name}&quot;</strong>? Hành động này
                không thể hoàn tác.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button variant="outline" onClick={() => setDeletingItem(null)}>
                Hủy
                </Button>
                <Button variant="destructive" onClick={executeDeleteLesson}>
                Xác nhận xóa
                </Button>
            </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}
