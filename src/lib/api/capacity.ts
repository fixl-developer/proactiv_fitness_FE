import { apiClient } from './client';
import type { ApiResponse } from '@/types';

export const capacityApi = {
    getMetrics: async () => {
        const response = await apiClient.get<ApiResponse<any>>('/capacity/metrics');
        return response.data.data;
    },

    getRecommendations: async () => {
        const response = await apiClient.get<ApiResponse<any[]>>('/capacity/recommendations');
        return response.data.data;
    },

    executeRebalance: async (recommendationId: string) => {
        const response = await apiClient.post<ApiResponse<any>>(`/capacity/rebalance/${recommendationId}`);
        return response.data.data;
    },

    getUnderbookedClasses: async () => {
        const response = await apiClient.get<ApiResponse<any[]>>('/capacity/underbooked');
        return response.data.data;
    },

    getOverbookedClasses: async () => {
        const response = await apiClient.get<ApiResponse<any[]>>('/capacity/overbooked');
        return response.data.data;
    },

    simulateRebalance: async (data: any) => {
        const response = await apiClient.post<ApiResponse<any>>('/capacity/simulate', data);
        return response.data.data;
    },
};
