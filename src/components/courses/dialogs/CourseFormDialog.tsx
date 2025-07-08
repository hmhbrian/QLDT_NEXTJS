"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { MultiSelect } from "@/components/ui/multi-select";
import { useToast } from "@/components/ui/use-toast";
import {
  PlusCircle,
  Upload,
  X,
  Users,
  Library,
  FileQuestion,
  Edit,
  Trash2,
  Paperclip,
  ListChecks,
  ChevronLeft,
  ChevronRight,
  Link as LinkIcon,
  ChevronsUpDown,
  Search,
  Loader2,
  FileText,
  Video,
  GripVertical,
  AlertTriangle,
} from "lucide-react";
import NextImage from "next/image";
import { DatePicker } from "@/components/ui/datepicker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandGroup,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type {
  Course,
  CourseMaterial,
  EnrollmentType,
  Lesson,
  Test,
  Question,
  UpdateLessonPayload,
  CourseMaterialType,
  CreateQuestionPayload,
} from "@/lib/types/course.types";
import { generateCourseCode } from "@/lib/utils/code-generator";
import { useError } from "@/hooks/use-error";
import { extractErrorMessage } from "@/lib/core";
import * as XLSX from "xlsx";
import type { Status } from "@/lib/types/status.types";
import type { User } from "@/lib/types/user.types";
import { courseAttachedFilesService } from "@/lib/services";
import { LoadingButton } from "@/components/ui/loading";
import {
  useLessons,
  useCreateLesson,
  useUpdateLesson,
  useDeleteLesson,
  useReorderLesson,
} from "@/hooks/use-lessons";
import {
  useTests,
  useCreateTest,
  useUpdateTest,
  useDeleteTest,
} from "@/hooks/use-tests";
import {
  useQuestions,
  useCreateQuestion,
  useCreateQuestions,
  useCreateQuestionSilent,
  useCreateQuestionsSilent,
  useUpdateQuestion,
  useUpdateQuestionSilent,
  useDeleteQuestion,
  useDeleteQuestionSilent,
} from "@/hooks/use-questions";
import {
  mapUiTestToCreatePayload,
  mapUiTestToUpdatePayload,
} from "@/lib/mappers/test.mapper";
import { mapUiQuestionToApiPayload } from "@/lib/mappers/question.mapper";
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
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CourseAttachedFilePayload } from "@/lib/services/modern/course-attached-files.service";
import { categoryOptions } from "@/lib/constants";
import { NO_DEPARTMENT_VALUE } from "@/lib/constants";

// Helper function to render material icon
const renderMaterialIcon = (type: CourseMaterialType | undefined) => {
  switch (type) {
    case "PDF":
      return <FileText className="h-5 w-5 text-red-500" />;
    case "Link":
      return <LinkIcon className="h-5 w-5 text-blue-500" />;
    default:
      return <Paperclip className="h-5 w-5 text-gray-500" />;
  }
};

// Trạng thái ban đầu cho các đối tượng lồng nhau
const initialDurationState = { sessions: 1, hoursPerSession: 2 };

const initialQuestionState: Omit<Question, "id"> = {
  questionCode: "",
  text: "",
  options: ["", "", "", ""],
  correctAnswerIndex: -1,
  correctAnswerIndexes: [],
  explanation: "",
  position: 0,
};
const initialTestState: Omit<Test, "id"> = {
  title: "",
  questions: [],
  passingScorePercentage: 70,
};

type DeletingItem = {
  type: "lesson" | "test" | "question" | "material";
  id: string | number;
  name: string;
  testId?: string | number; // Optional, for deleting questions
};

// Define the form data state type to be more flexible with materials
type CourseFormData = Omit<
  Course,
  "id" | "createdAt" | "modifiedAt" | "createdBy" | "modifiedBy" | "materials"
> & {
  materials: (Partial<CourseMaterial> & {
    id: string | number;
    __file?: File | null;
  })[];
};

// Trạng thái ban đầu cho khóa học mới trong dialog, using the new flexible type
const initialNewCourseStateForDialog: CourseFormData = {
  title: "",
  courseCode: "",
  description: "",
  objectives: "",
  category: "programming",
  instructor: "",
  duration: initialDurationState,
  learningType: "online",
  startDate: null,
  endDate: null,
  location: "",
  image: "https://placehold.co/600x400.png",
  status: "Lưu nháp",
  department: [],
  level: [],
  materials: [],
  lessons: [],
  tests: [],
  enrollmentType: "optional",
  registrationStartDate: null,
  registrationDeadline: null,
  enrolledTrainees: [],
  isPublic: false,
};

export interface CourseFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  courseToEdit?: Course | null;
  isDuplicating?: boolean;
  onSave: (
    courseData:
      | Course
      | Omit<
          Course,
          "id" | "createdAt" | "modifiedAt" | "createdBy" | "modifiedBy"
        >,
    isEditing: boolean,
    imageFile?: File | null
  ) => Promise<Course | void>; // Return course on success
  courseStatuses: Status[];
  departmentOptions: readonly { value: string; label: string }[];
  levelOptions: readonly { value: string; label: string }[];
  trainees: User[];
}

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

