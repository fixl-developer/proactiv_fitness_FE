import { apiClient } from '../api/client'
import ErrorHandler from '../api/errorHandler'

export interface LoginRequest {
    email: string
    password: string
}

export interface LoginResponse {
    success: boolean
    data: {
        user: {
            id: string
            email: string
            name: string
            role: {
                id: string
                name: string
            }
        }
        tokens: {
            accessToken: string
            refreshToken: string
        }
    }
    message?: string
}

export interface RegisterRequest {
    email: string
    password: string
    confirmPassword: string
    firstName: string
    lastName: string
    phone?: string
    role?: string
}

export interface RegisterResponse {
    success: boolean
    data: {
        user: {
            id: string
            email: string
            name: string
        }
    }
    message?: string
}

export interface RefreshTokenRequest {
    refreshToken: string
}

export interface RefreshTokenResponse {
    success: boolean
    data: {
        accessToken: string
    }
}

export interface ValidateTokenResponse {
    success: boolean
    data: {
        valid: boolean
        user?: {
            id: string
            email: string
            name: string
            role: {
                id: string
                name: string
            }
        }
    }
}

class AuthService {
    private readonly MODULE_NAME = 'iam'

    async login(credentials: LoginRequest): Promise<LoginResponse> {
        try {
            const response = await apiClient.post<LoginResponse>(
                '/auth/login',
                credentials
            )

            if (response.success) {
                // Normalize role to string (backend may return { id, name } object)
                const rawUser = response.data.user as any
                const normalizedUser = {
                    ...rawUser,
                    role: typeof rawUser.role === 'object' ? rawUser.role?.name : rawUser.role,
                    name: rawUser.name || rawUser.fullName || `${rawUser.firstName || ''} ${rawUser.lastName || ''}`.trim(),
                }
                response.data.user = normalizedUser
                localStorage.setItem('token', response.data.tokens.accessToken)
                localStorage.setItem('refreshToken', response.data.tokens.refreshToken)
                localStorage.setItem('user', JSON.stringify(normalizedUser))
            }

            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async register(data: RegisterRequest): Promise<RegisterResponse> {
        try {
            const response = await apiClient.post<RegisterResponse>(
                '/auth/register',
                data
            )

            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async logout(): Promise<void> {
        try {
            // Call logout endpoint if available
            await apiClient.post('/auth/logout', {})
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            // Clear local storage regardless
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')
        }
    }

    async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
        try {
            const response = await apiClient.post<RefreshTokenResponse>(
                '/auth/refresh-token',
                { refreshToken }
            )

            if (response.success) {
                localStorage.setItem('token', response.data.accessToken)
            }

            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async validateToken(): Promise<ValidateTokenResponse> {
        try {
            const response = await apiClient.get<ValidateTokenResponse>(
                '/auth/validate'
            )

            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await apiClient.post<{ success: boolean; message: string }>(
                '/auth/forgot-password',
                { email }
            )

            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
        try {
            // Backend expects token + newPassword + confirmPassword. Caller has
            // already validated equality, so we mirror newPassword into confirm.
            const response = await apiClient.post<{ success: boolean; message: string }>(
                '/auth/reset-password',
                { token, newPassword, confirmPassword: newPassword }
            )

            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await apiClient.post<{ success: boolean; message: string }>(
                '/auth/verify-email',
                { token }
            )

            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    getStoredUser() {
        try {
            const user = localStorage.getItem('user')
            return user ? JSON.parse(user) : null
        } catch (error) {
            console.error('Error parsing stored user:', error)
            return null
        }
    }

    getStoredToken(): string | null {
        return localStorage.getItem('token')
    }

    getStoredRefreshToken(): string | null {
        return localStorage.getItem('refreshToken')
    }

    isAuthenticated(): boolean {
        return !!this.getStoredToken()
    }
}

export const authService = new AuthService()
export default AuthService
