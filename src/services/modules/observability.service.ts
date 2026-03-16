import { apiClient } from '../api/client'

export interface SystemHealth {
    status: 'healthy' | 'degraded' | 'down'
    uptime: number
    cpu: number
    memory: number
    disk: number
    services: ServiceHealth[]
}

export interface ServiceHealth {
    name: string
    status: 'up' | 'down' | 'degraded'
    responseTime: number
    lastCheck: string
}

export interface PerformanceMetric {
    timestamp: string
    cpu: number
    memory: number
    requests: number
    responseTime: number
    errors: number
}

export interface Alert {
    id: string
    type: 'critical' | 'warning' | 'info'
    title: string
    message: string
    service: string
    timestamp: string
    status: 'active' | 'resolved' | 'acknowledged'
}

export interface Incident {
    id: string
    title: string
    description: string
    severity: 'critical' | 'high' | 'medium' | 'low'
    status: 'open' | 'investigating' | 'resolved' | 'closed'
    affectedServices: string[]
    createdAt: string
    resolvedAt?: string
}

export class ObservabilityService {
    /**
     * Get system health
     */
    static async getSystemHealth(): Promise<SystemHealth> {
        try {
            const response = await apiClient.get('/observability/health')
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching system health:', error)
            throw error
        }
    }

    /**
     * Get service health
     */
    static async getServiceHealth(serviceName: string): Promise<ServiceHealth> {
        try {
            const response = await apiClient.get(`/observability/services/${serviceName}/health`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching service health:', error)
            throw error
        }
    }

    /**
     * Get performance metrics
     */
    static async getPerformanceMetrics(filters?: { startDate?: string; endDate?: string; interval?: string }): Promise<PerformanceMetric[]> {
        try {
            const response = await apiClient.get('/observability/metrics/performance', { params: filters })
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching performance metrics:', error)
            throw error
        }
    }

    /**
     * Get system metrics
     */
    static async getSystemMetrics(): Promise<any> {
        try {
            const response = await apiClient.get('/observability/metrics/system')
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching system metrics:', error)
            throw error
        }
    }

    /**
     * Get alerts
     */
    static async getAlerts(filters?: { status?: string; type?: string; service?: string }): Promise<Alert[]> {
        try {
            const response = await apiClient.get('/observability/alerts', { params: filters })
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching alerts:', error)
            throw error
        }
    }

    /**
     * Create alert
     */
    static async createAlert(data: Partial<Alert>): Promise<Alert> {
        try {
            const response = await apiClient.post('/observability/alerts', data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error creating alert:', error)
            throw error
        }
    }

    /**
     * Acknowledge alert
     */
    static async acknowledgeAlert(alertId: string): Promise<Alert> {
        try {
            const response = await apiClient.patch(`/observability/alerts/${alertId}/acknowledge`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error acknowledging alert:', error)
            throw error
        }
    }

    /**
     * Resolve alert
     */
    static async resolveAlert(alertId: string): Promise<Alert> {
        try {
            const response = await apiClient.patch(`/observability/alerts/${alertId}/resolve`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error resolving alert:', error)
            throw error
        }
    }

    /**
     * Get incidents
     */
    static async getIncidents(filters?: { status?: string; severity?: string }): Promise<Incident[]> {
        try {
            const response = await apiClient.get('/observability/incidents', { params: filters })
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching incidents:', error)
            throw error
        }
    }

    /**
     * Create incident
     */
    static async createIncident(data: Partial<Incident>): Promise<Incident> {
        try {
            const response = await apiClient.post('/observability/incidents', data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error creating incident:', error)
            throw error
        }
    }

    /**
     * Update incident
     */
    static async updateIncident(incidentId: string, data: Partial<Incident>): Promise<Incident> {
        try {
            const response = await apiClient.patch(`/observability/incidents/${incidentId}`, data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error updating incident:', error)
            throw error
        }
    }

    /**
     * Get uptime statistics
     */
    static async getUptimeStats(period: string): Promise<any> {
        try {
            const response = await apiClient.get('/observability/uptime', { params: { period } })
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching uptime stats:', error)
            throw error
        }
    }

    /**
     * Get error rates
     */
    static async getErrorRates(filters?: { startDate?: string; endDate?: string }): Promise<any[]> {
        try {
            const response = await apiClient.get('/observability/errors/rates', { params: filters })
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching error rates:', error)
            throw error
        }
    }

    /**
     * Get response time trends
     */
    static async getResponseTimeTrends(filters?: { startDate?: string; endDate?: string }): Promise<any[]> {
        try {
            const response = await apiClient.get('/observability/response-time/trends', { params: filters })
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching response time trends:', error)
            throw error
        }
    }

    /**
     * Get resource usage
     */
    static async getResourceUsage(): Promise<any> {
        try {
            const response = await apiClient.get('/observability/resources/usage')
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching resource usage:', error)
            throw error
        }
    }

    /**
     * Get service dependencies
     */
    static async getServiceDependencies(): Promise<any> {
        try {
            const response = await apiClient.get('/observability/services/dependencies')
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching service dependencies:', error)
            throw error
        }
    }

    /**
     * Run health check
     */
    static async runHealthCheck(serviceName: string): Promise<ServiceHealth> {
        try {
            const response = await apiClient.post(`/observability/services/${serviceName}/health-check`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error running health check:', error)
            throw error
        }
    }
}

export default ObservabilityService
