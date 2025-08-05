"use client";

import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useDeleteAttachedFile,
  useCreateAttachedFiles,
} from "@/hooks/use-course-attached-files";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PlusCircle,
  X,
  Paperclip,
  Loader2,
  FileText,
  Link as LinkIcon,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import type {
  CourseMaterial,
  CourseMaterialType,
} from "@/lib/types/course.types";
import { courseAttachedFilesService } from "@/lib/services";
import { LoadingButton } from "@/components/ui/loading";

interface MaterialManagerProps {
  courseId: string | null;
}

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

type LocalMaterial = Partial<CourseMaterial> & {
  __file?: File | null;
  __localId: string;
};

type DeletingItem = {
  type: "material";
  id: number;
  name: string;
};

export function MaterialManager({ courseId }: MaterialManagerProps) {
  const [localMaterials, setLocalMaterials] = useState<LocalMaterial[]>([]);
  const materialFileInputRef = useRef<HTMLInputElement>(null);
  const [currentUploadIndex, setCurrentUploadIndex] = useState<number | null>(
    null
  );
  const [deletingItem, setDeletingItem] = useState<DeletingItem | null>(null);

  const {
    data: attachedFiles,
    isLoading: isLoadingAttachedFiles,
    refetch,
  } = useQuery({
    queryKey: ["attachedFiles", courseId],
    queryFn: () =>
      courseId ? courseAttachedFilesService.getAttachedFiles(courseId) : [],
    enabled: !!courseId,
  });

  const deleteMutation = useDeleteAttachedFile();
  const createMutation = useCreateAttachedFiles();

  const handleAddLocalMaterial = () => {
    setLocalMaterials((prev) => [
      ...prev,
      {
        __localId: crypto.randomUUID(),
        type: "Link",
        title: "",
        link: "",
        __file: null,
      },
    ]);
  };

  const handleLocalMaterialChange = (
    index: number,
    field: "type" | "title" | "link",
    value: string
  ) => {
    setLocalMaterials((prev) => {
      const newMaterials = [...prev];
      if (newMaterials[index]) {
        (newMaterials[index] as any)[field] = value;
        if (field === "type" && value !== "PDF") {
          newMaterials[index].link = "";
          newMaterials[index].__file = null;
        }
      }
      return newMaterials;
    });
  };

  const handleFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = event.target.files?.[0];
    if (file && index < localMaterials.length) {
      setLocalMaterials((prev) => {
        const newMaterials = [...prev];
        newMaterials[index].link = file.name;
        newMaterials[index].__file = file;
        return newMaterials;
      });
    }
  };

  const handleRemoveLocalMaterial = (index: number) => {
    setLocalMaterials((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingMaterial = (fileId: number, title: string) => {
    setDeletingItem({
      type: "material",
      id: fileId,
      name: title,
    });
  };

  const executeDeleteMaterial = () => {
    if (!deletingItem || deletingItem.type !== "material" || !courseId) return;
    deleteMutation.mutate(
      { courseId, fileId: deletingItem.id },
      {
        onSuccess: () => {
          setDeletingItem(null);
        },
      }
    );
  };

  const handleSaveNewMaterials = async () => {
    if (!courseId || localMaterials.length === 0) return;

    const payload = localMaterials.map((m) => ({
      title: m.title || "Tài liệu không tên",
      file: m.__file ?? undefined,
      link: m.type === "Link" ? m.link : undefined,
    }));

    await createMutation.mutateAsync(
      { courseId, files: payload },
      {
        onSuccess: () => {
          setLocalMaterials([]);
          refetch();
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={materialFileInputRef}
        className="hidden"
        onChange={(e) => {
          if (currentUploadIndex !== null) {
            handleFileSelect(e, currentUploadIndex);
            setCurrentUploadIndex(null);
          }
        }}
      />
      {isLoadingAttachedFiles ? (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Đang tải tài liệu...</p>
        </div>
      ) : (
        <>
          {attachedFiles && attachedFiles.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                Tài liệu hiện có
              </p>
              {attachedFiles.map((material) => (
                <div
                  key={material.id}
                  className="flex items-center gap-3 p-3 border rounded-md bg-muted/30"
                >
                  <div className="flex-shrink-0">
                    {renderMaterialIcon(material.type)}
                  </div>
                  <div className="flex-grow truncate">
                    <a
                      href={material.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium hover:underline"
                    >
                      {material.title}
                    </a>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0 text-destructive hover:text-destructive"
                    onClick={() =>
                      handleDeleteExistingMaterial(
                        material.id as number,
                        material.title
                      )
                    }
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {localMaterials.length > 0 && (
            <div className="space-y-3 pt-4 border-t">
              <p className="text-sm font-medium text-muted-foreground">
                Tài liệu mới
              </p>
              {localMaterials.map((material, index) => (
                <div
                  key={material.__localId}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 border rounded-md"
                >
                  <div className="flex-shrink-0 self-center sm:self-start pt-1">
                    {renderMaterialIcon(material.type)}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-grow">
                    <Select
                      value={material.type || "Link"}
                      onValueChange={(v: CourseMaterialType) =>
                        handleLocalMaterialChange(index, "type", v)
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
                        handleLocalMaterialChange(
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
                          handleLocalMaterialChange(
                            index,
                            "link",
                            e.target.value
                          )
                        }
                        readOnly={!!material.__file}
                      />
                      {material.type === "PDF" && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setCurrentUploadIndex(index);
                            if (materialFileInputRef.current) {
                              materialFileInputRef.current.accept = ".pdf";
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
                    onClick={() => handleRemoveLocalMaterial(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                size="sm"
                onClick={handleSaveNewMaterials}
                disabled={createMutation.isPending}
                className="mt-2"
              >
                {createMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Lưu tài liệu mới
              </Button>
            </div>
          )}

          {(!attachedFiles || attachedFiles.length === 0) &&
            localMaterials.length === 0 && (
              <p className="text-sm text-center text-muted-foreground py-2">
                Chưa có tài liệu nào.
              </p>
            )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={handleAddLocalMaterial}
            disabled={!courseId}
          >
            <PlusCircle className="h-4 w-4 mr-2" /> Thêm tài liệu
          </Button>
        </>
      )}

      {/* Delete Material Confirmation Dialog */}
      <Dialog open={!!deletingItem} onOpenChange={() => setDeletingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-destructive" />
              Xác nhận xóa
            </DialogTitle>
            <DialogDescription className="pt-2">
              Bạn có chắc chắn muốn xóa tài liệu{" "}
              <strong>&quot;{deletingItem?.name}&quot;</strong>? Hành động này
              không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingItem(null)}
              disabled={deleteMutation.isPending}
            >
              Hủy
            </Button>
            <LoadingButton
              variant="destructive"
              onClick={executeDeleteMaterial}
              isLoading={deleteMutation.isPending}
            >
              Xác nhận xóa
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
