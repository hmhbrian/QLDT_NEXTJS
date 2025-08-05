
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  PlusCircle,
  Edit,
  Trash2,
  FileQuestion,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import type { Test } from "@/lib/types/test.types";
import { LoadingButton } from "@/components/ui/loading";
import {
  useTests,
  useCreateTest,
  useUpdateTest,
  useDeleteTest,
} from "@/hooks/use-tests";
import { QuestionManagerDialog } from "./QuestionManagerDialog";
import {
  mapUiTestToCreatePayload,
  mapUiTestToUpdatePayload,
} from "@/lib/mappers/test.mapper";
import { extractErrorMessage } from "@/lib/core";

interface TestManagerProps {
  courseId: string | null;
}

const initialTestState: Omit<Test, "id"> = {
  title: "",
  questions: [],
  passingScorePercentage: 70,
  isDone: false,
  timeTest: 30,
  countQuestion: 0,
};

type DeletingItem = {
  type: "test";
  id: string | number;
  name: string;
};

export function TestManager({ courseId }: TestManagerProps) {
  const {
    tests,
    isLoading: isLoadingTests,
    error: testsError,
  } = useTests(courseId ?? undefined);

  const createTestMutation = useCreateTest();
  const updateTestMutation = useUpdateTest();
  const deleteTestMutation = useDeleteTest();

  const [isQuestionManagerOpen, setIsQuestionManagerOpen] = useState(false);
  const [currentEditingTest, setCurrentEditingTest] =
    useState<Partial<Test> | null>(null);
  const [deletingItem, setDeletingItem] = useState<DeletingItem | null>(null);

  const handleOpenAddTest = () => {
    setCurrentEditingTest(initialTestState);
    setIsQuestionManagerOpen(true);
  };

  const handleOpenEditTest = (test: Test) => {
    setCurrentEditingTest(test);
    setIsQuestionManagerOpen(true);
  };

  const handleDeleteTest = (test: Test) => {
    if (typeof test.id !== "number") return;
    setDeletingItem({ type: "test", id: test.id, name: test.title });
  };

  const executeDeleteTest = () => {
    if (
      !deletingItem ||
      deletingItem.type !== "test" ||
      !courseId ||
      typeof deletingItem.id !== "number"
    )
      return;
    deleteTestMutation.mutate(
      { courseId, testId: deletingItem.id },
      {
        onSuccess: () => {
          setDeletingItem(null);
        },
      }
    );
  };

  const handleSaveTest = async (testData: Partial<Test>) => {
    if (!courseId) return;

    if (typeof testData.id === "number") {
      const payload = mapUiTestToUpdatePayload(testData as Test);
      await updateTestMutation.mutateAsync({
        courseId,
        testId: testData.id,
        payload: payload,
      });
    } else {
      const payload = mapUiTestToCreatePayload(testData as Test);
      await createTestMutation.mutateAsync({
        courseId,
        payload: payload,
      });
    }
    setIsQuestionManagerOpen(false);
  };

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold flex items-center">
            <FileQuestion className="mr-2 h-4 w-4 text-primary" /> Bài kiểm tra
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleOpenAddTest}
            disabled={!courseId}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Thêm bài kiểm tra
          </Button>
        </div>

        {isLoadingTests ? (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : testsError ? (
          <p className="text-destructive text-sm">
            Lỗi tải bài kiểm tra: {extractErrorMessage(testsError)}
          </p>
        ) : tests.length > 0 ? (
          <div className="space-y-2">
            {tests.map((test) => (
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
                    onClick={() => handleDeleteTest(test)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Chưa có bài kiểm tra.</p>
        )}
      </div>

      {currentEditingTest && courseId && (
        <QuestionManagerDialog
          isOpen={isQuestionManagerOpen}
          onOpenChange={setIsQuestionManagerOpen}
          courseId={courseId}
          initialTestState={currentEditingTest}
          onSave={handleSaveTest}
          isSavingTest={
            createTestMutation.isPending || updateTestMutation.isPending
          }
        />
      )}

      <Dialog open={!!deletingItem} onOpenChange={() => setDeletingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-destructive" /> Xác nhận xóa
            </DialogTitle>
            <DialogDescription className="pt-2">
              Bạn có chắc chắn muốn xóa bài kiểm tra{" "}
              <strong>&quot;{deletingItem?.name}&quot;</strong>? Hành động này
              không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingItem(null)}
              disabled={deleteTestMutation.isPending}
            >
              Hủy
            </Button>
            <LoadingButton
              variant="destructive"
              onClick={executeDeleteTest}
              isLoading={deleteTestMutation.isPending}
            >
              Xác nhận xóa
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
