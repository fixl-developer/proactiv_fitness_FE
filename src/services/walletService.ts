import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
        const response = await axios.get(`${API_URL}/wallet/${userId}`);
        return response.data;
    }

    async createWallet(userId: string, tenantId: string) {
        const response = await axios.post(`${API_URL}/wallet`, {
            userId,
            tenantId,
        });
        return response.data;
    }

    async addCredit(userId: string, bucket: 'cash' | 'promo' | 'scholarship' | 'referral' | 'sponsor' | 'loyalty', amount: number, description: string) {
        const response = await axios.post(`${API_URL}/wallet/${userId}/credit`, {
            bucket,
            amount,
            description,
        });
        return response.data;
    }

    async deductCredit(userId: string, amount: number, description: string) {
        const response = await axios.post(`${API_URL}/wallet/${userId}/debit`, {
            amount,
            description,
        });
        return response.data;
    }

    async getTransactionHistory(userId: string, limit: number = 50) {
        const response = await axios.get(`${API_URL}/wallet/${userId}/transactions`, {
            params: { limit },
        });
        return response.data;
    }

    async getBalance(userId: string) {
        const response = await axios.get(`${API_URL}/wallet/${userId}/balance`);
        return response.data;
    }

    async transferCredit(fromUserId: string, toUserId: string, amount: number, bucket: string) {
        const response = await axios.post(`${API_URL}/wallet/transfer`, {
            fromUserId,
            toUserId,
            amount,
            bucket,
        });
        return response.data;
    }
}

export default new WalletService();
