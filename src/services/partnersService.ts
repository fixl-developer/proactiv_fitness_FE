import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Partner {
    partnerId?: string;
    tenantId: string;
    name: string;
    type: 'school' | 'corporate' | 'government' | 'ngo' | 'other';
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
        const response = await axios.post(`${API_URL}/partners`, data);
        return response.data;
    }

    async getPartner(partnerId: string) {
        const response = await axios.get(`${API_URL}/partners/${partnerId}`);
        return response.data;
    }

    async listPartners(tenantId: string, type?: string) {
        const response = await axios.get(`${API_URL}/partners`, {
            params: { tenantId, type },
        });
        return response.data;
    }

    async updatePartner(partnerId: string, updates: Partial<Partner>) {
        const response = await axios.put(`${API_URL}/partners/${partnerId}`, updates);
        return response.data;
    }

    async bulkImportStudents(partnerId: string, studentIds: string[]) {
        const response = await axios.post(`${API_URL}/partners/${partnerId}/students/bulk`, {
            studentIds,
        });
        return response.data;
    }

    async getPerformanceMetrics(partnerId: string) {
        const response = await axios.get(`${API_URL}/partners/${partnerId}/metrics`);
        return response.data;
    }

    async generateReport(partnerId: string, startDate: string, endDate: string) {
        const response = await axios.get(`${API_URL}/partners/${partnerId}/report`, {
            params: { startDate, endDate },
            responseType: 'blob',
        });
        return response.data;
    }
}

export default new PartnersService();
