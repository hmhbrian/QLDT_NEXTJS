
import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import { devtools } from "zustand/middleware";
import type { Course, CourseApiResponse } from "@/lib/types/course.types";
import { mockCourses } from "@/lib/mock";
import Cookies from "js-cookie";
import { API_CONFIG } from "@/lib/config";
import { coursesService } from "@/lib/services/modern/courses.service";
import { mapCourseApiToUi, mapCourseUiToCreatePayload, mapCourseUiToUpdatePayload } from "@/lib/mappers/course.mapper";

// Enhanced error types for better error handling
interface CourseStoreError {
  type:
    | "FETCH_ERROR"
    | "CREATE_ERROR"
    | "UPDATE_ERROR"
    | "DELETE_ERROR"
    | "NETWORK_ERROR";
  message: string;
  details?: unknown;
  timestamp: number;
}

// Loading states for different operations
interface LoadingStates {
  fetching: boolean;
  creating: boolean;
  updating: Record<string, boolean>;
  deleting: Record<string, boolean>;
}

// Cache metadata for intelligent caching
interface CacheMetadata {
  lastFetch: number;
  ttl: number;
  version: number;
}

interface CourseStore {
  // Core state
  courses: Course[];
  loadingStates: LoadingStates;
  error: CourseStoreError | null;
  cacheMetadata: CacheMetadata;

  // Computed getters
  isLoading: boolean;
  getCourseById: (id: string) => Course | undefined;
  getCoursesByCategory: (category: string) => Course[];
  getActiveCourses: () => Course[];

  // Core actions
  setCourses: (courses: Course[]) => void;
  clearError: () => void;

  // Async operations with enhanced error handling
  fetchCourses: (options?: { force?: boolean }) => Promise<void>;
  addCourse: (
    course: Course,
    options?: { optimistic?: boolean }
  ) => Promise<void>;
  updateCourse: (
    courseId: string,
    courseData: Partial<Course>,
    options?: { optimistic?: boolean }
  ) => Promise<void>;
  deleteCourse: (
    courseId: string,
    options?: { optimistic?: boolean }
  ) => Promise<void>;

  // Batch operations
  deleteCourses: (courseIds: string[]) => Promise<void>;
  refreshCourse: (courseId: string) => Promise<void>;

  // Cache management
  invalidateCache: () => void;
  isCacheValid: () => boolean;

  // Hydration
  _hasHydrated: boolean;
  setHasHydrated: (hydrated: boolean) => void;
}

// Enhanced utility functions
const createError = (
  type: CourseStoreError["type"],
  message: string,
  details?: unknown
): CourseStoreError => ({
  type,
  message,
  details,
  timestamp: Date.now(),
});

const createInitialLoadingStates = (): LoadingStates => ({
  fetching: false,
  creating: false,
  updating: {},
  deleting: {},
});

const createInitialCacheMetadata = (): CacheMetadata => ({
  lastFetch: 0,
  ttl: 5 * 60 * 1000, // 5 minutes cache TTL
  version: 1,
});

const cookieStorage: StateStorage = {
  getItem: (name: string): string | null => {
    const value = Cookies.get(name);
    return value === undefined ? null : value;
  },
  setItem: (name: string, value: string): void => {
    Cookies.set(name, value, { expires: 7, sameSite: "strict" });
  },
  removeItem: (name: string): void => {
    Cookies.remove(name);
  },
};

const ensureDateStrings = (courses: Course[]): Course[] => {
  return courses.map((course) => ({
    ...course,
    startDate: course.startDate,
    endDate: course.endDate,
    registrationDeadline: course.registrationDeadline,
    createdAt:
      typeof course.createdAt === "object"
        ? new Date(course.createdAt).toISOString()
        : course.createdAt,
    modifiedAt:
      typeof course.modifiedAt === "object"
        ? new Date(course.modifiedAt).toISOString()
        : course.modifiedAt,
  }));
};

// Optimistic update helper
const withOptimisticUpdate = async <T>(
  optimisticAction: () => void,
  revertAction: () => void,
  apiCall: () => Promise<T>,
  isOptimistic: boolean = true
): Promise<T> => {
  if (isOptimistic) {
    optimisticAction();
  }

  try {
    const result = await apiCall();
    return result;
  } catch (error) {
    if (isOptimistic) {
      revertAction();
    }
    throw error;
  }
};

