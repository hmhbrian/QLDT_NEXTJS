"use client";

import { useState, useMemo, useEffect } from "react";
import ReactPlayer from "react-player/lazy";
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
  Link as LinkIcon,
  FileText,
  Video,
} from "lucide-react";
import type {
  Lesson,
  UpdateLessonPayload,
  CreateLessonPayload,
  LessonContentType,
} from "@/lib/types/course.types";
import { extractErrorMessage } from "@/lib/core";
import { LoadingButton } from "@/components/ui/loading";
import {
  useLessons,
  useCreateLesson,
  useUpdateLesson,
  useDeleteLesson,
  useReorderLesson,
  LESSONS_QUERY_KEY,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CSS } from "@dnd-kit/utilities";
import { useQueryClient } from "@tanstack/react-query";

const renderLessonIcon = (contentType: LessonContentType | undefined) => {
  if (!contentType) return <FileText className="h-4 w-4 text-gray-400" />;
  const iconMap: Record<LessonContentType, React.ReactNode> = {
    video_url: <Video className="h-4 w-4 text-blue-500" />,
    pdf_url: <FileText className="h-4 w-4 text-red-500" />,
    slide_url: <FileText className="h-4 w-4 text-yellow-500" />,
    text: <Library className="h-4 w-4 text-green-500" />,
    external_link: <LinkIcon className="h-4 w-4 text-gray-500" />,
  };
  return iconMap[contentType] || <FileText className="h-4 w-4 text-gray-500" />;
};

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
      className="flex items-center justify-between p-3 border rounded-md bg-background hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center gap-3 flex-grow min-w-0">
        <button
          {...listeners}
          {...attributes}
          className="cursor-grab p-1 text-muted-foreground hover:bg-muted rounded touch-none"
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 flex-shrink-0">
          {renderLessonIcon(lesson.type)}
        </div>
        <div className="flex-grow min-w-0">
          <p className="text-sm font-medium truncate" title={lesson.title}>
            {lesson.title}
          </p>
          <p
            className="text-xs text-muted-foreground mt-1 truncate"
            title={lesson.link || ""}
          >
            {lesson.link || lesson.content || "Không có"}
          </p>
        </div>
      </div>
      <div className="space-x-1 flex-shrink-0 flex items-center">
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
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const {
    lessons,
    isLoading: isLoadingLessons,
    error: lessonsError,
  } = useLessons(courseId ?? undefined);

  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [currentEditingLesson, setCurrentEditingLesson] =
    useState<Lesson | null>(null);
  const [lessonFormData, setLessonFormData] = useState<
    Partial<Lesson & { file: File | null }>
  >({
    title: "",
    type: "pdf_url",
    link: "",
    file: null,
    totalDurationSeconds: 0,
  });

  const [deletingItem, setDeletingItem] = useState<DeletingItem | null>(null);
  const [isFetchingDuration, setIsFetchingDuration] = useState(false);

  const createLessonMutation = useCreateLesson();
  const updateLessonMutation = useUpdateLesson();
  const deleteLessonMutation = useDeleteLesson();
  const reorderLessonMutation = useReorderLesson();

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    if (
      lessonFormData.type === "video_url" &&
      lessonFormData.link &&
      ReactPlayer.canPlay(lessonFormData.link)
    ) {
      setIsFetchingDuration(true);
    } else {
      setIsFetchingDuration(false);
    }
  }, [lessonFormData.link, lessonFormData.type]);

  const handleOpenAddLesson = () => {
    setCurrentEditingLesson(null);
    setLessonFormData({
      title: "",
      type: "pdf_url",
      link: "",
      file: null,
      totalDurationSeconds: 0,
    });
    setIsLessonDialogOpen(true);
  };

  const handleOpenEditLesson = (lesson: Lesson) => {
    setCurrentEditingLesson(lesson);
    setLessonFormData({
      title: lesson.title,
      type: lesson.type || "pdf_url",
      link: lesson.link || "",
      file: null,
      totalDurationSeconds: lesson.totalDurationSeconds || 0,
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
    if (
      lessonFormData.type === "pdf_url" &&
      !lessonFormData.file &&
      !currentEditingLesson
    ) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn file PDF cho bài học mới.",
        variant: "destructive",
      });
      return;
    }
    if (lessonFormData.type !== "pdf_url" && !lessonFormData.link) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập đường dẫn (link).",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload: CreateLessonPayload | UpdateLessonPayload = {
        Title: lessonFormData.title,
        Link:
          lessonFormData.type !== "pdf_url" ? lessonFormData.link : undefined,
        FilePdf:
          lessonFormData.type === "pdf_url" ? lessonFormData.file : undefined,
        TotalDurationSeconds: lessonFormData.totalDurationSeconds,
      };

      if (currentEditingLesson) {
        await updateLessonMutation.mutateAsync({
          courseId: courseId,
          lessonId: Number(currentEditingLesson.id),
          payload,
        });
      } else {
        await createLessonMutation.mutateAsync({
          courseId: courseId,
          ...(payload as CreateLessonPayload),
        });
      }
      setIsLessonDialogOpen(false);
    } catch (error) {
      console.error("Failed to save lesson:", error);
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
    if (!deletingItem || deletingItem.type !== "lesson" || !courseId) return;
    deleteLessonMutation.mutate(
      {
        courseId: courseId,
        lessonIds: [Number(deletingItem.id)],
      },
      {
        onSuccess: () => {
          setDeletingItem(null);
        },
      }
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = lessons.findIndex((l) => l.id === active.id);
      const newIndex = lessons.findIndex((l) => l.id === over.id);

      if (oldIndex === -1 || newIndex === -1 || !courseId) return;

      const reorderedLessons = arrayMove(lessons, oldIndex, newIndex);
      const movedLesson = reorderedLessons[newIndex];
      const previousLesson =
        newIndex > 0 ? reorderedLessons[newIndex - 1] : null;

      queryClient.setQueryData([LESSONS_QUERY_KEY, courseId], reorderedLessons);

      const payload = {
        LessonId: Number(movedLesson.id),
        PreviousLessonId: previousLesson ? Number(previousLesson.id) : null,
      };
      reorderLessonMutation.mutate({
        courseId: courseId,
        payload,
      });
    }
  };

  return (
    <>
      <div className="space-y-4">
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
            Lỗi tải bài học: {extractErrorMessage(lessonsError)}
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
          <p className="text-sm text-muted-foreground">Chưa có bài học.</p>
        )}
      </div>

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
              <Label htmlFor="lessonType">Loại nội dung</Label>
              <Select
                value={lessonFormData.type}
                onValueChange={(v: LessonContentType) =>
                  setLessonFormData((p) => ({
                    ...p,
                    type: v,
                    link: "",
                    file: null,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại nội dung" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf_url">Tài liệu PDF</SelectItem>
                  <SelectItem value="video_url">
                    Link Video/Link ngoài
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {lessonFormData.type === "pdf_url" ? (
              <div className="space-y-2">
                <Label htmlFor="lessonFile">
                  File PDF{" "}
                  {currentEditingLesson ? "(Để trống nếu không đổi)" : "*"}
                </Label>
                {currentEditingLesson?.fileUrl && (
                  <a
                    href={currentEditingLesson.fileUrl}
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
            ) : (
              <div className="space-y-2">
                <Label htmlFor="lessonLink">
                  Đường dẫn (Link) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lessonLink"
                  value={lessonFormData.link || ""}
                  onChange={(e) =>
                    setLessonFormData((p) => ({ ...p, link: e.target.value }))
                  }
                  placeholder="https://youtube.com/... hoặc https://..."
                />
                {isFetchingDuration && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Đang lấy thời lượng video...
                  </div>
                )}
              </div>
            )}
            {/* Hidden ReactPlayer to get duration */}
            {lessonFormData.type === "video_url" && lessonFormData.link && (
              <div className="hidden">
                <ReactPlayer
                  url={lessonFormData.link}
                  onDuration={(duration) => {
                    setLessonFormData((p) => ({
                      ...p,
                      totalDurationSeconds: Math.round(duration),
                    }));
                    setIsFetchingDuration(false);
                  }}
                  onError={() => setIsFetchingDuration(false)}
                />
              </div>
            )}
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
                createLessonMutation.isPending ||
                updateLessonMutation.isPending ||
                isFetchingDuration
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
            <Button
              variant="outline"
              onClick={() => setDeletingItem(null)}
              disabled={deleteLessonMutation.isPending}
            >
              Hủy
            </Button>
            <LoadingButton
              variant="destructive"
              onClick={executeDeleteLesson}
              isLoading={deleteLessonMutation.isPending}
            >
              Xác nhận xóa
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
