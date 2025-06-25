import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import type { Course } from "@/lib/types";
import { mockCourses } from "@/lib/mock";
import Cookies from "js-cookie";
import { API_CONFIG } from "@/lib/legacy-api/config";
// Giả định có coursesService tồn tại tương tự như usersService
// import { coursesService } from '@/lib/services';

interface CourseStore {
  courses: Course[];
  isLoading: boolean;
  error: string | null;
  setCourses: (courses: Course[]) => void;
  fetchCourses: () => Promise<void>;
  addCourse: (course: Course) => Promise<void>;
  updateCourse: (
    courseId: string,
    courseData: Partial<Course>
  ) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;
  _hasHydrated: boolean;
  setHasHydrated: (hydrated: boolean) => void;
}

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

export const useCourseStore = create<CourseStore>()(
  persist(
    (set, get) => ({
      courses: [],
      isLoading: true,
      error: null,
      _hasHydrated: false,
      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
      setCourses: (courses) => set({ courses: ensureDateStrings(courses) }),

      fetchCourses: async () => {
        if (!get().isLoading) set({ isLoading: true });
        try {
          if (API_CONFIG.useApi) {
            // const fetchedCourses = await coursesService.getCourses(); // Replace with actual API call
            // set({ courses: ensureDateStrings(fetchedCourses), isLoading: false, error: null });
            console.warn(
              "coursesService.getCourses() is not implemented. Using mock data."
            );
            set({ courses: mockCourses, isLoading: false, error: null });
          } else {
            set({ courses: mockCourses, isLoading: false, error: null });
          }
        } catch (error: any) {
          console.error("Failed to fetch courses:", error);
          set({
            error: "Failed to load courses.",
            isLoading: false,
            courses: mockCourses,
          }); // Fallback về mock
        }
      },

      addCourse: async (course) => {
        try {
          if (API_CONFIG.useApi) {
            // const newCourse = await coursesService.createCourse(course); // Thay thế bằng lời gọi API thực tế
            console.warn(
              "coursesService.createCourse() is not implemented. Adding to mock data."
            );
            set((state) => ({ courses: [...state.courses, course] }));
          } else {
            set((state) => ({ courses: [...state.courses, course] }));
          }
          await get().fetchCourses(); // Làm mới danh sách sau hành động
        } catch (error) {
          console.error("Failed to add course:", error);
          throw error; // Ném lại để component bắt được
        }
      },

      updateCourse: async (courseId, courseData) => {
        try {
          if (API_CONFIG.useApi) {
            // const updatedCourse = await coursesService.updateCourse(courseId, courseData); // Replace
            console.warn(
              "coursesService.updateCourse() is not implemented. Updating mock data."
            );
            set((state) => ({
              courses: state.courses.map((c) =>
                c.id === courseId ? { ...c, ...courseData } : c
              ),
            }));
          } else {
            set((state) => ({
              courses: state.courses.map((c) =>
                c.id === courseId ? { ...c, ...courseData } : c
              ),
            }));
          }
          await get().fetchCourses(); // Làm mới danh sách sau hành động
        } catch (error) {
          console.error("Failed to update course:", error);
          throw error; // Ném lại để component bắt được
        }
      },

      deleteCourse: async (courseId) => {
        try {
          if (API_CONFIG.useApi) {
            // await coursesService.deleteCourse(courseId); // Thay thế
            console.warn(
              "coursesService.deleteCourse() is not implemented. Deleting from mock data."
            );
            set((state) => ({
              courses: state.courses.filter((c) => c.id !== courseId),
            }));
          } else {
            set((state) => ({
              courses: state.courses.filter((c) => c.id !== courseId),
            }));
          }
          await get().fetchCourses(); // Làm mới danh sách sau hành động
        } catch (error) {
          console.error("Failed to delete course:", error);
          throw error; // Ném lại để component bắt được
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
      partialize: (state) => ({ courses: state.courses }),
    }
  )
);

if (typeof window !== "undefined") {
  useCourseStore.persist.rehydrate();
}
