import { apiClient } from '@/services/api/client';

export interface Wallet {
    userId: string;
    tenantId: string;
    buckets: {
        cash: number;
        promo: number;
        scholarship: number;
        referral: number;
        sponsor: number;
        loyalty: number;
    };
    transactions: Array<{
        transactionId: string;
        type: 'credit' | 'debit';
        bucket: string;
        amount: number;
        description: string;
        timestamp: Date;
    }>;
    totalBalance: number;
}

class WalletService {
    async getWallet(userId: string) {
        const response = await apiClient.get(`/wallet/${userId}`);
        return response;
    }

    async createWallet(userId: string, tenantId: string) {
        const response = await apiClient.post(`/wallet`, {
            userId,
            tenantId,
        });
        return response;
    }

    async addCredit(userId: string, bucket: 'cash' | 'promo' | 'scholarship' | 'referral' | 'sponsor' | 'loyalty', amount: number, description: string) {
        const response = await apiClient.post(`/wallet/${userId}/credit`, {
            bucket,
            amount,
            description,
        });
        return response;
    }

    async deductCredit(userId: string, amount: number, description: string) {
        const response = await apiClient.post(`/wallet/${userId}/debit`, {
            amount,
            description,
        });
        return response;
    }

    async getTransactionHistory(userId: string, limit: number = 50) {
        const response = await apiClient.get(`/wallet/${userId}/transactions`, {
            params: { limit },
        });
        return response;
    }

    async getBalance(userId: string) {
        const response = await apiClient.get(`/wallet/${userId}/balance`);
        return response;
    }

    async transferCredit(fromUserId: string, toUserId: string, amount: number, bucket: string) {
        const response = await apiClient.post(`/wallet/transfer`, {
            fromUserId,
            toUserId,
            amount,
            bucket,
        });
        return response;
    }
}

export default new WalletService();
