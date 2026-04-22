/**
 * API Error Handler Utilities
 * Comprehensive error handling for API calls
 */

export interface ApiError {
    status: number;
    message: string;
    code?: string;
    details?: any;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: ApiError;
    message?: string;
}

// Parse error response
export const parseApiError = (error: any): ApiError => {
    // If it's already an ApiError
    if (error.status && error.message) {
        return error;
    }

    // If it's a fetch error
    if (error instanceof TypeError) {
        return {
            status: 0,
            message: 'Network error. Please check your connection.',
            code: 'NETWORK_ERROR',
        };
    }

    // If it's a response error
    if (error.response) {
        const { status, data } = error.response;
        return {
            status,
            message: data?.message || data?.error || 'An error occurred',
            code: data?.code,
            details: data,
        };
    }

    // If it's an axios error
    if (error.message) {
        return {
            status: error.status || 500,
            message: error.message,
            code: error.code,
        };
    }

    // Default error
    return {
        status: 500,
        message: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
    };
};

// Get user-friendly error message
export const getErrorMessage = (error: any): string => {
    const apiError = parseApiError(error);

    const errorMessages: Record<number, string> = {
        400: 'Invalid request. Please check your input.',
        401: 'Unauthorized. Please log in again.',
        403: 'Forbidden. You do not have permission to perform this action.',
        404: 'Resource not found.',
        409: 'Conflict. This resource already exists.',
        422: 'Validation error. Please check your input.',
        429: 'Too many requests. Please try again later.',
        500: 'Server error. Please try again later.',
        502: 'Bad gateway. Please try again later.',
        503: 'Service unavailable. Please try again later.',
        504: 'Gateway timeout. Please try again later.',
    };

    return errorMessages[apiError.status] || apiError.message || 'An error occurred';
};

// Check if error is retryable
export const isRetryableError = (error: any): boolean => {
    const apiError = parseApiError(error);
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    return retryableStatuses.includes(apiError.status);
};

// Check if error is authentication error
export const isAuthError = (error: any): boolean => {
    const apiError = parseApiError(error);
    return apiError.status === 401 || apiError.status === 403;
};

// Check if error is validation error
export const isValidationError = (error: any): boolean => {
    const apiError = parseApiError(error);
    return apiError.status === 400 || apiError.status === 422;
};

// Get validation errors
export const getValidationErrors = (error: any): Record<string, string> => {
    const apiError = parseApiError(error);

    if (apiError.details?.errors) {
        return apiError.details.errors;
    }

    if (apiError.details?.fieldErrors) {
        return apiError.details.fieldErrors;
    }

    return {};
};

// Retry with exponential backoff
export const retryWithBackoff = async <T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<T> => {
    let lastError: any;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            if (!isRetryableError(error) || i === maxRetries - 1) {
                throw error;
            }

            const delay = baseDelay * Math.pow(2, i);
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }

    throw lastError;
};

// Handle API response
export const handleApiResponse = <T>(response: any): ApiResponse<T> => {
    if (response.success === false) {
        return {
            success: false,
            error: parseApiError(response.error || response),
            message: response.message,
        };
    }

    return {
        success: true,
        data: response.data || response,
        message: response.message,
    };
};

// Log error for debugging
export const logApiError = (error: any, context?: string): void => {
    const apiError = parseApiError(error);
    console.error(`[API Error${context ? ` - ${context}` : ''}]`, {
        status: apiError.status,
        message: apiError.message,
        code: apiError.code,
        details: apiError.details,
    });
};

// Create error toast message
export const createErrorToast = (error: any): { title: string; description: string } => {
    const apiError = parseApiError(error);

    return {
        title: 'Error',
        description: getErrorMessage(error),
    };
};

// Create success toast message
export const createSuccessToast = (message: string): { title: string; description: string } => {
    return {
        title: 'Success',
        description: message,
    };
};
