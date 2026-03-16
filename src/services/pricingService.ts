import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
        const response = await axios.post(`${API_URL}/pricing/rules`, data);
        return response.data;
    }

    async getPricingRule(ruleId: string) {
        const response = await axios.get(`${API_URL}/pricing/rules/${ruleId}`);
        return response.data;
    }

    async listPricingRules(tenantId: string) {
        const response = await axios.get(`${API_URL}/pricing/rules`, {
            params: { tenantId },
        });
        return response.data;
    }

    async calculateDynamicPrice(basePrice: number, factors: any) {
        const response = await axios.post(`${API_URL}/pricing/calculate`, {
            basePrice,
            factors,
        });
        return response.data;
    }

    async getPriceForSession(sessionId: string, studentId: string) {
        const response = await axios.get(`${API_URL}/pricing/session/${sessionId}`, {
            params: { studentId },
        });
        return response.data;
    }

    async applyEarlyBirdDiscount(sessionId: string, discountPercentage: number) {
        const response = await axios.post(`${API_URL}/pricing/early-bird`, {
            sessionId,
            discountPercentage,
        });
        return response.data;
    }
}

export default new PricingService();