export const useCourseStore = create<CourseStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        courses: [],
        loadingStates: createInitialLoadingStates(),
        error: null,
        cacheMetadata: createInitialCacheMetadata(),
        _hasHydrated: false,

        // Computed getters
        get isLoading() {
          const { loadingStates } = get();
          return (
            loadingStates.fetching ||
            loadingStates.creating ||
            Object.values(loadingStates.updating).some(Boolean) ||
            Object.values(loadingStates.deleting).some(Boolean)
          );
        },

        getCourseById: (id: string) => {
          return get().courses.find((course) => course.id === id);
        },

        getCoursesByCategory: (category: string) => {
          return get().courses.filter(
            (course) => course.category === (category as any)
          );
        },

        getActiveCourses: () => {
          return get().courses.filter(
            (course) => course.status === "published"
          );
        },

        // Core actions
        setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),

        setCourses: (courses) => set({ courses: ensureDateStrings(courses) }),

        clearError: () => set({ error: null }),

        // Cache management
        isCacheValid: () => {
          const { cacheMetadata } = get();
          return Date.now() - cacheMetadata.lastFetch < cacheMetadata.ttl;
        },

        invalidateCache: () => {
          set((state) => ({
            cacheMetadata: {
              ...state.cacheMetadata,
              lastFetch: 0,
            },
          }));
        },

        // Enhanced fetch with caching and error handling
        fetchCourses: async (options = {}) => {
          const { force = false } = options;
          const state = get();

          // Check cache validity unless force refresh
          if (!force && state.isCacheValid() && state.courses.length > 0) {
            return;
          }

          set((prev) => ({
            loadingStates: { ...prev.loadingStates, fetching: true },
            error: null,
          }));

          try {
            if (API_CONFIG.useApi) {
              console.log("Fetching courses from API...");
              const apiCourses = await coursesService.getCourses();
              const transformedCourses = (apiCourses.items || []).map((apiCourse) =>
                mapCourseApiToUi(apiCourse)
              );

              set((prev) => ({
                courses: ensureDateStrings(transformedCourses),
                loadingStates: { ...prev.loadingStates, fetching: false },
                error: null,
                cacheMetadata: {
                  ...prev.cacheMetadata,
                  lastFetch: Date.now(),
                  version: prev.cacheMetadata.version + 1,
                },
              }));
            } else {
              set((prev) => ({
                courses: mockCourses,
                loadingStates: { ...prev.loadingStates, fetching: false },
                error: null,
                cacheMetadata: {
                  ...prev.cacheMetadata,
                  lastFetch: Date.now(),
                },
              }));
            }
          } catch (error: any) {
            console.error("Failed to fetch courses:", error);
            set((prev) => ({
              error: createError(
                "FETCH_ERROR",
                "Failed to load courses",
                error
              ),
              loadingStates: { ...prev.loadingStates, fetching: false },
              courses: mockCourses, // Fallback to mock data
            }));
            throw error;
          }
        },

        // Enhanced add with optimistic updates
        addCourse: async (course, options = {}) => {
          const { optimistic = true } = options;

          // Validation - kiểm tra các field bắt buộc
          const requiredFields = [
            "title",
            "courseCode",
            "description",
            "objectives",
          ];
          const missingFields = requiredFields.filter(
            (field) =>
              !course[field as keyof Course] ||
              course[field as keyof Course] === ""
          );

          if (missingFields.length > 0) {
            const error = createError(
              "CREATE_ERROR",
              `Thiếu các trường bắt buộc: ${missingFields.join(", ")}`,
              { missingFields }
            );
            set((prev) => ({ error }));
            throw new Error(error.message);
          }

          const tempId = `temp-${Date.now()}`;
          const courseWithTempId = { ...course, id: tempId };

          set((prev) => ({
            loadingStates: { ...prev.loadingStates, creating: true },
            error: null,
          }));

          try {
            await withOptimisticUpdate(
              // Optimistic action
              () => {
                if (optimistic) {
                  set((prev) => ({
                    courses: [...prev.courses, courseWithTempId],
                  }));
                }
              },
              // Revert action
              () => {
                set((prev) => ({
                  courses: prev.courses.filter((c) => c.id !== tempId),
                }));
              },
              // API call
              async () => {
                if (API_CONFIG.useApi) {
                  console.log("Creating course via API...");
                  const completeCourse = {
                    ...course,
                    category: course.category || "programming",
                    instructor: course.instructor || "Giảng viên",
                    duration: course.duration || {
                      sessions: 1,
                      hoursPerSession: 1,
                    },
                    learningType: "online" as const,
                    location: course.location || "Trực tuyến",
                    image: course.image || "https://placehold.co/600x400.png",
                    status: course.status || "draft",
                    department: course.department || [],
                    level: course.level || [],
                    materials: course.materials || [],
                    enrollmentType: course.enrollmentType || "optional",
                    isPublic:
                      course.isPublic !== undefined ? course.isPublic : true,
                    maxParticipants: course.maxParticipants || 25,
                    createdAt: new Date().toISOString(),
                    modifiedAt: new Date().toISOString(),
                    createdBy: course.createdBy || "Admin",
                    modifiedBy: course.modifiedBy || "Admin",
                  };
                  const apiPayload = mapCourseUiToCreatePayload(completeCourse);
                  console.log("API Payload being sent:", apiPayload);
                  
                  await coursesService.createCourse(apiPayload);
                  await get().fetchCourses({ force: true });

                } else {
                  const newCourse = { ...course, id: `course-${Date.now()}` };
                  set((prev) => ({
                    courses: optimistic
                      ? prev.courses.map((c) =>
                          c.id === tempId ? newCourse : c
                        )
                      : [...prev.courses, newCourse],
                  }));
                  return newCourse;
                }
              },
              optimistic
            );
            set((prev) => ({
              loadingStates: { ...prev.loadingStates, creating: false },
            }));
            // Invalidate cache after successful operation
            get().invalidateCache();
          } catch (error: any) {
            console.error("Failed to add course:", error);
            set((prev) => ({
              error: createError(
                "CREATE_ERROR",
                "Failed to create course",
                error
              ),
              loadingStates: { ...prev.loadingStates, creating: false },
            }));
            throw error;
          }
        },

        // Enhanced update with optimistic updates
        updateCourse: async (courseId, courseData, options = {}) => {
          const { optimistic = true } = options;
          const state = get();
          const originalCourse = state.courses.find((c) => c.id === courseId);

          if (!originalCourse) {
            throw new Error(`Course with ID ${courseId} not found`);
          }

          set((prev) => ({
            loadingStates: {
              ...prev.loadingStates,
              updating: { ...prev.loadingStates.updating, [courseId]: true },
            },
            error: null,
          }));

          try {
            await withOptimisticUpdate(
              // Optimistic action
              () => {
                if (optimistic) {
                  set((prev) => ({
                    courses: prev.courses.map((c) =>
                      c.id === courseId ? { ...c, ...courseData } : c
                    ),
                  }));
                }
              },
              // Revert action
              () => {
                set((prev) => ({
                  courses: prev.courses.map((c) =>
                    c.id === courseId ? originalCourse : c
                  ),
                }));
              },
              // API call
              async () => {
                if (API_CONFIG.useApi) {
                  console.log("Updating course via API...");
                  const apiPayload =
                    mapCourseUiToUpdatePayload(courseData as Course);
                  const updatedApiCourse = await coursesService.updateCourse(
                    courseId,
                    apiPayload
                  );
                  const updatedCourse =
                    mapCourseApiToUi(updatedApiCourse);

                  set((prev) => ({
                    courses: prev.courses.map((c) =>
                      c.id === courseId ? { ...c, ...updatedCourse } : c
                    ),
                  }));

                  return updatedCourse;
                } else {
                  if (!optimistic) {
                    set((prev) => ({
                      courses: prev.courses.map((c) =>
                        c.id === courseId ? { ...c, ...courseData } : c
                      ),
                    }));
                  }
                  return { ...originalCourse, ...courseData };
                }
              },
              optimistic
            );

            set((prev) => ({
              loadingStates: {
                ...prev.loadingStates,
                updating: { ...prev.loadingStates.updating, [courseId]: false },
              },
            }));

            // Invalidate cache after successful operation
            get().invalidateCache();
          } catch (error: any) {
            console.error("Failed to update course:", error);
            set((prev) => ({
              error: createError(
                "UPDATE_ERROR",
                "Failed to update course",
                error
              ),
              loadingStates: {
                ...prev.loadingStates,
                updating: { ...prev.loadingStates.updating, [courseId]: false },
              },
            }));
            throw error;
          }
        },

        // Enhanced delete with optimistic updates
        deleteCourse: async (courseId, options = {}) => {
          const { optimistic = true } = options;
          const state = get();
          const originalCourse = state.courses.find((c) => c.id === courseId);

          if (!originalCourse) {
            throw new Error(`Course with ID ${courseId} not found`);
          }

          set((prev) => ({
            loadingStates: {
              ...prev.loadingStates,
              deleting: { ...prev.loadingStates.deleting, [courseId]: true },
            },
            error: null,
          }));

          try {
            await withOptimisticUpdate(
              // Optimistic action
              () => {
                if (optimistic) {
                  set((prev) => ({
                    courses: prev.courses.filter((c) => c.id !== courseId),
                  }));
                }
              },
              // Revert action
              () => {
                set((prev) => ({
                  courses: [...prev.courses, originalCourse],
                }));
              },
              // API call
              async () => {
                if (API_CONFIG.useApi) {
                  console.log("Deleting course via API...");
                  await coursesService.softDeleteCourses([courseId]);
                }

                if (!optimistic) {
                  set((prev) => ({
                    courses: prev.courses.filter((c) => c.id !== courseId),
                  }));
                }
              },
              optimistic
            );

            set((prev) => ({
              loadingStates: {
                ...prev.loadingStates,
                deleting: { ...prev.loadingStates.deleting, [courseId]: false },
              },
            }));

            // Invalidate cache after successful operation
            get().invalidateCache();
          } catch (error: any) {
            console.error("Failed to delete course:", error);
            set((prev) => ({
              error: createError(
                "DELETE_ERROR",
                "Failed to delete course",
                error
              ),
              loadingStates: {
                ...prev.loadingStates,
                deleting: { ...prev.loadingStates.deleting, [courseId]: false },
              },
            }));
            throw error;
          }
        },

        // Batch operations
        deleteCourses: async (courseIds) => {
          const state = get();
          const originalCourses = state.courses.filter((c) =>
            courseIds.includes(c.id)
          );

          set((prev) => ({
            loadingStates: {
              ...prev.loadingStates,
              deleting: courseIds.reduce(
                (acc, id) => ({ ...acc, [id]: true }),
                prev.loadingStates.deleting
              ),
            },
            error: null,
          }));

          try {
            // Optimistic update
            set((prev) => ({
              courses: prev.courses.filter((c) => !courseIds.includes(c.id)),
            }));

            if (API_CONFIG.useApi) {
              await coursesService.softDeleteCourses(courseIds);
            }

            set((prev) => ({
              loadingStates: {
                ...prev.loadingStates,
                deleting: courseIds.reduce(
                  (acc, id) => ({ ...acc, [id]: false }),
                  prev.loadingStates.deleting
                ),
              },
            }));

            // Invalidate cache after successful operation
            get().invalidateCache();
          } catch (error: any) {
            // Revert optimistic update
            set((prev) => ({
              courses: [...prev.courses, ...originalCourses],
              error: createError(
                "DELETE_ERROR",
                "Failed to delete courses",
                error
              ),
              loadingStates: {
                ...prev.loadingStates,
                deleting: courseIds.reduce(
                  (acc, id) => ({ ...acc, [id]: false }),
                  prev.loadingStates.deleting
                ),
              },
            }));
            throw error;
          }
        },

        // Refresh individual course
        refreshCourse: async (courseId) => {
          try {
            if (API_CONFIG.useApi) {
              const apiCourse = await coursesService.getCourseById(courseId);
              const transformedCourse =
                mapCourseApiToUi(apiCourse);

              set((prev) => ({
                courses: prev.courses.map((c) =>
                  c.id === courseId ? transformedCourse : c
                ),
              }));
            }
          } catch (error: any) {
            console.error(`Failed to refresh course ${courseId}:`, error);
            set((prev) => ({
              error: createError(
                "FETCH_ERROR",
                `Failed to refresh course ${courseId}`,
                error
              ),
            }));
            throw error;
          }
        },
      }),
      {
        name: "becamex-course-list-storage",
        storage: createJSONStorage(() => cookieStorage),
        onRehydrateStorage: () => (state) => {
          if (state) {
            state.setHasHydrated(true);
          }
        },
        partialize: (state) => ({
          courses: state.courses,
          cacheMetadata: state.cacheMetadata,
        }),
      }
    ),
    {
      name: "course-store", // DevTools name
      enabled: process.env.NODE_ENV === "development",
    }
  )
);

