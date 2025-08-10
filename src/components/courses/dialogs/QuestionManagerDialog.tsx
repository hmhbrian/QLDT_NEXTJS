
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  PlusCircle,
  Upload,
  Edit,
  Trash2,
  ListChecks,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import type { Test, Question } from "@/lib/types/test.types";
import { useError } from "@/hooks/use-error";
import * as XLSX from "xlsx";
import { LoadingButton } from "@/components/ui/loading";
import {
  useQuestions,
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
  useCreateQuestionsSilent,
} from "@/hooks/use-questions";
import { mapUiQuestionToApiPayload } from "@/lib/mappers/question.mapper";
import { MultiSelect } from "@/components/ui/multi-select";

const initialQuestionState: Omit<Question, "id"> = {
  questionCode: "",
  text: "",
  options: ["", "", "", ""],
  correctAnswerIndex: -1,
  correctAnswerIndexes: [],
  explanation: "",
  position: 0,
};

type DeletingItem = {
  type: "question";
  id: string | number;
  name: string;
};

interface QuestionManagerDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  courseId: string;
  initialTestState: Partial<Test>;
  onSave: (testData: Partial<Test>) => Promise<void>;
  isSavingTest: boolean;
}

export function QuestionManagerDialog({
  isOpen,
  onOpenChange,
  courseId,
  initialTestState,
  onSave,
  isSavingTest,
}: QuestionManagerDialogProps) {
  const { showError } = useError();
  const { toast } = useToast();

  const [testFormData, setTestFormData] =
    useState<Partial<Test>>(initialTestState);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [currentEditingQuestion, setCurrentEditingQuestion] =
    useState<Question | null>(null);
  const [questionFormData, setQuestionFormData] =
    useState<Omit<Question, "id">>(initialQuestionState);
  const [questionsPage, setQuestionsPage] = useState(1);
  const [deletingItem, setDeletingItem] = useState<DeletingItem | null>(null);

  const testExcelImportInputRef = useRef<HTMLInputElement>(null);
  const questionsPerPage = 10;

  const testId =
    typeof initialTestState.id === "number" ? initialTestState.id : undefined;
  const isEditingExistingTest = testId !== undefined;

  const {
    questions: fetchedQuestions,
    isLoading: isLoadingQuestions,
  } = useQuestions(testId);

  const createQuestionMutation = useCreateQuestion();
  const updateQuestionMutation = useUpdateQuestion();
  const deleteQuestionMutation = useDeleteQuestion();
  const createQuestionsSilentMutation = useCreateQuestionsSilent();

  useEffect(() => {
    if (isOpen) {
      setTestFormData((prev) => ({
        ...initialTestState,
        timeTest:
          initialTestState.timeTest === 0 ||
          initialTestState.timeTest === undefined
            ? 30
            : initialTestState.timeTest,
      }));
      setQuestionsPage(1);
    }
  }, [isOpen, initialTestState]);

  useEffect(() => {
    if (isEditingExistingTest && !isLoadingQuestions && isOpen) {
      setTestFormData((prev) => ({
        ...prev,
        questions: fetchedQuestions,
        countQuestion: fetchedQuestions.length,
      }));
    }
  }, [isEditingExistingTest, fetchedQuestions, isLoadingQuestions, isOpen]);

  const handleOpenAddQuestion = () => {
    setCurrentEditingQuestion(null);
    setQuestionFormData(initialQuestionState);
    setIsQuestionDialogOpen(true);
  };

  const handleOpenEditQuestion = (question: Question) => {
    setCurrentEditingQuestion(question);
    setQuestionFormData({ ...initialQuestionState, ...question });
    setIsQuestionDialogOpen(true);
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

    // "Instant Save" logic for existing tests
    if (isEditingExistingTest && testId) {
      const payload = mapUiQuestionToApiPayload(questionFormData as Question);
      if (
        currentEditingQuestion &&
        typeof currentEditingQuestion.id === "number"
      ) {
        await updateQuestionMutation.mutateAsync({
          testId: testId,
          questionId: currentEditingQuestion.id,
          payload,
        });
      } else {
        await createQuestionMutation.mutateAsync({ testId: testId, payload });
      }
    } else {
      // For new tests, just update local state
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
            id: Date.now(), // Use timestamp for temporary unique ID
            ...questionFormData,
            position: newQuestions.length,
          });
        }
        return { ...prev, questions: newQuestions };
      });
      toast({
        title: "Đã thêm vào danh sách",
        description: "Câu hỏi sẽ được lưu khi bạn lưu bài kiểm tra.",
        variant: "success",
      });
    }

    setIsQuestionDialogOpen(false);
  };

  const handleDeleteQuestionFromTest = (question: Question) => {
    setDeletingItem({
      type: "question",
      id: question.id,
      name: `câu hỏi "${question.text.substring(0, 30)}..."`,
    });
  };

  const executeDeleteQuestion = async () => {
    if (!deletingItem || deletingItem.type !== "question") return;
    const { id } = deletingItem;

    if (isEditingExistingTest && typeof id === "number" && testId) {
      await deleteQuestionMutation.mutateAsync(
        {
          testId: testId,
          questionIds: [id],
        },
        {
          onSuccess: () => {
            setDeletingItem(null);
          },
        }
      );
    } else {
      // For new tests, just update local state
      setTestFormData((prev) => ({
        ...prev,
        questions: (prev.questions || [])
          .filter((q) => q.id !== id)
          .map((q, index) => ({ ...q, position: index })),
      }));
      toast({
        title: "Đã xóa khỏi danh sách",
        description: "Câu hỏi đã được xóa khỏi danh sách tạm thời.",
        variant: "success",
      });
      setDeletingItem(null);
    }
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
        const newQuestions: Omit<Question, "id">[] = [];

        const headerMap = {
          question:
            headers.indexOf("questiontext") !== -1
              ? headers.indexOf("questiontext")
              : headers.indexOf("câu hỏi"),
          correctAnswer:
            headers.indexOf("correctoption") !== -1
              ? headers.indexOf("correctoption")
              : headers.indexOf("câu trả lời"),
          explanation:
            headers.indexOf("explanation") !== -1
              ? headers.indexOf("explanation")
              : headers.indexOf("lời giải"),
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
          showError("FILE001");
          return;
        }

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length === 0) continue;

          const questionText = String(row[headerMap.question] || "").trim();
          const correctAnswerText = String(
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

          if (!questionText || !correctAnswerText || !optionA || !optionB)
            continue;

          const options = [optionA, optionB];
          if (optionC) options.push(optionC);
          if (optionD) options.push(optionD);

          const correctAnswers = correctAnswerText
            .split(/[,;\s]+/)
            .filter((a) => a.trim());
          const correctAnswerIndexes = correctAnswers
            .map((answer) => {
              if (/^\d+$/.test(answer.trim()))
                return parseInt(answer.trim()) - 1;
              const upperAnswer = answer.trim().toUpperCase();
              return { A: 0, B: 1, C: 2, D: 3 }[upperAnswer] ?? -1;
            })
            .filter((index) => index >= 0 && index < options.length);

          if (correctAnswerIndexes.length === 0) continue;

          newQuestions.push({
            text: questionText,
            options: options,
            correctAnswerIndex: correctAnswerIndexes[0],
            correctAnswerIndexes: [...new Set(correctAnswerIndexes)].sort(
              (a, b) => a - b
            ),
            explanation: explanation,
            position:
              (testFormData.questions?.length || 0) + newQuestions.length + 1,
          });
        }

        if (newQuestions.length === 0) {
          showError("FILE001");
          return;
        }

        if (isEditingExistingTest && testId) {
          await createQuestionsSilentMutation.mutateAsync({
            testId,
            questions: newQuestions.map((q) =>
              mapUiQuestionToApiPayload(q as Question)
            ),
          });
          toast({
            title: "Thành công",
            description: `Đã import và lưu ${newQuestions.length} câu hỏi.`,
            variant: "success",
          });
        } else {
          setTestFormData((prev) => ({
            ...prev,
            questions: [
              ...(prev.questions || []),
              ...newQuestions.map((q, i) => ({ ...q, id: Date.now() + i })),
            ],
          }));
          toast({
            title: "Thành công",
            description: `Đã import ${newQuestions.length} câu hỏi.`,
            variant: "success",
          });
        }
      } catch (error) {
        showError("FILE001");
      }
    };
    reader.readAsArrayBuffer(file);
    if (testExcelImportInputRef.current)
      testExcelImportInputRef.current.value = "";
  };

  const handleSaveChanges = async () => {
    if (!testFormData.title) {
      showError("FORM001");
      return;
    }
    await onSave(testFormData);
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
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto resize">
          <DialogHeader>
            <DialogTitle>
              {isEditingExistingTest
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
              <div className="space-y-2">
                <Label htmlFor="timeTest">
                  Thời gian làm bài (phút){" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="timeTest"
                  type="number"
                  min={1}
                  value={testFormData.timeTest || 30} // Default to 30 minutes
                  onChange={(e) =>
                    setTestFormData((p) => ({
                      ...p,
                      timeTest: parseInt(e.target.value) || 30,
                    }))
                  }
                />
              </div>
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
                      onClick={handleOpenAddQuestion}
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
                              <div className="font-medium mb-1">{`Q${
                                q.position ?? actualIndex + 1
                              }`}</div>
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
                            <ChevronLeft className="h-4 w-4 mr-1" /> Trước
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
                            Sau <ChevronRight className="h-4 w-4 ml-1" />
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
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <LoadingButton onClick={handleSaveChanges} isLoading={isSavingTest}>
              Lưu Bài kiểm tra
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isQuestionDialogOpen}
        onOpenChange={setIsQuestionDialogOpen}
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
              disabled={
                createQuestionMutation.isPending ||
                updateQuestionMutation.isPending
              }
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

      <Dialog
        open={!!deletingItem && deletingItem.type === "question"}
        onOpenChange={() => setDeletingItem(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-destructive" /> Xác nhận xóa
            </DialogTitle>
            <DialogDescription className="pt-2">
              Bạn có chắc chắn muốn xóa {deletingItem?.name}? Hành động này
              không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingItem(null)}
              disabled={deleteQuestionMutation.isPending}
            >
              Hủy
            </Button>
            <LoadingButton
              variant="destructive"
              onClick={executeDeleteQuestion}
              isLoading={deleteQuestionMutation.isPending}
            >
              Xác nhận xóa
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
