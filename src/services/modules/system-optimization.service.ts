import { apiClient } from '../api/client'

export interface PerformanceMetric {
    name: string
    value: number
    unit: string
    status: 'good' | 'warning' | 'critical'
    trend: 'up' | 'down' | 'stable'
}

export interface CacheStatus {
    name: string
    size: number
    hitRate: number
    missRate: number
    status: 'healthy' | 'warning' | 'critical'
}

export interface DatabaseMetric {
    name: string
    value: number
    threshold: number
    status: 'healthy' | 'warning' | 'critical'
}

export interface SystemHealth {
    status: 'healthy' | 'warning' | 'critical'
    uptime: number
    cpuUsage: number
    memoryUsage: number
    diskUsage: number
    activeConnections: number
}

export class SystemOptimizationService {
    /**
     * Get performance metrics
     */
    static async getPerformanceMetrics(period?: string): Promise<PerformanceMetric[]> {
        try {
            const response = await apiClient.get('/system/performance', { params: { period } })
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching performance metrics:', error)
            throw error
        }
    }

    /**
     * Get performance overview
     */
    static async getPerformanceOverview(): Promise<any> {
        try {
            const response = await apiClient.get('/system/performance/overview')
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching performance overview:', error)
            throw error
        }
    }

    /**
     * Get cache status
     */
    static async getCacheStatus(): Promise<CacheStatus[]> {
        try {
            const response = await apiClient.get('/system/cache')
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching cache status:', error)
            throw error
        }
    }

    /**
     * Clear cache
     */
    static async clearCache(cacheType?: string): Promise<any> {
        try {
            const response = await apiClient.post('/system/cache/clear', { cacheType })
            return (response as any)?.data
        } catch (error) {
            console.error('Error clearing cache:', error)
            throw error
        }
    }

    /**
     * Get cache analytics
     */
    static async getCacheAnalytics(period?: string): Promise<any> {
        try {
            const response = await apiClient.get('/system/cache/analytics', { params: { period } })
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching cache analytics:', error)
            throw error
        }
    }

    /**
     * Get database metrics
     */
    static async getDatabaseMetrics(): Promise<DatabaseMetric[]> {
        try {
            const response = await apiClient.get('/system/database')
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching database metrics:', error)
            throw error
        }
    }

    /**
     * Optimize database
     */
    static async optimizeDatabase(): Promise<any> {
        try {
            const response = await apiClient.post('/system/database/optimize')
            return (response as any)?.data
        } catch (error) {
            console.error('Error optimizing database:', error)
            throw error
        }
    }

    /**
     * Get database analytics
     */
    static async getDatabaseAnalytics(period?: string): Promise<any> {
        try {
            const response = await apiClient.get('/system/database/analytics', { params: { period } })
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching database analytics:', error)
            throw error
        }
    }

    /**
     * Get API performance
     */
    static async getAPIPerformance(period?: string): Promise<any> {
        try {
            const response = await apiClient.get('/system/api/performance', { params: { period } })
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching API performance:', error)
            throw error
        }
    }

    /**
     * Get API endpoints
     */
    static async getAPIEndpoints(): Promise<any[]> {
        try {
            const response = await apiClient.get('/system/api/endpoints')
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching API endpoints:', error)
            throw error
        }
    }

    /**
     * Optimize API
     */
    static async optimizeAPI(): Promise<any> {
        try {
            const response = await apiClient.post('/system/api/optimize')
            return (response as any)?.data
        } catch (error) {
            console.error('Error optimizing API:', error)
            throw error
        }
    }

    /**
     * Get system health
     */
    static async getSystemHealth(): Promise<SystemHealth> {
        try {
            const response = await apiClient.get('/system/health')
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching system health:', error)
            throw error
        }
    }

    /**
     * Get system alerts
     */
    static async getSystemAlerts(): Promise<any[]> {
        try {
            const response = await apiClient.get('/system/alerts')
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching system alerts:', error)
            throw error
        }
    }

    /**
     * Get system logs
     */
    static async getSystemLogs(limit?: number): Promise<any[]> {
        try {
            const response = await apiClient.get('/system/logs', { params: { limit } })
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching system logs:', error)
            throw error
        }
    }

    /**
     * Get system recommendations
     */
    static async getSystemRecommendations(): Promise<any[]> {
        try {
            const response = await apiClient.get('/system/recommendations')
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching recommendations:', error)
            throw error
        }
    }

    /**
     * Export system report
     */
    static async exportSystemReport(format: string): Promise<Blob> {
        try {
            const response = await apiClient.get('/system/export', {
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

export default SystemOptimizationService
