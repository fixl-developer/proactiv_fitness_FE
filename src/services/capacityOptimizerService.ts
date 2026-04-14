import { apiClient } from '@/services/api/client';

export interface CapacityOptimization {
    sessionId: string;
    locationId: string;
    tenantId: string;
    currentCapacity: number;
    maxCapacity: number;
    occupancyRate: number;
    status: 'underbooked' | 'optimal' | 'full' | 'overbooked';
    suggestions: Array<{
        type: 'merge' | 'split' | 'move-students' | 'waitlist-promotion';
        description: string;
        impactScore: number;
        revenueImpact: number;
    }>;
}

class CapacityOptimizerService {
    async analyzeCapacity(sessionId: string, locationId: string, tenantId: string) {
        const response = await apiClient.post(`/capacity-optimizer/analyze`, {
            sessionId,
            locationId,
            tenantId,
        });
        return response;
    }

    async getOptimization(sessionId: string) {
        const response = await apiClient.get(`/capacity-optimizer/${sessionId}`);
        return response;
    }

    async listOptimizations(locationId: string, tenantId: string, status?: string) {
        const response = await apiClient.get(`/capacity-optimizer`, {
            params: { locationId, tenantId, status },
        });
        return response;
    }

    async executeSuggestion(sessionId: string, suggestionType: string) {
        const response = await apiClient.post(`/capacity-optimizer/${sessionId}/execute`, {
            suggestionType,
        });
        return response;
    }

    async getRevenueImpact(sessionId: string) {
        const response = await apiClient.get(`/capacity-optimizer/${sessionId}/revenue-impact`);
        return response;
    }
}

export default new CapacityOptimizerService();
