"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
  CommandSeparator,
} from "@/components/ui/command";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Upload, X, Users, Search } from "lucide-react";
import NextImage from "next/image";
import { DatePicker } from "@/components/ui/datepicker";
import { LoadingButton } from "@/components/ui/loading";
import { Loading } from "@/components/ui/loading";
import { useToast } from "@/components/ui/use-toast";

import type { Course, EnrollmentType } from "@/lib/types/course.types";
import { generateCourseCode } from "@/lib/utils/code-generator";
import { useCourseCategories } from "@/hooks/use-course-categories";
import {
  useCourse,
  useCreateCourse,
  useUpdateCourse,
} from "@/hooks/use-courses";
import { useCourseStatuses } from "@/hooks/use-statuses";
import { useDepartments } from "@/hooks/use-departments";
import { useEmployeeLevel } from "@/hooks/use-employeeLevel";
import { useUsers } from "@/hooks/use-users";
import { useDebounce } from "@/hooks/use-debounce";
import { MaterialManager } from "@/components/courses/dialogs/MaterialManager";
import { LessonManager } from "@/components/courses/dialogs/LessonManager";
import { TestManager } from "@/components/courses/dialogs/TestManager";
import { mapCourseUiToCreatePayload, mapCourseUiToUpdatePayload } from "@/lib/mappers/course.mapper";
import { parseYMDToLocalDate } from "@/lib/utils/date.utils";

const initialNewCourseState: Course = {
  id: "",
  title: "",
  courseCode: "",
  description: "",
  objectives: "",
  category: null,
  instructor: "",
  duration: { sessions: 1, hoursPerSession: 2 },
  learningType: "online",
  startDate: null,
  endDate: null,
  location: "",
  image: "https://placehold.co/600x400.png",
  status: "Lưu nháp",
  departments: [],
  eLevels: [],
  department: [],
  level: [],
  materials: [],
  lessons: [],
  tests: [],
  enrollmentType: "" as EnrollmentType,
  registrationStartDate: null,
  registrationDeadline: null,
  userIds: [],
  isPrivate: false,
  maxParticipants: 200,
  createdAt: new Date().toISOString(),
  modifiedAt: new Date().toISOString(),
  createdBy: "",
  modifiedBy: "",
};