// Auto-rehydrate on client side
if (typeof window !== "undefined") {
  useCourseStore.persist.rehydrate();
}

// ==================================================
// UTILITY HOOKS & SELECTORS
// ==================================================

// Performance-optimized selectors to prevent unnecessary re-renders
export const useCourses = () => useCourseStore((state) => state.courses);
export const useCoursesLoading = () =>
  useCourseStore((state) => state.isLoading);
export const useCoursesError = () => useCourseStore((state) => state.error);

// Specific loading states
export const useIsFetchingCourses = () =>
  useCourseStore((state) => state.loadingStates.fetching);
export const useIsCreatingCourse = () =>
  useCourseStore((state) => state.loadingStates.creating);
export const useIsUpdatingCourse = (courseId: string) =>
  useCourseStore((state) => state.loadingStates.updating[courseId] || false);
export const useIsDeletingCourse = (courseId: string) =>
  useCourseStore((state) => state.loadingStates.deleting[courseId] || false);

// Computed selectors
export const useCourseById = (id: string) =>
  useCourseStore((state) => state.getCourseById(id));

export const useCoursesByCategory = (category: string) =>
  useCourseStore((state) => state.getCoursesByCategory(category));

export const useActiveCourses = () =>
  useCourseStore((state) => state.getActiveCourses());

