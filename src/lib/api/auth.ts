import apiClient from './client';
import type {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    User,
    ApiResponse
} from '@/types';

// Auth API endpoints
export const authApi = {
    // Login
    login: async (data: LoginRequest): Promise<LoginResponse> => {
        const response = await apiClient.post<ApiResponse<LoginResponse>>(
            '/auth/login',
            data
        );
        return response.data.data;
    },

    // Register (multi-step)
    register: async (data: RegisterRequest): Promise<LoginResponse> => {
        const response = await apiClient.post<ApiResponse<LoginResponse>>(
            '/auth/register',
            data
        );
        return response.data.data;
    },

    // Verify email
    verifyEmail: async (token: string): Promise<{ message: string }> => {
        const response = await apiClient.post<ApiResponse<{ message: string }>>(
            '/auth/verify-email',
            { token }
        );
        return response.data.data;
    },

    // Resend verification email
    resendVerification: async (email: string): Promise<{ message: string }> => {
        const response = await apiClient.post<ApiResponse<{ message: string }>>(
            '/auth/resend-verification',
            { email }
        );
        return response.data.data;
    },

    // Forgot password
    forgotPassword: async (email: string): Promise<{ message: string }> => {
        const response = await apiClient.post<ApiResponse<{ message: string }>>(
            '/auth/forgot-password',
            { email }
        );
        return response.data.data;
    },

    // Reset password
    resetPassword: async (
        token: string,
        password: string
    ): Promise<{ message: string }> => {
        const response = await apiClient.post<ApiResponse<{ message: string }>>(
            '/auth/reset-password',
            { token, password }
        );
        return response.data.data;
    },

    // Change password
    changePassword: async (
        currentPassword: string,
        newPassword: string
    ): Promise<{ message: string }> => {
        const response = await apiClient.post<ApiResponse<{ message: string }>>(
            '/auth/change-password',
            { currentPassword, newPassword }
        );
        return response.data.data;
    },

    // Get current user
    getCurrentUser: async (): Promise<User> => {
        const response = await apiClient.get<ApiResponse<User>>('/auth/me');
        return response.data.data;
    },

    // Update profile
    updateProfile: async (data: Partial<User>): Promise<User> => {
        const response = await apiClient.put<ApiResponse<User>>(
            '/auth/profile',
            data
        );
        return response.data.data;
    },

    // Logout
    logout: async (): Promise<void> => {
        await apiClient.post('/auth/logout');
    },

    // Refresh token
    refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
        const response = await apiClient.post<ApiResponse<LoginResponse>>(
            '/auth/refresh',
            { refreshToken }
        );
        return response.data.data;
    },

    // Enable MFA
    enableMFA: async (): Promise<{ qrCode: string; secret: string }> => {
        const response = await apiClient.post<
            ApiResponse<{ qrCode: string; secret: string }>
        >('/auth/mfa/enable');
        return response.data.data;
    },

    // Verify MFA
    verifyMFA: async (code: string): Promise<{ message: string }> => {
        const response = await apiClient.post<ApiResponse<{ message: string }>>(
            '/auth/mfa/verify',
            { code }
        );
        return response.data.data;
    },

    // Disable MFA
    disableMFA: async (password: string): Promise<{ message: string }> => {
        const response = await apiClient.post<ApiResponse<{ message: string }>>(
            '/auth/mfa/disable',
            { password }
        );
        return response.data.data;
    },
};