export function CourseForm({
  courseId,
  onSaveSuccess,
}: {
  courseId?: string;
  onSaveSuccess?: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const duplicateFromId = searchParams.get("duplicateFrom");

  // --- Data Fetching ---
  const { categories, isLoading: isLoadingCategories } = useCourseCategories();
  const { course: courseToEdit, isLoading: isLoadingCourse } = useCourse(
    courseId || ""
  );
  const { course: sourceCourseForDuplication, isLoading: isLoadingSource } =
    useCourse(duplicateFromId || "");
  const { courseStatuses } = useCourseStatuses();
  const { departments } = useDepartments();
  const { EmployeeLevel } = useEmployeeLevel();

  const createCourseMutation = useCreateCourse();
  const updateCourseMutation = useUpdateCourse();

  // --- State Management ---
  const [formData, setFormData] = useState<Course>(initialNewCourseState);
  const [courseImagePreview, setCourseImagePreview] = useState<string | null>(
    initialNewCourseState.image
  );
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const courseImageInputRef = useRef<HTMLInputElement>(null);

  const [isSelectingTrainees, setIsSelectingTrainees] = useState(false);
  const [tempSelectedTraineeIds, setTempSelectedTraineeIds] = useState<
    string[]
  >([]);
  const [traineeSearchTerm, setTraineeSearchTerm] = useState("");
  const debouncedTraineeSearch = useDebounce(traineeSearchTerm, 500);

  const { users: trainees } = useUsers({
    // RoleName: "HOCVIEN",
    keyword: debouncedTraineeSearch,
    Limit: 50,
  });

  const isSubmitting =
    createCourseMutation.isPending || updateCourseMutation.isPending;

  // --- Validation State ---
  const { toast } = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearError = (field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateField = useCallback(
    (field: string, value: unknown): string | undefined => {
      switch (field) {
        case "title":
          if (!String(value || "").trim()) return "Tên khóa học là bắt buộc";
          break;
        case "category":
          if (!value || !(value as any)?.id) return "Danh mục là bắt buộc";
          break;
        case "description":
          if (!String(value || "").trim()) return "Mô tả là bắt buộc";
          break;
        case "objectives":
          if (!String(value || "").trim()) return "Mục tiêu đào tạo là bắt buộc";
          break;
        default:
          break;
      }
      return undefined;
    },
    []
  );

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    const titleMsg = validateField("title", formData.title);
    if (titleMsg) newErrors.title = titleMsg;
    const categoryMsg = validateField("category", formData.category);
    if (categoryMsg) newErrors.category = categoryMsg;
    const descMsg = validateField("description", formData.description);
    if (descMsg) newErrors.description = descMsg;
    const objMsg = validateField("objectives", formData.objectives);
    if (objMsg) newErrors.objectives = objMsg;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateField]);

  // --- Derived State (Options for Selects) ---
  const departmentOptions = useMemo(() => {
    return (departments || []).map((d) => ({
      value: String(d.departmentId),
      label: d.name,
    }));
  }, [departments]);

  const levelOptions = useMemo(() => {
    return (EmployeeLevel || []).map((p) => ({
      value: String(p.eLevelId),
      label: p.eLevelName,
    }));
  }, [EmployeeLevel]);

  // --- Effects ---
  useEffect(() => {
    if (courseToEdit && courseId) {
      console.log(
        "🔄 [CourseForm] Updating form data with courseToEdit:",
        courseToEdit
      );
      setFormData(courseToEdit);
      setCourseImagePreview(courseToEdit.image);
      setTempSelectedTraineeIds(courseToEdit.userIds || []);
    } else if (sourceCourseForDuplication && !courseId) {
      const draftStatus = courseStatuses.find(
        (status) => status.name === "Lưu nháp"
      );
      const duplicatedCourse: Course = {
        ...sourceCourseForDuplication,
        id: crypto.randomUUID(),
        title: `${sourceCourseForDuplication.title} (Bản sao)`,
        courseCode: `${sourceCourseForDuplication.courseCode}-COPY-${Date.now()
          .toString()
          .slice(-4)}`,
        status: "Lưu nháp",
        statusId: draftStatus?.id,
        isPrivate: false,
        userIds: [],
      };
      setFormData(duplicatedCourse);
      setCourseImagePreview(duplicatedCourse.image);
      setTempSelectedTraineeIds([]);

      // Download and convert image to file for duplication
      if (
        sourceCourseForDuplication.image &&
        !sourceCourseForDuplication.image.includes("placehold.co")
      ) {
        fetch(sourceCourseForDuplication.image)
          .then((response) => response.blob())
          .then((blob) => {
            const file = new File([blob], "duplicated-image.jpg", {
              type: blob.type,
            });
            setSelectedImageFile(file);
          })
          .catch((error) => {
            console.warn("Failed to duplicate image file:", error);
            // Fallback to default image if download fails
            setCourseImagePreview("https://placehold.co/600x400.png");
          });
      }
    } else if (!courseId && !duplicateFromId) {
      const draftStatus = courseStatuses.find((s) => s.name === "Lưu nháp");
      setFormData({
        ...initialNewCourseState,
        statusId: draftStatus?.id,
      });
      setCourseImagePreview(initialNewCourseState.image);
    }
  }, [
    courseId,
    courseToEdit,
    duplicateFromId,
    sourceCourseForDuplication,
    courseStatuses,
  ]);

  useEffect(() => {
    return () => {
      if (courseImagePreview && courseImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(courseImagePreview);
      }
    };
  }, [courseImagePreview]);

  // --- Handlers ---
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
      duration: { ...prev.duration, [field]: numericValue },
    }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setCourseImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setSelectedImageFile(null);
      setCourseImagePreview(null);
    }
  };

  const openTraineeSelectionDialog = () => {
    setTempSelectedTraineeIds(formData.userIds || []);
    setIsSelectingTrainees(true);
  };

  const handleSaveTraineeSelection = () => {
    handleInputChange("userIds", tempSelectedTraineeIds);
    setIsSelectingTrainees(false);
  };

  const getTraineeNameById = (id: string): string =>
    trainees.find((t) => t.id === id)?.fullName || "Không rõ học viên";

  const handleSubmit = async () => {
    if (!validateForm()) {
      const order = ["title", "category", "description", "objectives"];
      const first = order.find((k) => !!errors[k]) || Object.keys(errors)[0];
      if (first) {
        const el = document.querySelector(`[name="${first}"]`) as HTMLElement | null;
        el?.focus();
      }
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng kiểm tra các trường bắt buộc.",
        variant: "destructive",
      });
      return;
    }
    const dataWithFile = {
      ...formData,
      imageFile: selectedImageFile || undefined,
    };

    try {
      if (courseId) {
        // Editing existing course - pass original course data for comparison
        const payload = mapCourseUiToUpdatePayload(dataWithFile, courseToEdit);
        await updateCourseMutation.mutateAsync({ courseId, payload });

        // Update form data with the saved data to reflect changes
        // NO - This was causing the re-render bug. The query invalidation will handle it.
        // setFormData(dataWithFile);

        // Navigate after successful save
        onSaveSuccess?.();
      } else {
        // Creating new course (could be from scratch or duplication)
        const payload = mapCourseUiToCreatePayload(dataWithFile);
        await createCourseMutation.mutateAsync(payload);

        // Navigate immediately for new course
        onSaveSuccess?.();
      }
    } catch (error) {
      // The useMutation hook will show the error toast.
      console.error("Failed to save course:", error);
    }
  };

  // --- Render Helpers ---
  const parseDateStringForPicker = (
    dateString: string | null | undefined
  ): Date | undefined => parseYMDToLocalDate(dateString || undefined);

  if (isLoadingCourse || (duplicateFromId && isLoadingSource)) {
    return <Loading text="Đang tải..." />;
  }

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
              <TabsTrigger value="general">Thông tin chung</TabsTrigger>
              <TabsTrigger value="lessons">Bài học</TabsTrigger>
              <TabsTrigger value="tests">Bài kiểm tra</TabsTrigger>
              <TabsTrigger value="materials">Tài liệu</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 pt-4">
                <div className="md:col-span-2">
                  <Label htmlFor="title">
                    Tên khóa học <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={(e) => {
                      handleInputChange("title", e.target.value);
                      clearError("title");
                    }}
                    onBlur={(e) => {
                      const msg = validateField("title", e.target.value);
                      if (msg) setErrors((p) => ({ ...p, title: msg }));
                    }}
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500 mt-1">{errors.title}</p>
                  )}
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
                </div>
                <div>
                  <Label htmlFor="category">
                    Danh mục <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={
                      formData.category?.id ? String(formData.category.id) : ""
                    }
                    onValueChange={(value: string) => {
                      const selectedCategory = categories.find(
                        (c) => String(c.id) === value
                      );
                      handleInputChange("category", selectedCategory || null);
                      const msg = validateField("category", selectedCategory || null);
                      if (msg) setErrors((p) => ({ ...p, category: msg }));
                      else clearError("category");
                    }}
                  >
                    <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={String(category.id)}
                        >
                          {category.categoryName}
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
                    name="description"
                    value={formData.description}
                    onChange={(e) => {
                      handleInputChange("description", e.target.value);
                      clearError("description");
                    }}
                    onBlur={(e) => {
                      const msg = validateField("description", e.target.value);
                      if (msg) setErrors((p) => ({ ...p, description: msg }));
                    }}
                    className={errors.description ? "border-red-500" : ""}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="objectives">
                    Mục tiêu đào tạo <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="objectives"
                    name="objectives"
                    value={formData.objectives}
                    onChange={(e) => {
                      handleInputChange("objectives", e.target.value);
                      clearError("objectives");
                    }}
                    onBlur={(e) => {
                      const msg = validateField("objectives", e.target.value);
                      if (msg) setErrors((p) => ({ ...p, objectives: msg }));
                    }}
                    className={errors.objectives ? "border-red-500" : ""}
                  />
                  {errors.objectives && (
                    <p className="text-sm text-red-500 mt-1">{errors.objectives}</p>
                  )}
                </div>
                {/* Trường giảng viên đã bỏ */}
                <div>
                  <Label htmlFor="learningType">Hình thức học</Label>
                  <Select
                    value={formData.learningType}
                    onValueChange={(v) => handleInputChange("learningType", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn hình thức" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Trực tuyến</SelectItem>
                      <SelectItem value="offline">Ngoại tuyến</SelectItem>
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
                  <Label htmlFor="maxParticipants">Số học viên tối đa</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    min="1"
                    value={formData.maxParticipants}
                    onChange={(e) =>
                      handleInputChange(
                        "maxParticipants",
                        parseInt(e.target.value) || 200
                      )
                    }
                    placeholder="200"
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
                    setDate={(date) =>
                      handleInputChange(
                        "startDate",
                        date ? format(date, "yyyy-MM-dd") : null
                      )
                    }
                    placeholder="Chọn ngày bắt đầu"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Ngày kết thúc</Label>
                  <DatePicker
                    date={parseDateStringForPicker(formData.endDate)}
                    setDate={(date) =>
                      handleInputChange(
                        "endDate",
                        date ? format(date, "yyyy-MM-dd") : null
                      )
                    }
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
                          <CommandEmpty>Không tìm thấy phòng ban.</CommandEmpty>
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
                                  handleInputChange("department", newSelection);
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
                        {(formData.department?.length || 0) > 0 && (
                          <>
                            <CommandSeparator />
                            <CommandGroup>
                              <CommandItem
                                onSelect={() =>
                                  handleInputChange("department", [])
                                }
                                className="text-destructive focus:bg-destructive/10 focus:text-destructive justify-center text-center cursor-pointer"
                              >
                                Xoá tất cả
                              </CommandItem>
                            </CommandGroup>
                          </>
                        )}
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {formData.department
                      ?.map(
                        (id) =>
                          departmentOptions.find(
                            (opt) => String(opt.value) === String(id)
                          )?.label
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
                        {(formData.level?.length || 0) > 0 && (
                          <>
                            <CommandSeparator />
                            <CommandGroup>
                              <CommandItem
                                onSelect={() => handleInputChange("level", [])}
                                className="text-destructive focus:bg-destructive/10 focus:text-destructive justify-center text-center cursor-pointer"
                              >
                                Xoá tất cả
                              </CommandItem>
                            </CommandGroup>
                          </>
                        )}
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {formData.level
                      ?.map(
                        (id) =>
                          levelOptions.find(
                            (opt) => String(opt.value) === String(id)
                          )?.label
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
                      id="isPrivate"
                      checked={formData.isPrivate}
                      onCheckedChange={(c) =>
                        handleInputChange("isPrivate", c === true)
                      }
                    />
                    <div>
                      <Label htmlFor="isPrivate">Chỉ hiển thị nội bộ </Label>
                    </div>
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
                          setDate={(date) =>
                            handleInputChange(
                              "registrationStartDate",
                              date ? format(date, "yyyy-MM-dd") : null
                            )
                          }
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
                          setDate={(date) =>
                            handleInputChange(
                              "registrationDeadline",
                              date ? format(date, "yyyy-MM-dd") : null
                            )
                          }
                          placeholder="Chọn hạn đăng ký"
                        />
                      </div>
                    </div>
                  )}
                  {formData.enrollmentType === "mandatory" && (
                    <div>
                      <Label>Học viên được chỉ định</Label>
                      <div className="mt-1 p-3 border rounded-md bg-muted/30 min-h-[60px]">
                        {(formData.userIds || []).length > 0 ? (
                          <ul className="list-disc list-inside text-sm space-y-1">
                            {(formData.userIds || []).map((id) => (
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
            </TabsContent>

            <TabsContent value="lessons" className="mt-0">
              <LessonManager courseId={courseId || null} />
            </TabsContent>

            <TabsContent value="tests" className="mt-0">
              <TestManager courseId={courseId || null} />
            </TabsContent>

            <TabsContent value="materials" className="mt-0">
              <MaterialManager courseId={courseId || null} />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <div className="flex justify-end w-full gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/courses")}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <LoadingButton onClick={handleSubmit} isLoading={isSubmitting}>
              {courseId ? "Lưu thay đổi" : "Tạo khóa học"}
            </LoadingButton>
          </div>
        </CardFooter>
      </Card>

      {/* Trainee Selection Dialog */}
      <Dialog open={isSelectingTrainees} onOpenChange={setIsSelectingTrainees}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chọn học viên</DialogTitle>
            <DialogDescription>
              Chọn các học viên sẽ được chỉ định cho khóa học này.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên hoặc email..."
                value={traineeSearchTerm}
                onChange={(e) => setTraineeSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {tempSelectedTraineeIds.length > 0 && (
              <div className="flex justify-between items-center text-sm px-1">
                <span className="text-muted-foreground">
                  Đã chọn {tempSelectedTraineeIds.length} học viên
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto p-1 text-xs text-muted-foreground hover:text-destructive"
                  onClick={() => setTempSelectedTraineeIds([])}
                >
                  Xoá tất cả
                </Button>
              </div>
            )}

            <div className="max-h-[50vh] overflow-y-auto py-2 space-y-2">
              {trainees.length === 0 && !debouncedTraineeSearch ? (
                <p className="text-sm text-center text-muted-foreground py-4">
                  Bắt đầu tìm kiếm học viên.
                </p>
              ) : trainees.length === 0 && debouncedTraineeSearch ? (
                <p className="text-sm text-center text-muted-foreground py-4">
                  Không tìm thấy học viên.
                </p>
              ) : (
                trainees.map((trainee) => (
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