// Actions hooks
export const useCourseActions = () =>
  useCourseStore((state) => ({
    fetchCourses: state.fetchCourses,
    addCourse: state.addCourse,
    updateCourse: state.updateCourse,
    deleteCourse: state.deleteCourse,
    deleteCourses: state.deleteCourses,
    refreshCourse: state.refreshCourse,
    clearError: state.clearError,
    invalidateCache: state.invalidateCache,
  }));

// Cache status hook
export const useCacheStatus = () =>
  useCourseStore((state) => ({
    isValid: state.isCacheValid(),
    lastFetch: state.cacheMetadata.lastFetch,
    version: state.cacheMetadata.version,
  }));

// ==================================================
// ADVANCED UTILITY FUNCTIONS
// ==================================================

/**
 * Custom hook for handling course operations with proper error handling
 * and loading states. Includes retry mechanism and validation.
 */
export const useCourseOperations = () => {
  const actions = useCourseActions();
  const error = useCoursesError();
  const { validateBeforeSubmit } = useCourseValidation();

  const withErrorHandling = async <T>(
    operation: () => Promise<T>,
    errorMessage: string,
    retries: number = 2
  ): Promise<T | null> => {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await operation();
      } catch (err) {
        lastError = err as Error;
        console.warn(`Attempt ${attempt + 1} failed:`, err);

        if (attempt < retries) {
          // Exponential backoff
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          );
        }
      }
    }

    console.error(`${errorMessage} after ${retries + 1} attempts:`, lastError);
    throw lastError;
  };

  // Enhanced add course with validation
  const addCourseWithValidation = async (
    course: Course,
    options?: { optimistic?: boolean }
  ) => {
    try {
      // Validate trước khi gửi
      validateBeforeSubmit(course);
      return await actions.addCourse(course, options);
    } catch (error) {
      console.error("Course validation failed:", error);
      throw error;
    }
  };

  // Enhanced update course with validation
  const updateCourseWithValidation = async (
    courseId: string,
    courseData: Partial<Course>,
    options?: { optimistic?: boolean }
  ) => {
    try {
      // Chỉ validate các field được cập nhật
      if (
        courseData.title ||
        courseData.courseCode ||
        courseData.description ||
        courseData.objectives
      ) {
        validateBeforeSubmit(courseData);
      }
      return await actions.updateCourse(courseId, courseData, options);
    } catch (error) {
      console.error("Course update validation failed:", error);
      throw error;
    }
  };

  return {
    ...actions,
    withErrorHandling,
    addCourseWithValidation,
    updateCourseWithValidation,
    hasError: !!error,
    errorMessage: error?.message,
    errorType: error?.type,
  };
};

