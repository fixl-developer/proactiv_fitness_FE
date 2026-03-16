import apiClient, { ApiResponse } from '@/lib/apiClient'

// Types for Authentication
export interface LoginRequest {
    email: string
    password: string
}

export interface RegisterRequest {
    email: string
    password: string
    confirmPassword: string
    firstName: string
    lastName: string
    phone: string
    role?: 'PARENT' | 'COACH' | 'ADMIN' | 'MANAGER'
    dateOfBirth?: string
    gender?: 'MALE' | 'FEMALE' | 'OTHER'
    language?: string
}

export interface ForgotPasswordRequest {
    email: string
}

export interface ResetPasswordRequest {
    token: string
    newPassword: string
    confirmPassword: string
}

export interface ChangePasswordRequest {
    currentPassword: string
    newPassword: string
    confirmPassword: string
}

export interface VerifyEmailRequest {
    token: string
}

export interface User {
    id: string
    email: string
    firstName: string
    lastName: string
    fullName: string
    phone?: string
    role: 'PARENT' | 'COACH' | 'ADMIN' | 'MANAGER' | 'SUPER_ADMIN' | 'HQ_ADMIN' | 'REGIONAL_ADMIN' | 'FRANCHISE_OWNER' | 'LOCATION_MANAGER' | 'PARTNER_ADMIN' | 'SUPPORT_STAFF'
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING'
    profileImage?: string
    language?: string
    isEmailVerified: boolean
    isPhoneVerified: boolean
    lastLogin?: string
    createdAt: string
    updatedAt: string
    dateOfBirth?: string
    gender?: 'MALE' | 'FEMALE' | 'OTHER'
    address?: {
        street?: string
        city?: string
        state?: string
        country?: string
        postalCode?: string
    }
}

export interface AuthTokens {
    accessToken: string
    refreshToken: string
    expiresIn: number
}

export interface AuthResponse {
    user: User
    tokens: AuthTokens
}

// Authentication Service
export class AuthService {
    /**
     * Login user with email and password
     * Backend: POST /auth/login
     */
    static async login(credentials: LoginRequest): Promise<AuthResponse> {
        try {
            const response = await apiClient.post<AuthResponse>('/auth/login', credentials)

            // Store tokens in localStorage
            if (response.success && response.data) {
                this.storeAuthData(response.data)
            }

            return response.data
        } catch (error: any) {
            console.error('Login failed:', error)
            throw new Error(error.response?.data?.message || 'Login failed')
        }
    }

    /**
     * Register new user
     * Backend: POST /auth/register
     */
    static async register(userData: RegisterRequest): Promise<AuthResponse> {
        try {
            const response = await apiClient.post<AuthResponse>('/auth/register', userData)

            // Store tokens in localStorage
            if (response.success && response.data) {
                this.storeAuthData(response.data)
            }

            return response.data
        } catch (error: any) {
            console.error('Registration failed:', error)
            throw new Error(error.response?.data?.message || 'Registration failed')
        }
    }

    /**
     * Get current authenticated user
     * Backend: GET /auth/me
     */
    static async getCurrentUser(): Promise<User> {
        try {
            const response = await apiClient.get<User>('/auth/me')
            return response.data
        } catch (error: any) {
            console.error('Get current user failed:', error)
            throw new Error(error.response?.data?.message || 'Failed to get user')
        }
    }

    /**
     * Logout user
     * Backend: POST /auth/logout
     */
    static async logout(): Promise<void> {
        try {
            await apiClient.post('/auth/logout')
        } catch (error) {
            console.error('Logout API failed:', error)
        } finally {
            // Clear localStorage regardless of API response
            this.clearAuthData()
        }
    }

    /**
     * Refresh access token
     * Backend: POST /auth/refresh-token
     */
    static async refreshToken(refreshToken: string): Promise<AuthTokens> {
        try {
            const response = await apiClient.post<AuthTokens>('/auth/refresh-token', {
                refreshToken
            })

            if (response.success && response.data) {
                // Update tokens in localStorage
                localStorage.setItem('accessToken', response.data.accessToken)
                localStorage.setItem('refreshToken', response.data.refreshToken)
            }

            return response.data
        } catch (error: any) {
            console.error('Token refresh failed:', error)
            throw new Error(error.response?.data?.message || 'Token refresh failed')
        }
    }

    /**
     * Request password reset
     * Backend: POST /auth/forgot-password
     */
    static async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
        try {
            await apiClient.post('/auth/forgot-password', data)
        } catch (error: any) {
            console.error('Forgot password failed:', error)
            throw new Error(error.response?.data?.message || 'Failed to send reset email')
        }
    }

    /**
     * Reset password with token
     * Backend: POST /auth/reset-password
     */
    static async resetPassword(data: ResetPasswordRequest): Promise<void> {
        try {
            await apiClient.post('/auth/reset-password', data)
        } catch (error: any) {
            console.error('Reset password failed:', error)
            throw new Error(error.response?.data?.message || 'Password reset failed')
        }
    }

    /**
     * Change password for authenticated user
     * Backend: POST /auth/change-password
     */
    static async changePassword(data: ChangePasswordRequest): Promise<void> {
        try {
            await apiClient.post('/auth/change-password', data)
        } catch (error: any) {
            console.error('Change password failed:', error)
            throw new Error(error.response?.data?.message || 'Password change failed')
        }
    }

    /**
     * Verify email with token
     * Backend: POST /auth/verify-email
     */
    static async verifyEmail(data: VerifyEmailRequest): Promise<void> {
        try {
            await apiClient.post('/auth/verify-email', data)
        } catch (error: any) {
            console.error('Email verification failed:', error)
            throw new Error(error.response?.data?.message || 'Email verification failed')
        }
    }

    /**
     * Resend verification email
     * Backend: POST /auth/resend-verification
     */
    static async resendVerification(): Promise<void> {
        try {
            await apiClient.post('/auth/resend-verification')
        } catch (error: any) {
            console.error('Resend verification failed:', error)
            throw new Error(error.response?.data?.message || 'Failed to resend verification email')
        }
    }

    /**
     * Check if user is authenticated
     */
    static isAuthenticated(): boolean {
        if (typeof window === 'undefined') return false
        const token = localStorage.getItem('accessToken')
        return !!token
    }

    /**
     * Get stored access token
     */
    static getAccessToken(): string | null {
        if (typeof window === 'undefined') return null
        return localStorage.getItem('accessToken')
    }

    /**
     * Get stored refresh token
     */
    static getRefreshToken(): string | null {
        if (typeof window === 'undefined') return null
        return localStorage.getItem('refreshToken')
    }

    /**
     * Get stored user data
     */
    static getStoredUser(): User | null {
        if (typeof window === 'undefined') return null
        const userStr = localStorage.getItem('user')
        return userStr ? JSON.parse(userStr) : null
    }

    /**
     * Store authentication data in localStorage
     */
    private static storeAuthData(authData: AuthResponse): void {
        if (typeof window === 'undefined') return

        localStorage.setItem('accessToken', authData.tokens.accessToken)
        localStorage.setItem('refreshToken', authData.tokens.refreshToken)
        localStorage.setItem('user', JSON.stringify(authData.user))
        localStorage.setItem('isAuthenticated', 'true')
    }

    /**
     * Clear authentication data from localStorage
     */
    private static clearAuthData(): void {
        if (typeof window === 'undefined') return

        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        localStorage.removeItem('isAuthenticated')
    }
}