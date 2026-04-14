import { apiClient } from '@/services/api/client';

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
        const response = await apiClient.post(`/franchise`, data);
        return response;
    }

    async getFranchise(franchiseId: string) {
        const response = await apiClient.get(`/franchise/${franchiseId}`);
        return response;
    }

    async listFranchises(tenantId: string) {
        const response = await apiClient.get(`/franchise`, {
            params: { tenantId },
        });
        return response;
    }

    async updateFranchise(franchiseId: string, updates: Partial<Franchise>) {
        const response = await apiClient.put(`/franchise/${franchiseId}`, updates);
        return response;
    }

    async calculateRoyalty(franchiseId: string, revenue: number) {
        const response = await apiClient.post(`/franchise/${franchiseId}/calculate-royalty`, {
            revenue,
        });
        return response;
    }

    async getPerformanceMetrics(franchiseId: string) {
        const response = await apiClient.get(`/franchise/${franchiseId}/metrics`);
        return response;
    }

    async updateStatus(franchiseId: string, status: 'active' | 'suspended' | 'terminated') {
        const response = await apiClient.put(`/franchise/${franchiseId}/status`, { status });
        return response;
    }

    async getProfitLoss(franchiseId: string, startDate: string, endDate: string) {
        const response = await apiClient.get(`/franchise/${franchiseId}/profit-loss`, {
            params: { startDate, endDate },
        });
        return response;
    }
}

export default new FranchiseService();
