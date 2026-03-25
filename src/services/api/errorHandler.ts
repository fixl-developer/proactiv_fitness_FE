import { AxiosError } from 'axios'

export enum ErrorType {
    NETWORK_ERROR = 'NETWORK_ERROR',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
    SERVER_ERROR = 'SERVER_ERROR',
    TIMEOUT_ERROR = 'TIMEOUT_ERROR',
    CIRCUIT_BREAKER_ERROR = 'CIRCUIT_BREAKER_ERROR',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface AppError {
    type: ErrorType
    message: string
    userMessage: string
    statusCode?: number
    details?: any
    timestamp: number
    userId?: string
    module?: string
}

class ErrorHandler {
    static classifyError(error: any): AppError {
        const timestamp = Date.now()
        const userId = this.getUserId()

        // Network error
        if (!error.response && error.message === 'Network Error') {
            return {
                type: ErrorType.NETWORK_ERROR,
                message: 'Network connection failed',
                userMessage: 'Unable to connect to server. Please check your internet connection.',
                timestamp,
                userId
            }
        }

        // Timeout error
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            return {
                type: ErrorType.TIMEOUT_ERROR,
                message: 'Request timeout',
                userMessage: 'Request took too long. Please try again.',
                timestamp,
                userId
            }
        }

        // Circuit breaker error
        if (error.message && error.message.includes('Circuit breaker')) {
            return {
                type: ErrorType.CIRCUIT_BREAKER_ERROR,
                message: error.message,
                userMessage: 'Service temporarily unavailable. Please try again later.',
                timestamp,
                userId
            }
        }

        // Axios error with response
        if (error.response) {
            const status = error.response.status
            const data = error.response.data

            // 400 - Validation error
            if (status === 400) {
                return {
                    type: ErrorType.VALIDATION_ERROR,
                    message: data.message || 'Validation failed',
                    userMessage: data.message || 'Please check your input and try again.',
                    statusCode: status,
                    details: data.errors,
                    timestamp,
                    userId
                }
            }

            // 401 - Unauthorized
            if (status === 401) {
                return {
                    type: ErrorType.AUTHORIZATION_ERROR,
                    message: 'Unauthorized',
                    userMessage: 'Your session has expired. Please log in again.',
                    statusCode: status,
                    timestamp,
                    userId
                }
            }

            // 403 - Forbidden
            if (status === 403) {
                return {
                    type: ErrorType.AUTHORIZATION_ERROR,
                    message: 'Forbidden',
                    userMessage: 'You do not have permission to access this resource.',
                    statusCode: status,
                    timestamp,
                    userId
                }
            }

            // 404 - Not found
            if (status === 404) {
                return {
                    type: ErrorType.VALIDATION_ERROR,
                    message: 'Resource not found',
                    userMessage: 'The requested resource was not found.',
                    statusCode: status,
                    timestamp,
                    userId
                }
            }

            // 5xx - Server error
            if (status >= 500) {
                return {
                    type: ErrorType.SERVER_ERROR,
                    message: data.message || 'Server error',
                    userMessage: 'Server error occurred. Please try again later.',
                    statusCode: status,
                    details: data,
                    timestamp,
                    userId
                }
            }

            // Other HTTP errors
            return {
                type: ErrorType.UNKNOWN_ERROR,
                message: data.message || 'Unknown error',
                userMessage: 'An unexpected error occurred. Please try again.',
                statusCode: status,
                details: data,
                timestamp,
                userId
            }
        }

        // Unknown error
        return {
            type: ErrorType.UNKNOWN_ERROR,
            message: error.message || 'Unknown error',
            userMessage: 'An unexpected error occurred. Please try again.',
            timestamp,
            userId
        }
    }

    static getUserId(): string | undefined {
        try {
            const user = localStorage.getItem('user')
            if (user) {
                const userData = JSON.parse(user)
                return userData.id
            }
        } catch (e) {
            // Ignore parsing errors
        }
        return undefined
    }

    static getErrorMessage(error: any): string {
        const appError = this.classifyError(error)
        return appError.userMessage
    }

    static logError(error: AppError, module?: string) {
        const errorLog = {
            ...error,
            module: module || error.module,
            timestamp: new Date(error.timestamp).toISOString()
        }

        console.warn('[ERROR]', errorLog)

        // Audit logger integration can be added here when available
    }

    static isRetryable(error: any): boolean {
        const appError = this.classifyError(error)

        // Retryable errors
        const retryableTypes = [
            ErrorType.NETWORK_ERROR,
            ErrorType.TIMEOUT_ERROR,
            ErrorType.SERVER_ERROR
        ]

        return retryableTypes.includes(appError.type)
    }
}

export default ErrorHandler
