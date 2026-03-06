import { apiClient } from './client';
import type { Program, ProgramFilters, ProgramFormData, ProgramStats, ApiResponse } from '@/types';

export const programsApi = {
    getAll: async (filters?: ProgramFilters) => {
        const response = await apiClient.get<ApiResponse<{ programs: Program[]; total: number }>>(
            '/programs',
            { params: filters }
        );
        return response.data.data;
    },

    getById: async (id: string) => {
        const response = await apiClient.get<ApiResponse<Program>>(`/programs/${id}`);
        return response.data.data;
    },

    create: async (data: ProgramFormData) => {
        const response = await apiClient.post<ApiResponse<Program>>('/programs', data);
        return response.data.data;
    },

    update: async (id: string, data: Partial<ProgramFormData>) => {
        const response = await apiClient.put<ApiResponse<Program>>(`/programs/${id}`, data);
        return response.data.data;
    },

    delete: async (id: string) => {
        await apiClient.delete(`/programs/${id}`);
    },

    getStats: async () => {
        const response = await apiClient.get<ApiResponse<ProgramStats>>('/programs/stats');
        return response.data.data;
    },

    duplicate: async (id: string) => {
        const response = await apiClient.post<ApiResponse<Program>>(`/programs/${id}/duplicate`);
        return response.data.data;
    },

    toggleStatus: async (id: string, status: 'active' | 'inactive') => {
        const response = await apiClient.put<ApiResponse<Program>>(`/programs/${id}/status`, { status });
        return response.data.data;
    },

    exportData: async (filters?: ProgramFilters) => {
        const response = await apiClient.post('/programs/export', filters, { responseType: 'blob' });
        return response.data;
    },
};
