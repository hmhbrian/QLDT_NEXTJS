export type PaginationMode = "page" | "offset";

export interface PaginationInput {
    page?: number; // 1-based by convention in UI
    pageSize?: number;
}

export interface BuildPaginationOptions {
    mode?: PaginationMode; // default: 'page'
    // Keys for page-size pagination
    pageKey?: string; // default: 'Page'
    sizeKey?: string; // default: 'Limit'
    // Keys for offset pagination (if mode === 'offset')
    offsetKey?: string; // default: 'Offset'
    limitKey?: string; // default: 'Limit'
    zeroBased?: boolean; // if true and mode==='page', send page-1
}

/**
 * Build pagination params compatible with various backend styles.
 * - UI is 1-based page; set zeroBased=true if backend expects 0-based.
 * - Supports both page/size and offset/limit.
 */
export function buildPaginationParams(
    input: PaginationInput,
    options: BuildPaginationOptions = {}
) {
    const {
        mode = "page",
        pageKey = "Page",
        sizeKey = "Limit",
        offsetKey = "Offset",
        limitKey = "Limit",
        zeroBased = false,
    } = options;

    const page = input.page ?? 1;
    const size = input.pageSize ?? 10;

    if (mode === "offset") {
        const offset = (Math.max(1, page) - 1) * size;
        return {
            [offsetKey]: offset,
            [limitKey]: size,
        } as Record<string, number>;
    }

    // mode === 'page'
    const pageValue = zeroBased ? Math.max(1, page) - 1 : Math.max(1, page);
    return {
        [pageKey]: pageValue,
        [sizeKey]: size,
    } as Record<string, number>;
}

export interface NormalizeMetaOptions {
    totalItemsKey?: string; // default: 'totalItems'
    itemsPerPageKey?: string; // default: 'itemsPerPage'
    currentPageKey?: string; // default: 'currentPage'
    totalPagesKey?: string; // default: 'totalPages'
    zeroBased?: boolean; // if true, add +1 to currentPage
}

export interface NormalizedPaginationMeta {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number; // 1-based
    totalPages: number;
}

/**
 * Normalize backend pagination meta into a stable shape the UI can consume.
 */
export function normalizePaginationMeta(
    meta: any,
    options: NormalizeMetaOptions = {}
): NormalizedPaginationMeta {
    const {
        totalItemsKey = "totalItems",
        itemsPerPageKey = "itemsPerPage",
        currentPageKey = "currentPage",
        totalPagesKey = "totalPages",
        zeroBased = false,
    } = options;

    const totalItems = Number(meta?.[totalItemsKey] ?? 0) || 0;
    const itemsPerPage = Number(meta?.[itemsPerPageKey] ?? 10) || 10;
    let currentPage = Number(meta?.[currentPageKey] ?? 1) || 1;
    const totalPages = Number(meta?.[totalPagesKey] ?? 1) || 1;

    if (zeroBased) currentPage = currentPage + 1;

    return { totalItems, itemsPerPage, currentPage, totalPages };
}


