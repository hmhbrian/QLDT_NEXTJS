import React, { useEffect, useState } from "react";
import {
  useCourses,
  useCourseActions,
  useCoursesLoading,
  useCoursesError,
  useCourseOperations,
  useBulkCourseOperations,
  useCacheStatus,
  useIsCreatingCourse,
  useIsUpdatingCourse,
  useIsDeletingCourse,
} from "@/stores/course-store";
import type { Course } from "@/lib/types/course.types";

/**
 * Enhanced Course Management Component
 * Demonstrates all the advanced features of the new Course Store
 *
 * Features demonstrated:
 * - Optimistic updates
 * - Granular loading states
 * - Error handling with retry
 * - Bulk operations
 * - Cache management
 * - Performance optimizations
 */
export function EnhancedCourseManager() {
  // ===== STORE HOOKS =====
  const courses = useCourses();
  const isLoading = useCoursesLoading();
  const error = useCoursesError();
  const { fetchCourses, addCourse, updateCourse, deleteCourse, clearError } =
    useCourseActions();
  const { withErrorHandling } = useCourseOperations();
  const { bulkDelete } = useBulkCourseOperations();
  const { isValid, lastFetch } = useCacheStatus();

  // ===== LOCAL STATE =====
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [newCourseData, setNewCourseData] = useState<Partial<Course>>({});
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  // ===== LOADING STATES =====
  const isCreatingCourse = useIsCreatingCourse();

  // ===== EFFECTS =====
  useEffect(() => {
    // Only fetch if cache is invalid or we have no courses
    if (!isValid || courses.length === 0) {
      fetchCourses();
    }
  }, [fetchCourses, isValid, courses.length]);

  // ===== HANDLERS =====

  /**
   * Create new course with optimistic update and error handling
   */
  const handleCreateCourse = async () => {
    try {
      const courseData: Course = {
        ...newCourseData,
        id: `temp-${Date.now()}`, // Temporary ID for optimistic update
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
      } as Course;

      await withErrorHandling(
        () => addCourse(courseData, { optimistic: true }),
        "Failed to create course",
        3 // 3 retries with exponential backoff
      );

      setNewCourseData({});
      alert("Course created successfully!");
    } catch (error) {
      console.error("Failed to create course after retries:", error);
      alert(
        `Failed to create course: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  /**
   * Update course with optimistic update
   */
  const handleUpdateCourse = async (
    courseId: string,
    updates: Partial<Course>
  ) => {
    try {
      await withErrorHandling(
        () => updateCourse(courseId, updates, { optimistic: true }),
        "Failed to update course",
        2
      );

      setEditingCourseId(null);
      alert("Course updated successfully!");
    } catch (error) {
      console.error("Failed to update course:", error);
      alert(
        `Failed to update course: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  /**
   * Delete single course with optimistic update
   */
  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      await withErrorHandling(
        () => deleteCourse(courseId, { optimistic: true }),
        "Failed to delete course",
        2
      );

      alert("Course deleted successfully!");
    } catch (error) {
      console.error("Failed to delete course:", error);
      alert(
        `Failed to delete course: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  /**
   * Bulk delete with progress tracking
   */
  const handleBulkDelete = async () => {
    if (selectedCourseIds.length === 0) {
      alert("Please select courses to delete");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete ${selectedCourseIds.length} courses?`
      )
    )
      return;

    try {
      setBulkProgress(0);

      const results = await bulkDelete(
        selectedCourseIds,
        (completed, total) => {
          setBulkProgress((completed / total) * 100);
        }
      );

      const successful = results.filter((r) => r.success).length;
      const failed = results.length - successful;

      if (failed === 0) {
        alert(`Successfully deleted ${successful} courses!`);
      } else {
        alert(`Deleted ${successful} courses. ${failed} deletions failed.`);
      }

      setSelectedCourseIds([]);
      setBulkProgress(0);
    } catch (error) {
      console.error("Bulk delete failed:", error);
      alert("Bulk delete operation failed");
      setBulkProgress(0);
    }
  };

  /**
   * Force refresh cache
   */
  const handleForceRefresh = () => {
    fetchCourses({ force: true });
  };

  /**
   * Toggle course selection for bulk operations
   */
  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourseIds((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  // ===== RENDER =====

  return (
    <div className="enhanced-course-manager p-6 max-w-7xl mx-auto">
      {/* Header with Cache Status */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Enhanced Course Manager</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            <span
              className={`inline-block w-2 h-2 rounded-full mr-2 ${
                isValid ? "bg-green-500" : "bg-red-500"
              }`}
            />
            Cache: {isValid ? "Valid" : "Expired"}
            {lastFetch > 0 && (
              <span className="ml-2">
                (Last: {new Date(lastFetch).toLocaleTimeString()})
              </span>
            )}
          </div>
          <button
            onClick={handleForceRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={isLoading}
          >
            {isLoading ? "Refreshing..." : "Force Refresh"}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <div className="flex justify-between items-center">
            <div>
              <strong>Error ({error.type}):</strong> {error.message}
              <div className="text-sm mt-1">
                Occurred at: {new Date(error.timestamp).toLocaleString()}
              </div>
            </div>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700 font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Create Course Form */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Create New Course</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Course Title"
            value={newCourseData.title || ""}
            onChange={(e) =>
              setNewCourseData((prev) => ({ ...prev, title: e.target.value }))
            }
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="Course Code"
            value={newCourseData.courseCode || ""}
            onChange={(e) =>
              setNewCourseData((prev) => ({
                ...prev,
                courseCode: e.target.value,
              }))
            }
            className="border rounded px-3 py-2"
          />
          <button
            onClick={handleCreateCourse}
            disabled={
              isCreatingCourse ||
              !newCourseData.title ||
              !newCourseData.courseCode
            }
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            {isCreatingCourse ? "Creating..." : "Create Course"}
          </button>
        </div>
      </div>

      {/* Bulk Operations */}
      {selectedCourseIds.length > 0 && (
        <div className="bg-yellow-50 p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center">
            <span>{selectedCourseIds.length} courses selected</span>
            <div className="flex gap-2">
              {bulkProgress > 0 && (
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-4">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${bulkProgress}%` }}
                  />
                </div>
              )}
              <button
                onClick={handleBulkDelete}
                disabled={bulkProgress > 0}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:bg-gray-400"
              >
                {bulkProgress > 0
                  ? `Deleting... ${Math.round(bulkProgress)}%`
                  : "Delete Selected"}
              </button>
              <button
                onClick={() => setSelectedCourseIds([])}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading && courses.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading courses...</p>
          </div>
        ) : (
          courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              isSelected={selectedCourseIds.includes(course.id)}
              onSelect={() => toggleCourseSelection(course.id)}
              onEdit={(updates) => handleUpdateCourse(course.id, updates)}
              onDelete={() => handleDeleteCourse(course.id)}
              isEditing={editingCourseId === course.id}
              onStartEdit={() => setEditingCourseId(course.id)}
              onCancelEdit={() => setEditingCourseId(null)}
            />
          ))
        )}
      </div>

      {/* Empty State */}
      {!isLoading && courses.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No courses found
          </h3>
          <p className="text-gray-500">
            Start by creating your first course above
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Individual Course Card Component with granular loading states
 */
interface CourseCardProps {
  course: Course;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: (updates: Partial<Course>) => void;
  onDelete: () => void;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
}

function CourseCard({
  course,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  isEditing,
  onStartEdit,
  onCancelEdit,
}: CourseCardProps) {
  const isUpdating = useIsUpdatingCourse(course.id);
  const isDeleting = useIsDeletingCourse(course.id);
  const [editData, setEditData] = useState<Partial<Course>>({});

  useEffect(() => {
    if (isEditing) {
      setEditData({ title: course.title, description: course.description });
    }
  }, [isEditing, course]);

  const handleSave = () => {
    onEdit(editData);
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 border-2 transition-all ${
        isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"
      } ${isUpdating || isDeleting ? "opacity-50" : ""}`}
    >
      {/* Selection Checkbox */}
      <div className="flex items-start justify-between mb-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="mt-1"
        />
        <div className="flex gap-2">
          {isUpdating && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              Updating...
            </span>
          )}
          {isDeleting && (
            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
              Deleting...
            </span>
          )}
        </div>
      </div>

      {/* Course Content */}
      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={editData.title || ""}
            onChange={(e) =>
              setEditData((prev) => ({ ...prev, title: e.target.value }))
            }
            className="w-full border rounded px-3 py-2"
            placeholder="Course Title"
          />
          <textarea
            value={editData.description || ""}
            onChange={(e) =>
              setEditData((prev) => ({ ...prev, description: e.target.value }))
            }
            className="w-full border rounded px-3 py-2 h-20"
            placeholder="Course Description"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isUpdating}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:bg-gray-400"
            >
              Save
            </button>
            <button
              onClick={onCancelEdit}
              className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
          <p className="text-gray-600 text-sm mb-2">{course.courseCode}</p>
          <p className="text-gray-700 mb-4">{course.description}</p>

          <div className="flex justify-between items-center">
            <span
              className={`px-2 py-1 rounded text-xs ${
                course.status === "published"
                  ? "bg-green-100 text-green-800"
                  : course.status === "draft"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {course.status}
            </span>

            <div className="flex gap-2">
              <button
                onClick={onStartEdit}
                disabled={isUpdating || isDeleting}
                className="text-blue-500 hover:text-blue-700 text-sm disabled:text-gray-400"
              >
                Edit
              </button>
              <button
                onClick={onDelete}
                disabled={isUpdating || isDeleting}
                className="text-red-500 hover:text-red-700 text-sm disabled:text-gray-400"
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default EnhancedCourseManager;
