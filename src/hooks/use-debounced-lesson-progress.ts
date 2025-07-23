import { useCallback, useRef, useEffect } from "react";
import { useUpsertLessonProgress } from "./use-lesson-progress";
import type { UpsertLessonProgressPayload } from "@/lib/types/course.types";

/**
 * Debounced hook for saving lesson progress to improve performance
 * Prevents too frequent API calls when user is scrubbing through video
 * Automatically saves pending progress on unmount
 */
export function useDebouncedLessonProgress(
  courseId: string,
  debounceMs: number = 1500
) {
  const upsertMutation = useUpsertLessonProgress(courseId);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastPayloadRef = useRef<UpsertLessonProgressPayload | null>(null);
  const isMountedRef = useRef(true);

  const debouncedUpsert = useCallback(
    (payload: UpsertLessonProgressPayload) => {
      // Store the latest payload
      lastPayloadRef.current = payload;

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        if (lastPayloadRef.current && isMountedRef.current) {
          console.log("Auto-saving lesson progress:", lastPayloadRef.current);
          upsertMutation.mutate(lastPayloadRef.current);
          lastPayloadRef.current = null;
        }
      }, debounceMs);
    },
    [upsertMutation, debounceMs]
  );

  // Force save immediately (useful for when user pauses or finishes video)
  const saveImmediately = useCallback(
    (payload: UpsertLessonProgressPayload) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      lastPayloadRef.current = null;
      console.log("Immediately saving lesson progress:", payload);
      upsertMutation.mutate(payload);
    },
    [upsertMutation]
  );

  // Cleanup on unmount - ensures pending progress is saved
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    // Save any pending progress before cleanup
    if (lastPayloadRef.current) {
      console.log(
        "Saving pending progress on cleanup:",
        lastPayloadRef.current
      );
      upsertMutation.mutate(lastPayloadRef.current);
      lastPayloadRef.current = null;
    }
  }, [upsertMutation]);

  // Auto cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      // Force save any pending progress immediately when component unmounts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (lastPayloadRef.current) {
        console.log(
          "Component unmounting - saving final progress:",
          lastPayloadRef.current
        );
        // Use synchronous approach to ensure it saves before unmount
        upsertMutation.mutate(lastPayloadRef.current);
        lastPayloadRef.current = null;
      }
    };
  }, [upsertMutation]);

  // Save progress when page visibility changes (user switches tabs or closes browser)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && lastPayloadRef.current) {
        console.log("Page hidden - saving progress:", lastPayloadRef.current);
        saveImmediately(lastPayloadRef.current);
      }
    };

    const handleBeforeUnload = () => {
      if (lastPayloadRef.current) {
        console.log(
          "Page unloading - saving progress:",
          lastPayloadRef.current
        );
        // Use navigator.sendBeacon for reliable saving on page unload
        const endpoint = `/api/courses/${courseId}/lesson-progress`;
        const data = JSON.stringify(lastPayloadRef.current);

        if (navigator.sendBeacon) {
          navigator.sendBeacon(endpoint, data);
        } else {
          // Fallback to synchronous save
          saveImmediately(lastPayloadRef.current);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [courseId, saveImmediately]);

  return {
    debouncedUpsert,
    saveImmediately,
    cleanup,
    isLoading: upsertMutation.isPending,
    error: upsertMutation.error,
    hasPendingProgress: () => lastPayloadRef.current !== null,
  };
}
