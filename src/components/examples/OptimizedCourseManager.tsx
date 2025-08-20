/**
 * Example: Optimized Course Management Component
 * Demonstrates best practices for performance optimization
 */

"use client";

import React, { useMemo, useCallback } from "react";
import {
  useAttachedFiles,
  useCreateAttachedFiles,
  useDeleteAttachedFile,
  useOptimizedFilter,
  useDebounce,
} from "@/hooks";
import { useCourseRealtime } from "@/hooks/use-realtime-sync";
import { useSmartCache, useSmartDebounce } from "@/lib/optimization/simple";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface OptimizedCourseManagerProps {
  courseId: string;
}

export function OptimizedCourseManager({
  courseId,
}: OptimizedCourseManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Optimized data fetching with smart caching
  const { attachedFiles, isLoading } = useAttachedFiles(courseId);
  const createMutation = useCreateAttachedFiles();
  const deleteMutation = useDeleteAttachedFile();

  // Real-time sync for course data
  const { forceSync, isActive } = useCourseRealtime(courseId);

  // Smart caching for computed data
  const { get: getCachedData, set: setCachedData } = useSmartCache<any>();

  // Debounced search with smart debouncing
  const { debounce } = useSmartDebounce();
  const debouncedSetSearch = useMemo(
    () => debounce("search-files", setSearchTerm, 300, 1), // High priority
    [debounce]
  );

  // Optimized filtering with memoization
  const filteredFiles = useOptimizedFilter(
    attachedFiles,
    useDebounce(searchTerm, 300),
    (file, search) =>
      file.title.toLowerCase().includes(search) ||
      file.type.toLowerCase().includes(search)
  );

  // Cached computation for file statistics
  const fileStats = useMemo(() => {
    const cacheKey = `file-stats-${courseId}-${attachedFiles.length}`;
    const cached = getCachedData(cacheKey);

    if (cached) return cached;

    const stats = {
      totalFiles: attachedFiles.length,
      totalSize: attachedFiles.length * 1024, // Estimate since we don't have size
      fileTypes: attachedFiles.reduce((acc, file) => {
        acc[file.type] = (acc[file.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    setCachedData(cacheKey, stats);
    return stats;
  }, [attachedFiles, courseId, getCachedData, setCachedData]);

  // Optimized file upload with batch processing
  const handleFileUpload = useCallback(
    async (files: FileList) => {
      if (!files.length) return;

      setIsUploading(true);

      try {
        // Convert files to batch payload
        const filePayloads = Array.from(files).map((file) => ({
          title: file.name,
          file: file,
          link: file.name.endsWith(".pdf")
            ? URL.createObjectURL(file)
            : undefined,
        }));

        // Use optimistic updates - UI updates immediately
        await createMutation.mutateAsync({
          courseId,
          files: filePayloads,
        });

        // Force real-time sync after successful upload
        forceSync();
      } catch (error) {
        console.error("Upload failed:", error);
      } finally {
        setIsUploading(false);
      }
    },
    [courseId, createMutation, forceSync]
  );

  // Optimized delete with confirmation
  const handleFileDelete = useCallback(
    async (fileId: number) => {
      if (!confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) return;

      try {
        // Optimistic delete - file disappears immediately from UI
        await deleteMutation.mutateAsync({ courseId, fileId });

        // Force real-time sync after successful delete
        forceSync();
      } catch (error) {
        console.error("Delete failed:", error);
      }
    },
    [courseId, deleteMutation, forceSync]
  );

  // Performance indicator
  const performanceIndicator = useMemo(() => {
    if (isLoading) return "⏳ Đang tải...";
    if (!isActive) return "📱 Chế độ nền";
    if (createMutation.isPending || deleteMutation.isPending)
      return "🔄 Đang xử lý...";
    return `✅ Hoạt động (${attachedFiles.length} tài liệu)`;
  }, [
    isLoading,
    isActive,
    createMutation.isPending,
    deleteMutation.isPending,
    attachedFiles.length,
  ]);

  return (
    <div className="space-y-6">
      {/* Performance Status */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <span className="text-sm font-medium">
          Trạng thái: {performanceIndicator}
        </span>
        <Button
          onClick={() => forceSync()}
          size="sm"
          variant="outline"
          disabled={isLoading}
        >
          🔄 Đồng bộ
        </Button>
      </div>

      {/* File Statistics - Cached computation */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600">Tổng tài liệu</p>
          <p className="text-2xl font-bold text-blue-600">
            {fileStats.totalFiles}
          </p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-gray-600">Tổng dung lượng</p>
          <p className="text-2xl font-bold text-green-600">
            {(fileStats.totalSize / 1024 / 1024).toFixed(1)} MB
          </p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <p className="text-sm text-gray-600">Loại file</p>
          <p className="text-2xl font-bold text-purple-600">
            {Object.keys(fileStats.fileTypes).length}
          </p>
        </div>
      </div>

      {/* Search - Debounced input */}
      <div className="space-y-2">
        <Input
          placeholder="🔍 Tìm kiếm tài liệu..."
          onChange={(e) => debouncedSetSearch(e.target.value)}
          className="w-full"
        />
        {searchTerm && (
          <p className="text-sm text-gray-500">
            Tìm thấy {filteredFiles.length} tài liệu cho "{searchTerm}"
          </p>
        )}
      </div>

      {/* File Upload */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <input
          type="file"
          multiple
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          className="hidden"
          id="file-upload"
          disabled={isUploading}
        />
        <label
          htmlFor="file-upload"
          className={`cursor-pointer flex flex-col items-center space-y-2 ${
            isUploading ? "opacity-50 cursor-wait" : ""
          }`}
        >
          <div className="text-4xl">📁</div>
          <p className="text-sm text-gray-600">
            {isUploading ? "Đang tải lên..." : "Nhấp để tải lên tài liệu"}
          </p>
        </label>
      </div>

      {/* File List - Optimized rendering */}
      <div className="space-y-2">
        {filteredFiles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm
              ? "Không tìm thấy tài liệu nào"
              : "Chưa có tài liệu nào"}
          </div>
        ) : (
          filteredFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📄</span>
                <div>
                  <p className="font-medium">{file.title}</p>
                  <p className="text-sm text-gray-500">
                    {file.type} •{" "}
                    {file.createdAt
                      ? new Date(file.createdAt).toLocaleDateString()
                      : "Unknown date"}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => handleFileDelete(file.id)}
                size="sm"
                variant="destructive"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "🔄" : "🗑️"}
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Export with performance optimization wrapper
export default React.memo(OptimizedCourseManager);