/**
 * Hook for bulk operations with progress tracking
 */
export const useBulkCourseOperations = () => {
  const actions = useCourseActions();

  const bulkUpdate = async (
    updates: Array<{ id: string; data: Partial<Course> }>,
    onProgress?: (completed: number, total: number) => void
  ) => {
    const results: Array<{ id: string; success: boolean; error?: Error }> = [];

    for (let i = 0; i < updates.length; i++) {
      const { id, data } = updates[i];
      try {
        await actions.updateCourse(id, data, { optimistic: false });
        results.push({ id, success: true });
      } catch (error) {
        results.push({ id, success: false, error: error as Error });
      }

      onProgress?.(i + 1, updates.length);
    }

    return results;
  };

  const bulkDelete = async (
    courseIds: string[],
    onProgress?: (completed: number, total: number) => void
  ) => {
    // Use the optimized batch delete
    try {
      await actions.deleteCourses(courseIds);
      onProgress?.(courseIds.length, courseIds.length);
      return courseIds.map((id) => ({ id, success: true }));
    } catch (error) {
      // Fallback to individual deletions
      const results: Array<{ id: string; success: boolean; error?: Error }> =
        [];

      for (let i = 0; i < courseIds.length; i++) {
        const id = courseIds[i];
        try {
          await actions.deleteCourse(id, { optimistic: false });
          results.push({ id, success: true });
        } catch (err) {
          results.push({ id, success: false, error: err as Error });
        }

        onProgress?.(i + 1, courseIds.length);
      }

      return results;
    }
  };

  return {
    bulkUpdate,
    bulkDelete,
  };
};

