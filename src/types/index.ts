// User Types
export interface User {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    permissions: string[];
    avatar?: string;
}

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface ApiError {
    success: false;
    message: string;
    error: {
        code: string;
        details?: string;
    };
}

// Pagination Types
export interface PaginationParams {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Common Types
export interface SelectOption {
    label: string;
    value: string;
}

export interface DateRange {
    from: Date;
    to: Date;
}
