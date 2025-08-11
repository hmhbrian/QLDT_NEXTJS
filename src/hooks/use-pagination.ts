"use client";

import { useCallback, useMemo, useState } from "react";

interface UsePaginationOptions {
    initialPage?: number;
    initialPageSize?: number;
}

export function usePagination(options: UsePaginationOptions = {}) {
    const { initialPage = 1, initialPageSize = 10 } = options;

    const [page, setPage] = useState<number>(initialPage);
    const [pageSize, setPageSize] = useState<number>(initialPageSize);
    const [totalItems, setTotalItems] = useState<number>(0);

    const setPageSafe = useCallback((nextPage: number) => {
        setPage((prev) => (nextPage < 1 ? 1 : nextPage));
    }, []);

    const setPageSizeSafe = useCallback((nextSize: number) => {
        setPageSize(nextSize > 0 ? nextSize : 10);
        setPageSafe(1); // Reset về trang 1 khi đổi pageSize
    }, [setPageSafe]);

    const totalPages = useMemo(() => {
        return Math.max(1, Math.ceil((totalItems || 0) / (pageSize || 1)));
    }, [totalItems, pageSize]);

    const range = useMemo(() => {
        const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
        const end = Math.min(page * pageSize, totalItems);
        return { start, end };
    }, [page, pageSize, totalItems]);

    return {
        page,
        pageSize,
        setPage: setPageSafe,
        setPageSize: setPageSizeSafe,
        totalItems,
        setTotalItems,
        totalPages,
        start: range.start,
        end: range.end,
    } as const;
}


