import { apiClient } from '@/services/api/client';

export interface Referral {
    referralId?: string;
    tenantId: string;
    referrerId: string;
    referredUserId?: string;
    referralCode?: string;
    referralLink?: string;
    status?: 'pending' | 'converted' | 'rewarded' | 'expired';
    tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
    rewards?: {
        referrerReward: { type: string; value: number; status: string };
        referredReward: { type: string; value: number; status: string };
    };
    conversionDate?: Date;
    expiryDate?: Date;
}

class ReferralService {
    async createReferral(referrerId: string, tenantId: string) {
        const response = await apiClient.post(`/referral`, {
            referrerId,
            tenantId,
        });
        return response;
    }

    async getReferral(referralCode: string) {
        const response = await apiClient.get(`/referral/${referralCode}`);
        return response;
    }

    async listReferrals(referrerId: string, tenantId: string) {
        const response = await apiClient.get(`/referral`, {
            params: { referrerId, tenantId },
        });
        return response;
    }

    async convertReferral(referralCode: string, referredUserId: string) {
        const response = await apiClient.post(`/referral/${referralCode}/convert`, {
            referredUserId,
        });
        return response;
    }

    async issueRewards(referralId: string) {
        const response = await apiClient.post(`/referral/${referralId}/rewards`);
        return response;
    }

    async getAnalytics(referrerId: string, tenantId: string) {
        const response = await apiClient.get(`/referral/analytics`, {
            params: { referrerId, tenantId },
        });
        return response;
    }

    async shareReferralLink(referralCode: string, platform: 'email' | 'sms' | 'social') {
        const response = await apiClient.post(`/referral/${referralCode}/share`, {
            platform,
        });
        return response;
    }
}

export default new ReferralService();
