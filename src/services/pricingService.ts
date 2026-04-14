import { apiClient } from '@/services/api/client';

export interface PricingRule {
    ruleId?: string;
    tenantId: string;
    name: string;
    basePrice: number;
    factors: {
        demandMultiplier: number;
        seasonalAdjustment: number;
        capacityFactor: number;
        peakTimePremium: number;
    };
    calculatedPrice?: number;
    effectiveFrom: Date;
    effectiveTo?: Date;
}

class PricingService {
    async createPricingRule(data: PricingRule) {
        const response = await apiClient.post(`/pricing/rules`, data);
        return response;
    }

    async getPricingRule(ruleId: string) {
        const response = await apiClient.get(`/pricing/rules/${ruleId}`);
        return response;
    }

    async listPricingRules(tenantId: string) {
        const response = await apiClient.get(`/pricing/rules`, {
            params: { tenantId },
        });
        return response;
    }

    async calculateDynamicPrice(basePrice: number, factors: any) {
        const response = await apiClient.post(`/pricing/calculate`, {
            basePrice,
            factors,
        });
        return response;
    }

    async getPriceForSession(sessionId: string, studentId: string) {
        const response = await apiClient.get(`/pricing/session/${sessionId}`, {
            params: { studentId },
        });
        return response;
    }

    async applyEarlyBirdDiscount(sessionId: string, discountPercentage: number) {
        const response = await apiClient.post(`/pricing/early-bird`, {
            sessionId,
            discountPercentage,
        });
        return response;
    }
}

export default new PricingService();
