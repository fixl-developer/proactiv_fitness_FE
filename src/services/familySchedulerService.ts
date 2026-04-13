import { apiClient } from '@/services/api/client';

export interface FamilySchedule {
    familyId: string;
    tenantId: string;
    children: string[];
    optimizationScore: number;
    scheduleOptions: Array<{
        optionId: string;
        sessions: Array<{ childId: string; sessionId: string; time: Date }>;
        travelTime: number;
        convenienceScore: number;
        siblingDiscount: number;
    }>;
    selectedOption?: string;
}

class FamilySchedulerService {
    async optimizeSchedule(familyId: string, tenantId: string, children: string[]) {
        const response = await apiClient.post(`/family-scheduler/optimize`, {
            familyId,
            tenantId,
            children,
        });
        return response;
    }

    async getSchedule(familyId: string) {
        const response = await apiClient.get(`/family-scheduler/${familyId}`);
        return response;
    }

    async selectOption(familyId: string, optionId: string) {
        const response = await apiClient.post(`/family-scheduler/${familyId}/select`, {
            optionId,
        });
        return response;
    }

    async findCarpoolMatches(familyId: string, locationId: string) {
        const response = await apiClient.get(`/family-scheduler/${familyId}/carpool`, {
            params: { locationId },
        });
        return response;
    }

    async calculateSiblingDiscount(familyId: string) {
        const response = await apiClient.get(`/family-scheduler/${familyId}/discount`);
        return response;
    }
}

export default new FamilySchedulerService();
