import { apiClient } from '../api/client'

export interface GrowthMetric {
    name: string
    value: number
    change: number
    changePercent: number
    trend: 'up' | 'down' | 'stable'
}

export interface FunnelStage {
    name: string
    users: number
    conversionRate: number
}

export interface AcquisitionChannel {
    name: string
    users: number
    cost: number
    roi: number
}

export class GrowthAnalyticsService {
    /**
     * Get growth overview
     */
    static async getGrowthOverview(): Promise<any> {
        try {
            const response = await apiClient.get('/growth/overview')
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching growth overview:', error)
            throw error
        }
    }

    /**
     * Get growth metrics
     */
    static async getGrowthMetrics(period?: string): Promise<GrowthMetric[]> {
        try {
            const response = await apiClient.get('/growth/metrics', { params: { period } })
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching growth metrics:', error)
            throw error
        }
    }

    /**
     * Get funnel analysis
     */
    static async getFunnelAnalysis(funnelId?: string): Promise<FunnelStage[]> {
        try {
            const response = await apiClient.get('/growth/funnel', { params: { funnelId } })
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching funnel analysis:', error)
            throw error
        }
    }

    /**
     * Get conversion tracking
     */
    static async getConversionTracking(period?: string): Promise<any> {
        try {
            const response = await apiClient.get('/growth/conversion', { params: { period } })
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching conversion tracking:', error)
            throw error
        }
    }

    /**
     * Get user acquisition
     */
    static async getUserAcquisition(period?: string): Promise<AcquisitionChannel[]> {
        try {
            const response = await apiClient.get('/growth/acquisition', { params: { period } })
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching user acquisition:', error)
            throw error
        }
    }

    /**
     * Get retention analysis
     */
    static async getRetentionAnalysis(period?: string): Promise<any> {
        try {
            const response = await apiClient.get('/growth/retention', { params: { period } })
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching retention analysis:', error)
            throw error
        }
    }

    /**
     * Get churn analysis
     */
    static async getChurnAnalysis(period?: string): Promise<any> {
        try {
            const response = await apiClient.get('/growth/churn', { params: { period } })
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching churn analysis:', error)
            throw error
        }
    }

    /**
     * Get cohort analysis
     */
    static async getCohortAnalysis(cohortType?: string): Promise<any> {
        try {
            const response = await apiClient.get('/growth/cohort', { params: { cohortType } })
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching cohort analysis:', error)
            throw error
        }
    }

    /**
     * Get LTV analysis
     */
    static async getLTVAnalysis(): Promise<any> {
        try {
            const response = await apiClient.get('/growth/ltv')
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching LTV analysis:', error)
            throw error
        }
    }

    /**
     * Get CAC analysis
     */
    static async getCACAnalysis(): Promise<any> {
        try {
            const response = await apiClient.get('/growth/cac')
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching CAC analysis:', error)
            throw error
        }
    }

    /**
     * Get growth forecast
     */
    static async getGrowthForecast(horizon?: number): Promise<any[]> {
        try {
            const response = await apiClient.get('/growth/forecast', { params: { horizon } })
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching forecast:', error)
            throw error
        }
    }

    /**
     * Get growth opportunities
     */
    static async getGrowthOpportunities(): Promise<any[]> {
        try {
            const response = await apiClient.get('/growth/opportunities')
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching opportunities:', error)
            throw error
        }
    }

    /**
     * Get growth benchmarks
     */
    static async getGrowthBenchmarks(industry?: string): Promise<any> {
        try {
            const response = await apiClient.get('/growth/benchmarks', { params: { industry } })
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching benchmarks:', error)
            throw error
        }
    }

    /**
     * Get growth recommendations
     */
    static async getGrowthRecommendations(): Promise<any[]> {
        try {
            const response = await apiClient.get('/growth/recommendations')
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching recommendations:', error)
            throw error
        }
    }

    /**
     * Export growth report
     */
    static async exportGrowthReport(format: string): Promise<Blob> {
        try {
            const response = await apiClient.get('/growth/export', {
                params: { format },
                responseType: 'blob'
            })
            return response as any
        } catch (error) {
            console.error('Error exporting report:', error)
            throw error
        }
    }
}

export default GrowthAnalyticsService
