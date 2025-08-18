/**
 * WebSocket Realtime Hook - Tối ưu cho khóa học
 * Tự động cập nhật data khi admin thay đổi
 */

import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

interface UseWebSocketRealtimeOptions {
  courseId?: string;
  enabled?: boolean;
  // Optional client-side hooks - will be called after a revalidation/refresh
  onCourseUpdate?: () => void;
  onProgressUpdate?: () => void;
  onEnrollmentUpdate?: () => void;
  // If provided, will poll at this interval (ms). Otherwise rely on focus/reconnect-triggered revalidation.
  pollInterval?: number | null;
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
}

/**
 * Frontend-only realtime helper using TanStack Query revalidation.
 * Backend doesn't support WebSocket/SSE, so we rely on cache invalidation,
 * focus/online triggers and optional polling.
 */
export function useWebSocketRealtime(
  options: UseWebSocketRealtimeOptions = {}
) {
  const {
    courseId,
    enabled = true,
    onCourseUpdate,
    onProgressUpdate,
    onEnrollmentUpdate,
    pollInterval = null,
    revalidateOnFocus = true,
    revalidateOnReconnect = true,
  } = options;

  const queryClient = useQueryClient();
  const { user } = useAuth();
  const pollRef = useRef<number | null>(null);

  const invalidateCourseKeys = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["courses"] });
    if (courseId) {
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      queryClient.invalidateQueries({
        queryKey: ["course", courseId, "lessons"],
      });
      queryClient.invalidateQueries({
        queryKey: ["course", courseId, "tests"],
      });
      queryClient.invalidateQueries({
        queryKey: ["course", courseId, "attached-files"],
      });
    }
  }, [queryClient, courseId]);

  useEffect(() => {
    if (!enabled || !user?.id) return;

    // Focus -> revalidate
    const onFocus = () => {
      if (!revalidateOnFocus) return;
      invalidateCourseKeys();
      onCourseUpdate?.();
      onProgressUpdate?.();
      onEnrollmentUpdate?.();
    };

    // Reconnect (online) -> revalidate
    const onOnline = () => {
      if (!revalidateOnReconnect) return;
      invalidateCourseKeys();
      onCourseUpdate?.();
      onProgressUpdate?.();
      onEnrollmentUpdate?.();
    };

    if (revalidateOnFocus) window.addEventListener("focus", onFocus);
    if (revalidateOnReconnect) window.addEventListener("online", onOnline);

    // Optional polling
    if (pollInterval && pollInterval > 0) {
      // Use window.setInterval to obtain a numeric id (compatible with browser)
      pollRef.current = window.setInterval(() => {
        invalidateCourseKeys();
        onCourseUpdate?.();
        onProgressUpdate?.();
        onEnrollmentUpdate?.();
      }, pollInterval) as unknown as number;
    }

    return () => {
      if (revalidateOnFocus) window.removeEventListener("focus", onFocus);
      if (revalidateOnReconnect) window.removeEventListener("online", onOnline);
      if (pollRef.current) {
        clearInterval(pollRef.current as number);
        pollRef.current = null;
      }
    };
  }, [
    enabled,
    user?.id,
    courseId,
    invalidateCourseKeys,
    onCourseUpdate,
    onProgressUpdate,
    onEnrollmentUpdate,
    pollInterval,
    revalidateOnFocus,
    revalidateOnReconnect,
  ]);

  // Manual refresh API
  const refresh = useCallback(() => {
    invalidateCourseKeys();
  }, [invalidateCourseKeys]);

  return {
    // No websocket connection in this mode
    isConnected: false,
    send: () => console.log("No WebSocket backend - send() is a no-op"),
    refresh,
  };
}

// Simple alias for course detail pages
export function useCourseRealtime(courseId: string) {
  return useWebSocketRealtime({
    courseId,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });
}
