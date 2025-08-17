"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  OnChangeFn,
  PaginationState,
  SortingState,
  useReactTable,
  getFilteredRowModel,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "./skeleton";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  // Server-side pagination props
  pageCount?: number;
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  pageCount,
  pagination,
  onPaginationChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState({});

  const isServerSidePagination = pageCount !== undefined;

  // Fallback for client-side pagination when not controlled
  const [uncontrolledPagination, setUncontrolledPagination] =
    React.useState<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
    });

  const paginationState = pagination ?? uncontrolledPagination;
  const onPaginationChangeHandler =
    onPaginationChange ?? setUncontrolledPagination;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    // Pagination
    manualPagination: isServerSidePagination,
    pageCount: pageCount,
    onPaginationChange: onPaginationChangeHandler,
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      rowSelection,
      pagination: paginationState,
    },
  });

  const renderTableBody = () => {
    if (isLoading) {
      return (
        <TableBody>
          {Array.from({
            length: table.getState().pagination?.pageSize || 10,
          }).map((_, i) => (
            <TableRow key={`skeleton-${i}`}>
              {columns.map((column, j) => {
                const meta = (column as any).meta;
                const isSticky = meta?.sticky === "right";
                return (
                  <TableCell
                    key={`skeleton-cell-${i}-${j}`}
                    className={
                      isSticky
                        ? "sticky right-0 bg-background/80 backdrop-blur-sm"
                        : ""
                    }
                    style={
                      isSticky
                        ? {
                            width: (column as any).size || "auto",
                            minWidth: (column as any).size || "auto",
                            maxWidth: (column as any).size || "auto",
                          }
                        : {}
                    }
                  >
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      );
    }

    if (table.getRowModel().rows?.length) {
      return (
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
            >
              {row.getVisibleCells().map((cell) => {
                const meta = cell.column.columnDef.meta as any;
                const isSticky = meta?.sticky === "right";
                return (
                  <TableCell
                    key={cell.id}
                    className={`whitespace-nowrap ${
                      isSticky
                        ? "sticky right-0 bg-background/80 backdrop-blur-sm"
                        : ""
                    }`}
                    style={
                      isSticky
                        ? {
                            width: cell.column.getSize(),
                            minWidth: cell.column.getSize(),
                            maxWidth: cell.column.getSize(),
                          }
                        : {}
                    }
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      );
    }

    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={columns.length} className="h-24 text-center">
            Không có kết quả.
          </TableCell>
        </TableRow>
      </TableBody>
    );
  };

  return (
    <div>
      <div className="rounded-md border overflow-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as any;
                  const isSticky = meta?.sticky === "right";
                  return (
                    <TableHead
                      key={header.id}
                      className={
                        isSticky
                          ? "sticky right-0 bg-muted/95 z-10"
                          : ""
                      }
                      style={
                        isSticky
                          ? {
                              width: header.column.getSize(),
                              minWidth: header.column.getSize(),
                              maxWidth: header.column.getSize(),
                            }
                          : {}
                      }
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          {renderTableBody()}
        </Table>
      </div>
      <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 justify-between px-2 py-4">
        <div className="w-full md:flex-1 text-xs sm:text-sm text-muted-foreground text-center md:text-left">
          {table.getFilteredSelectedRowModel().rows.length} - {table.getFilteredRowModel().rows.length}
        </div>
        <div className="w-full md:w-auto flex flex-wrap items-center justify-center md:justify-end gap-3 md:gap-4">
          <div className="flex items-center gap-2">
            {/* <p className="text-sm font-medium">Số dòng mỗi trang</p> */}
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex min-w-[120px] items-center justify-center text-xs sm:text-sm font-medium">
            Trang {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