/**
 * Development utilities for debugging and testing
 */
export const useCourseStoreDevtools = () => {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return {
    getState: useCourseStore.getState,
    setState: useCourseStore.setState,
    subscribe: useCourseStore.subscribe,
    // Debug helpers
    logState: () =>
      console.log("Course Store State:", useCourseStore.getState()),
    clearCache: () => {
      useCourseStore.getState().invalidateCache();
      useCourseStore.persist.clearStorage();
    },
    simulateError: (type: CourseStoreError["type"], message: string) => {
      useCourseStore.setState({
        error: createError(type, message, "Simulated error for testing"),
      });
    },
  };
};

/**
 * Hook for validating course data before submission
 */
export const useCourseValidation = () => {
  const validateCourse = (course: Partial<Course>) => {
    const errors: Record<string, string> = {};

    // Kiểm tra các field bắt buộc
    if (!course.title?.trim()) {
      errors.title = "Tên khóa học là bắt buộc";
    }

    if (!course.courseCode?.trim()) {
      errors.courseCode = "Mã khóa học là bắt buộc";
    }

    if (!course.description?.trim()) {
      errors.description = "Mô tả khóa học là bắt buộc";
    }

    if (!course.objectives?.trim()) {
      errors.objectives = "Mục tiêu khóa học là bắt buộc";
    }

    // Kiểm tra format
    if (
      course.courseCode &&
      !/^[A-Z0-9_-]{2,20}$/i.test(course.courseCode.trim())
    ) {
      errors.courseCode =
        "Mã khóa học phải từ 2-20 ký tự, chỉ chứa chữ, số, gạch ngang và gạch dưới";
    }

    // Kiểm tra độ dài
    if (course.title && course.title.trim().length > 200) {
      errors.title = "Tên khóa học không được vượt quá 200 ký tự";
    }

    if (course.description && course.description.trim().length > 1000) {
      errors.description = "Mô tả không được vượt quá 1000 ký tự";
    }

    // Kiểm tra ngày tháng
    if (course.startDate && course.endDate) {
      const startDate = new Date(course.startDate);
      const endDate = new Date(course.endDate);

      if (startDate >= endDate) {
        errors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
      }
    }

    if (course.registrationDeadline && course.startDate) {
      const regDeadline = new Date(course.registrationDeadline);
      const startDate = new Date(course.startDate);

      if (regDeadline >= startDate) {
        errors.registrationDeadline =
          "Hạn đăng ký phải trước ngày bắt đầu khóa học";
      }
    }

    // Kiểm tra số lượng
    if (course.maxParticipants && course.maxParticipants < 1) {
      errors.maxParticipants = "Số lượng học viên tối đa phải lớn hơn 0";
    }

    if (course.duration) {
      if (course.duration.sessions && course.duration.sessions < 1) {
        errors.sessions = "Số buổi học phải lớn hơn 0";
      }

      if (
        course.duration.hoursPerSession &&
        course.duration.hoursPerSession < 0.5
      ) {
        errors.hoursPerSession = "Số giờ mỗi buổi phải ít nhất 0.5 giờ";
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  };

  const validateBeforeSubmit = (course: Partial<Course>) => {
    const validation = validateCourse(course);

    if (!validation.isValid) {
      const errorMessages = Object.values(validation.errors).join("\n");
      throw new Error(`Dữ liệu không hợp lệ:\n${errorMessages}`);
    }

    return validation;
  };

  return {
    validateCourse,
    validateBeforeSubmit,
  };
};
