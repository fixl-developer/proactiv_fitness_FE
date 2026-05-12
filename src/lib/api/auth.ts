import { apiClient } from '@/services/api/client';

// Auth API endpoints
export const authApi = {
    login: async (data: { email: string; password: string }) => {
        const response = await apiClient.post('/auth/login', data);
        return response.data;
    },

    register: async (data: any) => {
        const response = await apiClient.post('/auth/register', data);
        return response.data;
    },

    verifyEmail: async (token: string) => {
        const response = await apiClient.post('/auth/verify-email', { token });
        return response.data;
    },

    resendVerification: async (email: string) => {
        const response = await apiClient.post('/auth/resend-verification', { email });
        return response.data;
    },

    forgotPassword: async (email: string) => {
        const response = await apiClient.post('/auth/forgot-password', { email });
        return response.data;
    },

    resetPassword: async (token: string, password: string) => {
        // Backend expects newPassword + confirmPassword (mirrors change-password
        // schema). Frontend already validates equality before this call.
        const response = await apiClient.post('/auth/reset-password', {
            token,
            newPassword: password,
            confirmPassword: password,
        });
        return response.data;
    },

    changePassword: async (currentPassword: string, newPassword: string) => {
        const response = await apiClient.post('/auth/change-password', { currentPassword, newPassword });
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await apiClient.get('/auth/me');
        return response.data;
    },

    updateProfile: async (data: any) => {
        const response = await apiClient.put('/auth/profile', data);
        return response.data;
    },

    logout: async () => {
        await apiClient.post('/auth/logout');
    },

    refreshToken: async (refreshToken: string) => {
        const response = await apiClient.post('/auth/refresh-token', { refreshToken });
        return response.data;
    },
};
