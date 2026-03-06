import { apiClient } from './client';
import type { Incident, IncidentFilters, SafetyAlert, EmergencyProtocol, ApiResponse } from '@/types';

export const safetyApi = {
    // Incidents
    getAllIncidents: async (filters?: IncidentFilters) => {
        const response = await apiClient.get<ApiResponse<{ incidents: Incident[]; total: number }>>(
            '/safety/incidents',
            { params: filters }
        );
        return response.data.data;
    },

    getIncidentById: async (id: string) => {
        const response = await apiClient.get<ApiResponse<Incident>>(`/safety/incidents/${id}`);
        return response.data.data;
    },

    createIncident: async (data: Partial<Incident>) => {
        const response = await apiClient.post<ApiResponse<Incident>>('/safety/incidents', data);
        return response.data.data;
    },

    updateIncident: async (id: string, data: Partial<Incident>) => {
        const response = await apiClient.put<ApiResponse<Incident>>(`/safety/incidents/${id}`, data);
        return response.data.data;
    },

    // Safety Alerts
    getAlerts: async () => {
        const response = await apiClient.get<ApiResponse<SafetyAlert[]>>('/safety/alerts');
        return response.data.data;
    },

    createAlert: async (data: Partial<SafetyAlert>) => {
        const response = await apiClient.post<ApiResponse<SafetyAlert>>('/safety/alerts', data);
        return response.data.data;
    },

    deactivateAlert: async (id: string) => {
        const response = await apiClient.put<ApiResponse<SafetyAlert>>(`/safety/alerts/${id}/deactivate`);
        return response.data.data;
    },

    // Emergency Protocols
    getProtocols: async () => {
        const response = await apiClient.get<ApiResponse<EmergencyProtocol[]>>('/safety/protocols');
        return response.data.data;
    },

    activateCrisisMode: async (protocolId: string) => {
        const response = await apiClient.post<ApiResponse<any>>('/safety/crisis-mode', { protocolId });
        return response.data.data;
    },

    deactivateCrisisMode: async () => {
        const response = await apiClient.post<ApiResponse<any>>('/safety/crisis-mode/deactivate');
        return response.data.data;
    },
};
