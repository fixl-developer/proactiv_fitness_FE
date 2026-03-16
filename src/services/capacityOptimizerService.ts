import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
        const response = await axios.post(`${API_URL}/capacity-optimizer/analyze`, {
            sessionId,
            locationId,
            tenantId,
        });
        return response.data;
    }

    async getOptimization(sessionId: string) {
        const response = await axios.get(`${API_URL}/capacity-optimizer/${sessionId}`);
        return response.data;
    }

    async listOptimizations(locationId: string, tenantId: string, status?: string) {
        const response = await axios.get(`${API_URL}/capacity-optimizer`, {
            params: { locationId, tenantId, status },
        });
        return response.data;
    }

    async executeSuggestion(sessionId: string, suggestionType: string) {
        const response = await axios.post(`${API_URL}/capacity-optimizer/${sessionId}/execute`, {
            suggestionType,
        });
        return response.data;
    }

    async getRevenueImpact(sessionId: string) {
        const response = await axios.get(`${API_URL}/capacity-optimizer/${sessionId}/revenue-impact`);
        return response.data;
    }
}

export default new CapacityOptimizerService();
