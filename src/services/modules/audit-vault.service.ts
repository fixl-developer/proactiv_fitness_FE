import { apiClient } from '../api/client'

export interface AuditLog {
    id: string
    userId: string
    userName: string
    action: string
    resource: string
    resourceId: string
    details: any
    ipAddress: string
    userAgent: string
    timestamp: string
    status: 'success' | 'failure'
}

export interface ComplianceReport {
    id: string
    type: string
    period: string
    generatedAt: string
    status: 'completed' | 'pending' | 'failed'
    findings: number
    issues: number
}

export class AuditVaultService {
    /**
     * Get audit logs
     */
    static async getAuditLogs(filters?: {
        page?: number
        limit?: number
        userId?: string
        action?: string
        startDate?: string
        endDate?: string
    }): Promise<{ logs: AuditLog[]; total: number }> {
        try {
            const response = await apiClient.get('/audit/logs', { params: filters })
            return (response as any)?.data || { logs: [], total: 0 }
        } catch (error) {
            console.error('Error fetching audit logs:', error)
            throw error
        }
    }

    /**
     * Get audit log by ID
     */
    static async getAuditLogById(logId: string): Promise<AuditLog> {
        try {
            const response = await apiClient.get(`/audit/logs/${logId}`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching audit log:', error)
            throw error
        }
    }

    /**
     * Create audit log
     */
    static async createAuditLog(data: Partial<AuditLog>): Promise<AuditLog> {
        try {
            const response = await apiClient.post('/audit/logs', data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error creating audit log:', error)
            throw error
        }
    }

    /**
     * Get user activity
     */
    static async getUserActivity(userId: string, filters?: { startDate?: string; endDate?: string }): Promise<AuditLog[]> {
        try {
            const response = await apiClient.get(`/audit/users/${userId}/activity`, { params: filters })
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching user activity:', error)
            throw error
        }
    }

    /**
     * Get resource activity
     */
    static async getResourceActivity(resource: string, resourceId: string): Promise<AuditLog[]> {
        try {
            const response = await apiClient.get(`/audit/resources/${resource}/${resourceId}`)
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching resource activity:', error)
            throw error
        }
    }

    /**
     * Search audit logs
     */
    static async searchAuditLogs(query: string, filters?: any): Promise<AuditLog[]> {
        try {
            const response = await apiClient.post('/audit/logs/search', { query, ...filters })
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error searching audit logs:', error)
            throw error
        }
    }

    /**
     * Get compliance reports
     */
    static async getComplianceReports(): Promise<ComplianceReport[]> {
        try {
            const response = await apiClient.get('/audit/compliance/reports')
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching compliance reports:', error)
            throw error
        }
    }

    /**
     * Generate compliance report
     */
    static async generateComplianceReport(type: string, period: string): Promise<ComplianceReport> {
        try {
            const response = await apiClient.post('/audit/compliance/reports', { type, period })
            return (response as any)?.data
        } catch (error) {
            console.error('Error generating compliance report:', error)
            throw error
        }
    }

    /**
     * Get audit statistics
     */
    static async getAuditStatistics(filters?: { startDate?: string; endDate?: string }): Promise<any> {
        try {
            const response = await apiClient.get('/audit/statistics', { params: filters })
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching audit statistics:', error)
            throw error
        }
    }

    /**
     * Export audit logs
     */
    static async exportAuditLogs(filters?: any): Promise<Blob> {
        try {
            const response = await apiClient.post('/audit/logs/export', filters, { responseType: 'blob' })
            return response as any
        } catch (error) {
            console.error('Error exporting audit logs:', error)
            throw error
        }
    }

    /**
     * Get data retention policies
     */
    static async getRetentionPolicies(): Promise<any[]> {
        try {
            const response = await apiClient.get('/audit/retention/policies')
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching retention policies:', error)
            throw error
        }
    }

    /**
     * Update retention policy
     */
    static async updateRetentionPolicy(policyId: string, data: any): Promise<any> {
        try {
            const response = await apiClient.patch(`/audit/retention/policies/${policyId}`, data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error updating retention policy:', error)
            throw error
        }
    }

    /**
     * Archive old logs
     */
    static async archiveLogs(beforeDate: string): Promise<{ archived: number }> {
        try {
            const response = await apiClient.post('/audit/logs/archive', { beforeDate })
            return (response as any)?.data
        } catch (error) {
            console.error('Error archiving logs:', error)
            throw error
        }
    }

    /**
     * Get audit trends
     */
    static async getAuditTrends(period: string): Promise<any[]> {
        try {
            const response = await apiClient.get('/audit/trends', { params: { period } })
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching audit trends:', error)
            throw error
        }
    }

    /**
     * Get security events
     */
    static async getSecurityEvents(filters?: { severity?: string; startDate?: string; endDate?: string }): Promise<any[]> {
        try {
            const response = await apiClient.get('/audit/security/events', { params: filters })
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching security events:', error)
            throw error
        }
    }
}

export default AuditVaultService
