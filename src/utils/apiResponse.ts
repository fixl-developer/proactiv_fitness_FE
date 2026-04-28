/**
 * Backend response shapes vary across modules — some controllers wrap the array
 * in `{data}`, some in `{data: {data, pagination}}`, some return `{programs}`/`{items}`/`{users}`.
 * This helper finds the array regardless of where it sits, so admin pages don't
 * each re-implement a fragile unwrap chain (which is how dropdowns silently
 * end up empty even when the API returned data).
 *
 * Pass the raw response from `apiClient.get(...)`. Returns `[]` if no array can
 * be located — never `null`/`undefined`, so callers can `.map` directly.
 */
export function extractList<T = any>(response: any): T[] {
    if (!response) return [];
    if (Array.isArray(response)) return response as T[];

    // Common single-level shapes: response.data, response.items, response.programs, etc.
    const candidates = ['data', 'items', 'list', 'records', 'results', 'programs', 'users', 'staff', 'bookings', 'sessions', 'schedules', 'locations', 'terms', 'rooms'];
    for (const key of candidates) {
        const v = response?.[key];
        if (Array.isArray(v)) return v as T[];
    }

    // One level deeper — `{data: {data: [...], pagination}}` or `{data: {programs: [...], totalCount}}`
    const inner = response?.data;
    if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
        for (const key of candidates) {
            const v = inner?.[key];
            if (Array.isArray(v)) return v as T[];
        }
    }

    return [];
}

/**
 * Pull pagination metadata out of any response shape we use. Returns
 * `{page, limit, total, totalPages}` with sensible defaults when missing.
 */
export function extractPagination(response: any): { page: number; limit: number; total: number; totalPages: number } {
    const sources = [response?.pagination, response?.data?.pagination, response?.meta, response?.data?.meta, response];
    for (const src of sources) {
        if (src && typeof src === 'object') {
            const total = Number(src.total ?? src.totalCount ?? src.count ?? 0);
            const page = Number(src.page ?? 1);
            const limit = Number(src.limit ?? src.pageSize ?? 20);
            const totalPages = Number(src.totalPages ?? (limit > 0 ? Math.ceil(total / limit) : 1));
            if (total || src.totalPages || src.totalCount) {
                return { page, limit, total, totalPages: totalPages || 1 };
            }
        }
    }
    return { page: 1, limit: 20, total: 0, totalPages: 1 };
}
