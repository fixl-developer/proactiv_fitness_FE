import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
        const response = await axios.post(`${API_URL}/referral`, {
            referrerId,
            tenantId,
        });
        return response.data;
    }

    async getReferral(referralCode: string) {
        const response = await axios.get(`${API_URL}/referral/${referralCode}`);
        return response.data;
    }

    async listReferrals(referrerId: string, tenantId: string) {
        const response = await axios.get(`${API_URL}/referral`, {
            params: { referrerId, tenantId },
        });
        return response.data;
    }

    async convertReferral(referralCode: string, referredUserId: string) {
        const response = await axios.post(`${API_URL}/referral/${referralCode}/convert`, {
            referredUserId,
        });
        return response.data;
    }

    async issueRewards(referralId: string) {
        const response = await axios.post(`${API_URL}/referral/${referralId}/rewards`);
        return response.data;
    }

    async getAnalytics(referrerId: string, tenantId: string) {
        const response = await axios.get(`${API_URL}/referral/analytics`, {
            params: { referrerId, tenantId },
        });
        return response.data;
    }

    async shareReferralLink(referralCode: string, platform: 'email' | 'sms' | 'social') {
        const response = await axios.post(`${API_URL}/referral/${referralCode}/share`, {
            platform,
        });
        return response.data;
    }
}

export default new ReferralService();
