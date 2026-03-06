import { apiClient } from './client';
import type { Student, StudentFilters, StudentFormData, StudentStats, ApiResponse } from '@/types';

export const studentsApi = {
    getAll: async (filters?: StudentFilters) => {
        const response = await apiClient.get<ApiResponse<{ students: Student[]; total: number }>>(
            '/students',
            { params: filters }
        );
        return response.data.data;
    },

    getById: async (id: string) => {
        const response = await apiClient.get<ApiResponse<Student>>(`/students/${id}`);
        return response.data.data;
    },

    create: async (data: StudentFormData) => {
        const response = await apiClient.post<ApiResponse<Student>>('/students', data);
        return response.data.data;
    },

    update: async (id: string, data: Partial<StudentFormData>) => {
        const response = await apiClient.put<ApiResponse<Student>>(`/students/${id}`, data);
        return response.data.data;
    },

    delete: async (id: string) => {
        await apiClient.delete(`/students/${id}`);
    },

    getStats: async () => {
        const response = await apiClient.get<ApiResponse<StudentStats>>('/students/stats');
        return response.data.data;
    },

    exportData: async (filters?: StudentFilters) => {
        const response = await apiClient.post('/students/export', filters, { responseType: 'blob' });
        return response.data;
    },
};
