import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
        const response = await axios.post(`${API_URL}/family-scheduler/optimize`, {
            familyId,
            tenantId,
            children,
        });
        return response.data;
    }

    async getSchedule(familyId: string) {
        const response = await axios.get(`${API_URL}/family-scheduler/${familyId}`);
        return response.data;
    }

    async selectOption(familyId: string, optionId: string) {
        const response = await axios.post(`${API_URL}/family-scheduler/${familyId}/select`, {
            optionId,
        });
        return response.data;
    }

    async findCarpoolMatches(familyId: string, locationId: string) {
        const response = await axios.get(`${API_URL}/family-scheduler/${familyId}/carpool`, {
            params: { locationId },
        });
        return response.data;
    }

    async calculateSiblingDiscount(familyId: string) {
        const response = await axios.get(`${API_URL}/family-scheduler/${familyId}/discount`);
        return response.data;
    }
}

export default new FamilySchedulerService();
