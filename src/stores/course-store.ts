import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import type { Course } from '@/lib/types';
import { mockCourses } from '@/lib/mock';
import Cookies from 'js-cookie';

interface CourseStore {
    courses: Course[];
    setCourses: (courses: Course[]) => void;
    addCourse: (course: Course) => void;
    updateCourse: (courseId: string, courseData: Partial<Course>) => void;
    deleteCourse: (courseId: string) => void;
    fetchCourses: () => Promise<void>;
    _hasHydrated: boolean;
    setHasHydrated: (hydrated: boolean) => void;
}

// Custom storage object using js-cookie
const cookieStorage: StateStorage = {
    getItem: (name: string): string | null => {
        const value = Cookies.get(name);
        return value === undefined ? null : value;
    },
    setItem: (name: string, value: string): void => {
        Cookies.set(name, value, {
            expires: 7, // Cookie expires after 7 days
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
        });
    },
    removeItem: (name: string): void => {
        Cookies.remove(name);
    },
};

// Function to ensure dates are in string format when loading from cookie
const ensureDateStrings = (courses: Course[]): Course[] => {
    return courses.map((course) => ({
        ...course,
        // Keep dates as strings or convert Date objects to strings if needed
        startDate: course.startDate,
        endDate: course.endDate,
        registrationDeadline: course.registrationDeadline,
        createdAt: typeof course.createdAt === 'object' ? new Date(course.createdAt).toISOString() : course.createdAt,
        modifiedAt: typeof course.modifiedAt === 'object' ? new Date(course.modifiedAt).toISOString() : course.modifiedAt,
    }));
};

// Prepare course data with necessary properties
const preparedMockCourses = mockCourses.map(course => ({
    ...course,
    materials: (course.materials || []).map(material => ({
        ...material,
        id: material.id || crypto.randomUUID(),
    })),
    lessons: course.lessons || [],
    tests: course.tests || [],
}));

export const useCourseStore = create<CourseStore>()(
    persist(
        (set) => ({
            courses: preparedMockCourses,
            _hasHydrated: false,
            setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
            fetchCourses: async () => {
                // Data is managed through cookies, no API call needed
            },
            setCourses: (courses) => {
                set({ courses: ensureDateStrings(courses) });
            },
            addCourse: (course) => {
                set((state) => {
                    const newCourseWithDate = {
                        ...course,
                        createdAt: course.createdAt || new Date().toISOString(),
                        modifiedAt: course.modifiedAt || new Date().toISOString(),
                        // Preserve other date fields
                        startDate: course.startDate,
                        endDate: course.endDate,
                        registrationDeadline: course.registrationDeadline,
                    };
                    return { courses: [...state.courses, newCourseWithDate] };
                });
            },
            updateCourse: (courseId, courseData) => {
                set((state) => ({
                    courses: state.courses.map((course) =>
                        course.id === courseId
                            ? {
                                ...course,
                                ...courseData,
                                modifiedAt: new Date().toISOString(),
                                // Preserve other date fields
                                startDate: courseData.startDate || course.startDate,
                                endDate: courseData.endDate || course.endDate,
                                registrationDeadline: courseData.registrationDeadline || course.registrationDeadline,
                            }
                            : course
                    ),
                }));
            },
            deleteCourse: (courseId) => {
                set((state) => ({
                    courses: state.courses.filter((course) => course.id !== courseId),
                }));
            },
        }),
        {
            name: 'becamex-course-list-storage', // Cookie name
            storage: createJSONStorage(() => cookieStorage),
            onRehydrateStorage: () => (state, error) => {
                if (error) {
                    console.error('Error loading course data from cookie:', error);
                } else if (state) {
                    state.courses = ensureDateStrings(state.courses);
                    state.setHasHydrated(true);
                }
            },
            // Only store the courses array
            partialize: (state) => ({ courses: state.courses }),
        }
    )
);

// Ensure _hasHydrated is set after initial loading from cookie
if (typeof window !== 'undefined') {
    useCourseStore.persist.rehydrate();
} 