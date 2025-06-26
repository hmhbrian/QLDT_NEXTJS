"use client";

import { useState, useEffect, useRef } from "react";
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
import { useToast } from "@/hooks/use-toast";
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
} from "lucide-react";
import NextImage from "next/image";
import { DatePicker } from "@/components/ui/datepicker";
import type {
  Course,
  TraineeLevel,
  Department,
  CourseMaterial,
  EnrollmentType,
  Lesson,
  Test,
  Question,
  LessonContentType,
} from "@/lib/types";
import { generateCourseCode } from "@/lib/utils/code-generator";
import {
  categoryOptions,
  departmentOptions,
  levelOptions,
  statusOptions,
  NO_DEPARTMENT_VALUE,
  NO_LEVEL_VALUE,
} from "@/lib/constants";
import { useUserStore } from "@/stores/user-store";
import { useError } from "@/hooks/use-error";
import * as XLSX from "xlsx";

// Trạng thái ban đầu cho các đối tượng lồng nhau
const initialDurationState = { sessions: 1, hoursPerSession: 2 };
const initialLessonState: Omit<Lesson, "id"> = {
  title: "",
  contentType: "text",
  content: "",
  duration: "",
};
const initialQuestionState: Omit<Question, "id"> = {
  questionCode: "",
  text: "",
  options: ["", "", "", ""],
  correctAnswerIndex: 0,
  explanation: "",
};
const initialTestState: Omit<Test, "id"> = {
  title: "",
  questions: [],
  passingScorePercentage: 70,
};
// Trạng thái ban đầu cho khóa học mới trong dialog
const initialNewCourseStateForDialog: Omit<
  Course,
  "id" | "createdAt" | "modifiedAt" | "createdBy" | "modifiedBy"
> = {
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
  status: "draft",
  department: [],
  level: [],
  materials: [],
  lessons: [],
  tests: [],
  enrollmentType: "optional",
  registrationDeadline: null,
  enrolledTrainees: [],
  isPublic: false,
};

interface CourseFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  courseToEdit?: Course | null;
  onSave: (
    courseData:
      | Course
      | Omit<
          Course,
          "id" | "createdAt" | "modifiedAt" | "createdBy" | "modifiedBy"
        >,
    isEditing: boolean
  ) => void;
}