export function CourseFormDialog({
  isOpen,
  onOpenChange,
  courseToEdit,
  isDuplicating = false,
  onSave,
  courseStatuses,
  departmentOptions,
  levelOptions,
  trainees,
}: CourseFormDialogProps) {
  const { showError } = useError();
  const { toast } = useToast();

  const [formData, setFormData] = useState<CourseFormData>(
    initialNewCourseStateForDialog
  );

  const [courseImagePreview, setCourseImagePreview] = useState<string | null>(
    courseToEdit?.image || initialNewCourseStateForDialog.image
  );
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const courseImageInputRef = useRef<HTMLInputElement>(null);
  const lessonPdfInputRef = useRef<HTMLInputElement>(null);
  const testExcelImportInputRef = useRef<HTMLInputElement>(null);
  const materialFileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentMaterialUploadIndex, setCurrentMaterialUploadIndex] = useState<
    number | null
  >(null);

  const [isSelectingTrainees, setIsSelectingTrainees] = useState(false);
  const [tempSelectedTraineeIds, setTempSelectedTraineeIds] = useState<
    string[]
  >([]);
  const [traineeSearchTerm, setTraineeSearchTerm] = useState("");

  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [currentEditingLesson, setCurrentEditingLesson] =
    useState<Lesson | null>(null);
  const [lessonFormData, setLessonFormData] = useState<
    Partial<Lesson & { file: File | null }>
  >({
    title: "",
    content: "",
    file: null,
  });

  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [currentEditingTest, setCurrentEditingTest] = useState<Test | null>(
    null
  );
  const [testFormData, setTestFormData] =
    useState<Partial<Test>>(initialTestState);

  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [currentEditingQuestion, setCurrentEditingQuestion] =
    useState<Question | null>(null);
  const [questionFormData, setQuestionFormData] =
    useState<Omit<Question, "id">>(initialQuestionState);

  // State cho pagination câu hỏi
  const [questionsPage, setQuestionsPage] = useState(1);
  const questionsPerPage = 10;

  // State for deletion confirmation
  const [deletingItem, setDeletingItem] = useState<DeletingItem | null>(null);

  const isEditingExistingCourse = !!courseToEdit && !isDuplicating;

  const { data: attachedFiles, isLoading: isLoadingAttachedFiles } = useQuery({
    queryKey: ["attachedFiles", courseToEdit?.id],
    queryFn: () => {
      if (!isEditingExistingCourse || !courseToEdit?.id)
        return Promise.resolve([]);
      return courseAttachedFilesService.getAttachedFiles(courseToEdit.id);
    },
    enabled: isEditingExistingCourse && !isDuplicating,
  });

  const {
    lessons,
    isLoading: isLoadingLessons,
    error: lessonsError,
  } = useLessons(isEditingExistingCourse ? courseToEdit?.id : undefined);

  const {
    tests,
    isLoading: isLoadingTests,
    error: testsError,
  } = useTests(isEditingExistingCourse ? courseToEdit?.id : undefined);

  const queryClient = useQueryClient();

  const createLessonMutation = useCreateLesson();
  const updateLessonMutation = useUpdateLesson();
  const deleteLessonMutation = useDeleteLesson();
  const reorderLessonMutation = useReorderLesson();

  const createTestMutation = useCreateTest();
  const updateTestMutation = useUpdateTest();
  const deleteTestMutation = useDeleteTest();

  const createQuestionMutation = useCreateQuestion();
  const createQuestionsMutation = useCreateQuestions();
  const createQuestionSilentMutation = useCreateQuestionSilent();
  const createQuestionsSilentMutation = useCreateQuestionsSilent();
  const updateQuestionMutation = useUpdateQuestion();
  const updateQuestionSilentMutation = useUpdateQuestionSilent();
  const deleteQuestionMutation = useDeleteQuestion();
  const deleteQuestionSilentMutation = useDeleteQuestionSilent();

  const { questions: fetchedQuestions, isLoading: isLoadingQuestions } =
    useQuestions(
      currentEditingTest && typeof currentEditingTest.id === "number"
        ? currentEditingTest.id
        : undefined
    );

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    if (!isOpen) return;

    if (courseToEdit) {
      const editableCourseData = JSON.parse(JSON.stringify(courseToEdit));
      setFormData({
        ...initialNewCourseStateForDialog,
        ...editableCourseData,
      });
      setCourseImagePreview(editableCourseData.image);
      setTempSelectedTraineeIds(editableCourseData.enrolledTrainees || []);
    } else {
      const draftStatus = courseStatuses.find((s) => s.name === "Lưu nháp");
      setFormData({
        ...initialNewCourseStateForDialog,
        statusId: draftStatus?.id,
        materials: [],
      });
      setCourseImagePreview(initialNewCourseStateForDialog.image);
      setTempSelectedTraineeIds([]);
    }
    setSelectedImageFile(null);
    if (courseImageInputRef.current) {
      courseImageInputRef.current.value = "";
    }
  }, [isOpen, courseToEdit, courseStatuses, isDuplicating]);

  useEffect(() => {
    if (isDuplicating || !isEditingExistingCourse) return;

    if (!isLoadingLessons && lessons) {
      setFormData((prev) => ({ ...prev, lessons: lessons || [] }));
    }

    if (!isLoadingTests && tests) {
      setFormData((prev) => ({ ...prev, tests: tests || [] }));
    }

    if (!isLoadingAttachedFiles && attachedFiles) {
      setFormData((prev) => ({
        ...prev,
        materials: (attachedFiles || []).map((file) => ({
          ...file,
          __file: null,
        })),
      }));
    }
  }, [
    lessons,
    tests,
    attachedFiles,
    isLoadingLessons,
    isLoadingTests,
    isLoadingAttachedFiles,
    isEditingExistingCourse,
    isDuplicating,
  ]);

  useEffect(() => {
    if (
      isTestDialogOpen &&
      currentEditingTest &&
      typeof currentEditingTest.id === "number"
    ) {
      if (!isLoadingQuestions) {
        setTestFormData((prev) => ({ ...prev, questions: fetchedQuestions }));
      }
    }
  }, [
    isTestDialogOpen,
    currentEditingTest,
    fetchedQuestions,
    isLoadingQuestions,
  ]);

  useEffect(() => {
    return () => {
      if (courseImagePreview && courseImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(courseImagePreview);
      }
    };
  }, [courseImagePreview]);

  const handleInputChange = (field: keyof typeof formData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDurationChange = (
    field: keyof Course["duration"],
    value: string
  ) => {
    const numericValue =
      field === "sessions" ? parseInt(value) : parseFloat(value);
    if (isNaN(numericValue) || numericValue < (field === "sessions" ? 1 : 0.5))
      return;
    setFormData((prev) => ({
      ...prev,
      duration: {
        ...prev.duration,
        [field]: numericValue,
      },
    }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCourseImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedImageFile(null);
      setCourseImagePreview(null);
    }
  };

  const openTraineeSelectionDialog = () => {
    setTempSelectedTraineeIds(formData.enrolledTrainees || []);
    setIsSelectingTrainees(true);
  };

  const handleSaveTraineeSelection = () => {
    handleInputChange("enrolledTrainees", tempSelectedTraineeIds);
    setIsSelectingTrainees(false);
  };

  const getTraineeNameById = (id: string): string =>
    trainees.find((t) => t.id === id)?.fullName || "Không rõ học viên";

  const filteredTrainees = trainees.filter(
    (trainee) =>
      trainee.fullName
        .toLowerCase()
        .includes(traineeSearchTerm.toLowerCase()) ||
      trainee.email.toLowerCase().includes(traineeSearchTerm.toLowerCase())
  );

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
    if (!courseToEdit?.id) return;
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
          courseId: courseToEdit.id,
          lessonId: Number(currentEditingLesson.id),
          payload,
        });
        // Mutation sẽ tự hiển thị thông báo thành công qua onSuccess callback
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
          courseId: courseToEdit.id,
          title: lessonFormData.title || "Bài học không tên",
          file: lessonFormData.file,
        });
        // Mutation sẽ tự hiển thị thông báo thành công qua onSuccess callback
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

  const executeDeleteLesson = () => {
    if (!deletingItem || deletingItem.type !== "lesson" || !courseToEdit?.id)
      return;
    deleteLessonMutation.mutate({
      courseId: courseToEdit.id,
      lessonIds: [Number(deletingItem.id)],
    });
    setDeletingItem(null);
  };

  const handleDeleteLesson = (lesson: Lesson) => {
    setDeletingItem({
      type: "lesson",
      id: lesson.id,
      name: lesson.title,
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = formData.lessons.findIndex((l) => l.id === active.id);
      const newIndex = formData.lessons.findIndex((l) => l.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      const reorderedLessons = arrayMove(formData.lessons, oldIndex, newIndex);

      handleInputChange("lessons", reorderedLessons);

      if (courseToEdit?.id) {
        const movedLesson = reorderedLessons[newIndex];
        const previousLesson =
          newIndex > 0 ? reorderedLessons[newIndex - 1] : null;

        const payload = {
          lessonId: Number(movedLesson.id),
          previousLessonId: previousLesson ? Number(previousLesson.id) : null,
        };
        reorderLessonMutation.mutate({
          courseId: courseToEdit.id,
          payload,
        });
      }
    }
  };

  const handleOpenAddTest = () => {
    setCurrentEditingTest(null);
    setTestFormData(initialTestState);
    setQuestionsPage(1);
    setIsTestDialogOpen(true);
  };

  const handleOpenEditTest = (test: Test) => {
    setCurrentEditingTest(test);
    setTestFormData({
      ...test,
      questions: test.questions || [],
    });
    setQuestionsPage(1);
    setIsTestDialogOpen(true);
  };

  const handleOpenAddQuestion = () => {
    setCurrentEditingQuestion(null);
    setQuestionFormData(initialQuestionState);
    setIsQuestionDialogOpen(true);
  };

  const handleOpenEditQuestion = (question: Question) => {
    setCurrentEditingQuestion(question);
    setQuestionFormData({
      ...initialQuestionState,
      ...question,
    });
    setIsQuestionDialogOpen(true);
  };

  const handleExcelFileImport = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls)$/)) {
      showError("FILE001");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        }) as (string | number | null)[][];

        if (jsonData.length < 2) {
          showError("FILE001");
          return;
        }

        const headers = (jsonData[0] as string[]).map(
          (h) => h?.toString().trim().toLowerCase() || ""
        );
        const questions: Question[] = [];

        const headerMap = {
          code: headers.indexOf("mã câu hỏi"),
          question: headers.indexOf("câu hỏi"),
          correctAnswer: headers.indexOf("câu trả lời"),
          questionType: headers.indexOf("loại câu hỏi"),
          explanation: headers.indexOf("lời giải"),
          optionA: headers.indexOf("a"),
          optionB: headers.indexOf("b"),
          optionC: headers.indexOf("c"),
          optionD: headers.indexOf("d"),
        };

        if (
          headerMap.question === -1 ||
          headerMap.correctAnswer === -1 ||
          headerMap.optionA === -1 ||
          headerMap.optionB === -1
        ) {
          console.error(
            "Cấu trúc file Excel không đúng. Cần có các cột: 'Câu hỏi', 'Câu trả lời', 'A', 'B'"
          );
          showError("FILE001");
          return;
        }

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length === 0) continue;

          const code =
            headerMap.code !== -1
              ? String(row[headerMap.code] || "").trim() || `Q${i}`
              : `Q${i}`;
          const question = String(row[headerMap.question] || "").trim();
          const correctAnswerLabel = String(
            row[headerMap.correctAnswer] || ""
          ).trim();
          const explanation =
            headerMap.explanation !== -1
              ? String(row[headerMap.explanation] || "").trim()
              : "";

          const optionA =
            headerMap.optionA !== -1
              ? String(row[headerMap.optionA] || "").trim()
              : "";
          const optionB =
            headerMap.optionB !== -1
              ? String(row[headerMap.optionB] || "").trim()
              : "";
          const optionC =
            headerMap.optionC !== -1
              ? String(row[headerMap.optionC] || "").trim()
              : "";
          const optionD =
            headerMap.optionD !== -1
              ? String(row[headerMap.optionD] || "").trim()
              : "";

          if (!question || !correctAnswerLabel || !optionA || !optionB) {
            console.warn(`Bỏ qua dòng ${i + 1} do thiếu dữ liệu bắt buộc.`);
            continue;
          }

          const options = [optionA, optionB];
          if (optionC) options.push(optionC);
          if (optionD) options.push(optionD);

          let correctAnswerIndex = -1;

          if (/^\d+$/.test(correctAnswerLabel)) {
            correctAnswerIndex = parseInt(correctAnswerLabel) - 1;
          } else {
            const upperLabel = correctAnswerLabel.toUpperCase();
            const labelMap: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
            correctAnswerIndex = labelMap[upperLabel];
          }

          if (
            correctAnswerIndex === undefined ||
            correctAnswerIndex < 0 ||
            correctAnswerIndex >= options.length
          ) {
            console.warn(
              `Đáp án đúng không hợp lệ ở dòng ${i + 1}. Bỏ qua câu hỏi.`
            );
            continue;
          }

          questions.push({
            id: crypto.randomUUID(),
            questionCode: code,
            text: question,
            options: options,
            correctAnswerIndex: correctAnswerIndex,
            explanation: explanation,
            position: (testFormData.questions?.length || 0) + questions.length,
          });
        }

        if (questions.length === 0) {
          showError("FILE001");
          return;
        }

        // Always add imported questions to local state first, regardless of whether editing or creating test
        setTestFormData((prev) => ({
          ...prev,
          questions: [...(prev.questions || []), ...questions],
        }));

        toast({
          title: "Thành công",
          description: `Đã import ${questions.length} câu hỏi vào danh sách.`,
          variant: "success",
        });

        const totalQuestions =
          (testFormData.questions?.length || 0) + questions.length;
        const lastPage = Math.ceil(totalQuestions / questionsPerPage);
        setQuestionsPage(lastPage);
      } catch (error) {
        console.error("Lỗi khi import file Excel:", error);
        showError("FILE001");
      }
    };
    reader.onerror = () => {
      showError("FILE001");
    };
    reader.readAsArrayBuffer(file);
    if (testExcelImportInputRef.current)
      testExcelImportInputRef.current.value = "";
  };

  const handleSaveOrUpdateTest = async () => {
    if (!testFormData.title || !courseToEdit?.id) {
      showError("FORM001");
      return;
    }

    try {
      if (currentEditingTest && typeof currentEditingTest.id === "number") {
        const testId = currentEditingTest.id;

        // First update the test basic info
        const updatePayload = mapUiTestToUpdatePayload(testFormData as Test);
        await updateTestMutation.mutateAsync({
          courseId: courseToEdit.id,
          testId: testId,
          payload: updatePayload,
        });

        // Then handle questions synchronization
        const currentQuestions = testFormData.questions || [];
        const originalQuestions = fetchedQuestions || [];

        // Ensure positions are unique and sequential
        const questionsWithCorrectPositions = currentQuestions.map(
          (q, index) => ({
            ...q,
            position: index,
          })
        );

        // Create new questions (those with string IDs from crypto.randomUUID())
        const newQuestions = questionsWithCorrectPositions.filter(
          (q) => typeof q.id === "string"
        );
        if (newQuestions.length > 0) {
          const payloads = newQuestions.map((question) =>
            mapUiQuestionToApiPayload(question)
          );
          await createQuestionsSilentMutation.mutateAsync({
            testId: testId,
            questions: payloads,
          });
        }

        // Update existing questions (those with numeric IDs) - batch all updates
        const existingQuestions = questionsWithCorrectPositions.filter(
          (q) => typeof q.id === "number"
        );
        const updatePromises = existingQuestions.map((question) => {
          const payload = mapUiQuestionToApiPayload(question);
          return updateQuestionSilentMutation.mutateAsync({
            testId: testId,
            questionId: question.id as number,
            payload,
          });
        });
        await Promise.all(updatePromises);

        // Delete questions that were removed (exist in original but not in current)
        const currentQuestionIds = new Set(existingQuestions.map((q) => q.id));
        const questionsToDelete = originalQuestions.filter(
          (q) => typeof q.id === "number" && !currentQuestionIds.has(q.id)
        );
        const deletePromises = questionsToDelete.map((question) =>
          deleteQuestionSilentMutation.mutateAsync({
            testId: testId,
            questionIds: [question.id as number],
          })
        );
        await Promise.all(deletePromises);

        // Manually invalidate queries once after all operations
        queryClient.invalidateQueries({
          queryKey: ["questions", testId],
        });
        queryClient.invalidateQueries({
          queryKey: ["tests"],
        });

        toast({
          title: "Thành công",
          description: `Bài kiểm tra đã được cập nhật thành công. ${
            newQuestions.length > 0
              ? `Đã thêm ${newQuestions.length} câu hỏi mới. `
              : ""
          }${
            existingQuestions.length > 0
              ? `Đã cập nhật ${existingQuestions.length} câu hỏi. `
              : ""
          }${
            questionsToDelete.length > 0
              ? `Đã xóa ${questionsToDelete.length} câu hỏi.`
              : ""
          }`,
        });
      } else {
        const createPayload = mapUiTestToCreatePayload(testFormData as Test);
        await createTestMutation.mutateAsync({
          courseId: courseToEdit.id,
          payload: createPayload,
        });
        // Mutation sẽ tự hiển thị thông báo thành công qua onSuccess callback
      }
      setIsTestDialogOpen(false);
    } catch (error) {
      console.error("Failed to save test:", error);
      toast({
        title: "Lỗi",
        description:
          extractErrorMessage(error) ||
          "Không thể lưu bài kiểm tra. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const executeDeleteTest = () => {
    if (
      !deletingItem ||
      deletingItem.type !== "test" ||
      !courseToEdit?.id ||
      typeof deletingItem.id !== "number"
    )
      return;
    deleteTestMutation.mutate({
      courseId: courseToEdit.id,
      testId: deletingItem.id,
    });
    setDeletingItem(null);
  };

  const handleDeleteExistingTest = (test: Test) => {
    if (typeof test.id !== "number") {
      toast({
        title: "Lỗi",
        description: "Không thể xóa bài kiểm tra chưa được lưu.",
        variant: "destructive",
      });
      return;
    }
    setDeletingItem({
      type: "test",
      id: test.id,
      name: test.title,
    });
  };

  const handleSaveOrUpdateQuestion = async () => {
    const validOptions = questionFormData.options.filter((opt) => opt.trim());
    const hasCorrectAnswers =
      (questionFormData.correctAnswerIndexes &&
        questionFormData.correctAnswerIndexes.length > 0) ||
      questionFormData.correctAnswerIndex >= 0;

    if (
      !questionFormData.text ||
      validOptions.length < 2 ||
      !hasCorrectAnswers
    ) {
      toast({
        title: "Dữ liệu không hợp lệ",
        description:
          "Vui lòng điền nội dung câu hỏi, ít nhất 2 lựa chọn và chọn ít nhất một đáp án đúng.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Always use local state for question management, regardless of new or editing test
      setTestFormData((prev) => {
        const newQuestions = [...(prev.questions || [])];
        if (currentEditingQuestion) {
          const index = newQuestions.findIndex(
            (q) => q.id === currentEditingQuestion.id
          );
          if (index > -1) {
            newQuestions[index] = {
              ...currentEditingQuestion,
              ...questionFormData,
            };
          }
        } else {
          newQuestions.push({
            id: crypto.randomUUID(),
            ...questionFormData,
            position: newQuestions.length,
          });
        }
        return { ...prev, questions: newQuestions };
      });

      // Show success message
      toast({
        title: "Thành công",
        description: currentEditingQuestion
          ? "Câu hỏi đã được cập nhật. Nhấn 'Lưu' để cập nhật vào cơ sở dữ liệu."
          : "Câu hỏi đã được thêm. Nhấn 'Lưu' để cập nhật vào cơ sở dữ liệu.",
        variant: "success",
      });

      setIsQuestionDialogOpen(false);
    } catch (error) {
      console.error("Failed to save question:", error);
      toast({
        title: "Lỗi",
        description:
          extractErrorMessage(error) ||
          "Không thể lưu câu hỏi. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const executeDeleteQuestion = () => {
    if (!deletingItem || deletingItem.type !== "question") return;

    const { id } = deletingItem;

    // Always remove from local state, regardless of whether it's a new or existing test
    setTestFormData((prev) => ({
      ...prev,
      questions: (prev.questions || [])
        .filter((q) => q.id !== id)
        .map((q, index) => ({ ...q, position: index })),
    }));

    toast({
      title: "Thành công",
      description:
        "Câu hỏi đã được xóa khỏi danh sách. Nhấn 'Lưu' để cập nhật vào cơ sở dữ liệu.",
      variant: "success",
    });

    setDeletingItem(null);
  };

  const handleDeleteQuestionFromTest = (question: Question) => {
    setDeletingItem({
      type: "question",
      id: question.id,
      name: `câu hỏi "${question.text.substring(0, 30)}..."`,
      testId: currentEditingTest?.id,
    });
  };

  const executeRemoveMaterial = async () => {
    if (!deletingItem || deletingItem.type !== "material") return;
    const { id } = deletingItem;

    if (typeof id === "string") {
      setFormData((prev) => ({
        ...prev,
        materials: (prev.materials || []).filter((m) => m.id !== id),
      }));
    } else if (courseToEdit?.id && typeof id === "number") {
      try {
        await courseAttachedFilesService.deleteAttachedFile({
          courseId: courseToEdit.id,
          fileId: id,
        });
        setFormData((prev) => ({
          ...prev,
          materials: (prev.materials || []).filter((m: any) => m.id !== id),
        }));
        toast({
          title: "Thành công",
          description: "Đã xóa tài liệu.",
          variant: "success",
        });
      } catch (error) {
        showError(error);
      }
    }
    setDeletingItem(null);
  };

  const handleRemoveMaterial = (material: Partial<CourseMaterial>) => {
    setDeletingItem({
      type: "material",
      id: material.id!,
      name: material.title || "Tài liệu không tên",
    });
  };

  const handleAddMaterial = () => {
    setFormData((prev) => ({
      ...prev,
      materials: [
        ...(prev.materials || []),
        {
          id: crypto.randomUUID(),
          type: "Link", // Default to Link
          title: "",
          link: "",
          __file: null,
        },
      ],
    }));
  };

  const handleMaterialDetailChange = (
    index: number,
    field: "type" | "title" | "link",
    value: string
  ) => {
    setFormData((prev) => {
      const newMaterials = [...(prev.materials || [])];
      if (newMaterials[index]) {
        (newMaterials[index] as any)[field] = value;
        if (field === "type" && value !== "PDF") {
          (newMaterials[index] as any).link = "";
          (newMaterials[index] as any).__file = null;
        }
      }
      return { ...prev, materials: newMaterials };
    });
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = event.target.files?.[0];
    if (file && index < (formData.materials?.length || 0)) {
      setFormData((prev) => {
        const newMaterials = [...(prev.materials || [])];
        (newMaterials[index] as any).link = file.name;
        (newMaterials[index] as any).__file = file;
        return { ...prev, materials: newMaterials };
      });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const isEditing = !!courseToEdit && !isDuplicating;

    if (!formData.title || !formData.description || !formData.objectives) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ các trường bắt buộc.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Separate materials from the rest of the form data for type safety
      const { materials, ...restOfFormData } = formData;

      // Filter out new materials that don't have a courseId for the onSave call.
      // These will be uploaded separately after the course is saved.
      const savedMaterials = (materials || []).filter(
        (m): m is CourseMaterial => m.courseId !== undefined
      );

      // Reconstruct the course data to match the expected 'onSave' signature.
      const courseDataForSave:
        | Course
        | Omit<
            Course,
            "id" | "createdAt" | "modifiedAt" | "createdBy" | "modifiedBy"
          > = {
        ...restOfFormData,
        materials: savedMaterials,
      };

      const savedCourseResult = await onSave(
        courseDataForSave,
        isEditing,
        selectedImageFile
      );

      let finalCourseId: string | null = null;
      if (savedCourseResult && "id" in savedCourseResult) {
        finalCourseId = savedCourseResult.id;
      } else if (isEditing && courseToEdit) {
        finalCourseId = courseToEdit.id;
      }

      if (finalCourseId) {
        const newMaterialsPayload: CourseAttachedFilePayload[] = (
          formData.materials || []
        )
          .filter((m) => typeof m.id === "string")
          .map((m) => {
            const item: CourseAttachedFilePayload = {
              title: m.title || "Untitled",
            };
            if (m.type === "PDF" && (m as any).__file instanceof File) {
              item.file = (m as any).__file;
            } else if (m.type === "Link") {
              item.link = m.link;
            }
            return item;
          })
          .filter((p) => p.file || p.link);

        if (newMaterialsPayload.length > 0) {
          await courseAttachedFilesService.uploadAttachedFiles(
            finalCourseId,
            newMaterialsPayload
          );
        }
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Error saving course or uploading files:", error);
      // Let the onSave function's error handling (toast) manage user feedback.
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = () => {
    if (!deletingItem) return;
    switch (deletingItem.type) {
      case "lesson":
        executeDeleteLesson();
        break;
      case "test":
        executeDeleteTest();
        break;
      case "question":
        executeDeleteQuestion();
        break;
      case "material":
        executeRemoveMaterial();
        break;
    }
    setDeletingItem(null);
  };

  const parseDateStringForPicker = (
    dateString: string | null | undefined
  ): Date | undefined => {
    if (!dateString) return undefined;
    try {
      const parsedDate = parseISO(dateString);
      if (isNaN(parsedDate.getTime())) {
        return undefined;
      }
      return parsedDate;
    } catch (e) {
      console.error("Invalid date string for parseISO:", dateString, e);
      return undefined;
    }
  };

  const sortedQuestions = useMemo(() => {
    return [...(testFormData.questions || [])].sort(
      (a, b) => (a.position || 0) - (b.position || 0)
    );
  }, [testFormData.questions]);

  const paginatedQuestions = useMemo(() => {
    return sortedQuestions.slice(
      (questionsPage - 1) * questionsPerPage,
      questionsPage * questionsPerPage
    );
  }, [sortedQuestions, questionsPage, questionsPerPage]);

  const totalQuestionPages = useMemo(() => {
    return Math.ceil((testFormData.questions?.length || 0) / questionsPerPage);
  }, [testFormData.questions, questionsPerPage]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {courseToEdit ? "Chỉnh sửa Khóa học" : "Thêm Khóa học Mới"}
            </DialogTitle>
            <DialogDescription>
              {courseToEdit
                ? "Cập nhật thông tin chi tiết cho khóa học."
                : "Điền thông tin để tạo khóa học mới."}
            </DialogDescription>
          </DialogHeader>
          <Accordion
            type="multiple"
            defaultValue={["item-1"]}
            className="w-full py-4"
          >
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-semibold text-gray-900 hover:text-orange-600 transition-colors">
                Thông tin chung
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                  <div className="md:col-span-2">
                    <Label htmlFor="title">
                      Tên khóa học <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="courseCode">Mã khóa học</Label>
                    <div className="flex gap-2">
                      <Input
                        id="courseCode"
                        value={formData.courseCode}
                        onChange={(e) =>
                          handleInputChange("courseCode", e.target.value)
                        }
                        placeholder="VD: CRSE001"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleInputChange("courseCode", generateCourseCode())
                        }
                        className="whitespace-nowrap"
                      >
                        Tạo tự động
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Nếu để trống, hệ thống sẽ tự động tạo mã khóa học
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="category">
                      Danh mục <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(v: Course["category"]) =>
                        handleInputChange("category", v)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="description">
                      Mô tả ngắn <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="objectives">
                      Mục tiêu đào tạo{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="objectives"
                      value={formData.objectives}
                      onChange={(e) =>
                        handleInputChange("objectives", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="instructor">
                      Giảng viên <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="instructor"
                      value={formData.instructor}
                      onChange={(e) =>
                        handleInputChange("instructor", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="learningType">Hình thức học</Label>
                    <Select
                      value={formData.learningType}
                      onValueChange={(v: "online") =>
                        handleInputChange("learningType", v)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn hình thức" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">Trực tuyến</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="sessions">
                      Số buổi học <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="sessions"
                      type="number"
                      value={formData.duration.sessions}
                      onChange={(e) =>
                        handleDurationChange("sessions", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="hoursPerSession">
                      Số giờ/buổi <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="hoursPerSession"
                      type="number"
                      step="0.5"
                      value={formData.duration.hoursPerSession}
                      onChange={(e) =>
                        handleDurationChange("hoursPerSession", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="startDate">Ngày bắt đầu</Label>
                    <DatePicker
                      date={parseDateStringForPicker(formData.startDate)}
                      setDate={(date) => {
                        handleInputChange(
                          "startDate",
                          date ? format(date, "yyyy-MM-dd") : null
                        );
                      }}
                      placeholder="Chọn ngày bắt đầu"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">Ngày kết thúc</Label>
                    <DatePicker
                      date={parseDateStringForPicker(formData.endDate)}
                      setDate={(date) => {
                        handleInputChange(
                          "endDate",
                          date ? format(date, "yyyy-MM-dd") : null
                        );
                      }}
                      placeholder="Chọn ngày kết thúc"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="location">
                      Địa điểm học (Link học trực tuyến)
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phòng ban</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start font-normal"
                        >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Chọn phòng ban ({formData.department?.length || 0})
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Tìm phòng ban..." />
                          <CommandList>
                            <CommandEmpty>
                              Không tìm thấy phòng ban.
                            </CommandEmpty>
                            <CommandGroup>
                              {departmentOptions.map((option) => (
                                <CommandItem
                                  key={option.value}
                                  onSelect={() => {
                                    const selected = formData.department || [];
                                    const isSelected = selected.includes(
                                      option.value
                                    );
                                    const newSelection = isSelected
                                      ? selected.filter(
                                          (id) => id !== option.value
                                        )
                                      : [...selected, option.value];
                                    handleInputChange(
                                      "department",
                                      newSelection
                                    );
                                  }}
                                >
                                  <Checkbox
                                    className="mr-2"
                                    checked={formData.department?.includes(
                                      option.value
                                    )}
                                  />
                                  <span>{option.label}</span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {formData.department
                        ?.map(
                          (id) =>
                            departmentOptions.find((opt) => opt.value === id)
                              ?.label
                        )
                        .filter(Boolean)
                        .map((label) => (
                          <Badge key={label} variant="secondary">
                            {label}
                          </Badge>
                        ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Cấp độ</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start font-normal"
                        >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Chọn cấp độ ({formData.level?.length || 0})
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Tìm cấp độ..." />
                          <CommandList>
                            <CommandEmpty>Không tìm thấy cấp độ.</CommandEmpty>
                            <CommandGroup>
                              {levelOptions.map((option) => (
                                <CommandItem
                                  key={option.value}
                                  onSelect={() => {
                                    const selected = formData.level || [];
                                    const isSelected = selected.includes(
                                      option.value
                                    );
                                    const newSelection = isSelected
                                      ? selected.filter(
                                          (id) => id !== option.value
                                        )
                                      : [...selected, option.value];
                                    handleInputChange("level", newSelection);
                                  }}
                                >
                                  <Checkbox
                                    className="mr-2"
                                    checked={formData.level?.includes(
                                      option.value
                                    )}
                                  />
                                  <span>{option.label}</span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {formData.level
                        ?.map(
                          (id) =>
                            levelOptions.find((opt) => opt.value === id)?.label
                        )
                        .filter(Boolean)
                        .map((label) => (
                          <Badge key={label} variant="secondary">
                            {label}
                          </Badge>
                        ))}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isPublic"
                        checked={formData.isPublic}
                        onCheckedChange={(c) =>
                          handleInputChange("isPublic", c === true)
                        }
                      />
                      <Label htmlFor="isPublic">Công khai khóa học này?</Label>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="course-image-upload">Ảnh khóa học</Label>
                    <div className="flex items-center gap-4 mt-1">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => courseImageInputRef.current?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" /> Tải ảnh lên
                      </Button>
                      <input
                        id="course-image-upload"
                        type="file"
                        ref={courseImageInputRef}
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      {courseImagePreview && (
                        <NextImage
                          src={courseImagePreview}
                          alt="Xem trước"
                          width={96}
                          height={64}
                          className="w-24 h-16 object-cover rounded border"
                          data-ai-hint="course thumbnail"
                        />
                      )}
                      {courseImagePreview && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (
                              courseImagePreview &&
                              courseImagePreview.startsWith("blob:")
                            )
                              URL.revokeObjectURL(courseImagePreview);
                            setCourseImagePreview(null);
                            setSelectedImageFile(null);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, GIF tối đa 5MB.
                    </p>
                  </div>

                  <div className="md:col-span-2 space-y-4 border-t pt-4">
                    <Label htmlFor="enrollmentType">Loại ghi danh</Label>
                    <Select
                      value={formData.enrollmentType}
                      onValueChange={(v: EnrollmentType) =>
                        handleInputChange("enrollmentType", v)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại ghi danh" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="optional">Tùy chọn</SelectItem>
                        <SelectItem value="mandatory">Bắt buộc</SelectItem>
                      </SelectContent>
                    </Select>
                    {formData.enrollmentType === "optional" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div>
                          <Label htmlFor="registrationStartDate">
                            Ngày bắt đầu đăng ký
                          </Label>
                          <DatePicker
                            date={parseDateStringForPicker(
                              formData.registrationStartDate
                            )}
                            setDate={(date) => {
                              handleInputChange(
                                "registrationStartDate",
                                date ? format(date, "yyyy-MM-dd") : null
                              );
                            }}
                            placeholder="Chọn ngày bắt đầu ĐK"
                          />
                        </div>
                        <div>
                          <Label htmlFor="registrationDeadline">
                            Hạn chót đăng ký
                          </Label>
                          <DatePicker
                            date={parseDateStringForPicker(
                              formData.registrationDeadline
                            )}
                            setDate={(date) => {
                              handleInputChange(
                                "registrationDeadline",
                                date ? format(date, "yyyy-MM-dd") : null
                              );
                            }}
                            placeholder="Chọn hạn đăng ký"
                          />
                        </div>
                      </div>
                    )}
                    {formData.enrollmentType === "mandatory" && (
                      <div>
                        <Label>Học viên được chỉ định</Label>
                        <div className="mt-1 p-3 border rounded-md bg-muted/30 min-h-[60px]">
                          {(formData.enrolledTrainees || []).length > 0 ? (
                            <ul className="list-disc list-inside text-sm space-y-1">
                              {(formData.enrolledTrainees || []).map((id) => (
                                <li key={id}>
                                  {getTraineeNameById(id)} (ID: {id})
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              Chưa có.
                            </p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={openTraineeSelectionDialog}
                        >
                          <Users className="mr-2 h-4 w-4" /> Chọn/Sửa
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2 pt-4">
                    <Label htmlFor="status">Trạng thái</Label>
                    <Select
                      value={String(formData.statusId || "")}
                      onValueChange={(v) =>
                        handleInputChange("statusId", parseInt(v))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        {courseStatuses.map((o) => (
                          <SelectItem key={o.id} value={String(o.id)}>
                            {o.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-semibold text-gray-900 hover:text-orange-600 transition-colors">
                Bài học
              </AccordionTrigger>
              <AccordionContent>
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
                      disabled={!isEditingExistingCourse}
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
                  ) : formData.lessons.length > 0 ? (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={formData.lessons.map((l) => l.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-2">
                          {formData.lessons.map((lesson) => (
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
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-semibold text-gray-900 hover:text-orange-600 transition-colors">
                Bài kiểm tra
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold flex items-center">
                      <FileQuestion className="mr-2 h-4 w-4 text-primary" /> Bài
                      kiểm tra
                    </Label>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        ref={testExcelImportInputRef}
                        className="hidden"
                        accept=".xlsx, .xls"
                        onChange={handleExcelFileImport}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleOpenAddTest}
                        disabled={!isEditingExistingCourse}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" /> Thêm bài kiểm
                        tra
                      </Button>
                    </div>
                  </div>
                  {(formData.tests || []).length > 0 ? (
                    <div className="space-y-2">
                      {(formData.tests || []).map((test) => (
                        <div
                          key={String(test.id)}
                          className="flex items-center justify-between p-2 border rounded-md"
                        >
                          <span className="text-sm">
                            {test.title} ({test.countQuestion || 0} câu hỏi)
                          </span>
                          <div className="space-x-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEditTest(test)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteExistingTest(test)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Chưa có bài kiểm tra.
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Điều kiện Đạt: Hoàn thành bài học &amp; đạt &gt;= 70% mỗi
                    bài kiểm tra.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg font-semibold text-gray-900 hover:text-orange-600 transition-colors">
                Tài liệu khóa học
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <input
                    type="file"
                    ref={materialFileInputRef}
                    className="hidden"
                    onChange={(e) => {
                      if (currentMaterialUploadIndex !== null) {
                        handleFileChange(e, currentMaterialUploadIndex);
                        setCurrentMaterialUploadIndex(null);
                      }
                    }}
                  />
                  {isLoadingAttachedFiles ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <p className="ml-2 text-muted-foreground">
                        Đang tải tài liệu...
                      </p>
                    </div>
                  ) : formData.materials.length > 0 ? (
                    <div className="space-y-3">
                      {formData.materials.map((material, index) => (
                        <div
                          key={material.id}
                          className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 border rounded-md bg-muted/30"
                        >
                          <div className="flex-shrink-0 self-center sm:self-start pt-1">
                            {renderMaterialIcon(material.type)}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-grow">
                            <Select
                              value={material.type || "Link"}
                              onValueChange={(v: CourseMaterialType) =>
                                handleMaterialDetailChange(index, "type", v)
                              }
                            >
                              <SelectTrigger className="w-full sm:w-[120px]">
                                <SelectValue placeholder="Loại" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PDF">PDF</SelectItem>
                                <SelectItem value="Link">Link</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              placeholder="Tiêu đề tài liệu"
                              value={material.title || ""}
                              onChange={(e) =>
                                handleMaterialDetailChange(
                                  index,
                                  "title",
                                  e.target.value
                                )
                              }
                            />
                            <div className="flex items-center gap-1">
                              <Input
                                placeholder="URL hoặc tải lên"
                                value={material.link || ""}
                                onChange={(e) =>
                                  handleMaterialDetailChange(
                                    index,
                                    "link",
                                    e.target.value
                                  )
                                }
                                readOnly={!!(material as any).__file}
                              />
                              {material.type === "PDF" && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentMaterialUploadIndex(index);
                                    if (materialFileInputRef.current) {
                                      materialFileInputRef.current.accept =
                                        ".pdf";
                                      materialFileInputRef.current.value = "";
                                      materialFileInputRef.current.click();
                                    }
                                  }}
                                >
                                  <Paperclip className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="sm:ml-auto flex-shrink-0"
                            onClick={() => handleRemoveMaterial(material)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-center text-muted-foreground py-2">
                      Chưa có tài liệu nào.
                    </p>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={handleAddMaterial}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" /> Thêm tài liệu
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <LoadingButton onClick={handleSubmit} isLoading={isSubmitting}>
              {courseToEdit ? "Lưu thay đổi" : "Thêm khóa học"}
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Universal Deletion Confirmation Dialog */}
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
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Xác nhận xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Chọn Học viên */}
      <Dialog open={isSelectingTrainees} onOpenChange={setIsSelectingTrainees}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chọn học viên</DialogTitle>
            <DialogDescription>
              Chọn các học viên sẽ được chỉ định cho khóa học này.
            </DialogDescription>
          </DialogHeader>
          <div className="relative mt-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên hoặc email..."
              value={traineeSearchTerm}
              onChange={(e) => setTraineeSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="max-h-[50vh] overflow-y-auto py-4 space-y-2">
            {filteredTrainees.length === 0 ? (
              <p className="text-sm text-center text-muted-foreground">
                Không tìm thấy học viên.
              </p>
            ) : (
              filteredTrainees.map((trainee) => (
                <div
                  key={trainee.id}
                  className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded-md"
                >
                  <Checkbox
                    id={`trainee-select-${trainee.id}`}
                    checked={tempSelectedTraineeIds.includes(trainee.id)}
                    onCheckedChange={(checked) => {
                      setTempSelectedTraineeIds((prev) =>
                        checked
                          ? [...prev, trainee.id]
                          : prev.filter((id) => id !== trainee.id)
                      );
                    }}
                  />
                  <Label
                    htmlFor={`trainee-select-${trainee.id}`}
                    className="cursor-pointer flex-grow"
                  >
                    {trainee.fullName} ({trainee.email})
                  </Label>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSelectingTrainees(false)}
            >
              Hủy
            </Button>
            <Button onClick={handleSaveTraineeSelection}>Lưu lựa chọn</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Bài học */}
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

      {/* Dialog Bài kiểm tra */}
      <Dialog
        open={isTestDialogOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) setIsTestDialogOpen(false);
        }}
      >
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto resize">
          <DialogHeader>
            <DialogTitle>
              {currentEditingTest
                ? "Chỉnh sửa Bài kiểm tra"
                : "Thêm Bài kiểm tra Mới"}
            </DialogTitle>
            <DialogDescription>
              Quản lý thông tin và câu hỏi cho bài kiểm tra.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <div className="grid gap-6 py-4 h-full overflow-y-auto pr-2">
              <div className="space-y-2">
                <Label htmlFor="testTitle">
                  Tiêu đề <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="testTitle"
                  value={testFormData.title || ""}
                  onChange={(e) =>
                    setTestFormData((p) => ({ ...p, title: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="testPassingScore">
                  Điểm đạt (%) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="testPassingScore"
                  type="number"
                  min={0}
                  max={100}
                  value={testFormData.passingScorePercentage || 70}
                  onChange={(e) =>
                    setTestFormData((p) => ({
                      ...p,
                      passingScorePercentage: parseInt(e.target.value) || 70,
                    }))
                  }
                />
              </div>

              {/* Phần Quản lý Câu hỏi */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold flex items-center">
                    <ListChecks className="mr-2 h-5 w-5 text-primary" /> Danh
                    sách Câu hỏi ({(testFormData.questions || []).length})
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => testExcelImportInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" /> Import Excel
                    </Button>
                    <input
                      type="file"
                      ref={testExcelImportInputRef}
                      className="hidden"
                      accept=".xlsx, .xls"
                      onChange={handleExcelFileImport}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenAddQuestion()}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" /> Thêm câu hỏi
                    </Button>
                  </div>
                </div>
                {isLoadingQuestions ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (testFormData.questions || []).length > 0 ? (
                  <>
                    <div className="space-y-2">
                      {paginatedQuestions.map((q, index) => {
                        const actualIndex =
                          (questionsPage - 1) * questionsPerPage + index;
                        return (
                          <div
                            key={String(q.id) || `q-${actualIndex}`}
                            className="flex items-start justify-between p-3 border rounded-md bg-muted/20 hover:bg-muted/30 transition-colors"
                          >
                            <div className="text-sm flex-1 pr-3">
                              <div className="font-medium mb-1">
                                {`Q${q.position ?? 0}`}
                              </div>
                              <div className="text-muted-foreground mb-2">
                                {q.text}
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {q.options.map((option, optIndex) => {
                                  const isCorrect =
                                    (q.correctAnswerIndexes &&
                                      q.correctAnswerIndexes.includes(
                                        optIndex
                                      )) ||
                                    optIndex === q.correctAnswerIndex;
                                  return (
                                    <span
                                      key={optIndex}
                                      className={`text-xs px-2 py-1 rounded ${
                                        isCorrect
                                          ? "bg-green-100 text-green-700 font-medium"
                                          : "bg-gray-100 text-gray-600"
                                      }`}
                                    >
                                      {String.fromCharCode(65 + optIndex)}:{" "}
                                      {option}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenEditQuestion(q)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDeleteQuestionFromTest(q)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {totalQuestionPages > 1 && (
                      <div className="flex items-center justify-between px-2 pt-2">
                        <div className="text-sm text-muted-foreground">
                          Hiển thị{" "}
                          {Math.min(
                            (questionsPage - 1) * questionsPerPage + 1,
                            sortedQuestions.length
                          )}{" "}
                          -{" "}
                          {Math.min(
                            questionsPage * questionsPerPage,
                            sortedQuestions.length
                          )}{" "}
                          trên tổng số {sortedQuestions.length} câu hỏi
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setQuestionsPage((p) => Math.max(1, p - 1))
                            }
                            disabled={questionsPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Trước
                          </Button>
                          <span className="text-sm">
                            Trang {questionsPage} / {totalQuestionPages}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setQuestionsPage((p) =>
                                Math.min(totalQuestionPages, p + 1)
                              )
                            }
                            disabled={questionsPage === totalQuestionPages}
                          >
                            Sau
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground italic text-center py-4">
                    Chưa có câu hỏi nào. Hãy thêm thủ công hoặc import từ Excel.
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsTestDialogOpen(false)}
            >
              Hủy
            </Button>
            <LoadingButton
              onClick={handleSaveOrUpdateTest}
              isLoading={
                createTestMutation.isPending ||
                updateTestMutation.isPending ||
                createQuestionMutation.isPending ||
                createQuestionSilentMutation.isPending ||
                createQuestionsSilentMutation.isPending ||
                updateQuestionMutation.isPending ||
                updateQuestionSilentMutation.isPending ||
                deleteQuestionMutation.isPending ||
                deleteQuestionSilentMutation.isPending
              }
            >
              Lưu Bài kiểm tra
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Câu hỏi (để thêm/sửa câu hỏi trong một Bài kiểm tra) */}
      <Dialog
        open={isQuestionDialogOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) setIsQuestionDialogOpen(false);
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {currentEditingQuestion
                ? "Chỉnh sửa Câu hỏi"
                : "Thêm Câu hỏi Mới"}
            </DialogTitle>
            <DialogDescription>
              Nhập thông tin chi tiết cho câu hỏi.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            {/* <div className="space-y-1">
              <Label htmlFor="questionCode">Mã câu hỏi (Tùy chọn)</Label>
              <Input
                id="questionCode"
                value={questionFormData.position || ""}
                onChange={(e) =>
                  setQuestionFormData((p) => ({
                    ...p,
                    questionCode: e.target.value,
                  }))
                }
              />
            </div> */}
            <div className="space-y-1">
              <Label htmlFor="questionText">
                Nội dung câu hỏi <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="questionText"
                value={questionFormData.text}
                onChange={(e) =>
                  setQuestionFormData((p) => ({ ...p, text: e.target.value }))
                }
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>
                Các lựa chọn trả lời <span className="text-destructive">*</span>
              </Label>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <Label htmlFor={`option${i}`} className="w-8 text-center">
                    {String.fromCharCode(65 + i)}
                  </Label>
                  <Input
                    id={`option${i}`}
                    value={questionFormData.options[i] || ""}
                    onChange={(e) => {
                      const newOptions = [...questionFormData.options];
                      newOptions[i] = e.target.value;
                      setQuestionFormData((p) => ({
                        ...p,
                        options: newOptions,
                      }));
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="space-y-1">
              <Label>
                Đáp án đúng <span className="text-destructive">*</span>
              </Label>
              <MultiSelect
                options={(questionFormData.options || [])
                  .map((opt, i) => ({
                    value: i.toString(),
                    label: `${String.fromCharCode(65 + i)}: ${opt}`,
                  }))
                  .filter((opt) =>
                    questionFormData.options?.[parseInt(opt.value)]?.trim()
                  )}
                selected={(questionFormData.correctAnswerIndexes || []).map(
                  (i) => i.toString()
                )}
                onChange={(values) => {
                  const indexes = values
                    .map((v) => parseInt(v))
                    .sort((a, b) => a - b);
                  setQuestionFormData((p) => ({
                    ...p,
                    correctAnswerIndexes: indexes,
                    // Update single correctAnswerIndex for backward compatibility
                    correctAnswerIndex: indexes.length > 0 ? indexes[0] : -1,
                  }));
                }}
                placeholder="Chọn đáp án đúng"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="explanation">Lời giải (Tùy chọn)</Label>
              <Textarea
                id="explanation"
                value={questionFormData.explanation || ""}
                onChange={(e) =>
                  setQuestionFormData((p) => ({
                    ...p,
                    explanation: e.target.value,
                  }))
                }
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsQuestionDialogOpen(false)}
            >
              Hủy
            </Button>
            <LoadingButton
              onClick={handleSaveOrUpdateQuestion}
              isLoading={
                createQuestionMutation.isPending ||
                updateQuestionMutation.isPending
              }
            >
              Lưu Câu hỏi
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
