import { apiClient } from '@/services/api/client'

export const walletService = {
    async getBalance() {
        try {
            const response = await apiClient.get('/wallet/balance')
            return response
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to fetch balance',
                data: { balance: 0 }
            }
        }
    },

    async getTransactions(limit = 20) {
        try {
            const response = await apiClient.get(`/wallet/transactions?limit=${limit}`)
            return response
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to fetch transactions',
                data: []
            }
        }
    },

    async addFunds(amount: number) {
        try {
            const response = await apiClient.post('/wallet/add-funds', { amount })
            return response
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to add funds'
            }
        }
    },

    async requestRefund(amount?: number) {
        try {
            const response = await apiClient.post('/wallet/refund-request', { amount })
            return response
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to request refund'
            }
        }
    },

    async getRefundRequests() {
        try {
            const response = await apiClient.get('/wallet/refund-requests')
            return response
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to fetch refund requests',
                data: []
            }
        }
    }
}
