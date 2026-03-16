import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Franchise {
    franchiseId?: string;
    tenantId: string;
    name: string;
    legalName: string;
    franchiseeContact: {
        name: string;
        email: string;
        phone: string;
    };
    status?: 'active' | 'suspended' | 'terminated';
    contractStartDate: Date;
    contractEndDate: Date;
    locations: string[];
    royaltyModel: {
        type: 'percentage' | 'fixed' | 'tiered' | 'hybrid';
        percentage?: number;
        fixedAmount?: number;
        tiers?: Array<{ minRevenue: number; maxRevenue: number; rate: number }>;
    };
    revenueShare: {
        franchisePercentage: number;
        hqPercentage: number;
    };
    whiteLabelConfig?: {
        enabled: boolean;
        brandName?: string;
        logoUrl?: string;
        primaryColor?: string;
        secondaryColor?: string;
    };
}

class FranchiseService {
    async createFranchise(data: Franchise) {
        const response = await axios.post(`${API_URL}/franchise`, data);
        return response.data;
    }

    async getFranchise(franchiseId: string) {
        const response = await axios.get(`${API_URL}/franchise/${franchiseId}`);
        return response.data;
    }

    async listFranchises(tenantId: string) {
        const response = await axios.get(`${API_URL}/franchise`, {
            params: { tenantId },
        });
        return response.data;
    }

    async updateFranchise(franchiseId: string, updates: Partial<Franchise>) {
        const response = await axios.put(`${API_URL}/franchise/${franchiseId}`, updates);
        return response.data;
    }

    async calculateRoyalty(franchiseId: string, revenue: number) {
        const response = await axios.post(`${API_URL}/franchise/${franchiseId}/calculate-royalty`, {
            revenue,
        });
        return response.data;
    }

    async getPerformanceMetrics(franchiseId: string) {
        const response = await axios.get(`${API_URL}/franchise/${franchiseId}/metrics`);
        return response.data;
    }

    async updateStatus(franchiseId: string, status: 'active' | 'suspended' | 'terminated') {
        const response = await axios.put(`${API_URL}/franchise/${franchiseId}/status`, { status });
        return response.data;
    }

    async getProfitLoss(franchiseId: string, startDate: string, endDate: string) {
        const response = await axios.get(`${API_URL}/franchise/${franchiseId}/profit-loss`, {
            params: { startDate, endDate },
        });
        return response.data;
    }
}

export default new FranchiseService();
