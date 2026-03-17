import { apiClient } from '../api/client'

export interface SystemAnalytics {
    totalUsers: number
    activeUsers: number
    totalRequests: number
    avgResponseTime: number
    errorRate: number
    uptime: number
}

export interface UsageStatistics {
    date: string
    users: number
    requests: number
    dataTransfer: number
}

export interface PerformanceAnalytics {
    endpoint: string
    avgResponseTime: number
    requests: number
    errors: number
    p95ResponseTime: number
    p99ResponseTime: number
}

export class SystemAnalyticsService {
    /**
     * Get system analytics
     */
    static async getSystemAnalytics(): Promise<SystemAnalytics> {
        try {
            const response = await apiClient.get('/system/analytics')
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching system analytics:', error)
            throw error
        }
    }

    /**
     * Get usage statistics
     */
    static async getUsageStatistics(filters?: { startDate?: string; endDate?: string; interval?: string }): Promise<UsageStatistics[]> {
        try {
            const response = await apiClient.get('/system/analytics/usage', { params: filters })
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching usage statistics:', error)
            throw error
        }
    }

    /**
     * Get performance analytics
     */
    static async getPerformanceAnalytics(filters?: { startDate?: string; endDate?: string }): Promise<PerformanceAnalytics[]> {
        try {
            const response = await apiClient.get('/system/analytics/performance', { params: filters })
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching performance analytics:', error)
            throw error
        }
    }

    /**
     * Get user analytics
     */
    static async getUserAnalytics(filters?: { startDate?: string; endDate?: string }): Promise<any> {
        try {
            const response = await apiClient.get('/system/analytics/users', { params: filters })
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching user analytics:', error)
            throw error
        }
    }

    /**
     * Get API analytics
     */
    static async getAPIAnalytics(filters?: { startDate?: string; endDate?: string }): Promise<any> {
        try {
            const response = await apiClient.get('/system/analytics/api', { params: filters })
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching API analytics:', error)
            throw error
        }
    }

    /**
     * Get error analytics
     */
    static async getErrorAnalytics(filters?: { startDate?: string; endDate?: string }): Promise<any[]> {
        try {
            const response = await apiClient.get('/system/analytics/errors', { params: filters })
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching error analytics:', error)
            throw error
        }
    }

    /**
     * Get trend analysis
     */
    static async getTrendAnalysis(metric: string, period: string): Promise<any[]> {
        try {
            const response = await apiClient.get('/system/analytics/trends', { params: { metric, period } })
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching trend analysis:', error)
            throw error
        }
    }

    /**
     * Get capacity analytics
     */
    static async getCapacityAnalytics(): Promise<any> {
        try {
            const response = await apiClient.get('/system/analytics/capacity')
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching capacity analytics:', error)
            throw error
        }
    }

    /**
     * Get cost analytics
     */
    static async getCostAnalytics(filters?: { startDate?: string; endDate?: string }): Promise<any> {
        try {
            const response = await apiClient.get('/system/analytics/costs', { params: filters })
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching cost analytics:', error)
            throw error
        }
    }

    /**
     * Get database analytics
     */
    static async getDatabaseAnalytics(): Promise<any> {
        try {
            const response = await apiClient.get('/system/analytics/database')
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching database analytics:', error)
            throw error
        }
    }

    /**
     * Get cache analytics
     */
    static async getCacheAnalytics(): Promise<any> {
        try {
            const response = await apiClient.get('/system/analytics/cache')
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching cache analytics:', error)
            throw error
        }
    }

    /**
     * Get security analytics
     */
    static async getSecurityAnalytics(filters?: { startDate?: string; endDate?: string }): Promise<any> {
        try {
            const response = await apiClient.get('/system/analytics/security', { params: filters })
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching security analytics:', error)
            throw error
        }
    }

    /**
     * Export analytics report
     */
    static async exportAnalyticsReport(type: string, filters?: any): Promise<Blob> {
        try {
            const response = await apiClient.post('/system/analytics/export', { type, ...filters }, { responseType: 'blob' })
            return response as any
        } catch (error) {
            console.error('Error exporting analytics report:', error)
            throw error
        }
    }

    /**
     * Get real-time metrics
     */
    static async getRealTimeMetrics(): Promise<any> {
        try {
            const response = await apiClient.get('/system/analytics/realtime')
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching real-time metrics:', error)
            throw error
        }
    }
}

export default SystemAnalyticsService
