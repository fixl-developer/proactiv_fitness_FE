import { apiClient } from '../api/client'

export interface AnalyticsQuery {
    id: string
    name: string
    query: string
    parameters: any
    createdAt: string
    createdBy: string
}

export interface AnalyticsResult {
    data: any[]
    metadata: {
        total: number
        columns: string[]
        executionTime: number
    }
}

export interface TrendData {
    period: string
    value: number
    change: number
    changePercent: number
}

export interface PredictionData {
    date: string
    predicted: number
    confidence: number
    actual?: number
}

export class AdvancedAnalyticsService {
    /**
     * Get analytics overview
     */
    static async getAnalyticsOverview(): Promise<any> {
        try {
            const response = await apiClient.get('/analytics/overview')
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching analytics overview:', error)
            throw error
        }
    }

    /**
     * Execute custom analytics query
     */
    static async executeQuery(query: string, parameters?: any): Promise<AnalyticsResult> {
        try {
            const response = await apiClient.post('/analytics/query', { query, parameters })
            return (response as any)?.data
        } catch (error) {
            console.error('Error executing query:', error)
            throw error
        }
    }

    /**
     * Get saved queries
     */
    static async getSavedQueries(): Promise<AnalyticsQuery[]> {
        try {
            const response = await apiClient.get('/analytics/queries')
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching saved queries:', error)
            throw error
        }
    }

    /**
     * Save analytics query
     */
    static async saveQuery(data: Partial<AnalyticsQuery>): Promise<AnalyticsQuery> {
        try {
            const response = await apiClient.post('/analytics/queries', data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error saving query:', error)
            throw error
        }
    }

    /**
     * Delete saved query
     */
    static async deleteQuery(queryId: string): Promise<void> {
        try {
            await apiClient.delete(`/analytics/queries/${queryId}`)
        } catch (error) {
            console.error('Error deleting query:', error)
            throw error
        }
    }

    /**
     * Get trend analysis
     */
    static async getTrendAnalysis(metric: string, period: string): Promise<TrendData[]> {
        try {
            const response = await apiClient.get('/analytics/trends', { params: { metric, period } })
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching trend analysis:', error)
            throw error
        }
    }

    /**
     * Get predictive analytics
     */
    static async getPredictiveAnalytics(metric: string, horizon: number): Promise<PredictionData[]> {
        try {
            const response = await apiClient.get('/analytics/predictions', { params: { metric, horizon } })
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching predictions:', error)
            throw error
        }
    }

    /**
     * Get comparative analytics
     */
    static async getComparativeAnalytics(metrics: string[], period: string): Promise<any> {
        try {
            const response = await apiClient.post('/analytics/compare', { metrics, period })
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching comparative analytics:', error)
            throw error
        }
    }

    /**
     * Get real-time analytics
     */
    static async getRealTimeAnalytics(metric: string): Promise<any> {
        try {
            const response = await apiClient.get('/analytics/realtime', { params: { metric } })
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching real-time analytics:', error)
            throw error
        }
    }

    /**
     * Get cohort analysis
     */
    static async getCohortAnalysis(cohortType: string, metric: string): Promise<any> {
        try {
            const response = await apiClient.get('/analytics/cohorts', { params: { cohortType, metric } })
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching cohort analysis:', error)
            throw error
        }
    }

    /**
     * Get funnel analysis
     */
    static async getFunnelAnalysis(funnelId: string): Promise<any> {
        try {
            const response = await apiClient.get(`/analytics/funnels/${funnelId}`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching funnel analysis:', error)
            throw error
        }
    }

    /**
     * Get retention analysis
     */
    static async getRetentionAnalysis(period: string): Promise<any> {
        try {
            const response = await apiClient.get('/analytics/retention', { params: { period } })
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching retention analysis:', error)
            throw error
        }
    }

    /**
     * Get segmentation analysis
     */
    static async getSegmentationAnalysis(segmentBy: string): Promise<any> {
        try {
            const response = await apiClient.get('/analytics/segmentation', { params: { segmentBy } })
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching segmentation analysis:', error)
            throw error
        }
    }

    /**
     * Get attribution analysis
     */
    static async getAttributionAnalysis(model: string): Promise<any> {
        try {
            const response = await apiClient.get('/analytics/attribution', { params: { model } })
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching attribution analysis:', error)
            throw error
        }
    }

    /**
     * Export analytics data
     */
    static async exportAnalytics(format: string, data: any): Promise<Blob> {
        try {
            const response = await apiClient.post('/analytics/export', { format, data }, { responseType: 'blob' })
            return response as any
        } catch (error) {
            console.error('Error exporting analytics:', error)
            throw error
        }
    }

    /**
     * Get analytics dashboard
     */
    static async getAnalyticsDashboard(dashboardId: string): Promise<any> {
        try {
            const response = await apiClient.get(`/analytics/dashboards/${dashboardId}`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching dashboard:', error)
            throw error
        }
    }

    /**
     * Create analytics dashboard
     */
    static async createDashboard(data: any): Promise<any> {
        try {
            const response = await apiClient.post('/analytics/dashboards', data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error creating dashboard:', error)
            throw error
        }
    }

    /**
     * Get metric definitions
     */
    static async getMetricDefinitions(): Promise<any[]> {
        try {
            const response = await apiClient.get('/analytics/metrics')
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching metrics:', error)
            throw error
        }
    }

    /**
     * Calculate custom metric
     */
    static async calculateMetric(metricId: string, parameters: any): Promise<any> {
        try {
            const response = await apiClient.post(`/analytics/metrics/${metricId}/calculate`, parameters)
            return (response as any)?.data
        } catch (error) {
            console.error('Error calculating metric:', error)
            throw error
        }
    }

    /**
     * Get analytics insights
     */
    static async getInsights(category?: string): Promise<any[]> {
        try {
            const response = await apiClient.get('/analytics/insights', { params: { category } })
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching insights:', error)
            throw error
        }
    }
}

export default AdvancedAnalyticsService
