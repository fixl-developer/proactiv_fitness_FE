import { apiClient } from './client';
import type { Schedule, ScheduleFilters, ScheduleTemplate, BulkScheduleData, ApiResponse } from '@/types';

export const schedulesApi = {
    getAll: async (filters?: ScheduleFilters) => {
        const response = await apiClient.get<ApiResponse<{ schedules: Schedule[]; total: number }>>(
            '/schedules',
            { params: filters }
        );
        return response.data.data;
    },

    getById: async (id: string) => {
        const response = await apiClient.get<ApiResponse<Schedule>>(`/schedules/${id}`);
        return response.data.data;
    },

    create: async (data: Partial<Schedule>) => {
        const response = await apiClient.post<ApiResponse<Schedule>>('/schedules', data);
        return response.data.data;
    },

    update: async (id: string, data: Partial<Schedule>) => {
        const response = await apiClient.put<ApiResponse<Schedule>>(`/schedules/${id}`, data);
        return response.data.data;
    },

    delete: async (id: string) => {
        await apiClient.delete(`/schedules/${id}`);
    },

    bulkCreate: async (data: BulkScheduleData) => {
        const response = await apiClient.post<ApiResponse<Schedule[]>>('/schedules/bulk', data);
        return response.data.data;
    },

    publish: async (id: string) => {
        const response = await apiClient.put<ApiResponse<Schedule>>(`/schedules/${id}/publish`);
        return response.data.data;
    },

    cancel: async (id: string, reason: string) => {
        const response = await apiClient.put<ApiResponse<Schedule>>(`/schedules/${id}/cancel`, { reason });
        return response.data.data;
    },

    checkConflicts: async (scheduleData: Partial<Schedule>) => {
        const response = await apiClient.post<ApiResponse<{ hasConflicts: boolean; conflicts: any[] }>>(
            '/schedules/check-conflicts',
            scheduleData
        );
        return response.data.data;
    },

    // Templates
    getTemplates: async () => {
        const response = await apiClient.get<ApiResponse<ScheduleTemplate[]>>('/schedules/templates');
        return response.data.data;
    },

    createTemplate: async (data: Partial<ScheduleTemplate>) => {
        const response = await apiClient.post<ApiResponse<ScheduleTemplate>>('/schedules/templates', data);
        return response.data.data;
    },

    deleteTemplate: async (id: string) => {
        await apiClient.delete(`/schedules/templates/${id}`);
    },
};
