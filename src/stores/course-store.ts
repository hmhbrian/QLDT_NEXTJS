
import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import { devtools } from "zustand/middleware";
import { Course, CourseApiResponse, CreateCourseRequest, UpdateCourseRequest } from "@/lib/types/course.types";
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

          if (!force && state.isCacheValid() && state.courses.length > 0) {
            return;
          }

          set((prev) => ({
            loadingStates: { ...prev.loadingStates, fetching: true },
            error: null,
          }));

          try {
            if (API_CONFIG.useApi) {
              const apiCoursesResponse = await coursesService.getCourses();
              const transformedCourses = (apiCoursesResponse.items || []).map(mapCourseApiToUi);

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
              courses: mockCourses, 
            }));
            throw error;
          }
        },

        // Enhanced add with optimistic updates
        addCourse: async (course, options = {}) => {
          const { optimistic = true } = options;

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
                  const apiPayload = mapCourseUiToCreatePayload(course);
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
              () => {
                if (optimistic) {
                  set((prev) => ({
                    courses: prev.courses.map((c) =>
                      c.id === courseId ? { ...c, ...courseData } : c
                    ),
                  }));
                }
              },
              () => {
                set((prev) => ({
                  courses: prev.courses.map((c) =>
                    c.id === courseId ? originalCourse : c
                  ),
                }));
              },
              async () => {
                if (API_CONFIG.useApi) {
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
              () => {
                if (optimistic) {
                  set((prev) => ({
                    courses: prev.courses.filter((c) => c.id !== courseId),
                  }));
                }
              },
              () => {
                set((prev) => ({
                  courses: [...prev.courses, originalCourse],
                }));
              },
              async () => {
                if (API_CONFIG.useApi) {
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
            get().invalidateCache();
          } catch (error: any) {
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
      name: "course-store",
      enabled: process.env.NODE_ENV === "development",
    }
  )
);

if (typeof window !== "undefined") {
  useCourseStore.persist.rehydrate();
}
