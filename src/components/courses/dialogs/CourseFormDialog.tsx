
"use client";

import { useState, useEffect, useRef } from "react";
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
import {
  PlusCircle,
  Upload,
  X,
  Users,
  Search,
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
  EnrollmentType,
} from "@/lib/types/course.types";
import { generateCourseCode } from "@/lib/utils/code-generator";
import type { Status } from "@/lib/types/status.types";
import type { User } from "@/lib/types/user.types";
import { LoadingButton } from "@/components/ui/loading";
import { categoryOptions } from "@/lib/config/constants";
import { MaterialManager } from "./MaterialManager";
import { LessonManager } from "./LessonManager";
import { TestManager } from "./TestManager";


type CourseFormData = Course;

const initialNewCourseStateForDialog: CourseFormData = {
  id: "",
  title: "",
  courseCode: "",
  description: "",
  objectives: "",
  category: "programming",
  instructor: "",
  duration: { sessions: 1, hoursPerSession: 2 },
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
  createdAt: new Date().toISOString(),
  modifiedAt: new Date().toISOString(),
  createdBy: "",
  modifiedBy: "",
};

export interface CourseFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  courseToEdit?: Course | null;
  isDuplicating?: boolean;
  onSave: (
    courseData: Course,
    isEditing: boolean,
    imageFile?: File | null
  ) => Promise<void>;
  courseStatuses: Status[];
  departmentOptions: readonly { value: string; label: string }[];
  levelOptions: readonly { value: string; label: string }[];
  trainees: User[];
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

  const [formData, setFormData] = useState<CourseFormData>(
    initialNewCourseStateForDialog
  );

  const [courseImagePreview, setCourseImagePreview] = useState<string | null>(
    courseToEdit?.image || initialNewCourseStateForDialog.image
  );
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const courseImageInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isSelectingTrainees, setIsSelectingTrainees] = useState(false);
  const [tempSelectedTraineeIds, setTempSelectedTraineeIds] = useState<
    string[]
  >([]);
  const [traineeSearchTerm, setTraineeSearchTerm] = useState("");

  const isEditingExistingCourse = !!courseToEdit && !isDuplicating;

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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const isEditing = !!courseToEdit && !isDuplicating;
    try {
      await onSave(formData, isEditing, selectedImageFile);
      onOpenChange(false);
    } catch (error) {
      // Error toast is handled by the onSave implementation
      console.error("Save course failed:", error);
    } finally {
      setIsSubmitting(false);
    }
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
                <LessonManager courseId={isEditingExistingCourse ? courseToEdit.id : null} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-semibold text-gray-900 hover:text-orange-600 transition-colors">
                Bài kiểm tra
              </AccordionTrigger>
              <AccordionContent>
                <TestManager courseId={isEditingExistingCourse ? courseToEdit.id : null} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg font-semibold text-gray-900 hover:text-orange-600 transition-colors">
                Tài liệu khóa học
              </AccordionTrigger>
              <AccordionContent>
                <MaterialManager
                  courseId={isEditingExistingCourse ? courseToEdit.id : null}
                />
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
    </>
  );
}