export function CourseFormDialog({
  isOpen,
  onOpenChange,
  courseToEdit,
  onSave,
}: CourseFormDialogProps) {
  const { showError } = useError();
  const { toast } = useToast();
  const allUsers = useUserStore((state) => state.users);
  const trainees = allUsers.filter((u) => u.role === "HOCVIEN");

  const [formData, setFormData] = useState<
    | Course
    | Omit<
        Course,
        "id" | "createdAt" | "modifiedAt" | "createdBy" | "modifiedBy"
      >
  >(
    courseToEdit || initialNewCourseStateForDialog // Nếu có courseToEdit thì dùng nó, không thì dùng state ban đầu
  );

  const [courseImagePreview, setCourseImagePreview] = useState<string | null>(
    courseToEdit?.image || initialNewCourseStateForDialog.image // Ưu tiên ảnh của khóa học đang sửa
  );
  const courseImageInputRef = useRef<HTMLInputElement>(null);
  const materialFileInputRef = useRef<HTMLInputElement>(null);
  const lessonPdfInputRef = useRef<HTMLInputElement>(null);
  const testExcelImportInputRef = useRef<HTMLInputElement>(null);

  const [currentMaterialUploadIndex, setCurrentMaterialUploadIndex] = useState<
    number | null
  >(null);
  const [isSelectingTrainees, setIsSelectingTrainees] = useState(false);
  const [tempSelectedTraineeIds, setTempSelectedTraineeIds] = useState<
    string[]
  >([]);

  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [currentEditingLesson, setCurrentEditingLesson] =
    useState<Lesson | null>(null);
  const [lessonFormData, setLessonFormData] = useState<
    Omit<Lesson, "id"> & { __file?: File }
  >(initialLessonState);

  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [currentEditingTest, setCurrentEditingTest] = useState<Test | null>(
    null
  );
  const [testFormData, setTestFormData] =
    useState<Omit<Test, "id">>(initialTestState);

  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [currentEditingQuestion, setCurrentEditingQuestion] =
    useState<Question | null>(null);
  const [currentTestIdForQuestion, setCurrentTestIdForQuestion] = useState<
    string | null
  >(null);
  const [questionFormData, setQuestionFormData] =
    useState<Omit<Question, "id">>(initialQuestionState);

  // State cho pagination câu hỏi
  const [questionsPage, setQuestionsPage] = useState(1);
  const questionsPerPage = 5;

  useEffect(() => {
    if (isOpen) {
      if (courseToEdit) {
        // Nếu là chỉnh sửa khóa học
        setFormData({
          ...initialNewCourseStateForDialog,
          ...courseToEdit,
          materials: (courseToEdit.materials || []).map((m) => ({
            ...m,
            id: m.id || crypto.randomUUID(),
          })),
          lessons: (courseToEdit.lessons || []).map((l) => ({
            ...l,
            id: l.id || crypto.randomUUID(),
          })),
          tests: (courseToEdit.tests || []).map((t) => ({
            ...t,
            id: t.id || crypto.randomUUID(),
            questions: (t.questions || []).map((q) => ({
              ...q,
              id: q.id || crypto.randomUUID(),
            })),
          })),
        });
        setCourseImagePreview(courseToEdit.image);
        setTempSelectedTraineeIds(courseToEdit.enrolledTrainees || []);
      } else {
        // Nếu là thêm mới khóa học
        setFormData(initialNewCourseStateForDialog);
        setCourseImagePreview(initialNewCourseStateForDialog.image);
        setTempSelectedTraineeIds([]);
      }
      if (courseImageInputRef.current) courseImageInputRef.current.value = ""; // Reset input file ảnh
    }
  }, [isOpen, courseToEdit]);

  // Dọn dẹp các URL đối tượng (object URLs)
  useEffect(() => {
    return () => {
      if (courseImagePreview && courseImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(courseImagePreview);
      }
      formData.materials.forEach((material) => {
        if (
          material.url &&
          material.url.startsWith("blob:") &&
          material.__file
        ) {
          URL.revokeObjectURL(material.url);
        }
      });
      if (
        lessonFormData.content &&
        lessonFormData.content.startsWith("blob:") &&
        lessonFormData.__file
      ) {
        URL.revokeObjectURL(lessonFormData.content);
      }
    };
  }, [courseImagePreview, formData.materials, lessonFormData]);

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
      if (file.size > 5 * 1024 * 1024) {
        showError("FILE002");
        return;
      }
      if (!file.type.startsWith("image/")) {
        showError("FILE001");
        return;
      }
      if (courseImagePreview && courseImagePreview.startsWith("blob:"))
        URL.revokeObjectURL(courseImagePreview);
      const previewUrl = URL.createObjectURL(file);
      setCourseImagePreview(previewUrl);
      handleInputChange("image", previewUrl);
    }
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    field: number
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showError("FILE002");
        return;
      }
      const objectUrl = URL.createObjectURL(file);
      const newMaterials = [...formData.materials];
      if (newMaterials[field]) {
        if (
          newMaterials[field].url &&
          newMaterials[field].url.startsWith("blob:")
        ) {
          URL.revokeObjectURL(newMaterials[field].url);
        }
        newMaterials[field] = {
          ...newMaterials[field],
          url: objectUrl,
          __file: file,
        };
        handleInputChange("materials", newMaterials);
      }
    }
  };

  const handleAddMaterial = () => {
    // Hàm thêm tài liệu mới
    const newMaterial: CourseMaterial = {
      id: crypto.randomUUID(),
      type: "pdf",
      title: "",
      url: "",
    }; // Tạo đối tượng tài liệu mới
    handleInputChange("materials", [...formData.materials, newMaterial]); // Thêm vào danh sách tài liệu
  };

  const handleRemoveMaterial = (materialId: string) => {
    const materialToRemove = formData.materials.find(
      (m) => m.id === materialId
    );
    if (
      materialToRemove?.url &&
      materialToRemove.url.startsWith("blob:") &&
      materialToRemove.__file
    ) {
      URL.revokeObjectURL(materialToRemove.url);
    }
    handleInputChange(
      "materials",
      formData.materials.filter((m) => m.id !== materialId)
    );
  };

  const handleMaterialDetailChange = (
    index: number,
    field: keyof CourseMaterial,
    value: string
  ) => {
    const newMaterials = formData.materials.map((m, i) => {
      if (i === index) {
        const updatedMaterial = { ...m, [field]: value };
        if (
          field === "url" &&
          updatedMaterial.__file &&
          updatedMaterial.url !== value
        ) {
          // Nếu URL thay đổi và có file được tải lên trước đó
          if (updatedMaterial.url.startsWith("blob:"))
            URL.revokeObjectURL(updatedMaterial.url); // Thu hồi URL blob cũ
          updatedMaterial.__file = undefined; // Xóa file đã lưu
        } else if (field === "type") {
          // Nếu loại tài liệu thay đổi
          const oldType = m.type; // Loại cũ
          const newType = value as CourseMaterial["type"]; // Loại mới
          if (
            (oldType === "pdf" || oldType === "slide") &&
            newType !== "pdf" &&
            newType !== "slide" &&
            updatedMaterial.__file
          ) {
            // Nếu từ PDF/Slide sang loại khác và có file
            if (updatedMaterial.url.startsWith("blob:"))
              URL.revokeObjectURL(updatedMaterial.url);
            updatedMaterial.url = ""; // Xóa URL
            updatedMaterial.__file = undefined; // Xóa file
          } else if (
            (newType === "video" || newType === "link") &&
            updatedMaterial.__file
          ) {
            // Nếu sang Video/Link và có file
            if (updatedMaterial.url.startsWith("blob:"))
              URL.revokeObjectURL(updatedMaterial.url);
            updatedMaterial.url = newType === oldType ? m.url : "";
            updatedMaterial.__file = undefined;
          } else if (
            (newType === "pdf" || newType === "slide") &&
            (oldType === "video" || oldType === "link")
          ) {
            // Nếu từ Video/Link sang PDF/Slide
            updatedMaterial.url = "";
            updatedMaterial.__file = undefined;
          }
        }
        return updatedMaterial;
      }
      return m;
    });
    handleInputChange("materials", newMaterials);
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

  // Quản lý Bài học
  const handleOpenAddLesson = () => {
    setCurrentEditingLesson(null);
    setLessonFormData(initialLessonState);
    setIsLessonDialogOpen(true);
  }; // Mở dialog thêm bài học
  const handleOpenEditLesson = (lesson: Lesson) => {
    setCurrentEditingLesson(lesson);
    setLessonFormData({ ...lesson, __file: undefined });
    setIsLessonDialogOpen(true);
  };

  const handleLessonPdfUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showError("FILE002");
        return;
      }
      if (file.type !== "application/pdf") {
        showError("FILE001");
        return;
      }
      if (
        lessonFormData.content &&
        lessonFormData.content.startsWith("blob:") &&
        lessonFormData.__file
      )
        URL.revokeObjectURL(lessonFormData.content);
      const blobUrl = URL.createObjectURL(file);
      setLessonFormData((prev) => ({
        ...prev,
        content: blobUrl,
        __file: file,
      }));
      if (lessonPdfInputRef.current) lessonPdfInputRef.current.value = "";
    }
  };

  const handleSaveOrUpdateLesson = () => {
    if (!lessonFormData.title) {
      showError("FORM001");
      return;
    }
    let updatedLessons: Lesson[];
    const lessonToSave: Omit<Lesson, "id"> = {
      title: lessonFormData.title,
      contentType: lessonFormData.contentType,
      content: lessonFormData.content,
      duration: lessonFormData.duration,
    };

    if (currentEditingLesson) {
      updatedLessons = (formData.lessons || []).map((l) =>
        l.id === currentEditingLesson.id
          ? { ...currentEditingLesson, ...lessonToSave }
          : l
      );
    } else {
      updatedLessons = [
        ...(formData.lessons || []),
        { id: crypto.randomUUID(), ...lessonToSave },
      ];
    }
    handleInputChange("lessons", updatedLessons);
    setIsLessonDialogOpen(false);
  };

  const handleDeleteExistingLesson = (lessonId: string) => {
    handleInputChange(
      "lessons",
      (formData.lessons || []).filter((l) => l.id !== lessonId)
    );
  };

  // Quản lý Bài kiểm tra
  const handleOpenAddTest = () => {
    setCurrentEditingTest(null);
    setTestFormData(initialTestState);
    setQuestionsPage(1); // Reset pagination
    setIsTestDialogOpen(true);
  }; // Mở dialog thêm bài kiểm tra
  const handleOpenEditTest = (test: Test) => {
    setCurrentEditingTest(test);
    setTestFormData({
      title: test.title,
      questions: test.questions || [],
      passingScorePercentage: test.passingScorePercentage,
    });
    setQuestionsPage(1); // Reset pagination
    setIsTestDialogOpen(true);
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
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as (
          | string
          | number
          | null
        )[][];

        if (jsonData.length < 2) {
          showError("FILE001");
          return;
        }

        // Lấy header từ dòng đầu tiên và chuyển về chữ thường
        const headers = (jsonData[0] as string[]).map(
          (h) => h?.toString().trim().toLowerCase() || ""
        );
        const questions: Question[] = [];

        // Xác định vị trí các cột dựa trên tiêu đề
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

        // Kiểm tra các cột bắt buộc
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

        // Xử lý từng dòng dữ liệu
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length === 0) continue;

          // Lấy các giá trị từ hàng
          const code =
            headerMap.code !== -1
              ? row[headerMap.code]?.toString().trim() || `Q${i}`
              : `Q${i}`;
          const question = row[headerMap.question]?.toString().trim();
          const correctAnswerLabel = row[headerMap.correctAnswer]
            ?.toString()
            .trim();
          const explanation =
            headerMap.explanation !== -1
              ? row[headerMap.explanation]?.toString().trim()
              : "";

          const optionA =
            headerMap.optionA !== -1
              ? row[headerMap.optionA]?.toString().trim()
              : "";
          const optionB =
            headerMap.optionB !== -1
              ? row[headerMap.optionB]?.toString().trim()
              : "";
          const optionC =
            headerMap.optionC !== -1
              ? row[headerMap.optionC]?.toString().trim()
              : "";
          const optionD =
            headerMap.optionD !== -1
              ? row[headerMap.optionD]?.toString().trim()
              : "";

          // Kiểm tra dữ liệu hợp lệ
          if (!question || !correctAnswerLabel || !optionA || !optionB) {
            console.warn(`Bỏ qua dòng ${i + 1} do thiếu dữ liệu bắt buộc.`);
            continue;
          }

          // Tạo mảng các lựa chọn, chỉ giữ lại các option không rỗng
          const options = [optionA, optionB];
          if (optionC) options.push(optionC);
          if (optionD) options.push(optionD);

          // Xác định chỉ số đáp án đúng
          let correctAnswerIndex = 0;

          // Có thể là số (1,2,3,4) hoặc chữ cái (A,B,C,D)
          if (/^\d+$/.test(correctAnswerLabel)) {
            // Nếu là số, chuyển về index (0-based)
            correctAnswerIndex = parseInt(correctAnswerLabel) - 1;
          } else {
            // Nếu là chữ cái, chuyển về index (A=0, B=1, etc.)
            const upperLabel = correctAnswerLabel.toUpperCase();
            const labelMap: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
            correctAnswerIndex = labelMap[upperLabel] || 0;
          }

          // Kiểm tra tính hợp lệ của đáp án
          if (correctAnswerIndex < 0 || correctAnswerIndex >= options.length) {
            console.warn(`Đáp án đúng không hợp lệ ở dòng ${i + 1}. Đặt về 0.`);
            correctAnswerIndex = 0;
          }

          // Thêm câu hỏi mới
          questions.push({
            id: crypto.randomUUID(),
            questionCode: code,
            text: question,
            options: options,
            correctAnswerIndex: correctAnswerIndex,
            explanation: explanation,
          });
        }

        if (questions.length === 0) {
          showError("FILE001");
          return;
        }

        // Cập nhật state với các câu hỏi mới
        setTestFormData((prev) => ({
          ...prev,
          questions: [...prev.questions, ...questions],
        }));

        // Reset trang về cuối để hiển thị câu hỏi mới import
        const totalQuestions = testFormData.questions.length + questions.length;
        const lastPage = Math.ceil(totalQuestions / questionsPerPage);
        setQuestionsPage(lastPage);

        showError("SUCCESS006"); // Thông báo thành công
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

  const handleSaveOrUpdateTest = () => {
    if (!testFormData.title) {
      showError("FORM001");
      return;
    }
    let updatedTests: Test[];
    if (currentEditingTest) {
      updatedTests = (formData.tests || []).map((t) =>
        t.id === currentEditingTest.id
          ? { ...currentEditingTest, ...testFormData }
          : t
      );
    } else {
      const newTestWithId = { ...testFormData, id: crypto.randomUUID() };
      updatedTests = [...(formData.tests || []), newTestWithId];
    }
    handleInputChange("tests", updatedTests);
    setIsTestDialogOpen(false);
  };

  const handleDeleteExistingTest = (testId: string) => {
    handleInputChange(
      "tests",
      (formData.tests || []).filter((t) => t.id !== testId)
    );
  };

  // Quản lý Câu hỏi (bên trong Dialog Bài kiểm tra)
  const handleOpenAddQuestion = (testId: string) => {
    // Mở dialog thêm câu hỏi
    setCurrentTestIdForQuestion(testId);
    setCurrentEditingQuestion(null);
    setQuestionFormData(initialQuestionState);
    setIsQuestionDialogOpen(true);
  };

  const handleOpenEditQuestion = (question: Question, testId: string) => {
    setCurrentTestIdForQuestion(testId);
    setCurrentEditingQuestion(question);
    setQuestionFormData({ ...question });
    setIsQuestionDialogOpen(true);
  };

  const handleSaveOrUpdateQuestion = () => {
    if (
      !questionFormData.text ||
      questionFormData.options.some((opt) => !opt.trim()) ||
      questionFormData.correctAnswerIndex < 0
    ) {
      showError("FORM001");
      return;
    }
    if (!currentTestIdForQuestion) return;

    const updatedTests = (formData.tests || []).map((test) => {
      if (test.id === currentTestIdForQuestion) {
        let updatedQuestions: Question[];
        if (currentEditingQuestion) {
          updatedQuestions = (test.questions || []).map((q) =>
            q.id === currentEditingQuestion.id
              ? { ...currentEditingQuestion, ...questionFormData }
              : q
          );
        } else {
          updatedQuestions = [
            ...(test.questions || []),
            { id: crypto.randomUUID(), ...questionFormData },
          ];
        }
        return { ...test, questions: updatedQuestions };
      }
      return test;
    });
    handleInputChange("tests", updatedTests);
    // Cập nhật testFormData nếu bài kiểm tra hiện tại đang được chỉnh sửa
    if (
      currentEditingTest &&
      currentEditingTest.id === currentTestIdForQuestion
    ) {
      const targetTest = updatedTests.find(
        (t) => t.id === currentTestIdForQuestion
      ); // Tìm bài kiểm tra mục tiêu
      if (targetTest) {
        // Nếu tìm thấy
        setTestFormData((prev) => ({
          ...prev,
          questions: targetTest.questions,
        })); // Cập nhật câu hỏi
      }
    }
    setIsQuestionDialogOpen(false);
  };

  const handleDeleteQuestionFromTest = (questionId: string, testId: string) => {
    const updatedTests = (formData.tests || []).map((test) => {
      if (test.id === testId) {
        return {
          ...test,
          questions: (test.questions || []).filter((q, index) => {
            // Ưu tiên xóa theo id nếu có
            if (q.id && q.id !== questionId) {
              return true;
            }
            // Fallback: xóa theo index nếu id là temp hoặc không có
            if (questionId.startsWith("temp-")) {
              const tempIndex = parseInt(questionId.replace("temp-", ""));
              return index !== tempIndex;
            }
            // Nếu không có id, xóa theo id truyền vào
            return q.id !== questionId;
          }),
        };
      }
      return test;
    });

    handleInputChange("tests", updatedTests);

    // Cập nhật testFormData nếu bài kiểm tra hiện tại đang được chỉnh sửa
    if (currentEditingTest && currentEditingTest.id === testId) {
      const targetTest = updatedTests.find((t) => t.id === testId);
      if (targetTest) {
        setTestFormData((prev) => ({
          ...prev,
          questions: targetTest.questions,
        })); // Cập nhật câu hỏi
      }
    }
  };

  const handleSubmit = async () => {
    // Frontend validation - chỉ kiểm tra cơ bản
    const validationErrors: string[] = [];

    if (!formData.title?.trim()) {
      validationErrors.push("Tên khóa học là bắt buộc");
    }

    if (!formData.courseCode?.trim()) {
      validationErrors.push("Mã khóa học là bắt buộc");
    }

    if (!formData.description?.trim()) {
      validationErrors.push("Mô tả khóa học là bắt buộc");
    }

    if (!formData.objectives?.trim()) {
      validationErrors.push("Mục tiêu khóa học là bắt buộc");
    }

    // Hiển thị lỗi frontend nếu có
    if (validationErrors.length > 0) {
      toast({
        title: "Thiếu thông tin bắt buộc",
        description: validationErrors.join(", "),
        variant: "destructive",
      });
      return;
    }

    // Tự động tạo mã khóa học nếu chưa có
    const finalFormData = {
      ...formData,
      courseCode: formData.courseCode || generateCourseCode(),
      image: courseImagePreview || formData.image,
    };

    try {
      await onSave(finalFormData, !!courseToEdit);
      onOpenChange(false); // Chỉ đóng dialog khi thành công
    } catch (error) {
      // Backend validation errors sẽ được hiển thị từ hook mutation
      console.error("Save failed:", error);
    }
  };

  const renderMaterialIcon = (type: CourseMaterial["type"]) => {
    switch (type) {
      case "pdf":
        return <FileQuestion className="h-4 w-4 text-red-500" />;
      case "slide":
        return <Library className="h-4 w-4 text-yellow-500" />;
      case "video":
        return <Users className="h-4 w-4 text-blue-500" />; // Icon video
      case "link":
        return <Upload className="h-4 w-4 text-gray-500" />; // Icon link
      default:
        return <FileQuestion className="h-4 w-4" />; // Icon mặc định
    }
  };

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
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="md:col-span-2">
                <Label htmlFor="title">
                  Tên khóa học <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
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
                  Mục tiêu đào tạo <span className="text-destructive">*</span>
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
                  date={
                    formData.startDate
                      ? new Date(formData.startDate)
                      : undefined
                  }
                  setDate={(date) => {
                    if (date) {
                      // Sử dụng local date thay vì UTC để tránh lỗi múi giờ
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(
                        2,
                        "0"
                      );
                      const day = String(date.getDate()).padStart(2, "0");
                      const localDateString = `${year}-${month}-${day}`;
                      handleInputChange("startDate", localDateString);
                    } else {
                      handleInputChange("startDate", null);
                    }
                  }}
                  placeholder="Chọn ngày bắt đầu"
                />
              </div>
              <div>
                <Label htmlFor="endDate">Ngày kết thúc</Label>
                <DatePicker
                  date={
                    formData.endDate ? new Date(formData.endDate) : undefined
                  }
                  setDate={(date) => {
                    if (date) {
                      // Sử dụng local date thay vì UTC để tránh lỗi múi giờ
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(
                        2,
                        "0"
                      );
                      const day = String(date.getDate()).padStart(2, "0");
                      const localDateString = `${year}-${month}-${day}`;
                      handleInputChange("endDate", localDateString);
                    } else {
                      handleInputChange("endDate", null);
                    }
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
              <div>
                <Label htmlFor="department">Đối tượng: Phòng ban</Label>
                <Select
                  value={
                    formData.department && formData.department.length > 0
                      ? formData.department[0]
                      : NO_DEPARTMENT_VALUE
                  }
                  onValueChange={(v) =>
                    handleInputChange(
                      "department",
                      v && v !== NO_DEPARTMENT_VALUE ? [v as Department] : []
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phòng ban" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_DEPARTMENT_VALUE}>
                      Không chọn
                    </SelectItem>
                    {departmentOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="level">Đối tượng: Cấp bậc</Label>
                <Select
                  value={
                    formData.level && formData.level.length > 0
                      ? formData.level[0]
                      : NO_LEVEL_VALUE
                  }
                  onValueChange={(v) =>
                    handleInputChange(
                      "level",
                      v && v !== NO_LEVEL_VALUE ? [v as TraineeLevel] : []
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn cấp độ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_LEVEL_VALUE}>Không chọn</SelectItem>
                    {levelOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  {courseImagePreview &&
                    courseImagePreview !==
                      "https://placehold.co/600x400.png" && (
                      <NextImage
                        src={courseImagePreview}
                        alt="Xem trước"
                        width={96}
                        height={64}
                        className="w-24 h-16 object-cover rounded border"
                        data-ai-hint="course thumbnail"
                      />
                    )}
                  {courseImagePreview &&
                    courseImagePreview !==
                      "https://placehold.co/600x400.png" && (
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
                          setCourseImagePreview(
                            initialNewCourseStateForDialog.image
                          );
                          handleInputChange(
                            "image",
                            initialNewCourseStateForDialog.image
                          );
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
                  <div>
                    <Label htmlFor="registrationDeadline">
                      Hạn chót đăng ký
                    </Label>
                    <DatePicker
                      date={
                        formData.registrationDeadline
                          ? new Date(formData.registrationDeadline)
                          : undefined
                      }
                      setDate={(date) => {
                        if (date) {
                          // Sử dụng local date thay vì UTC để tránh lỗi múi giờ
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(
                            2,
                            "0"
                          );
                          const day = String(date.getDate()).padStart(2, "0");
                          const localDateString = `${year}-${month}-${day}`;
                          handleInputChange(
                            "registrationDeadline",
                            localDateString
                          );
                        } else {
                          handleInputChange("registrationDeadline", null);
                        }
                      }}
                      placeholder="Chọn hạn đăng ký"
                    />
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

              {/* Phần Bài học */}
              <div className="md:col-span-2 space-y-3 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold flex items-center">
                    <Library className="mr-2 h-5 w-5 text-primary" /> Bài học
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleOpenAddLesson}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Thêm bài học
                  </Button>
                </div>
                {(formData.lessons || []).length > 0 ? (
                  <div className="space-y-2">
                    {(formData.lessons || []).map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between p-2 border rounded-md"
                      >
                        <span className="text-sm">
                          {lesson.title} ({lesson.contentType})
                        </span>
                        <div className="space-x-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEditLesson(lesson)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() =>
                              handleDeleteExistingLesson(lesson.id)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Chưa có bài học.
                  </p>
                )}
              </div>

              {/* Phần Bài kiểm tra */}
              <div className="md:col-span-2 space-y-3 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold flex items-center">
                    <FileQuestion className="mr-2 h-5 w-5 text-primary" /> Bài
                    kiểm tra
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleOpenAddTest}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Thêm bài kiểm tra
                  </Button>
                </div>
                {(formData.tests || []).length > 0 ? (
                  <div className="space-y-2">
                    {(formData.tests || []).map((test) => (
                      <div
                        key={test.id}
                        className="flex items-center justify-between p-2 border rounded-md"
                      >
                        <span className="text-sm">
                          {test.title} ({test.questions.length} câu hỏi)
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
                            onClick={() => handleDeleteExistingTest(test.id)}
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
                  Điều kiện Đạt: Hoàn thành bài học & đạt &gt;= 70% mỗi bài kiểm
                  tra.
                </p>
              </div>

              {/* Phần Tài liệu */}
              <div className="md:col-span-2 space-y-3 border-t pt-4">
                <Label>Tài liệu khóa học</Label>
                <input
                  type="file"
                  ref={materialFileInputRef}
                  className="hidden"
                  onChange={(e) => {
                    if (currentMaterialUploadIndex !== null) {
                      handleFileChange(e, currentMaterialUploadIndex);
                      setCurrentMaterialUploadIndex(null); // Đặt lại sau khi xử lý
                    }
                  }}
                />
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
                        value={material.type}
                        onValueChange={(v: CourseMaterial["type"]) =>
                          handleMaterialDetailChange(index, "type", v)
                        }
                      >
                        <SelectTrigger className="w-full sm:w-[120px]">
                          <SelectValue placeholder="Loại" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="slide">Slide</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="link">Link</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Tiêu đề tài liệu"
                        value={material.title}
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
                          value={material.url}
                          onChange={(e) =>
                            handleMaterialDetailChange(
                              index,
                              "url",
                              e.target.value
                            )
                          }
                          readOnly={!!material.__file}
                        />
                        {(material.type === "pdf" ||
                          material.type === "slide") && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentMaterialUploadIndex(index);
                              if (materialFileInputRef.current) {
                                materialFileInputRef.current.accept =
                                  material.type === "pdf"
                                    ? ".pdf"
                                    : ".ppt, .pptx, .key, .pdf"; // Đặt loại file chấp nhận
                                materialFileInputRef.current.value = ""; // Xóa giá trị cũ để đảm bảo sự kiện onChange được kích hoạt
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
                      onClick={() => handleRemoveMaterial(material.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
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

              {courseToEdit && (
                <div className="md:col-span-2">
                  <Label htmlFor="status">Trạng thái</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v: Course["status"]) =>
                      handleInputChange("status", v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button onClick={handleSubmit}>
              {courseToEdit ? "Lưu thay đổi" : "Thêm khóa học"}
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
          <div className="max-h-[60vh] overflow-y-auto py-4 space-y-2">
            {trainees.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Không có học viên.
              </p>
            )}
            {trainees.map((trainee) => (
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
            ))}
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
      <Dialog
        open={isLessonDialogOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) setIsLessonDialogOpen(false);
        }}
      >
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
                value={lessonFormData.title}
                onChange={(e) =>
                  setLessonFormData((p) => ({ ...p, title: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lessonContentType">Loại nội dung</Label>
              <Select
                value={lessonFormData.contentType}
                onValueChange={(v: LessonContentType) =>
                  setLessonFormData((p) => ({
                    ...p,
                    contentType: v,
                    content: "",
                    __file: undefined,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Chữ (Text/Markdown)</SelectItem>
                  <SelectItem value="video_url">Video URL</SelectItem>
                  <SelectItem value="pdf_url">
                    PDF (URL hoặc Tải lên)
                  </SelectItem>
                  <SelectItem value="slide_url">Slide URL</SelectItem>
                  <SelectItem value="external_link">Link ngoài</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lessonContent">
                Nội dung / URL <span className="text-destructive">*</span>
              </Label>
              {lessonFormData.contentType === "text" ? (
                <Textarea
                  id="lessonContent"
                  value={lessonFormData.content}
                  onChange={(e) =>
                    setLessonFormData((p) => ({
                      ...p,
                      content: e.target.value,
                    }))
                  }
                  rows={5}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    id="lessonContent"
                    value={lessonFormData.content}
                    onChange={(e) =>
                      setLessonFormData((p) => ({
                        ...p,
                        content: e.target.value,
                        __file: undefined,
                      }))
                    }
                    readOnly={
                      !!lessonFormData.__file &&
                      lessonFormData.contentType === "pdf_url"
                    }
                  />
                  {lessonFormData.contentType === "pdf_url" && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => lessonPdfInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                      <input
                        type="file"
                        ref={lessonPdfInputRef}
                        accept=".pdf"
                        onChange={handleLessonPdfUpload}
                        className="hidden"
                      />
                    </>
                  )}
                </div>
              )}
              {lessonFormData.contentType === "pdf_url" &&
                lessonFormData.__file && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Đã tải lên: {lessonFormData.__file.name}
                  </p>
                )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lessonDuration">Thời lượng</Label>
              <Input
                id="lessonDuration"
                value={lessonFormData.duration || ""}
                onChange={(e) =>
                  setLessonFormData((p) => ({ ...p, duration: e.target.value }))
                }
                placeholder="VD: 30 phút"
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
            <Button onClick={handleSaveOrUpdateLesson}>Lưu Bài học</Button>
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
                  value={testFormData.title}
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
                  value={testFormData.passingScorePercentage}
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
                    sách Câu hỏi
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
                      onClick={() =>
                        handleOpenAddQuestion(currentEditingTest?.id || "")
                      }
                      disabled={!currentEditingTest && !isTestDialogOpen}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" /> Thêm câu hỏi
                    </Button>
                  </div>
                </div>
                {(testFormData.questions || []).length > 0 ? (
                  <>
                    <div className="space-y-2">
                      {(testFormData.questions || [])
                        .slice(
                          (questionsPage - 1) * questionsPerPage,
                          questionsPage * questionsPerPage
                        )
                        .map((q, index) => {
                          const actualIndex =
                            (questionsPage - 1) * questionsPerPage + index;
                          return (
                            <div
                              key={q.id || actualIndex}
                              className="flex items-start justify-between p-3 border rounded-md bg-muted/20 hover:bg-muted/30 transition-colors"
                            >
                              <div className="text-sm flex-1 pr-3">
                                <div className="font-medium mb-1">
                                  {q.questionCode || `Q${actualIndex + 1}`}
                                </div>
                                <div className="text-muted-foreground mb-2">
                                  {q.text}
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {q.options.map((option, optIndex) => (
                                    <span
                                      key={optIndex}
                                      className={`text-xs px-2 py-1 rounded ${
                                        optIndex === q.correctAnswerIndex
                                          ? "bg-green-100 text-green-700 font-medium"
                                          : "bg-gray-100 text-gray-600"
                                      }`}
                                    >
                                      {String.fromCharCode(65 + optIndex)}:{" "}
                                      {option}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleOpenEditQuestion(
                                      q,
                                      currentEditingTest?.id || ""
                                    )
                                  }
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() =>
                                    handleDeleteQuestionFromTest(
                                      q.id || `temp-${actualIndex}`,
                                      currentEditingTest?.id || ""
                                    )
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    {/* Pagination cho câu hỏi */}
                    {(testFormData.questions || []).length >
                      questionsPerPage && (
                      <div className="flex items-center justify-between px-2">
                        <div className="text-sm text-muted-foreground">
                          Hiển thị{" "}
                          {Math.min(
                            (questionsPage - 1) * questionsPerPage + 1,
                            testFormData.questions.length
                          )}{" "}
                          -{" "}
                          {Math.min(
                            questionsPage * questionsPerPage,
                            testFormData.questions.length
                          )}{" "}
                          trong tổng số {testFormData.questions.length} câu hỏi
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
                            Trang {questionsPage} /{" "}
                            {Math.ceil(
                              testFormData.questions.length / questionsPerPage
                            )}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setQuestionsPage((p) =>
                                Math.min(
                                  Math.ceil(
                                    testFormData.questions.length /
                                      questionsPerPage
                                  ),
                                  p + 1
                                )
                              )
                            }
                            disabled={
                              questionsPage ===
                              Math.ceil(
                                testFormData.questions.length / questionsPerPage
                              )
                            }
                          >
                            Sau
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
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
            <Button onClick={handleSaveOrUpdateTest}>Lưu Bài kiểm tra</Button>
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
            <div className="space-y-1">
              <Label htmlFor="questionCode">Mã câu hỏi (Tùy chọn)</Label>
              <Input
                id="questionCode"
                value={questionFormData.questionCode || ""}
                onChange={(e) =>
                  setQuestionFormData((p) => ({
                    ...p,
                    questionCode: e.target.value,
                  }))
                }
              />
            </div>
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
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="space-y-1">
                <Label htmlFor={`option${i}`}>
                  Đáp án {String.fromCharCode(65 + i)}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={`option${i}`}
                  value={questionFormData.options[i] || ""}
                  onChange={(e) => {
                    const newOptions = [...questionFormData.options];
                    newOptions[i] = e.target.value;
                    setQuestionFormData((p) => ({ ...p, options: newOptions }));
                  }}
                />
              </div>
            ))}
            <div className="space-y-1">
              <Label htmlFor="correctAnswerIndex">
                Đáp án đúng <span className="text-destructive">*</span>
              </Label>
              <Select
                value={questionFormData.correctAnswerIndex.toString()}
                onValueChange={(v) =>
                  setQuestionFormData((p) => ({
                    ...p,
                    correctAnswerIndex: parseInt(v),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn đáp án đúng" />
                </SelectTrigger>
                <SelectContent>
                  {questionFormData.options.map(
                    (opt, i) =>
                      opt.trim() && (
                        <SelectItem key={i} value={i.toString()}>
                          Đáp án {String.fromCharCode(65 + i)}
                        </SelectItem>
                      )
                  )}
                </SelectContent>
              </Select>
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
            <Button onClick={handleSaveOrUpdateQuestion}>Lưu Câu hỏi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
