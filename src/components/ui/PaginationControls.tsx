"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaginationControlsProps {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function PaginationControls({
  page,
  pageSize,
  totalPages,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 30, 50],
  className,
}: PaginationControlsProps) {
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className={`flex flex-col md:flex-row items-center gap-3 md:gap-4 justify-between px-2 py-4 ${className || ""}`}>
      <div className="w-full md:flex-1 text-xs sm:text-sm text-muted-foreground text-center md:text-left">
        {start}–{end} trên {totalItems}
      </div>
      <div className="w-full md:w-auto flex flex-wrap items-center justify-center md:justify-end gap-3 md:gap-4">
        <div className="flex items-center gap-2">
          <p className="text-xs sm:text-sm font-medium hidden xs:block">Số dòng</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex min-w-[120px] items-center justify-center text-xs sm:text-sm font-medium">
          Trang {page} / {Math.max(totalPages, 1)}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => onPageChange(1)}
            disabled={page <= 1}
            aria-label="Trang đầu"
          >
            «
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            aria-label="Trang trước"
          >
            ‹
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(Math.min(Math.max(totalPages, 1), page + 1))}
            disabled={page >= totalPages}
            aria-label="Trang sau"
          >
            ›
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => onPageChange(Math.max(totalPages, 1))}
            disabled={page >= totalPages}
            aria-label="Trang cuối"
          >
            »
          </Button>
        </div>
      </div>
    </div>
  );
}


