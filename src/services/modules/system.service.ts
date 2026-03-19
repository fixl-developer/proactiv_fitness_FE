import { apiClient } from '../api/client'

class SystemService {
    // Security
    async getSecuritySettings() {
        const response = await apiClient.get('/admin/system/security/settings')
        return response.data
    }

    async updateSecuritySettings(data: any) {
        const response = await apiClient.put('/admin/system/security/settings', data)
        return response.data
    }

    async getSecurityLogs(page = 1, limit = 50) {
        const response = await apiClient.get(`/admin/system/security/logs?page=${page}&limit=${limit}`)
        return response.data
    }

    async getFailedLoginAttempts() {
        const response = await apiClient.get('/admin/system/security/failed-logins')
        return response.data
    }

    // API Monitoring
    async getAPIMetrics(period: '1h' | '24h' | '7d' | '30d') {
        const response = await apiClient.get(`/admin/system/api/metrics?period=${period}`)
        return response.data
    }

    async getAPIEndpoints() {
        const response = await apiClient.get('/admin/system/api/endpoints')
        return response.data
    }

    async getAPILogs(page = 1, limit = 50) {
        const response = await apiClient.get(`/admin/system/api/logs?page=${page}&limit=${limit}`)
        return response.data
    }

    // Database
    async getDatabaseHealth() {
        const response = await apiClient.get('/admin/system/database/health')
        return response.data
    }

    async getDatabaseMetrics() {
        const response = await apiClient.get('/admin/system/database/metrics')
        return response.data
    }

    async runDatabaseBackup() {
        const response = await apiClient.post('/admin/system/database/backup')
        return response.data
    }

    async getBackupHistory() {
        const response = await apiClient.get('/admin/system/database/backups')
        return response.data
    }

    // Feature Flags
    async getAllFeatureFlags() {
        const response = await apiClient.get('/admin/system/features')
        return response.data
    }

    async updateFeatureFlag(id: string, enabled: boolean) {
        const response = await apiClient.put(`/admin/system/features/${id}`, { enabled })
        return response.data
    }

    async createFeatureFlag(data: {
        name: string
        key: string
        description: string
        enabled: boolean
    }) {
        const response = await apiClient.post('/admin/system/features', data)
        return response.data
    }

    // Integrations
    async getAllIntegrations() {
        const response = await apiClient.get('/admin/system/integrations')
        return response.data
    }

    async getIntegrationById(id: string) {
        const response = await apiClient.get(`/admin/system/integrations/${id}`)
        return response.data
    }

    async testIntegration(id: string) {
        const response = await apiClient.post(`/admin/system/integrations/${id}/test`)
        return response.data
    }

    async updateIntegration(id: string, data: any) {
        const response = await apiClient.put(`/admin/system/integrations/${id}`, data)
        return response.data
    }

    // System Logs
    async getSystemLogs(page = 1, limit = 50, level?: 'info' | 'warn' | 'error') {
        const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() })
        if (level) params.append('level', level)

        const response = await apiClient.get(`/admin/system/logs?${params}`)
        return response.data
    }

    async clearLogs(olderThan: string) {
        const response = await apiClient.delete(`/admin/system/logs?olderThan=${olderThan}`)
        return response.data
    }

    async exportLogs(startDate: string, endDate: string) {
        const response = await apiClient.get(`/admin/system/logs/export?startDate=${startDate}&endDate=${endDate}`, {
            responseType: 'blob'
        })
        return response.data
    }
}

export default new SystemService()
