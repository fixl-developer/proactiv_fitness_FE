import { apiClient } from '@/services/api/client';

export interface Partner {
    partnerId?: string;
    tenantId: string;
    name: string;
    type: 'school' | 'gym' | 'corporate' | 'sports_academy' | 'ngo' | 'municipal' | 'sports_club' | 'other';
    contactPerson: { name: string; email: string; phone: string };
    contractStartDate: Date;
    contractEndDate?: Date;
    status?: 'active' | 'inactive' | 'suspended';
    revenueSharePercentage: number;
    students?: string[];
    performanceMetrics?: {
        totalStudents: number;
        totalRevenue: number;
        satisfactionScore: number;
    };
}

class PartnersService {
    async createPartner(data: Partner) {
        const response = await apiClient.post(`/partners`, data);
        return response;
    }

    async getPartner(partnerId: string) {
        const response = await apiClient.get(`/partners/${partnerId}`);
        return response;
    }

    async listPartners(tenantId: string, type?: string) {
        const response = await apiClient.get(`/partners`, {
            params: { tenantId, type },
        });
        return response;
    }

    async updatePartner(partnerId: string, updates: Partial<Partner>) {
        const response = await apiClient.put(`/partners/${partnerId}`, updates);
        return response;
    }

    async bulkImportStudents(partnerId: string, studentIds: string[]) {
        const response = await apiClient.post(`/partners/${partnerId}/students/bulk`, {
            studentIds,
        });
        return response;
    }

    async getPerformanceMetrics(partnerId: string) {
        const response = await apiClient.get(`/partners/${partnerId}/metrics`);
        return response;
    }

    async generateReport(partnerId: string, startDate: string, endDate: string) {
        const response = await apiClient.get(`/partners/${partnerId}/report`, {
            params: { startDate, endDate },
            responseType: 'blob',
        });
        return response;
    }
}

export default new PartnersService();
