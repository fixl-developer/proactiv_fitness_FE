import { apiClient } from '../api/client'

export interface Commission {
    id: string
    partnerId: string
    amount: number
    rate: number
    period: string
    status: 'pending' | 'approved' | 'paid' | 'disputed'
    calculatedAt: string
    paidAt?: string
    notes?: string
}

export interface CommissionBreakdown {
    totalRevenue: number
    commissionRate: number
    commissionAmount: number
    deductions: number
    netCommission: number
    breakdown: { category: string; amount: number }[]
}

export interface CommissionPayout {
    id: string
    partnerId: string
    amount: number
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'rejected'
    requestedAt: string
    processedAt?: string
    method: 'bank_transfer' | 'check' | 'paypal' | 'upi'
    notes?: string
    reference?: string
}

export interface CommissionRate {
    id: string
    tier: 'bronze' | 'silver' | 'gold' | 'platinum'
    baseRate: number
    bonusRate?: number
    minRevenue?: number
    maxRevenue?: number
    effectiveFrom: string
    effectiveTo?: string
}

export interface CommissionTier {
    tier: 'bronze' | 'silver' | 'gold' | 'platinum'
    minRevenue: number
    maxRevenue?: number
    rate: number
    benefits: string[]
}

export interface CommissionForecast {
    month: string
    projectedRevenue: number
    projectedCommission: number
    confidence: number
}

export interface CommissionStats {
    totalCommissions: number
    totalPaid: number
    totalPending: number
    averageCommission: number
    highestCommission: number
    lowestCommission: number
}

export class CommissionService {
    /**
     * Get commissions
     */
    static async getCommissions(partnerId: string, filters?: { status?: string; page?: number; limit?: number }): Promise<{ commissions: Commission[]; total: number }> {
        try {
            const params = { ...filters, partnerId }
            const response = await apiClient.get('/commissions', { params })
            return (response as any)?.data || { commissions: [], total: 0 }
        } catch (error) {
            console.error('Error fetching commissions:', error)
            throw error
        }
    }

    /**
     * Get commission by ID
     */
    static async getCommissionById(id: string): Promise<Commission> {
        try {
            const response = await apiClient.get(`/commissions/${id}`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching commission:', error)
            throw error
        }
    }

    /**
     * Calculate commission
     */
    static async calculateCommission(partnerId: string, revenue: number, period: string): Promise<CommissionBreakdown> {
        try {
            const response = await apiClient.post('/commissions/calculate', { partnerId, revenue, period })
            return (response as any)?.data
        } catch (error) {
            console.error('Error calculating commission:', error)
            throw error
        }
    }

    /**
     * Get commission history
     */
    static async getCommissionHistory(partnerId: string, filters?: { startDate?: string; endDate?: string; page?: number; limit?: number }): Promise<{ history: Commission[]; total: number }> {
        try {
            const params = { ...filters, partnerId }
            const response = await apiClient.get('/commissions/history', { params })
            return (response as any)?.data || { history: [], total: 0 }
        } catch (error) {
            console.error('Error fetching commission history:', error)
            throw error
        }
    }

    /**
     * Get commission statistics
     */
    static async getCommissionStats(partnerId: string): Promise<CommissionStats> {
        try {
            const response = await apiClient.get(`/commissions/${partnerId}/stats`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching commission stats:', error)
            throw error
        }
    }

    /**
     * Get commission breakdown
     */
    static async getCommissionBreakdown(partnerId: string, period: string): Promise<CommissionBreakdown> {
        try {
            const response = await apiClient.get(`/commissions/${partnerId}/breakdown`, { params: { period } })
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching commission breakdown:', error)
            throw error
        }
    }

    /**
     * Request commission payout
     */
    static async requestCommissionPayout(partnerId: string, amount: number, method: string): Promise<CommissionPayout> {
        try {
            const response = await apiClient.post('/commissions/payout-request', { partnerId, amount, method })
            return (response as any)?.data
        } catch (error) {
            console.error('Error requesting payout:', error)
            throw error
        }
    }

    /**
     * Get payout history
     */
    static async getPayoutHistory(partnerId: string, filters?: { page?: number; limit?: number }): Promise<{ payouts: CommissionPayout[]; total: number }> {
        try {
            const params = { ...filters, partnerId }
            const response = await apiClient.get('/commissions/payout-history', { params })
            return (response as any)?.data || { payouts: [], total: 0 }
        } catch (error) {
            console.error('Error fetching payout history:', error)
            throw error
        }
    }

    /**
     * Get payout status
     */
    static async getPayoutStatus(payoutId: string): Promise<CommissionPayout> {
        try {
            const response = await apiClient.get(`/commissions/payout/${payoutId}`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching payout status:', error)
            throw error
        }
    }

    /**
     * Get commission rates
     */
    static async getCommissionRates(): Promise<CommissionRate[]> {
        try {
            const response = await apiClient.get('/commissions/rates')
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching commission rates:', error)
            throw error
        }
    }

    /**
     * Get commission tiers
     */
    static async getCommissionTiers(): Promise<CommissionTier[]> {
        try {
            const response = await apiClient.get('/commissions/tiers')
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching commission tiers:', error)
            throw error
        }
    }

    /**
     * Get commission forecasts
     */
    static async getCommissionForecasts(partnerId: string, months?: number): Promise<CommissionForecast[]> {
        try {
            const response = await apiClient.get(`/commissions/${partnerId}/forecasts`, { params: { months } })
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching commission forecasts:', error)
            throw error
        }
    }

    /**
     * Export commission report
     */
    static async exportCommissionReport(partnerId: string, format: 'pdf' | 'excel' | 'csv'): Promise<Blob> {
        try {
            const response = await apiClient.get(`/commissions/${partnerId}/export`, { params: { format } })
            return response as any
        } catch (error) {
            console.error('Error exporting commission report:', error)
            throw error
        }
    }

    /**
     * Get commission comparison
     */
    static async getCommissionComparison(partnerId: string, period: string): Promise<any> {
        try {
            const response = await apiClient.get(`/commissions/${partnerId}/comparison`, { params: { period } })
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching commission comparison:', error)
            throw error
        }
    }
}

export default CommissionService
