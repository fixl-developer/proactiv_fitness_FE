import { apiClient } from './client';
import type { Staff, StaffFilters, StaffStats, ApiResponse } from '@/types';

export const staffApi = {
    getAll: async (filters?: StaffFilters) => {
        const response = await apiClient.get<ApiResponse<{ staff: Staff[]; total: number }>>(
            '/staff',
            { params: filters }
        );
        return response.data.data;
    },

    getById: async (id: string) => {
        const response = await apiClient.get<ApiResponse<Staff>>(`/staff/${id}`);
        return response.data.data;
    },

    create: async (data: Partial<Staff>) => {
        const response = await apiClient.post<ApiResponse<Staff>>('/staff', data);
        return response.data.data;
    },

    update: async (id: string, data: Partial<Staff>) => {
        const response = await apiClient.put<ApiResponse<Staff>>(`/staff/${id}`, data);
        return response.data.data;
    },

    delete: async (id: string) => {
        await apiClient.delete(`/staff/${id}`);
    },

    getStats: async () => {
        const response = await apiClient.get<ApiResponse<StaffStats>>('/staff/stats');
        return response.data.data;
    },

    updateAvailability: async (id: string, availability: any[]) => {
        const response = await apiClient.put<ApiResponse<Staff>>(`/staff/${id}/availability`, { availability });
        return response.data.data;
    },

    addCertification: async (id: string, certification: any) => {
        const response = await apiClient.post<ApiResponse<Staff>>(`/staff/${id}/certifications`, certification);
        return response.data.data;
    },

    updateBackgroundCheck: async (id: string, status: string, date: string) => {
        const response = await apiClient.put<ApiResponse<Staff>>(`/staff/${id}/background-check`, { status, date });
        return response.data.data;
    },

    exportData: async (filters?: StaffFilters) => {
        const response = await apiClient.post('/staff/export', filters, { responseType: 'blob' });
        return response.data;
    },
};
